import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, isAdmin, isROwner }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./Sessions/SubBot', senderNumber)

  if (!(isAdmin || isROwner || fs.existsSync(botPath))) {
    return m.reply(
      `uhㅤ⌗ ليس لديك الأذونات اللازمة لاستخدام هذا الأمر.`, 
      m
    )
  }

  global.db.data.chats[m.chat].isBanned = false

  m.reply(
    `˚∩ تم إلغاء حظر الروبوت بنجاح.`
  )
}

handler.help = ['desbanearbot']
handler.tags = ['grupos']
handler.command = ['desbanearbot', 'unbanchat']
handler.group = true

export default handler
