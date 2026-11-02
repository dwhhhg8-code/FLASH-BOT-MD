const handler = async (m, { conn, args, participants, command }) => {
  const prefix = args[0]
  if (!prefix || !prefix.startsWith('+')) {
    return m.reply(`⚠️ ❄️ تتطلب ظلال العطلات بادئة صالحة.\nمثال: *.${command} +52*`)
  }

  const botNumber = conn.user.id.split(':')[0]

  const groupMetadata = await conn.groupMetadata(m.chat)
  const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)

  const matching = participants.filter(p => 
    p.id.startsWith(prefix.replace('+', '')) &&
    p.id !== botNumber &&
    !admins.includes(p.id)
  )

  if (command === 'listnum' || command === 'listanum') {
    if (matching.length === 0) return m.reply(`👻🌌 الظلال لم تجد أرواحاً بالبادئة ${prefix}...`)

    const lista = matching.map((p, i) => `${i + 1}. wa.me/${p.id.split('@')[0]}`).join('\n')
    return m.reply(`🔎 ❄️ *تقرير عيد الميلاد الخاص بـ FLASH BOT* 🎄\n\nتم اكتشاف المستخدمين بالبادئة ${prefix}:\n\n${lista}\n\n✨ الظلال تراقب حتى خلال هذه العطلات.`)
  }

  if (command === 'kicknum') {
    if (matching.length === 0) return m.reply(`👻🌌 لم يتم العثور على روح بالبادئة ${prefix} ليتم طردها.`)

    for (let p of matching) {
      await conn.groupParticipantsUpdate(m.chat, [p.id], 'remove').catch(_ => null)
    }
    return m.reply(`✅ 🎄 *قام FLASH BOT بطرد أرواح ${matching.length} بالبادئة ${prefix}.*\n\n🌌 ها... هكذا تحتفل الظلال بعيد الميلاد: بانضباط وصمت.`)
  }
}

handler.command = ['kicknum', 'listnum', 'listanum']
handler.group = true
handler.botAdmin = true

export default handler
