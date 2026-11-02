let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('🌌⚠️ *الظلال تتطلب منك الإشارة إلى مستخدم باستخدام @tag.*')

    let who
    if (m.isGroup) who = m.mentionedJid[0]
    else who = m.chat
    if (!who) return m.reply('🌌⚠️ *يجب عليك استدعاء المستخدم باستخدام @tag.*')

    let users = global.db.data.users
    if (!users[who]) users[who] = {}

    users[who].banned = false

    await conn.sendMessage(
        m.chat,
        {
            text: `🎄🌌 *تم تحرير روح @${who.split('@')[0]} بواسطة FLASH BOT.*\n\n❄️ في عيد الميلاد هذا العام, تم كسر قيود الظلام...`,
            contextInfo: {
                forwardingScore: 200,
                isForwarded: false,
                mentionedJid: [who]
            }
        },
        { quoted: m }
    )
}

handler.help = ['unbanuser <@tag>']
handler.command = ['unbanuser']
handler.tags = ['owner']
handler.rowner = true

export default handler
