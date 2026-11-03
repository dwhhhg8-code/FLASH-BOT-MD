import fs from 'fs'
import { prepareWAMessageMedia, generateWAMessageFromContent } from "@whiskeysockets/baileys"

const botname = "فلاش بوت"
const channelRD = global.channelRD || { id: "0@newsletter", name: "قناة الظل" }

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const delay = ms => new Promise(res => setTimeout(res, ms))

    let user = global.db.data.users[m.sender] || {}
    let nombre = await conn.getName(m.sender)
    let limite = user.limit || 0
    let totalreg = Object.keys(global.db.data.users).length
    let groupsCount = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us')).length
    let muptime = clockString(process.uptime() * 1000)

    let infoUser = `
🎃 ʜᴏʟᴀ, ${nombre} 🦇
*«ظلال المعشر ترحب بكم...»* 🕯️

*乂 معلومات المقاول 🎃 🦇*
┌ ◦ الحالة: المستخدم 🕯️
└  ◦ ʟíᴍɪᴛᴇ: ${limite} 🩸

*乂 🕸️ ɪɴꜰᴏ ᴅᴇ ʟᴀ ꜱᴏᴍʙʀᴀ ⚰️*
┌  ◦ ᴄíʀᴄᴜʟᴏꜱ: ${groupsCount} 🏰
│  ◦ ᴛɪᴇᴍᴘᴏ ᴀᴄᴛɪᴠᴏ: ${muptime} ⏳
│  ◦ ᴀʟᴍᴀꜱ: ${totalreg} 👻
└  ◦ ʀᴇɪɴᴏ: ʟɪɴᴜx 🌘
`.trim()

    let comandosAnime = `
*╭──* 🎃 \`الأرواح الأركانية\` *🦇*
*│ 🕸️*  .قهوه/cafe @tag
*│ 🕸️*  .كوسبلاي
*│ 🕸️*  .اقترب/acurrucarse @tag
*│ 🕸️*  .ارقص/bailar @tag
*│ 🕸️*  .اكل/comer @tag
*│ 🕸️*  .فرحان/feliz @tag
*│ 🕸️*  .سلام/hola @tag
*│ 🕸️*  .استخبى @tag
*│ 🕸️*  .حضن/abrazar @tag
*│ 🕸️*  .اقتل
*│ 🕸️*  .اقتله @tag
*│ 🕸️*  .كيس/besar @tag
*│ 🕸️*  .بوسهقويه
*│ 🕸️*  .بوسه2 @tag
*│ 🕸️*  .بوسهخد @tag
*│ 🕸️*  .اضحك/reirse @tag
*│ 🕸️*  .اتسند @tag
*│ 🕸️*  .الحس @tag
*│ 🕸️*  .بص @tag
*│ 🕸️*  .love2/enamorada @tag
*│ 🕸️*  .عض @tag
*│ 🕸️*  .دللني @tag
*│ 🕸️*  .patt/acariciar @tag
*│ 🕸️*  .عابس/pucheros @tag
*│ 🕸️*  .pregg/embarazar @tag
*│ 🕸️*  .زعلان/triste @tag
*│ 🕸️*  .اغوي/seducir @tag
*│ 🕸️*  .صفعه/bofetada @tag
*│ 🕸️*  .دخن @tag
*│ 🕸️*  .وايفو
*│ 🕸️*  .اتاوب @tag
*╰─────────────╯*`.trim()

    let finalMenu = infoUser + '\n\n' + comandosAnime
    let imagen = 'https://u.pone.rs/aooiuczq.jpg'

    let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;Itachi;;;\nFN:Itachi\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Celular\nEND:VCARD`
    let qkontak = { 
      key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" }, 
      message: { contactMessage: { displayName: "فلاش بوت", vcard: vcard } } 
    }

    await m.react('🎃')

    let media;
    try {
      media = await prepareWAMessageMedia({ image: { url: imagen } }, { upload: conn.waUploadToServer })
    } catch {
      media = null
    }

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: finalMenu },
            footer: { text: "🎃 " + botname + " 🦇" },
            header: media ? {
              hasMediaAttachment: true,
              imageMessage: media.imageMessage
            } : undefined,
            nativeFlowMessage: {
              buttons: [
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🎃 القناة الرسمية 🦇",
                    url: "https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O"
                  })
                }
              ]
            },
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardingScore: 999,
              forwardedNewsletterMessageInfo: {
                newsletterJid: channelRD.id,
                serverMessageId: '',
                newsletterName: channelRD.name
              }
            }
          }
        }
      }
    }, { quoted: qkontak })

    await conn.relayMessage(m.chat, msg.message, {})
    await delay(400)

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { text: `✘ ظهر خطأ في قائمة الأنمي: ${e.message}` })
  }
}

handler.help = ['menuanime']
handler.tags = ['main']
handler.command = ['menuanime']
handler.register = true

export default handler

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
      }
