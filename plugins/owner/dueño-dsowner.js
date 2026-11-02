import { promises as fs, existsSync } from 'fs'
import path from 'path'

var handler = async (m, { conn }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.reply(m.chat, `استخدم هذا الأمر فقط على الرقم الرئيسي للروبوت.`, m)
  }
  
  await conn.reply(m.chat, `> 🤍 بدء حذف ملفات الجلسة باستثناء creds.json...`, m)
  m.react('🕓') 

  const sessionPath = './Sessions/Principal/'

  try {
    if (!existsSync(sessionPath)) {
      return conn.reply(m.chat, `مجلد الجلسات غير موجود أو أنه فارغ.`, m)
    }

    const files = await fs.readdir(sessionPath)
    let deletedCount = 0

    for (const file of files) {
      if (file !== 'creds.json') {
        await fs.unlink(path.join(sessionPath, file))
        deletedCount++
      }
    }

    if (deletedCount === 0) {
      await conn.reply(m.chat, `لم تكن هناك ملفات لإزالتها, فقط creds.json موجود.`, m)
    } else {
      m.react('✅')
      await conn.reply(m.chat, `تمت إزالة ملفات الجلسة ${deletedCount}, وترك creds.json كما هو.`, m)
      conn.reply(m.chat, `*تم تنظيف البوت بنجاح.*`, m)
    }
  } catch (error) {
    console.error('جلسات تنظيف الأخطاء:', error)
    await conn.reply(m.chat, `حدث خطأ أثناء التنظيف.`, m)
  }
}

handler.help = ['dsowner']
handler.tags = ['owner']
handler.command = ['delai', 'dsowner', 'clearallsession']
handler.rowner = true

export default handler
