import fetch from 'node-fetch'

const imagen1 = 'https://i.ibb.co/3NfYh9k/default-avatar.png'

var handler = async (m, { conn }) => {
  let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  let username = await conn.getName(who)

  let pp
  try {
    pp = await conn.profilePictureUrl(who, 'image')
  } catch {
    pp = imagen1
  }

  let user = global.db.data.users[who]
  if (!user) {
    global.db.data.users[who] = {
      registered: false,
      regTime: -1,
      age: 0
    }
    user = global.db.data.users[who]
  }

  let { registered } = user

  const frasesFlash = [
    'الظلال تراقب بصمت تحت ليل الساحرات.',
    'الفرن يراقب ما وراء الضوء.',
    'كل من يحتضن ظلاله في عيد الهالوين يجد القوة الحقيقية.',
    'الأشباح لا تهدأ أبدًا, فهي حاضرة دائمًا.',
    'يكشف السحر المحظور عن قوة FLASH BOT.'
  ]
  const fraseElegida = frasesFlash[Math.floor(Math.random() * frasesFlash.length)]
  
  let animacion = `
🎃🦇 〘 *فلاش بوت — استدعاء الملف الشخصي* 〙 🦇🎃

🕯️ فتح غريمويري الحياة الآخرة...
مزامنة 🌌 مع Coven of Flash...
🕸️ إطلاق العنان لأختام الهالوين...

✦✦✦ الشحن الكامل ✦✦✦

*تم الكشف عن ملف الظل...* 🕯️
`.trim()

  await conn.sendMessage(m.chat, { text: animacion, ...rcanal }, { quoted: m })

  let str = `🎃 『 ملف مظلم • الهالوين 』 🦇

🕯️ *Contratista:* ${username}
🆔 *Identificador:* @${who.replace(/@.+/, '')}
📜 *Pacto مقفول:* ${registered ? '🎃 نعم (ميثاق نشط)' : '❌ لا'}

✦ *همسة من وراء القبر:*
"${fraseElegida}"

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
🎃 *FLASH-BOT* — منطقة الظل لا تنام أبدًا 🦇
`

  const wm = (typeof global !== 'undefined' && global.wm) ? global.wm : '🎃 فلاش بوت • الهالوين 🦇'
  const bot = '🎃فلاش بوت 🦇'

  let fkontak = {
    key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Phone\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  }

  await conn.sendButton(
    m.chat,
    str,
    wm,
    pp, 
    [
      ['👑 المبدعين 🦇', '#owner'],
      ['🎃 قائمة الهالوين 🕯️', '/menu']
    ],
    null,
    [[bot, 'https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O']],
    fkontak
  )
}

handler.help = ['profile']
handler.register = true
handler.group = true
handler.tags = ['grupos']
handler.command = ['profile', 'perfil']
export default handler
