console.log('🚀 脚本启动');

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

async function authorize(callback) {
  let credentialsRaw;

  if (process.env.CREDENTIALS_JSON) {
    console.log('✅ 使用 GitHub Actions 提供的 credentials');
    credentialsRaw = process.env.CREDENTIALS_JSON;
  } else {
    console.log('🧪 本地运行，读取 credentials.json 文件');
    credentialsRaw = fs.readFileSync('credentials.json', 'utf-8');
  }

  const credentials = JSON.parse(credentialsRaw);
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // GitHub Actions 没有 stdin，所以我们也要读取 token（你提前本地跑过后存好的）
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  } else {
    console.log('❌ 缺少 token.json，请在本地运行一次完成授权流程，并上传 token.json 至仓库');
    process.exit(1);
  }
}

async function listMessages(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
  const messages = res.data.messages || [];

  let results = [];

  // 固定写入一条，防止不变导致 Git 无法 commit
  results.push({ from: "系统测试", subject: "自动更新时间", date: new Date().toISOString() });

  for (const msg of messages) {
    const msgData = await gmail.users.messages.get({ userId: 'me', id: msg.id });
    const headers = msgData.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '(无标题)';
    const from = headers.find(h => h.name === 'From')?.value || '(未知发件人)';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    results.push({ from, subject, date });
  }

  console.log('✅ 拉取邮件数：', results.length);
  fs.writeFileSync('inbox.json', JSON.stringify(results, null, 2));
  console.log('✅ 已写入 inbox.json');
}

authorize(listMessages);
