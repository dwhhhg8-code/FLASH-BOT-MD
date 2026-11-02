import { exec } from "child_process"
import fs from "fs"

let handler = async (m, { conn }) => {
  try {
    exec("df -h / && df -i /", (err, stdout) => {
      if (err) return conn.reply(m.chat, "⚠ خطأ في فحص القرص", m)
      conn.reply(m.chat, "📊 حالة الخادم:\n\n" + stdout, m)
    })

    let tempPath = "./tmp"
    if (fs.existsSync(tempPath)) {
      let files = fs.readdirSync(tempPath)
      for (let file of files) {
        fs.unlinkSync(`${tempPath}/${file}`)
      }
      conn.reply(m.chat, "🧹 تم تنظيف المجلد المؤقت ✅", m)
    }

    if (fs.existsSync("/tmp")) {
      exec("rm -rf /tmp/*", (err) => {
        if (!err) conn.reply(m.chat, "🧹تم تنظيف المجلد /tmp ✅", m)
      })
    }
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, "⚠ حدث خطأ أثناء إخلاء المساحة.", m)
  }
}

handler.help = ["limpiar"]
handler.tags = ["owner"]
handler.command = ["limpiar", "checkspace"]

export default handler
