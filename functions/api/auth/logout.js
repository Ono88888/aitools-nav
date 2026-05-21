// Cloudflare Pages Function: /api/auth/logout
export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } })
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'wk_session=; Path=/; Max-Age=0; HttpOnly',
      'Access-Control-Allow-Origin': '*',
    }
  })
}
