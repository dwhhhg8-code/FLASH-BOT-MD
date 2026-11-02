import { searchYouTube, firstYouTubeResult } from "../../lib/youtube-search.js"
import { downloadYouTube } from "../../lib/apiowo.js"
import fetch from "node-fetch"
import { generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(`💫 *استدعاء الظل*\n\n🎶 انطق اسم الفيديو أو امنح رابط YouTube.`)

  const isDirectAudio = ["ytmp3"].includes(command)
  const isDirectVideo = ["playvid", "ytmp4"].includes(command)
  const isSearchAction = ["yt", "ytv"].includes(command)

  try {
    if (isDirectAudio || isDirectVideo) {
      await m.react("🕘")
      let url = text.trim()
      let title = "Video"
      let thumb = ""

      if (!url.startsWith("https://")) {
        const video = await firstYouTubeResult(text)
        if (!video) return m.reply("❌ لم يتم العثور على أي شيء…")
        url = video.url
        title = video.title
        thumb = video.thumbnail
      }

      await downloadMedia(conn, m, url, title, thumb, isDirectAudio ? "mp3" : "mp4")
      return
    }

    if (isSearchAction) {
      await m.react("🕘")
      const results = await searchYouTube(text)
      const videos = results.videos.slice(0, 6)
      if (!videos.length) return m.reply("❌ لم يتم العثور على نتائج.")

      let cards = []
      for (let video of videos) {
        const imageBuffer = (await fetch(video.thumbnail).then(res => res.buffer()))
        const { imageMessage } = await generateWAMessageContent({ image: imageBuffer }, { upload: conn.waUploadToServer })

        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({ 
            text: `✨ *العنوان:* ${video.title}\n🔔 *القناة:* ${video.author.name}\n🎬 *المدة:* ${video.timestamp}\n👁️ *المشاهدات:* ${video.views.toLocaleString()}` 
          }),
          footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "فلاش بوت – يوتيوب" }),
          header: proto.Message.InteractiveMessage.Header.fromObject({ 
            title: "نتائج البحث", 
            hasMediaAttachment: true, 
            imageMessage 
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: "🎵 الصوت",
                  id: `${usedPrefix}ytmp3 ${video.url}`
                })
              },
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: "🎥 فيديو",
                  id: `${usedPrefix}ytmp4 ${video.url}`
                })
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "🌐 شاهد على اليوتيوب",
                  url: video.url
                })
              }
            ]
          })
        })
      }

      const messageContent = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({ text: `🌑✦ نتائج لـ: *${text}*` }),
              footer: proto.Message.InteractiveMessage.Footer.create({ text: "حدد خيارًا من الرف الدائري" }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
            })
          }
        }
      }, { quoted: m })

      await conn.relayMessage(m.chat, messageContent.message, { messageId: messageContent.key.id })
      await m.react("✅")
    }

  } catch (error) {
    await m.reply(`❌ *الظل — خطأ*\n\n${error.message}`)
    await m.react("⚠️")
  }
}

const downloadMedia = async (conn, m, url, title, thumbnail, type) => {
  try {
    const isAudio = type === "mp3" || type === "audio"
    const cleanTitle = cleanName(title) + (isAudio ? ".mp3" : ".mp4")
    const msg = `🎶 *الظل — التنزيل قيد التقدم (APIOWO)*\n\n✨ *العنوان:* ${title}\n🌌 جارٍ إعداد ${isAudio ? "audio..." : "video..."}`
    
    let sent = await conn.sendMessage(m.chat, { text: msg }, { quoted: m })

    const result = await downloadYouTube(url, isAudio ? "audio" : "video")
    const downloadUrl = result.download
    const fileTitle = result.title || title

    if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: { url: downloadUrl },
        mimetype: "audio/mpeg",
        fileName: cleanTitle
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: downloadUrl },
        mimetype: "video/mp4",
        fileName: cleanTitle
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      text: `🎶 *الظل — اكتملت العملية*\n\n✨ *العنوان:* ${fileTitle}\n🌌 تم التسليم بالكامل.`,
      edit: sent.key
    })
    await m.react("✅")

  } catch (error) {
    await m.reply(`❌ *الظل — فالا*\n\n${error.message}`)
    await m.react("❌")
  }
}

const cleanName = (name) => name.replace(/[^\w\s-_.]/gi, "").substring(0, 50)

handler.command = ["ytmp3", "playvid", "ytv", "ytmp4", "yt"]
handler.tags = ["descargas"]
handler.register = true

export default handler
