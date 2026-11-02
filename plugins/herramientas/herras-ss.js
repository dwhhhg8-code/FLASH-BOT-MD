import fetch from 'node-fetch'

let handler = async (m, { conn, command, args, usedPrefix }) => {
  if (!args[0]) return conn.reply(m.chat, `❄️✨ *تلميذ الظلال*, قم بتوفير *رابط* الصفحة لاستدعاء انعكاسك.`, m)
  try {
    await m.react('🎭')

    let ss = await (await fetch(`https://image.thum.io/get/fullpage/${args[0]}`)).buffer()

    await conn.sendFile(
      m.chat,
      ss,
      'Flash_screenshot.png',
      `🌌 *استدعاء الانعكاس من الظلال – إصدار عيد الميلاد* 🎅\n🔗 ${args[0]}`,
      m
    )

    await m.react('✔️')
  } catch (error) {
    await m.react('✖️')
    return conn.reply(
      m.chat,
      `⚠️ فشلت طقوس الاستدعاء...\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${error.message}`,
      m
    )
  }
}

handler.help = ['ssweb', 'ss']
handler.tags = ['tools']
handler.command = ['ssweb', 'ss']
handler.group = true

export default handler
