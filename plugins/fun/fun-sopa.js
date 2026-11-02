let juegos = {}

function generarSopaDeLetras(palabras) {
  const size = 12
  let grid = Array.from({ length: size }, () => Array(size).fill(' '))
  
  palabras.forEach((p, idx) => {
    if (idx < size) {
      for (let i = 0; i < p.length && i < size; i++) {
        grid[idx][i] = p[i].toUpperCase()
      }
    }
  })
  
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === ' ') {
        grid[r][c] = letras[Math.floor(Math.random() * letras.length)]
      }
    }
  }
  
  return grid.map(row => row.join(' ')).join('\n')
}

let handler = async (m, { command, text }) => {
  const chatId = m.chat
  const jugador = m.pushName || m.sender

  const palabras = [
    "فلاش", "قمر", "نجمة", "سلام", "أمل", "نور",
    "بحر", "شمس", "ورد", "قلب", "كتاب", "بيت",
    "مطر", "سحاب", "حلم", "فجر"
  ]

  if (command === 'sopa' || command === 'sopadeletras' || command === 'flashgame') {
    const sopa = generarSopaDeLetras(palabras)
    juegos[chatId] = { jugador, palabras, inicio: Date.now() }

    await m.reply(
`🌑🎄 *فلاش بوت حساء الحروف الأبجدية* 🎄🌑
👤 Jugador: ${jugador}
⏳ الحد الأقصى للوقت: 10 دقائق

Palabras a encontrar: ${palabras.join(', ')}

${sopa}

✨ ابحث عن الكلمات قبل أن تستهلك ظلال الأعياد عيد الميلاد...`
    )

    setTimeout(() => {
      if (juegos[chatId]) {
        m.reply(`⚠️ ${juegos[chatId].jugador}, 5 دقائق مرت.. ظلال الاحتفال تقترب 🎄🌑`)
      }
    }, 5 * 60 * 1000)

    setTimeout(() => {
      if (juegos[chatId]) {
        m.reply(`⏳ ${juegos[chatId].jugador}, لم يتبق سوى دقيقة واحدة... أسرع قبل أن يضيع عيد الميلاد في الظل! ❄️`)
      }
    }, 9 * 60 * 1000)

    setTimeout(() => {
      if (juegos[chatId]) {
        m.reply(`❌ الوقت المستقطع, ${juegos[chatId].jugador}... الظلال قد حسمت مصيرك 🎭🌑`)
        delete juegos[chatId]
      }
    }, 10 * 60 * 1000)
  }

  if (command === 'resolver') {
    if (!juegos[chatId]) return m.reply("⚠️ لا يوجد حساء نشط في هذه الدردشة.")
    if (!text) return m.reply("🧩 أدخل الكلمات التي وجدتها مفصولة بفواصل.")

    const encontradas = text.split(',').map(p => p.trim().toLowerCase())
    const faltantes = juegos[chatId].palabras.filter(p => !encontradas.includes(p))

    if (faltantes.length === 0) {
      m.reply(`🎉✨ النصر, ${juegos[chatId].jugador}! لقد عثرت على كل كلمات FLASH BOT قبل أن تلتقطك الظلال 🎄🌑`)
      delete juegos[chatId]
    } else {
      m.reply(`🔮 ${juegos[chatId].jugador}, لا تزال هناك كلمات يجب اكتشافها: ${faltantes.join(', ')}`)
    }
  }
}

handler.help = ['sopa', 'resolver <palabras>']
handler.tags = ['game']
handler.command = ['sopa', 'sopadeletras', 'flashgame', 'resolver']

export default handler
