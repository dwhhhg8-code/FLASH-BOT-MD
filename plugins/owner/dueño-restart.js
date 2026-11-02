let handler = async (m, { conn, usedPrefix, command, isROwner }) => {
  if (!isROwner) return
  try {
    await m.react('🎃')
    m.reply(`🎃 *تلميذ الظل • الهالوين* 🦇\nلقد بدأت طقوس إعادة التعيين...\n○ استدعاء *${global.botname}* 🕯️\n> ► انتظر بينما يُولد *المقبس* من جديد من خلف القبر.`)
    await m.react('🦇')
    setTimeout(() => {
      if (process.send) {
        process.send("restart")
      } else {
        process.exit(0)
      }
    }, 3000)
  } catch (error) {
    await m.react('✖️')
    console.log(error)
    conn.reply(
      m.chat,
      `⚠️ فشلت الطقوس...\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${error.message}`,
      m
    )
  }
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = ['restart', 'reiniciar']

export default handler
