import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import FormData from "form-data"

async function uploadToCatbox(content, filename) {
  const form = new FormData()
  form.append("reqtype", "fileupload")
  form.append("fileToUpload", content, filename)

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form
  })

  const text = await res.text()
  if (!text || !text.startsWith("https://")) throw new Error("❌ حدث خطأ أثناء تحميل الفيديو على Catbox.")
  return text
}

const handler = async (m, { conn, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, "")
  const botPath = path.join("./Sessions/SubBot", senderNumber)
  const configPath = path.join(botPath, "config.json")

  if (!fs.existsSync(botPath)) return m.reply("> ꕤ هذا الأمر مخصص لـ *المآخذ* فقط.")

  try {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || q.mediaType || ""

    if (!mime || !/video\/(mp4|mkv|mov)/.test(mime)) {
      return conn.sendMessage(m.chat, {
        text: `❐ الرجاء الرد على 🎞️ *فيديو صالح* (MP4, MKV, MOV) باستخدام *.${command}*`,
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: "🕓", key: m.key } })

    const media = await q.download()
    if (!media) throw new Error("❌لا يمكن تنزيل الفيديو.")

    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${mime.split("/")[1]}`
    const uploadUrl = await uploadToCatbox(media, filename)

    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}
    config.video = uploadUrl
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    await conn.sendMessage(m.chat, {
      text: `✩︎ تم تحديث الفيديو بنجاح:\n${uploadUrl}`,
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, {
      text: "❌لا يمكن تحميل الفيديو, يرجى المحاولة مرة أخرى في وقت لاحق.",
    }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: "✖️", key: m.key } })
  }
}

handler.command = ["setvid"]
handler.help = ["setvid"]
handler.tags = ["socket"]
export default handler 