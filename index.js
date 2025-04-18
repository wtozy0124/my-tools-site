console.log('🚀 脚本启动');

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  } else {
    getNewToken(oAuth2Client, callback);
  }
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('请在浏览器打开以下链接授权：\n', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('\n粘贴授权码：', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('获取 token 出错', err);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('授权成功，Token 已保存至 token.json\n');
      callback(oAuth2Client);
    });
  });
}

async function listMessages(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 10,
  });
  const messages = res.data.messages || [];
  if (!messages.length) {
    console.log('暂无邮件。');
    return;
  }

  let results = [];

  for (const msg of messages) {
    const msgData = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
    });
    const headers = msgData.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '(无标题)';
    const from = headers.find(h => h.name === 'From')?.value || '(未知发件人)';
    const date = headers.find(h => h.name === 'Date')?.value || '';

    results.push({ from, subject, date });
  }

  fs.writeFileSync('inbox.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('✅ 邮件已写入 inbox.json');
}

// ✅ 只保留这一处主入口！
let credentialsRaw;

// 优先从 GitHub Actions 环境变量读取
if (process.env.CREDENTIALS_JSON) {
  credentialsRaw = process.env.CREDENTIALS_JSON;
} else {
  // 本地运行时读本地文件
  credentialsRaw = fs.readFileSync('credentials.json', 'utf-8');
}

authorize(JSON.parse(credentialsRaw), listMessages);


