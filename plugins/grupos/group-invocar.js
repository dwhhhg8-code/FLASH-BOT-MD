import moment from "moment-timezone"

let handler = async (m, { conn, text }) => {
  try {
    const chatId = m.chat
    const isGroup = chatId.endsWith('@g.us')

    await conn.sendMessage(chatId, { react: { text: '🎃', key: m.key } })

    if (!isGroup) {
      await conn.sendMessage(chatId, {
        text: `🎃🦇 لا يمكن أداء هذه الطقوس إلا ضمن معشر (مجموعة).`,
        quoted: m
      })
      return
    }

    const metadata = await conn.groupMetadata(chatId)
    const participants = metadata.participants
    const mentionIds = participants.map(p => p.id)

    const extraMsg = (text || '').trim()

    let caption = 
`┏━━━━━━━━━━━━━━━━━━━┓
استدعاء 🎃 للكوفن 🦇
┗━━━━━━━━━━━━━━━━━━━┛

🕯️ Aquelarre: *${metadata.subject}*
👻 Almas: *${participants.length}*`

    if (extraMsg) caption += `\n🕸️ الرسالة: *${extraMsg}*`

    caption += `\n\n⚰️ استدعاء الظلال:\n`
    caption += participants.map(p => `» @${p.id.split('@')[0]}`).join('\n')

    const vs = "^1.3.2"
    caption += `\n\n🎃 الإصدار: *${vs}*`
    caption += `\n『🎃』 في ليلة الهالوين, يستجيب الجميع لنداء اللورد شادو. 🦇`

    await conn.sendMessage(chatId, {
      image: { url: 'https://raw.githubusercontent.com/Andresv27728/dtbs/main/shadow.jpg' },
      caption,
      mentions: mentionIds,
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363410090342500@newsletter",
          serverMessageId: '',
          newsletterName: '🎃 فلاش بوت • الهالوين 🦇'
        },
        forwardingScore: 9999999,
        isForwarded: true,
        mentionedJid: mentionIds
      }
    }, { quoted: m })

  } catch (error) {
    console.error('❌ خطأ في أمر tagall:', error)
    await conn.sendMessage(m.chat, {
      text: `❒ حدث خطأ أثناء تنفيذ الأمر *tagall*.`,
      quoted: m
    })
  }
}

handler.help = ['invocar']
handler.tags = ['grupos']
handler.command = ['tagall', 'invocar', 'todos']
handler.group = true
handler.admin = true

export default handler
