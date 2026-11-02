import ws from 'ws'

const handler = async (m, { conn, usedPrefix }) => {
  const chat = global.db.data.chats[m.chat]

  if (!chat.primaryBot) {
    return conn.reply(m.chat, `⚠︎ لا يوجد بوت أساسي في هذه المجموعة.`, m)
  }

  try {
    const oldPrimary = chat.primaryBot
    chat.primaryBot = null

    conn.reply(
      m.chat, 
      `✧ تمت إزالة الروبوت الأساسي @${oldPrimary.split`@`[0]}.\n> الآن تستجيب جميع برامج الروبوت في هذه المجموعة مرة أخرى.`, 
      m, 
      { mentions: [oldPrimary] }
    )
  } catch (e) {
    conn.reply(
      m.chat, 
      `⚠︎ حدثت مشكلة أثناء محاولة إزالة الروبوت الأصلي.\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${e.message}`, 
      m
    )
  }
}

handler.help = ['delprimary']
handler.tags = ['grupos']
handler.command = ['delprimary']
handler.group = true
handler.admin = true  

export default handler
