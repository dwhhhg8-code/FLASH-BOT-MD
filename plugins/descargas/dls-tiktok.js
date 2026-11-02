import fetch from 'node-fetch'
import { generateWAMessageFromContent, generateWAMessageContent, proto } from '@whiskeysockets/baileys'

var handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
      `🎃 [ 🕸️ ] نسيت رابط التيك توك... هل تخاف من كشف البوابة؟\n\n[ 🦇 ] مثال: ${usedPrefix + command} https://vm.tiktok.com/ZMkcmTCa6/`
    )
  }

  if (!args[0].match(/(https?:\/\/)?(www\.)?(vm\.|vt\.)?tiktok\.com\//)) {
    return m.reply(
      `🎃 [ ⚠️ ] هذا الرابط لا ينتمي إلى TikTok. لا تحاول خداع الظل.`
    )
  }

  try {
    await m.react('🎃')
    await conn.reply(
      m.chat,
      '🎃 [ ⏳ ] استدعاء الفيديو في ظلال الهالوين... تحضير نقل الأبعاد... 🦇',
      m
    )

    const tiktokData = await tiktokdl(args[0])

    if (!tiktokData || !tiktokData.data) {
      return m.reply(
        '🎃 [ 🕳️ ] الظل لم يتمكن من استخراج الفيديو . الرابط ملعون.'
      )
    }

    const videoURL = tiktokData.data.play
    const flashInfo = `🎃📜 الجزء المستخرج:\n> ${tiktokData.data.title || 'بدون عنوان'}`

    const businessHeader = {
      key: { remoteJid: m.chat, participant: '0@s.whatsapp.net', fromMe: false, id: 'FlashHeader' },
      message: {
        locationMessage: {
          name: '🎃 التيك توك • الهالوين 🦇',
          jpegThumbnail: Buffer.from(await (await fetch('https://files.catbox.moe/dsgmid.jpg')).arrayBuffer()),
          vcard:
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'N:;Flash;;;\n' +
            'FN:Flash\n' +
            'ORG:فلاش بوت الهالوين\n' +
            'TITLE:\n' +
            'item1.TEL;waid=5804242773183:+58 0424-2773183\n' +
            'item1.X-ABLabel:Flash\n' +
            'X-WA-BIZ-DESCRIPTION:تم استدعاء الأرشيف من Coven of Flash\n' +
            'X-WA-BIZ-NAME:FLASH BOT\n' +
            'END:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    }

    const media = await generateWAMessageContent({
      video: { url: videoURL },
      caption: '🎃🦇 اكتمال ناقل الحركة الفائق 🦇🎃\n\n' + flashInfo
    }, { upload: conn.waUploadToServer, jid: m.chat })

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: { text: 'اكتمل النقل - أرشيف الظل\n\n' + flashInfo },
            footer: { text: '⚔️ فلاش بوت' },
            header: {
              hasMediaAttachment: true,
              videoMessage: media.videoMessage
            },
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              messageParamsJson: '',
              buttons: [
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Copiar',
                    copy_code: '*أنا أحب يوسو 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 uwu*'
                  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'افتح TikTok',
                    url: args[0],
                    merchant_url: args[0]
                  })
                }
              ]
            }),
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: false
            }
          })
        }
      }
    }, {
      quoted: businessHeader,
      userJid: conn.user?.jid || conn.user?.id,
      upload: conn.waUploadToServer
    })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (error1) {
    await conn.reply(
      m.chat,
      `[ 🩸 ] تم اكتشاف خطأ: ${error1}\nالظلال لا تغفر الأخطاء...`,
      m
    )
  }
}

handler.help = ['tiktok']
handler.tags = ['descargas']
handler.command = ['tt', 'tiktok']

export default handler

async function tiktokdl(url) {
  const tikwm = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
  const response = await (await fetch(tikwm, { signal: AbortSignal.timeout(20000) })).json()
  return response
      }
