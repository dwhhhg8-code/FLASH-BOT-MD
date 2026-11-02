import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { conn, usedPrefix, text }) => {
  if (m.fromMe) return
  if (!/^https?:\/\//.test(text)) 
    return m.reply(`🎃🦇 *تلميذ الظلال*, قم بتوفير *عنوان URL* لاستدعاء محتواه في عيد الهالوين. 🕯️\n\n> 🕸️ *مثال:* ${usedPrefix}get https://api.github.com`)

  let url = text
  await m.react('🎃')

  try {
    let res = await fetch(url)

    if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
      throw `📦 الملف الموجود في السرداب كبير جدًا (${res.headers.get('content-length')})`
    }

    if (!/text|json/.test(res.headers.get('content-type'))) {
      await m.react('🦇')
      return conn.sendFile(m.chat, url, 'flash_file', `🎃 *ملف تم استدعاؤه من ظلال الهالوين* 🦇`, m)
    }

    let txt = await res.buffer()
    try {
      txt = format(JSON.parse(txt + ''))
    } catch (e) {
      txt = txt + ''
    } finally {
      m.reply(`🎃 *Grimoire of Flash – إصدار الهالوين* 🦇\n\n${txt.slice(0, 65536)}`)
      await m.react('🦇')
    }

  } catch (e) {
    await m.react('✖️')
    conn.reply(m.chat, `🎃⚠️ فشلت طقوس الاستدعاء في الظل...\n> استخدم *${usedPrefix}report* لإبلاغ المحكمة بذلك.\n\n🦇 ${e.message}`, m)
  }
}

handler.help = ['get']
handler.tags = ['tools']
handler.command = ['fetch', 'get']

export default handler
