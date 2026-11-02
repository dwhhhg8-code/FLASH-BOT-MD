let partidas = {}

const ahorcadoStages = [
  `
  
  

  
  `,
  `
  
  |
  |
  |
  `,
  `
  ______
  |
  |
  |
  `,
  `
  ______
  |    O
  |
  |
  `,
  `
  ______
  |    O
  |    |
  |
  `,
  `
  ______
  |    O
  |   /|
  |
  `,
  `
  ______
  |    O
  |   /|\\
  |
  `,
  `
  ______
  |    O
  |   /|\\
  |   /
  `,
  `
  ______
  |    O
  |   /|\\
  |   / \\
  `
]

function ocultarPalabra(palabra, letras) {
  return palabra.split('').map(l => letras.includes(l) ? l : '_').join(' ')
}

let handler = async (m, { command, text }) => {
  const chatId = m.chat
  const jugador = m.pushName || m.sender

  const palabras = [
    "فلاش", "قمر", "نجمة", "سلام", "أمل", "نور",
    "بحر", "شمس", "ورد", "قلب", "كتاب", "بيت",
    "مطر", "سحاب", "حلم", "فجر"
  ]

  if (command === 'orcado' || command === 'ahorcado') {
    const palabra = palabras[Math.floor(Math.random() * palabras.length)]
    partidas[chatId] = { jugador, palabra, letras: [], errores: 0 }

    await m.reply(
`🌑🎄 *لعبة فلاش بوت الجلاد* 🎄🌑
👤 Jugador: ${jugador}

Palabra oculta: ${ocultarPalabra(partidas[chatId].palabra, [])}

✨ استخدم أمر .letra <حرف> عشان تخمّن قبل ما الظلال تحبطك...`
    )
  }

  if (command === 'letra') {
    if (!partidas[chatId]) return m.reply("⚠️ لا توجد لعبة نشطة. استخدم .orcado للبدء.")
    if (!text) return m.reply("🔤 أدخل حرفًا للتخمين.")

    const partida = partidas[chatId]
    const letra = text.toLowerCase()

    if (partida.letras.includes(letra)) {
      return m.reply(`⚠️ ${jugador}, لقد قمت بالفعل بتجربة الحرف "${letra}".`)
    }

    partida.letras.push(letra)

    if (partida.palabra.includes(letra)) {
      const oculto = ocultarPalabra(partida.palabra, partida.letras)
      if (!oculto.includes('_')) {
        m.reply(`🎉✨ النصر, ${jugador}! لقد اكتشفت كلمة "${partida.palabra}" قبل أن تلاحقك الظلال 🎄🌑`)
        delete partidas[chatId]
      } else {
        m.reply(`✅ تمام يا ${jugador}. الكلمة الآن هي:\n${oculto}`)
      }
    } else {
      partida.errores++
      if (partida.errores >= ahorcadoStages.length - 1) {
        m.reply(`${ahorcadoStages[partida.errores]}\n❌ ${jugador}, لقد استهلكتك الظلال... وكانت الكلمة "${partida.palabra}".`)
        delete partidas[chatId]
      } else {
        m.reply(`${ahorcadoStages[partida.errores]}\n⚠️ ${jugador}, الحرف "${letra}" مفقود. لديك محاولات ${ahorcadoStages.length - 1 - partida.errores} متبقية.`)
      }
    }
  }
}

handler.help = ['orcado', 'letra <letra>']
handler.tags = ['game']
handler.command = ['orcado', 'ahorcado', 'letra']

export default handler
