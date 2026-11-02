import moment from 'moment-timezone'
import fetch from 'node-fetch'
import { generateWAMessageFromContent, generateWAMessageContent, proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  try {
    await m.react('🎃')
    let res = await fetch('https://api.github.com/repos/dwhhhg8-code/FLASH-BOT-MD')
    if (!res.ok) throw new Error('حدث خطأ أثناء الحصول على البيانات من مستودع FLASH-BOT')
    let json = await res.json()

    let txt = `*𓆩⚡𓆪  𝙁𝙇𝘼𝙎𝙃  𝘽𝙊𝙏  𓆩⚡𓆪*\n\n`
    txt += `⚰️ *مشروع جريمويري*: ${json.name}\n`
    txt += `👀 *أشباح في الظلال* : ${json.watchers_count}\n`
    txt += `📦 *حجم النطاق*: ${(json.size / 1024).toFixed(2)} ميجابايت\n`
    txt += `🕰️ *الاستدعاء الأخير*: ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`
    txt += `🔗 *البوابة السرية* : ${json.html_url}\n`
    txt += `🌌 *استنساخ العالم السفلي* : ${json.forks_count}\n`
    txt += `⭐ *نجوم الليلة الأبدية*: ${json.stargazers_count}\n\n`
    txt += `『🎃』 *في عيد الهالوين, يتم إطلاق العنان لقوة الظلال...*\n\n`
    txt += `👑 *المالك*: haitham`

    const thumbBuffer = await (await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')).buffer()

    const fkontak = {
      key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'FlashScript' },
      message: {
        locationMessage: {
          name: '📜 السيناريو',
          jpegThumbnail: thumbBuffer,
          vcard:
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'N:;script;;;\n' +
            'FN:script\n' +
            'ORG:FLASH BOT Halloween\n' +
            'TITLE:\n' +
            'item1.TEL;waid=5804242773183:+58 0424-2773183\n' +
            'item1.X-ABLabel:Creador\n' +
            'X-WA-BIZ-DESCRIPTION:Repositorio oficial de FLASH BOT Halloween\n' +
            'X-WA-BIZ-NAME:script\n' +
            'END:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    }

    const media = await generateWAMessageContent(
      { image: { url: 'https://files.catbox.moe/owpjte.jpg' } },
      { upload: conn.waUploadToServer }
    )

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: { text: txt },
            footer: { text: '🎃 فلاش بوت • الهالوين 🦇' },
            header: {
              hasMediaAttachment: true,
              imageMessage: media.imageMessage
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: '📦 جريمويري البوت 🎃',
                    url: json.html_url
                  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: '📞 تواصل مع اللورد الظل',
                    url: 'https://wa.me/5804242773183'
                  })
                }
              ],
              messageParamsJson: ''
            },
            contextInfo: {
              mentionedJid: [m.sender]
            }
          })
        }
      }
    }, { quoted: fkontak })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    await conn.reply(m.chat, `🌑⚔️ خطأ في مجال الظل:\n${e}`, m)
  }
}

handler.help = ['script']
handler.tags = ['main']
handler.command = ['script', 'sc']
handler.register = true

export default handler
