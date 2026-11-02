import yts from "yt-search"
import { firstYouTubeResult } from "../../lib/youtube-search.js"
import { downloadYouTube } from "../../lib/apiowo.js"
import fetch from "node-fetch"
import fs from "fs"
import path from "path"
import crypto from "crypto"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function toOggOpus(mp3Buf) {
  const tmp = path.join(process.cwd(), "temp")
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true })
  
  const id = crypto.randomBytes(6).toString("hex")
  const inp = path.join(tmp, `in_${id}.mp3`)
  const out = path.join(tmp, `out_${id}.ogg`)
  
  fs.writeFileSync(inp, mp3Buf)
  await execAsync(
    `ffmpeg -y -i "${inp}" -vn -map_metadata -1 -ac 1 -ar 48000 -c:a libopus -b:a 96k -vbr on -application audio -f ogg "${out}"`
  )
  const buf = fs.readFileSync(out)
  
  try { fs.unlinkSync(inp) } catch {}
  try { fs.unlinkSync(out) } catch {}
  
  return buf
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`[ 🕸️ ] التنسيق غير صحيح. كشف البوابة باستخدام:\n${usedPrefix + command}channel_id | اسم الموسيقى أو الرابط`)

  const parts = text.split('|')
  if (parts.length < 2) return m.reply(`[ ⚠️ ] افصل وجهة الاستدعاء باستخدام '|' حاجِز. على سبيل المثال:\n${usedPrefix + command} 120363300000000000@newsletter | سماحة في موضوع الظل`)

  const channelId = parts[0].trim()
  const searchQuery = parts.slice(1).join('|').trim()

  if (!channelId || !searchQuery) return m.reply(`[ 🕳️ ] تم فقدان معرف القناة أو أثر الموسيقى في الفراغ. تأكد من هيكلة الأمر بشكل جيد.`)

  await m.react("🔥")

  try {
    let url = searchQuery
    let title = "غير معروف"
    let authorName = "غير معروف"
    let durationTimestamp = "Desconocida"
    let views = 0
    let thumbnail = ""

    const isUrl = /^https?:\/\/\S+/i.test(url)

    if (isUrl) {
      if (!isYouTubeUrl(url)) {
        if (m.react) await m.react("❌")
        return m.reply("[ ⚠️ ] هذا الرابط لا ينتمي إلى عالم اليوتيوب. لا تحاول خداع الظل.")
      }

      const videoId = extractVideoId(url)
      if (!videoId) {
        return m.reply("[ 🕳️ ] لم أتمكن من استخراج جوهر هذا الفيديو.")
      }

      const res = await yts({ videoId })
      if (!res) {
        return m.reply("[ 🕳️ ] لم يتمكن الظل من الحصول على معلومات من هذا الأرشيف الكوني.")
      }

      title = res.title || title
      authorName = res.author?.name || authorName
      durationTimestamp = res.timestamp || durationTimestamp
      views = res.views || views
      thumbnail = res.thumbnail || thumbnail
      url = res.url || url
    } else {
      const video = await firstYouTubeResult(url)
      if (!video) {
        if (m.react) await m.react("❌")
        return m.reply("[ 🕳️ ] قام الظل بالبحث في حدود الشبكة ولم يعثر على شيء.")
      }

      title = video.title || title
      authorName = video.author?.name || authorName
      durationTimestamp = video.timestamp || durationTimestamp
      views = video.views || views
      url = video.url || url
      thumbnail = video.thumbnail || thumbnail
    }

    const vistas = formatViews(views)

    const fallbackThumbRes = await fetch("https://files.catbox.moe/dsgmid.jpg")
    const fallbackThumb = Buffer.from(await fallbackThumbRes.arrayBuffer())

    const fkontak = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        locationMessage: {
          name: `『 ${title} 』`,
          jpegThumbnail: fallbackThumb
        }
      }
    }

    const caption = `
✧━───『 𝙸𝚗𝚏𝚘 𝚍𝚎𝚕 𝚅𝚒𝚍𝚎𝚘 』───━✧

🎼 𝑻𝒊́𝒕𝒖𝒍𝒐: ${title}
📺 𝑪𝒂𝒏𝒂𝒍: ${authorName}
👁️ 𝑽𝒊𝒔𝒕𝒂𝒔: ${vistas}
⏳ 𝑫𝚞𝒓𝒂𝒄𝒊𝒐́𝒏: ${durationTimestamp}
🌐 𝑬𝒏𝒍𝒂𝒄𝒆: ${url}

✧━───『 𝑺𝒉𝒂𝒅𝒐𝒘 𝑩𝒐𝒕 』───━✧
⚡ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒀𝒐𝒔𝒖𝒆 & 𝑺𝒉𝒂𝒅𝒐𝒘 𝑮𝒂𝒓𝒅𝒆𝚗 ⚡
`.trim()

    let thumb = fallbackThumb

    if (thumbnail) {
      try {
        thumb = (await conn.getFile(thumbnail)).data
      } catch {
        thumb = fallbackThumb
      }
    }

    await conn.sendMessage(
      m.chat,
      {
        image: thumb,
        caption
      },
      { quoted: fkontak }
    )

    await downloadMediaToChannel(conn, m, url, channelId)
    await m.react("⚔️")
  } catch (e) {
    console.error(e)
    await m.reply("[🩸] كشفت الظلال عن وجود شذوذ في النظام:" + e.message)
    await m.react("⚠️")
  }
}

const downloadMediaToChannel = async (conn, m, url, channelId) => {
  try {
    const sent = await conn.sendMessage(
      m.chat,
      { text: "[ ⏳ ] استدعاء الفن المحرم...نقل الصوت إلى القناة المقصودة..." },
      { quoted: m }
    )

    const dl = await downloadYouTube(url, "audio")
    const fileUrl = dl.download
    const fileTitle = cleanName(dl.title || "audio")

    const audioRes = await fetch(fileUrl)
    const audioArrayBuffer = await audioRes.arrayBuffer()
    const mp3Buf = Buffer.from(audioArrayBuffer)

    if (mp3Buf.length < 50000) {
      throw new Error("الملف الصوتي المستلم صغير جدًا.")
    }

    const opusBuf = await toOggOpus(mp3Buf)
    if (opusBuf.length < 10000) {
      throw new Error("فشل تحويل الصوت إلى Opus.")
    }

    await conn.sendMessage(channelId, {
      audio: opusBuf,
      mimetype: "audio/ogg; codecs=opus",
      ptt: false,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 99,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelId,
          serverMessageId: 100,
          newsletterName: "فلاش بوت",
        },
      },
    })

    try {
      await conn.sendMessage(
        m.chat,
        {
          text: `⚔️ اكتمل نقل الأبعاد.\n\n🎼 العنوان: ${fileTitle}\n👁️ الوجهة: قناة الظلال`,
          edit: sent.key
        }
      )
    } catch {
      await m.reply(`⚔️ اكتمل نقل الأبعاد.\n\n🎼 العنوان: ${fileTitle}`)
    }
  } catch (e) {
    console.error(e)
    await m.reply("[ 🩸 ] فشلت الظلال في تحويل التدفق إلى القناة. تأكد من تثبيت FFmpeg ومن صحة المعرف (على سبيل المثال: 120363xxxxxxx@newsletter):" + e.message)
    await m.react("⚠️")
  }
}

const cleanName = (name) =>
  String(name).replace(/[^\w\s._-]/gi, "").substring(0, 50)

const formatViews = (views) => {
  const n = Number(views)
  if (!n || Number.isNaN(n)) return "غير متوفر"
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toString()
}

const isYouTubeUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)
}

const extractVideoId = (url) => {
  const match =
    url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&/]|\b)/) ||
    url.match(/youtu\.be\/([0-9A-Za-z_-]{11})/)
  return match?.[1] || null
}

handler.command = ["playch"]
handler.tags = ["descargas"]
handler.help = ['playch']
handler.register = false

export default handler
