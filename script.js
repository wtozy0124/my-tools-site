function copyEmail() {
  const email = document.getElementById("email");
  email.select();
  document.execCommand("copy");
  alert("邮箱地址已复制！");
}

async function fetchInbox() {
  const res = await fetch("inbox.json");
  const data = await res.json();
  const list = document.getElementById("email-list");
  list.innerHTML = "";

  data.messages.reverse().forEach(msg => {
    const item = document.createElement("div");
    item.className = "p-2 border rounded bg-gray-50";
    item.innerHTML = `
      <div><strong>来自：</strong>${msg.from}</div>
      <div><strong>主题：</strong>${msg.subject}</div>
      <div><strong>时间：</strong>${new Date(msg.date).toLocaleString()}</div>
      <details class="mt-2">
        <summary class="text-blue-500 cursor-pointer">查看内容</summary>
        <pre class="whitespace-pre-wrap text-xs mt-1">${JSON.stringify(msg, null, 2)}</pre>
      </details>
    `;
    list.appendChild(item);
  });
}

fetchInbox();
setInterval(fetchInbox, 60000); // 每分钟刷新一次
