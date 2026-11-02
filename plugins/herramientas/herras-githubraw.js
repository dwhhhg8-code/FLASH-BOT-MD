function formatUrl(url) {
  if (!url) return url
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'Raw.githubusercontent.com').replace('/blob/', '/')
  }
  return url.trim()
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const emoji = global.emoji || '✦'
  const emoji2 = global.emoji2 || '✘'
  const input = (text || '').trim()
  const example = `${usedPrefix || '.'}${command || 'githubraw'} https://github.com/usuario/repo/blob/main/imagen.png`

  if (!input || !input.includes('github.com') || !input.includes('/blob/')) {
    return conn.reply(m.chat, `${emoji2} *ارتباط GitHub غير صالح.*\n\n${emoji} أرسل لي عنوان URL لملف GitHub الذي يحتوي على */blob/* للتحويل إلى Raw.\n\n*مثال:*\n${example}`, m)
  }

  const rawUrl = formatUrl(input)
  if (rawUrl === input || !rawUrl.includes('Raw.githubusercontent.com')) {
    return conn.reply(m.chat, `${emoji2} لم أتمكن من تحويل هذا الرابط. تحقق من أنه عنوان URL صالح للملف على GitHub.`, m)
  }

  return conn.reply(m.chat, rawUrl, m)
}

handler.help = ['githubraw <url>', 'rawurl <url>', 'raw <url>']
handler.tags = ['tools', 'github']
handler.command = ['raw', 'rawurl', 'githubraw']
handler.register = true

export { formatUrl }
export default handler
