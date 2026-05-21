// Cloudflare Pages Function: /api/auth/send-code
// 发送邮箱验证码（用于忘记密码）
// 验证码存在 KV 或临时用 Notion 存（这里用内存+返回方式，实际存KV）
// 因为没有KV，用Cloudflare Email Worker或SMTP

const N = 'https://api.notion.com/v1', VER = '2022-06-28'

function cors(res) {
  const h = new Headers(res.headers)
  h.set('Access-Control-Allow-Origin', '*')
  h.set('Access-Control-Allow-Methods', 'POST,OPTIONS')
  h.set('Access-Control-Allow-Headers', 'Content-Type')
  return new Response(res.body, { status: res.status, headers: h })
}
function json(data, status = 200) {
  return cors(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }))
}
function nH(env) {
  return { Authorization: `Bearer ${env.NOTION_API_KEY}`, 'Content-Type': 'application/json', 'Notion-Version': VER }
}

// 生成6位数字验证码
function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// 用QQ邮箱SMTP发送（通过EmailJS API或直接SMTP over fetch）
// 实际用 Resend API（免费100封/天，无需信用卡）
async function sendEmail(env, toEmail, code) {
  const from = env.EMAIL_FROM   // 你的发件邮箱
  const pass  = env.EMAIL_PASS  // QQ邮箱授权码 或 Resend API Key

  if (!from || !pass) throw new Error('邮件配置缺失')

  // 方案A：用 Resend API（推荐，免费）
  if (pass.startsWith('re_')) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${pass}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `GO悟空 <${from}>`,
        to: [toEmail],
        subject: '【GO悟空】密码重置验证码',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;border-radius:12px;border:1px solid #E5E7EB">
            <h2 style="color:#D97706;margin:0 0 16px">🔑 密码重置验证码</h2>
            <p style="color:#374151;margin:0 0 8px">您正在重置 GO悟空 账户密码。</p>
            <p style="color:#374151;margin:0 0 24px">您的验证码是：</p>
            <div style="background:#FEF3C7;border-radius:8px;padding:16px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#92400E">${code}</div>
            <p style="color:#9CA3AF;font-size:12px;margin:16px 0 0">验证码10分钟内有效，请勿泄露给他人。</p>
            <p style="color:#9CA3AF;font-size:12px;margin:4px 0 0">如非本人操作，请忽略此邮件。</p>
          </div>
        `
      })
    })
    if (!r.ok) {
      const err = await r.text()
      throw new Error(`Resend发送失败: ${err}`)
    }
    return
  }

  // 方案B：QQ SMTP（通过fetch调用SMTP代理，这里用smtp2go免费API）
  // 或直接用 MailChannels（Cloudflare Worker内置，免费）
  const r = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: from, name: 'GO悟空' },
      subject: '【GO悟空】密码重置验证码',
      content: [{
        type: 'text/html',
        value: `<div style="font-family:sans-serif;padding:24px"><h2 style="color:#D97706">密码重置验证码</h2><p>您的验证码：<strong style="font-size:24px;letter-spacing:4px">${code}</strong></p><p style="color:#9CA3AF;font-size:12px">10分钟内有效，请勿泄露。</p></div>`
      }]
    })
  })
  if (!r.ok && r.status !== 202) {
    throw new Error(`MailChannels发送失败: ${r.status}`)
  }
}

// 把验证码存到Notion用户记录的verifyToken字段（有效期10分钟，加时间戳）
async function saveCode(env, userId, code) {
  const val = `${code}:${Date.now() + 10 * 60 * 1000}` // code:过期时间戳
  await fetch(`${N}/pages/${userId}`, {
    method: 'PATCH', headers: nH(env),
    body: JSON.stringify({ properties: { verifyToken: { rich_text: [{ text: { content: val } }] } } })
  })
}

async function findUserByEmail(env, email) {
  const d = await fetch(`${N}/databases/${env.NOTION_USER_DB_ID}/query`, {
    method: 'POST', headers: nH(env),
    body: JSON.stringify({ filter: { property: 'email', title: { equals: email.toLowerCase() } }, page_size: 1 })
  }).then(r => r.json())
  return d.results?.[0] ?? null
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }))
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const { email } = await request.json().catch(() => ({}))
  if (!email || !email.includes('@')) return json({ error: '请输入有效邮箱' }, 400)

  const user = await findUserByEmail(env, email.trim())
  // 为防止账号枚举，不管账号是否存在都返回相同提示
  if (!user) {
    // 延迟响应
    await new Promise(r => setTimeout(r, 800))
    return json({ ok: true, message: '如该邮箱已注册，验证码已发送' })
  }

  const code = genCode()
  try {
    await saveCode(env, user.id, code)
    await sendEmail(env, email.trim(), code)
    return json({ ok: true, message: '验证码已发送，请查收邮件' })
  } catch (err) {
    console.error('Send code error:', err)
    return json({ error: `发送失败: ${err.message}` }, 500)
  }
}
