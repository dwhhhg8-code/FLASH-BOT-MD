// créditos reservados para wilkerson
let handler = async (m, { conn }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.primaryBot) {
    return m.reply('ℹ️ لا يوجد بوت رئيسي في هذه المجموعة.')
  }

  let botJid = chat.primaryBot
  m.reply(`🤖 البوت الرئيسي في هذه المجموعة هو:\n*${botJid}*`)
}

handler.help = ['verprimary']
handler.tags = ['socket']
handler.command = ['verprimary']
handler.group = true
handler.admin = true

export default handler
