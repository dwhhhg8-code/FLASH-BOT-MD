import { createHash } from 'crypto'

const SelloMistico = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  const who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender)
  const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://raw.githubusercontent.com/Andresv27728/dtbs/main/shadow.jpg')
  const user = global.db.data.users[m.sender]
  const name2 = conn.getName(m.sender)

  if (user.registered) {
    return conn.sendMessage(m.chat, {
      text: `『🎃』 لقد أبرمت بالفعل ميثاق الظل الخاص بك في عيد الهالوين, ${name2}-kun...\n\nهل ترغب في كسر الختم الطيفي والولادة من جديد؟\nاستخدم *${usedPrefix}unreg* لحل الرابطة الحالية.`,
      buttons: [
        { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '🎃 العودة إلى القائمة 🦇' }, type: 1 },
        { buttonId: `${usedPrefix}nreg`, buttonText: { displayText: '🕯️ كسر الختم ⚰️' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (!SelloMistico.test(text)) {
    return m.reply(`『🎃⚠️』 تم نطق طقوس السحرة بشكل خاطئ...\n\n✧ التنسيق الصحيح: *${usedPrefix + command} name.age*\n✧ مثال: *${usedPrefix + command} ${name2}.18*`)
  }

  let [_, name, __, age] = text.match(SelloMistico)
  age = parseInt(age)

  if (age > 60) {
    return m.reply("『🎃』 هل أنت روح قديمة؟ XD\n\nلا يمكنك التسجيل إذا كان عمرك يزيد عن 60 عامًا.")
  }
  if (age >= 1 && age <= 5) {
    return m.reply("『🎃』 لا ينبغي على الأطفال استدعاء الأشباح.\n\nلا يمكنك التسجيل لمن تقل أعمارهم عن 6 سنوات.")
  }
  if (isNaN(age) || age < 6) {
    return m.reply("『🎃』عمر غير صالح. يجب عليك إدخال رقم أكبر من 5.")
  }

  user.name = `${name}⋆🎃Flash🦇⋆`
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  const sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)

  const certificadoPacto = `
╭─「 ميثاق الحياة الآخرة 🎃 • FLASH BOT 🦇 」─╮
│ ✧ *Contratista:* ${name}
│ ✧ *Edad:* ${age} años
│ ✧ *Sello Único:* ${sn}
│
├─ رسالة من القبو:
│ 🕯️ يمكنك الآن استدعاء جميع أوامر الليل.
│ 🦇 إذا كنت تريد رؤية ملفك الشخصي، استخدم *.profile*
│
╰─「🎃 فلاش بوت الهالوين 🦇 」─╯
`.trim()

  await m.react('🎃')

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: certificadoPacto,
    buttons: [
      { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '🎃 قائمة التشفير 🦇' }, type: 1 },
      { buttonId: `${usedPrefix}profile ${m.sender}`, buttonText: { displayText: '👤 ملف الظل 🕯️' }, type: 1 }
    ],
    headerType: 4
  }, { quoted: m })

  await conn.sendMessage(m.chat, {
    document: { url: 'https://files.catbox.moe/zbyywc.jpg' }, 
    mimetype: 'application/pdf', 
    fileName: '🎃 باكتو شادو الهالوين 🦇',
    caption: '『📜🎃』 تم ختم الميثاق المظلم بالدم في عيد الهالوين...'
  }, { quoted: m })
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler
