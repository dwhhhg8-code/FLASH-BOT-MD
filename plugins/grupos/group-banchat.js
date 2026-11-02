import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, isAdmin, isROwner }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./Sessions/SubBot', senderNumber)

  if (!(isAdmin || isROwner || fs.existsSync(botPath))) {
    return m.reply(
      `uhㅤ⌗ ليس لديك أذونات, ولا يمكن استخدامها إلا بواسطة *admins* *sockets* أو *المالك.*`, 
      m
    )
  }

  global.db.data.chats[m.chat].isBanned = true

  m.reply(
    `> ⌗ تم حظر الروبوت بنجاح في هذه المجموعة.`
  )
}

handler.help = ['banearbot']
handler.tags = ['grupos']
handler.command = ['banearbot', 'banchat']
handler.group = true

export default handler
