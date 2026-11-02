import fetch from 'node-fetch'

var handler = async (m, { conn, text, args, usedPrefix }) => {
  if (!text) return m.reply(`✩ يرجى تقديم مصطلح البحث الذي ترغب في إجرائه إلى *Google*.

Ejemplo: ${usedPrefix}google gatos curiosos`)

  await m.react('🕒')

  const apiUrl = `${global.APIs.delirius.url}/search/googlesearch?query=${encodeURIComponent(text)}`
  const maxResults = Number(args[1]) || 3

  try {
    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error('No se pudo conectar con la API')

    const result = await response.json()
    if (!result.status || !Array.isArray(result.data) || !result.data.length) {
      await m.react('✖️')
      return conn.sendMessage(m.chat, { text: 'ꕥ لم يتم العثور على نتائج لهذا البحث.', ...rcanal }, { quoted: m })
    }

    let replyMessage = `「ᜊ」نتائج البحث عن *<${text}>*\n\n`
    result.data.slice(0, maxResults).forEach((item, index) => {
      replyMessage += `> ✐ Título » *${index + 1}. ${item.title || 'بدون عنوان'}*\n`
      replyMessage += `> ⴵ Descripción » ${item.description ? `*${item.description}*` : '_لا يوجد وصف_'}\n`
      replyMessage += `> 🜸 Link » ${item.url || '_لا يوجد عنوان URL_'}\n\n`
    })

    await conn.sendMessage(m.chat, { text: replyMessage.trim(), ...rcanal }, { quoted: m })
    await m.react('✔️')
  } catch (error) {
    await m.react('✖️')
    await conn.sendMessage(m.chat, { text: `⚠︎ حدثت مشكلة.
> Usa *${usedPrefix}report* للإبلاغ عنه.

${error.message}`, ...rcanal }, { quoted: m })
  }
}

handler.help = ['search']
handler.tags = ['search']
handler.command = ['search', 'google']
handler.group = true

export default handler
