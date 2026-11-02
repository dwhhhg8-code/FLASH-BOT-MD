let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('🌌⚠️ *الظلال تتطلب منك الإشارة إلى مستخدم باستخدام @tag.*')

    let who
    if (m.isGroup) who = m.mentionedJid[0]
    else who = m.chat
    if (!who) return m.reply('🌌⚠️ *يجب عليك استدعاء المستخدم باستخدام @tag.*')

    let users = global.db.data.users
    if (!users[who]) users[who] = {}

    users[who].banned = true

    await conn.sendMessage(
        m.chat,
        {
            text: `🎄🌌 *تم تمييز روح @${who.split('@')[0]} بواسطة FLASH BOT.*\n\n❄️ لقد تم تحديد مصيره في عيد الميلاد البارد هذا...`,
            contextInfo: {
                forwardingScore: 200,
                isForwarded: false,
                mentionedJid: [who]
            }
        },
        { quoted: m }
    )
}

handler.help = ['banuser <@tag>']
handler.command = ['banuser']
handler.tags = ['owner']
handler.rowner = true

export default handler
