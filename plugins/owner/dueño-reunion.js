let handler = async (m, { conn, command, text }) => {
  const emoji = '📢'
  const emoji2 = '⚠️'

  if (!text) return m.reply(`${emoji} الرجاء إدخال سبب الاجتماع.`)
  if (text.length < 10) return m.reply(`${emoji2} الرجاء إدخال 10 أحرف على الأقل.`)

  let texto = `${emoji2} المالك @${m.sender.split`@`[0]} بدأ الاجتماع. انضم إلى مجموعة الموظفين في أقرب وقت ممكن...\n*➪ السبب: ${text}*`
  m.reply(`${emoji} إرسال رسالة الاجتماع لجميع أصحابها.`)

  let mentions = [m.sender]

  for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
    let data = (await conn.onWhatsApp(jid))[0] || {}
    if (data.exists) {
      await conn.sendMessage(data.jid, { text: texto, mentions })
    }
  }
}

handler.tags = ['owner']
handler.command = handler.help = ['reunion', 'meeting']
handler.rowner = true

export default handler
