const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER || '328liu';
const GITHUB_REPO = process.env.GITHUB_REPO || 'second-brain';
const FEISHU_API = 'https://open.feishu.cn/open-apis';
const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;

function pad(n) { return String(n).padStart(2, '0'); }

function getDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function getTimestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '-').substring(0, 80);
}

function toBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

async function githubPut(path, base64Content) {
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}`;
  let sha = null;
  const getResp = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
  if (getResp.ok) {
    const existing = await getResp.json();
    sha = existing.sha;
  }
  const body = { message: `📥 捕梦精灵: ${path}`, content: base64Content, branch: 'main' };
  if (sha) body.sha = sha;
  const resp = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GitHub error: ${resp.status} ${err}`);
  }
}

async function getFeishuToken() {
  const resp = await fetch(`${FEISHU_API}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET }),
  });
  const data = await resp.json();
  if (!data.tenant_access_token) throw new Error(`飞书 token 失败: ${JSON.stringify(data)}`);
  return data.tenant_access_token;
}

async function writeToFeishu({ title, content, type, source, priority }) {
  try {
    const token = await getFeishuToken();
    const createResp = await fetch(`${FEISHU_API}/docx/v1/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `[${type}] ${title}` }),
    });
    const createData = await createResp.json();
    if (createData.code !== 0) return null;
    const docId = createData.data.document.document_id;
    const blocks = [
      { block_type: 5, heading3: { style: {}, elements: [{ text_run: { content: `${type}：${title}`, text_element_style: {} } }] } },
      { block_type: 22, divider: {} },
      { block_type: 2, text: { style: {}, elements: [{ text_run: { content: `来源：${source || '手动录入'}`, text_element_style: {} } }] } },
      { block_type: 2, text: { style: {}, elements: [{ text_run: { content: `时间：${getTimestamp()}`, text_element_style: {} } }] } },
      { block_type: 2, text: { style: {}, elements: [{ text_run: { content: `类别：${type}`, text_element_style: {} } }] } },
      { block_type: 2, text: { style: {}, elements: [{ text_run: { content: `优先级：${priority || '一般'}`, text_element_style: {} } }] } },
      { block_type: 22, divider: {} },
    ];
    if (content) {
      content.split('\n').filter(l => l.trim()).forEach(line => {
        blocks.push({ block_type: 2, text: { style: {}, elements: [{ text_run: { content: line, text_element_style: {} } }] } });
      });
    }
    await fetch(`${FEISHU_API}/docx/v1/documents/${docId}/blocks/${docId}/children`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ children: blocks }),
    });
    return `https://my.feishu.cn/docx/${docId}`;
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { title, content, type = '笔记', source = '网页', priority = '一般', file } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: '请输入标题' });
    }

    const dateStr = getDateStr();
    const safeTitle = sanitizeFilename(title);
    const fileName = `${dateStr}-${type}-${safeTitle}.md`;

    const frontmatter = [
      '---',
      `created: ${getTimestamp()}`,
      `source: ${source}`,
      `tags: [${type}]`,
      'status: inbox',
      `priority: ${priority}`,
      '---',
      '',
    ].join('\n');

    let markdown = frontmatter + (content || '');

    // Handle file attachment
    let assetPath = null;
    if (file && file.data && file.name) {
      const isImage = file.type && file.type.startsWith('image/');
      const safeName = file.name.replace(/[<>:"/\\|?*]/g, '_');
      assetPath = `Inbox/assets/${Date.now()}-${safeName}`;
      await githubPut(assetPath, file.data);
      markdown += isImage ? `\n\n![](${assetPath})\n` : `\n\n📎 [${file.name}](${assetPath})\n`;
    }

    await githubPut(`Inbox/${fileName}`, toBase64(markdown));

    let feishuUrl = null;
    if (FEISHU_APP_ID && FEISHU_APP_SECRET) {
      feishuUrl = await writeToFeishu({ title, content, type, source, priority });
    }

    return res.json({ success: true, fileName, feishuUrl });
  } catch (err) {
    console.error('Capture error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
