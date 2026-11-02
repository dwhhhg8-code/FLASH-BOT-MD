let handlerUnreg = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const pp = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://raw.githubusercontent.com/Andresv27728/dtbs/main/shadow.jpg')

  if (!user.registered) {
    return m.reply('『🎃⚠️』 ليس لديك أي اتفاقيات ظل نشطة في السهرة...')
  }

  await m.react('🕯️')

  user.registered = false
  user.name = ''
  user.age = 0

  await conn.sendMessage(m.chat, {
    text: `『🎃💀』 لقد تم كسر الختم الغامض...\n\n🦇 يذوب الظل في ليلة الهالوين الأبدية.`
  }, { quoted: m })

  await conn.sendMessage(m.chat, {
    document: { url: 'https://files.catbox.moe/4vjomv.jpg' },
    mimetype: 'application/pdf',
    fileName: '🎃 ميثاق ما وراء القبر المكسور 🦇',
    caption: '『📜🕯️』 لقد استهلكت الوصية لفيفة الاتفاقية...'
  }, { quoted: m })
}

handlerUnreg.help = ['unreg']
handlerUnreg.tags = ['rg']
handlerUnreg.command = ['unreg', 'borrarregistro', 'delreg']

export default handlerUnreg
