<?php
// 数据库连接配置
$servername = "127.0.0.1:3306";
$username = "YourUsername";
$password = "YourPassword";
$dbname = "YourDBName";

// 创建数据库连接
$conn = new mysqli($servername, $username, $password, $dbname);

// 检查连接是否成功
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 获取GET请求中的key变量
$key = $_GET['key'];

// 去掉前缀 'sk-'
$key = substr($key, 3);

// 防止SQL注入
$key = mysqli_real_escape_string($conn, $key);

// 查询数据库，使用反引号括起列名 `key`
$sql = "SELECT name, expired_time, remain_quota, used_quota FROM tokens WHERE `key` = '$key'";
$result = $conn->query($sql);

// 检查查询是否成功
if ($result === false) {
    die("Query failed: " . $conn->error);
}

$response = array();

if ($result->num_rows > 0) {
    // 输出数据
    $row = $result->fetch_assoc();
    $token_name = $row['name'];
    $response['token_name'] = $row['name'];
    $response['remain_quota'] = number_format($row['remain_quota'] / 500000, 6, '.', '');
    $response['used_quota'] = number_format($row['used_quota'] / 500000, 6, '.', '');
    // 处理 expired_time
    if ($row['expired_time'] == -1) {
        $response['expired_time'] = "无限期";
    } else {
        $response['expired_time'] = date('Y-m-d H:i:s', $row['expired_time']);
    }
    
    // 查询 logs 表
    $sql_logs = "SELECT created_at, model_name, prompt_tokens, completion_tokens, content FROM logs WHERE token_name = '$token_name' ORDER BY created_at DESC";
    $result_logs = $conn->query($sql_logs);

    // 检查查询是否成功
    if ($result_logs === false) {
        die("Query failed: " . $conn->error);
    }

    $logs = array();

    if ($result_logs->num_rows > 0) {
        while ($row_logs = $result_logs->fetch_assoc()) {
            // 提取 content 中的三组小数
            preg_match_all('/\d+\.\d+/', $row_logs['content'], $matches);
            $numbers = $matches[0];

            // 确保有三组小数
            if (count($numbers) >= 3) {
                $model_magnification = $numbers[0];
                $group_magnification = $numbers[1];
                $completion_magnification = $numbers[2];
            } else {
                $model_magnification = $group_magnification = $completion_magnification = '';
            }

            // 转换 created_at 为具体年月日时分秒
            $created_time = date('Y-m-d H:i:s', $row_logs['created_at']);

            // 计算 cost
            $cost = $group_magnification * $model_magnification * ($row_logs['prompt_tokens'] + $row_logs['completion_tokens'] * $completion_magnification) / 500000;
            $cost = number_format($cost, 6, '.', '');

            $logs[] = array(
                'created_time' => $created_time,        //调用时间
                'model_name' => $row_logs['model_name'],        //调用模型名字
                'prompt_tokens' => $row_logs['prompt_tokens'],  //提示词
                'completion_tokens' => $row_logs['completion_tokens'], //补全提示词
                //'model_magnification' => $model_magnification,
                //'group_magnification' => $group_magnification,
                //'completion_magnification' => $completion_magnification,
                'cost' => $cost
            );
        }
    }

    $response['logs'] = $logs;
} else {
    $response['token_name'] = "No matching key found";
}

// 关闭数据库连接
$conn->close();

// 返回JSON响应
header('Content-Type: application/json');
echo json_encode($response);
?>
