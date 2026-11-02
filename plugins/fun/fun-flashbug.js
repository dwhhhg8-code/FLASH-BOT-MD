import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  const bannerUrl = 'https://files.catbox.moe/xytfun.jpg'
  const miniaturaUrl = 'https://files.catbox.moe/your_red_icon.jpg'
  const documentoUrl = 'https://files.catbox.moe/xytfun.jpg'

  const media = await prepareWAMessageMedia({ image: { url: bannerUrl } }, { upload: conn.waUploadToServer })
  const thumb = (await conn.getFile(miniaturaUrl)).data

  const cargaTexto = "i ᡃ⃝ᡃ⃝ᡃ⃝...".repeat(5000)

  const content = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: { hasMediaAttachment: true, imageMessage: media.imageMessage },
          body: { text: cargaTexto },
          footer: { text: "⚔️ FLASH-BOT • لوحة عيد الميلاد 🎄" },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "القناة الرسمية 💚",
                  url: "https://www.whatsapp.com/android",
                }),
              },
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "📋 نسخ تحميل تفاعلي",
                  id: "flash-copy",
                  copy_code: cargaTexto
                }),
              },
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "📜 عبارات الظل",
                  sections: [{
                    title: "العبارات المتاحة",
                    rows: [
                      { title: "🎄الظل يراقب في صمت", description: "عبارة غامضة", id: "frase1" },
                      { title: "✨بين أضواء الأعياد يبتسم الظل", description: "عبارة عيد الميلاد", id: "frase2" },
                      { title: "⚔️السماحة تملي القدر", description: "عبارة ملحمية", id: "frase3" },
                      { title: "❄️البرد يحفظ الأسرار الخفية", description: "عبارة الشتاء", id: "frase4" }
                    ]
                  }]
                })
              }
            ],
          },
        },
      },
    },
  }

  const msg = generateWAMessageFromContent(m.chat, content, { userJid: m.sender })
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  await conn.sendMessage(m.chat, {
    document: { url: documentoUrl },
    fileName: '☽ الظل ☽',
    mimetype: 'application/pdf',
    caption: "『📜』 FLASH-BOT...\n مدعوم من FLASHBUG",
    jpegThumbnail: thumb
  }, { quoted: m })
}

handler.help = ['flashbug']
handler.tags = ['fun']
handler.command = ['flashbug']
handler.register = true

export default handler
