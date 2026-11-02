let handler = async (m, { args, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🎃🦇 *Oracle of Beyond the Grave of Destiny* 🦇🎃\n\nاستخدم الأمر مثل هذا:\n${usedPrefix}${command} هل سأصبح مليونيرًا؟\n\nاطرح سؤالك وستجيبك أرواح الهالوين...`)

  await m.react('🎃')

  const pregunta = text.toLowerCase()
  let respuesta = Math.random() < 0.5 ? '🎃✨ نعم، أرواح الظل تؤكد ذلك...' : '🌑🕸️ لا, القدر يختبئ في عيد الهالوين...'

  if (pregunta.includes('gay') || pregunta.includes('homo') || pregunta.includes('bisexual')) {
    respuesta = '🦇🕯️ نعم السحرة والنجوم يؤكدون طريقك...'
  } else if (pregunta.includes('hetero') || pregunta.includes('heterosexual')) {
    respuesta = '🕯️🎃 لا, الظلال تنكر ذلك الطريق...'
  }

  await m.reply(
`🎭 *Pregunta ritual:* ${text}
🎃🔮 *Respuesta del Oráculo:* ${respuesta}

🦇✨ *فرقة FLASH BOT تراقب في صمت...*`
  )
}

handler.help = ['8ball <pregunta>']
handler.tags = ['fun']
handler.command = ['8ball', 'flashball', 'naviball']

export default handler
