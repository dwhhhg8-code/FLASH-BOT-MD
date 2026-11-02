import axios from 'axios'
import { generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { nombreSeguro } from '../../lib/anime-mention.js'

const newsletterJid  = '120363410090342500@newsletter'
const newsletterName = '👑فلاش بوت uwu👑'

const packname = '👑فلاش بوت 👑'
const dev = 'تم إنشاؤها بواسطة يوسوي'
const redes = 'https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O'
const icons = 'https://files.catbox.moe/6bgv7s.jpg'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const contextInfo = {
      mentionedJid: [m.sender],
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
        newsletterJid,
        newsletterName,
        serverMessageId: -1
      }
    }

    await m.react('❤️')
    await conn.reply(m.chat, '🌌 *أبحث لك عن وايفو جميل...*', m, { contextInfo })

    const res = await axios.get('https://nekos.best/api/v2/waifu', { timeout: 10000 })
    if (!res.data?.results?.[0]?.url) throw new Error('لم تُرجع واجهة برمجة التطبيقات (API) صورة صالحة.')

    let url = res.data.results[0].url

    const imgRes = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 })
    const buffer = Buffer.from(imgRes.data)

    const { imageMessage } = await generateWAMessageContent({ image: buffer }, { upload: conn.waUploadToServer })
    if (!imageMessage) throw new Error('لا يمكن إنشاء مكون الصورة.')

    const caption = `🌌 *Aquí tienes tu waifu, ${await nombreSeguro(conn, m.sender)}* 👑

💫 هل تريد واحدة أخرى؟ فقط اضغط على الزر أدناه.`

    const messageContent = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
              footer: proto.Message.InteractiveMessage.Footer.create({ text: '👑 شادو بوت إم دي' }),
              header: proto.Message.InteractiveMessage.Header.create({
                title: 'الظل وايفوس',
                hasMediaAttachment: true,
                imageMessage
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                  {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                      display_text: '🔁الويفو التالي',
                      id: `${usedPrefix}${command}`
                    })
                  },
                  {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                      display_text: '🌐 قناة الظل',
                      url: redes
                    })
                  }
                ]
              })
            })
          }
        }
      },
      { quoted: m, contextInfo }
    )

    await conn.relayMessage(m.chat, messageContent.message, { messageId: messageContent.key.id })
    await m.react('✅')

  } catch (e) {
    await conn.reply(m.chat, `❌ حدث خطأ أثناء معالجة الأمر.\n> التفاصيل: ${e.message}`, m)
    await m.react('⚠️')
  }
}

handler.help = ['waifu']
handler.tags = ['anime']
handler.command = ['waifu']
handler.group = true
handler.register = true

export default handler
