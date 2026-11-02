let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const emojiFlash = "🌑"
  const emojiChristmas = "🎄"

  if (!args[0]) throw `${emojiFlash} لا يوجد شيء في الظل...\n${emojiChristmas} أدخل نصًا لبدء *Flash Christmas Survey*.\n\n📌 مثال:\n*${usedPrefix + command}* Pizza|Hamburger|Tacos`
  if (!text.includes('|')) throw `${emojiChristmas} قم بتقسيم الخيارات باستخدام *|* للكشف عن قوة الظلال.\n\n📌 مثال:\n*${usedPrefix + command}* Snow|Gifts|Flash`

  let opciones = []
  let partes = text.split('|')
  for (let i = 0; i < partes.length; i++) {
    opciones.push([`${emojiFlash} ${partes[i].trim()} ${emojiChristmas}`])
  }

  let titulo = `🌑 استطلاع الظل ${emojiChristmas}\n\n` +
               `👾 *السماحة في الظل* تمتزج بسحر عيد الميلاد...\n` +
               `✨ اختر بعناية, كل خيار يعكس مصيرك.`

  return conn.sendPoll(m.chat, titulo, opciones, m)
}

handler.help = ['encuesta <opción1|opción2|...>']
handler.tags = ['grupos']
handler.command = ['poll', 'encuesta', 'flashpoll']
handler.group = true

export default handler
