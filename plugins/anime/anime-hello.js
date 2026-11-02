import { enviarReaccionAnime } from '../../lib/anime-media.js'
import { resolverObjetivo, nombreSeguro } from '../../lib/anime-mention.js'

let handler = async (m, { conn, participants, groupMetadata, text, args, usedPrefix }) => {
  try {
    const { who, via, hasMention } = await resolverObjetivo(m, { conn, participants, groupMetadata, text, args })
    const hayMencion = hasMention || via === 'mention' || via === 'text'
    const name = await nombreSeguro(conn, who)
    const name2 = await nombreSeguro(conn, m.sender)

    await conn.sendMessage(m.chat, { react: { text: '👋', key: m.key } })

    let caption
    if (hayMencion) {
      caption = `\`${name2}\` *مرحبا* \`${name}\` *كيف حالك؟*`
    } else if (via === 'quoted') {
      caption = `\`${name2}\` *مرحبا* \`${name}\` *كيف حالك اليوم؟*`
    } else {
      caption = `\`${name2}\` *تحية لجميع أعضاء المجموعة, كيف حالكم؟*`
    }

    const mentions = who ? [who] : []
    await enviarReaccionAnime(conn, m, { reaccion: 'hi', caption, mentions })
  } catch (err) {
    await conn.sendMessage(m.chat, { text: `☽ خطأ في الترحيب: ${err.message}` }, { quoted: m })
  }
}

handler.help = ['hello/hola @tag']
handler.tags = ['anime']
handler.command = ['hello', 'hola']
handler.group = true

export default handler
