const activeGames = new Map()

const words = [
  'PERRO', 'GATO', 'COMPUTADORA', 'WHATSAPP', 'JAVASCRIPT',
  'PROGRAMACION', 'CELULAR', 'BOTELLA', 'TECLADO', 'PANTALLA',
  'INTERNET', 'ELEFANTE', 'UNIVERSO', 'GALAXIA', 'ASTRONAUTA',
  'TELEVISOR', 'VEHICULO', 'GUITARRA', 'MURCIELAGO', 'VIDEOJUEGO',
  'BIBLIOTECA', 'AEROPUERTO', 'RESTAURANTE', 'HELICOPTERO',
  'CHOCOLATE', 'ESTUDIANTE', 'DINOSAURIO', 'MARIPOSA',
  'COCODRILO', 'PARAGUAS', 'البطريق', 'BICICLETA',
  'ROMPECABEZAS', 'TIBURON', 'TORTUGA', 'UNICORNIO'
]

const drawings = [
`  +---+
  |   |
      |
      |
      |
      |
=========`,
`  +---+
  |   |
  O   |
      |
      |
      |
=========`,
`  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
`  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
`  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
`  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
`  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`
]

function displayWord(word, guessed) {
  return [...word]
    .map(letter => guessed.has(letter) ? letter : '_')
    .join(' ')
}

function resetTimeout(conn, chat, game) {
  clearTimeout(game.timeout)

  game.timeout = setTimeout(async () => {
    if (activeGames.get(chat) !== game) return

    activeGames.delete(chat)

    try {
      await conn.reply(
        chat,
        `⏳ *تم إلغاء اللعبة بسبب عدم النشاط.*\n` +
        `الكلمة كانت: *${game.word}*`,
        null
      )
    } catch (error) {
      console.error('[الشنق] خطأ في المهلة:', error)
    }
  }, 60000)
}

function gameStatus(game, title) {
  return (
    `${title}\n\n` +
    `${displayWord(game.word, game.guessed)}\n\n` +
    `*الأخطاء:* ${game.errors}/6\n` +
    `\`\`\`${drawings[game.errors]}\`\`\``
  )
}

let handler = async (m, { conn }) => {
  const currentGame = activeGames.get(m.chat)

  if (currentGame) {
    return conn.reply(
      m.chat,
      `🙄 *توجد مباراة بالفعل في هذه المجموعة.*\n\n` +
      `*Palabra:* ${displayWord(
        currentGame.word,
        currentGame.guessed
      )}\n` +
      `*الأخطاء:* ${currentGame.errors}/6\n\n` +
      `إرسال حرف واحد للعب.`,
      m
    )
  }

  const game = {
    word: words[Math.floor(Math.random() * words.length)],
    guessed: new Set(),
    errors: 0,
    timeout: null
  }

  activeGames.set(m.chat, game)
  resetTimeout(conn, m.chat, game)

  return conn.reply(
    m.chat,
    `🎮 *الجلاد* 🎮\n\n` +
    `خمن الكلمة عن طريق إرسال حرف واحد.\n\n` +
    `*الكلمة:* ${displayWord(game.word, game.guessed)}\n` +
    `*الأخطاء المسموح بها:* 6\n\n` +
    `\`\`\`${drawings[0]}\`\`\`\n\n` +
    `_سيتم الإلغاء بعد 60 ثانية من عدم اللعب._`,
    m
  )
}

handler.before = async function (m, { conn }) {
  const game = activeGames.get(m.chat)

  if (!game || !m.text || m.fromMe) return false

  const guess = m.text.trim().toUpperCase()

  if (!/^[A-ZÁÉÍÓÚÜÑ]$/.test(guess)) return false

  if (game.guessed.has(guess)) {
    await conn.reply(
      m.chat,
      `🙄 لقد جربوا بالفعل الحرف *${guess}*.`,
      m
    )

    return true
  }

  game.guessed.add(guess)
  resetTimeout(conn, m.chat, game)

  if (game.word.includes(guess)) {
    const completed =
      !displayWord(game.word, game.guessed).includes('_')

    if (completed) {
      clearTimeout(game.timeout)
      activeGames.delete(m.chat)

      const user = global.db.data.users[m.sender]
      user.coin = Number(user.coin) || 0
      user.coin += 100

      await conn.sendMessage(
        m.chat,
        {
          text:
            `🎉 *¡ تحياتي @${m.sender.split('@')[0]}!*\n\n` +
            `الكلمة كانت: *${game.word}*\n` +
            `🎁 لقد ربحت *100 ${global.moneda || 'coins'}*.`,
          mentions: [m.sender]
        },
        { quoted: m }
      )

      return true
    }

    await conn.reply(
      m.chat,
      gameStatus(game, '✅ *الحرف الصحيح!*'),
      m
    )

    return true
  }

  game.errors++

  if (game.errors >= 6) {
    const user = global.db.data.users[m.sender]
    user.coin = Number(user.coin) || 0

    if (user.coin >= 50) {
      user.coin -= 50
      game.errors = 5

      await conn.sendMessage(
        m.chat,
        {
          text:
            `❤️ *حياة إضافية!*\n\n` +
            `@${m.sender.split('@')[0]} قضى` +
            `*50 ${global.moneda || 'coins'}* لحفظ اللعبة.\n\n` +
            `${displayWord(game.word, game.guessed)}\n\n` +
            `*الأخطاء:* 5/6\n` +
            `\`\`\`${drawings[5]}\`\`\``,
          mentions: [m.sender]
        },
        { quoted: m }
      )

      return true
    }

    clearTimeout(game.timeout)
    activeGames.delete(m.chat)

    await conn.reply(
      m.chat,
      `💀 *¡انتهت اللعبة!*\n\n` +
      `الكلمة كانت: *${game.word}*\n\n` +
      `\`\`\`${drawings[6]}\`\`\``,
      m
    )

    return true
  }

  await conn.reply(
    m.chat,
    gameStatus(game, '❌ *حرف خاطئ!*'),
    m
  )

  return true
}

handler.help = ['ahorcado', 'pene']
handler.tags = ['game']
handler.command = /^(ahorcado|hangman)$/i
handler.group = true
handler.register = true

export default handler
