function handler(m, { conn, text }) {
  const emoji = "🌑🎄"

  if (!text) return conn.reply(m.chat, `${emoji} *استدعاء اسمك إلى حديقة الظلال.*\nاستخدم الأمر الموجود بجانب اسمك لتلقي هويتك السرية...`, m)

  conn.reply(m.chat, `${emoji} *ظلال عيد الميلاد تنسج مصيرك...* 🎁❄️`, m)

  let teks = text ? text : m.quoted && m.quoted.text ? m.quoted.text : m.text

  const diccionario = {
    'a': 'ka',
    'b': 'tsu',
    'c': 'mi',
    'd': 'te',
    'e': 'ku',
    'f': 'hi',
    'g': 'ji',
    'h': 'ri',
    'i': 'ki',
    'j': 'zu',
    'k': 'me',
    'l': 'ta',
    'm': 'rin',
    'n': 'to',
    'o': 'mo',
    'p': 'no',
    'q': 'ke',
    'r': 'shi',
    's': 'ari',
    't': 'chi',
    'u': 'do',
    'v': 'ru',
    'w': 'mei',
    'x': 'na',
    'y': 'fu',
    'z': 'mori'
  }

  let nombreFlash = teks.replace(/[a-z]/gi, v => diccionario[v.toLowerCase()] || v)

  m.reply(
`🎭❄️ *الاسم المُستدعى:* ${text}
🌌🎄 *Tu identidad en el FLASH BOT:* ${nombreFlash}

🕯️✨ *الظلال الاحتفالية أعطتك لقبك السري...*`
  )
}

handler.help = ['nombrflash *<texto>*']
handler.tags = ['fun']
handler.command = ['nombrflash', 'nombrninja', 'flashgarden']

export default handler
