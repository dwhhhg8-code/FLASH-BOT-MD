import fetch from 'node-fetch'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const quotedText = quoted.text || quoted.conversation || m.msg?.text || ''

  if (!args[0] && !quotedText) {
    return conn.reply(m.chat, `🚩 *الاستخدام:* ${usedPrefix + command} [اللغة] [النص]\n*مثال:* ${usedPrefix + command} مرحبًا, كيف حالك؟`, m)
  }

  let lang = 'es'
  let textToTranslate = text

  if (args[0] && args[0].length === 2) {
    lang = args[0]
    textToTranslate = args.slice(1).join(' ')
  }

  const finalSelection = textToTranslate || quotedText

  if (!finalSelection) return conn.reply(m.chat, '🚩 لم أتمكن من العثور على نص لترجمته.', m)

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(finalSelection)}`

  try {
    const res = await fetch(url)
    const json = await res.json()

    if (!json || !json[0]) throw 'ولم يتم الحصول على أي رد من المترجم.'

    const translation = json[0].map(part => part[0]).join('')

    const responseMsg = `*— الترجمة —*\n\n` +
                        `*الأصل:* ${finalSelection}\n` +
                        `*النتيجة (${lang}):* {translation} دولار`

    await conn.sendMessage(m.chat, { text: responseMsg }, { quoted: m })
  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '🚩 حدث خطأ أثناء الاتصال بترجمة Google.', m)
  }
}

handler.command = ['translate', 'trad', 'tr', 'traducir', 'treaductor', 'transle']
handler.help = ['translate']
handler.tags = ['tools']

export default handler
