import util from 'util'
import path from 'path'

let user = a => '@' + a.split('@')[0]

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function handler(m, { groupMetadata, command, conn, text, usedPrefix }) {
    if (!text) return conn.reply(m.chat, '🌌 مثال للاستخدام: #top *الأغمق*', m)

    const participants = groupMetadata.participants.map(v => v.id)
    let shuffled = [...participants].sort(() => 0.5 - Math.random())
    let topUsers = shuffled.slice(0, Math.min(10, shuffled.length))

    const emojis = ['🌌','👑','✨','🔥','🌙','🕯️']
    const x = pickRandom(emojis)

    let topMessage = `╔══✦🌌✦══╗
   𝐒𝐇𝐀𝐃𝐎𝐖 𝐆𝐀𝐑𝐃𝐄𝐍
   𝐓𝐎𝐏 ${topUsers.length} ${text}
╚══✦🌌✦══╝\n`

    topUsers.forEach((id, i) => {
        topMessage += `\n${x} *${i + 1}. ${user(id)}*`
    })

    topMessage += `\n\n🌙 الظلال تراقب في صمت....`

    conn.sendMessage(m.chat, { text: topMessage, mentions: topUsers })
}

handler.help = ['top *<texto>*']
handler.command = ['top']
handler.tags = ['fun']
handler.group = true

export default handler
