import axios from "axios"
import { generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const handler = async (m, { conn }) => {
  try {
    await m.react("🎃")

    const creators = [
      {
        name: "haitham",
        role: "👑 المالك الرئيسي",
        number: "201125166486",
        image: "https://github.com/dwhhhg8-code.png",
        description: "⚡ مالك ومطوّر 𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪.\n\n🌐 GitHub: github.com/dwhhhg8-code\n📢 القناة: https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v\n📦 Repo: https://github.com/dwhhhg8-code/FLASH-BOT-MD.git",
        btnLabel: "⚡قناة هيثم ⚡",
        btnUrl: "https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v"
      }
    ]

    let cards = []
    const fallbackImage = "https://files.catbox.moe/mwhyfm.jpg"

    for (let creator of creators) {
      let imageBuffer
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 8000);
        imageBuffer = (await axios.get(creator.image, { responseType: 'arraybuffer', signal: controller.signal })).data
      } catch {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 8000);
        imageBuffer = (await axios.get(fallbackImage, { responseType: 'arraybuffer', signal: controller.signal })).data
      }

      const { imageMessage } = await generateWAMessageContent({ image: imageBuffer }, { upload: conn.waUploadToServer })

      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ 
          text: `⚡ المطور: ${creator.name}\n👑 الدور: ${creator.role}\n\n${creator.description}` 
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ 
          text: "𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪" 
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({ 
          title: `⚡ ${creator.name} ⚡`, 
          hasMediaAttachment: true, 
          imageMessage 
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: `🎃 الدردشة مع ${creator.name}`,
                url: `https://wa.me/${creator.number}?text=${encodeURIComponent("سلام " + creator.name + "، جاي من البوت")}`
              })
            },
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: creator.btnLabel,
                url: creator.btnUrl
              })
            },
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "📦 مستودع جيثب ⚡",
                url: "https://github.com/dwhhhg8-code/FLASH-BOT-MD.git"
              })
            }
          ]
        })
      })
    }

    const messageContent = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({ 
              text: "التعريف الرسمي بمالك المشروع." 
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({ 
              text: "اسحب لرؤية المالك" 
            }),
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, messageContent.message, { messageId: messageContent.key.id })

    await conn.sendMessage(m.chat, { 
      text: "ده مالك 𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪. لو لقيت أي مشكلة أو خطأ، كلّمه على طول (ومتكتبش نص الليل لأننا مش هرد عليك)" 
    }, { quoted: m })

  } catch (error) {
    m.reply(`أُووبس! حدث خطأ ما.\n\nالتفاصيل الفنية: ${error.message}`)
  }
}

handler.tags = ["main"]
handler.help = ["owner"]
handler.command = /^(owner|creators|creadores|owners|desarrolladores)$/i

export default handler
