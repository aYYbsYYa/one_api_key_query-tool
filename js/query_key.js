function queryLog() {
    var api_key = document.getElementById("keyInput").value;
    fetch(`https://Your域名/query/query_key.php?key=${api_key}`)
        .then(response => response.json())
        .then(data => {
            displayData(data);
        })
        .catch(error => console.error('Error:', error));

    // 移除透明背景类
    document.querySelector('.info-container').classList.remove('transparent-bg');
}

function displayData(data) {
    // 销毁之前的Chart实例
    var existingChart = Chart.getChart('quotaChart');
    if (existingChart) {
        existingChart.destroy();
    }

    // 计算百分比
    var usedQuota = parseFloat(data.used_quota);
    var remainQuota = parseFloat(data.remain_quota);
    var totalQuota = usedQuota + remainQuota;
    var percentage = ((remainQuota / totalQuota) * 100).toFixed(2);

    // 创建插件
    var centerTextPlugin = {
        id: 'centerText',
        afterDraw: function(chart) {
            if (chart.config.options.elements.center) {
                var ctx = chart.ctx;
                var centerConfig = chart.config.options.elements.center;
                var fontStyle = centerConfig.fontStyle || 'Arial';
                var txt = centerConfig.text;
                var color = centerConfig.color || '#000';
                var sidePadding = centerConfig.sidePadding || 20;
                var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2);
                var fontSize = Math.min(chart.width / 8, 20); // 动态调整字体大小
                ctx.font = "bold " + fontSize + "px " + fontStyle;
                ctx.textBaseline = "middle";
                var textX = Math.round((chart.chartArea.width - ctx.measureText(txt).width) / 2) + chart.chartArea.left;
                var textY = chart.chartArea.height / 2 + chart.chartArea.top;
                ctx.fillText(txt, textX, textY);
            }
        }
    };

    // 注册插件
    Chart.register(centerTextPlugin);

    // 更新圆形进度图
    var ctx = document.getElementById('quotaChart').getContext('2d');
    var quotaChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['已用额度', '剩余额度'],
            datasets: [{
                data: [usedQuota, remainQuota],
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 2
            }]
        },
        options: {
            cutout: '50%',
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                center: {
                    text: percentage + '%',
                    color: '#000', // 文本颜色
                    fontStyle: 'Arial', // 字体
                    sidePadding: 10 // 边距
                }
            }
        }
    });

    // 更新文字信息
    document.getElementById('tokenName').innerText = `Token名称: ${data.token_name}`;
    document.getElementById('expiredTime').innerText = `过期时间: ${data.expired_time}`;
    document.getElementById('usedQuota').innerText = `已用额度: ${data.used_quota}u`;
    document.getElementById('remainQuota').innerText = `剩余额度: ${data.remain_quota}u`;

    // 更新日志列表
    var logsList = document.getElementById('logsList');
    logsList.innerHTML = '';
    data.logs.forEach(log => {
        var logItem = document.createElement('li');
        logItem.className = 'log-item';
        logItem.innerHTML = `
            <div>时间: ${log.created_time}</div>
            <div>模型: ${log.model_name}</div>
            <div>提示: ${log.prompt_tokens}</div>
            <div>补全: ${log.completion_tokens}</div>
            <div>额度: ${log.cost}</div>
        `;
        logsList.appendChild(logItem);
    });
}