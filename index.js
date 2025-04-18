<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>我的临时邮箱</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f0f0f0; }
    h1 { text-align: center; }
    #email-list { max-width: 700px; margin: auto; background: white; padding: 20px; border-radius: 8px; }
    .mail { border-bottom: 1px solid #ddd; padding: 10px 0; }
    .mail:last-child { border: none; }
    .from { font-weight: bold; }
    .subject { color: #333; }
    .date { color: gray; font-size: 12px; }
  </style>
</head>
<body>
  <h1>📮 我的临时邮箱</h1>
  <div id="email-list">加载中...</div>

  <script>
    function loadInbox() {
      fetch('inbox.json?t=' + Date.now()) // 加时间戳确保不缓存
        .then(res => res.json())
        .then(data => {
          const list = document.getElementById('email-list');
          list.innerHTML = '';
          data.forEach(mail => {
            const div = document.createElement('div');
            div.className = 'mail';
            div.innerHTML = `
              <div class="from">📩 来自：${mail.from}</div>
              <div class="subject">主题：${mail.subject}</div>
              <div class="date">时间：${mail.date}</div>
            `;
            list.appendChild(div);
          });
        })
        .catch(err => {
          document.getElementById('email-list').innerText = '加载失败，请稍后重试';
          console.error(err);
        });
    }

    loadInbox();
    setInterval(loadInbox, 10000); // 每 10 秒刷新一次
  </script>
</body>
</html>
