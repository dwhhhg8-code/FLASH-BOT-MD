import yts from "yt-search"
import fetch from "node-fetch"
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from "@whiskeysockets/baileys"

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) return m.reply("🌑✦ أدخل بحث يوتيوب.")

  try {
    await m.react("🕸️")

    const results = await yts(text)
    const videos = results.all.filter(v => v.type === "video")
    if (!videos.length) throw new Error("لم يتم العثور على نتائج.")

    const first = videos[0]
    const smallThumb = await (await fetch("https://i.postimg.cc/rFfVL8Ps/image.jpg")).buffer()

    const businessHeader = {
      key: { participants: "0@s.whatsapp.net", fromMe: false, id: "FlashYT" },
      message: {
        locationMessage: {
          name: "🔍 بحث يوتيوب",
          jpegThumbnail: smallThumb,
          vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;YouTube;;;\nFN:YouTube\nORG:FLASH BOT\nEND:VCARD"
        }
      },
      participant: "0@s.whatsapp.net"
    }

    const media = await prepareWAMessageMedia(
      { image: { url: first.thumbnail } },
      { upload: conn.waUploadToServer }
    )

    const rows = videos.slice(0, 20).map(v => ({
      title: v.title,
      description: `⏱ ${v.timestamp} | القناة: ${v.author.name}`,
      id: `${usedPrefix}play ${v.url}` 
    }))

    const interactive = proto.Message.InteractiveMessage.fromObject({
      body: { text: "🌑✦ حدد مقطع فيديو من القائمة لتنزيله تلقائيًا." },
      footer: { text: "فلاش بوت - بحث يوتيوب" },
      header: {
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "📜 قائمة النتائج",
              sections: [
                {
                  title: "نتائج يوتيوب",
                  highlight_label: "🔎",
                  rows
                }
              ]
            })
          }
        ]
      },
      contextInfo: {
        mentionedJid: [m.sender]
      }
    })

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: { interactiveMessage: interactive }
        }
      },
      { quoted: businessHeader }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react("✔️")

  } catch (e) {
    await m.react("✖️")
    m.reply(`⚠️ خطأ:\n${e.message}`)
  }
}

handler.all = async function (m) {
  if (!m.message) return
  const type = m.message.interactiveResponseMessage?.body?.text
  if (type && type.startsWith(this.prefix || "/")) {
    this.emit('chat-update', {
      ...m,
      message: {
        extendedTextMessage: { text: type }
      }
    })
  }
}

handler.command = ["ytbuscar", "ytsearch", "yts"]
export default handler
