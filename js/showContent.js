console.log('\n' + ' %c one_api_key_query-tool   %c https://github.com/aYYbsYYa/one_api_key_query-tool ' + '\n', 'color: #fadfa3; background: #030307; padding:5px 0;', 'background: #fadfa3; padding:5px 0;');
/* 切换标签页 */
function showContent(index) {
    const pages = document.querySelectorAll('.content-pane');
    const buttons = document.querySelectorAll('.tab-button');
    pages.forEach((page, i) => {
        page.classList.toggle('active', i === index);
    });
    buttons.forEach((button, i) => {
        button.classList.toggle('active', i === index);
    });
}

/* 切换下拉菜单 */
function toggleDropdown() {
    const dropdownContent = document.getElementById('dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

function selectTab(index) {
    showContent(index);
    const dropdownContent = document.getElementById('dropdown-content');
    dropdownContent.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    showContent(0);  // 默认显示第一个标签页
});
