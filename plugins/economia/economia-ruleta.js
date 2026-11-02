const handler = async (m, { conn, text, command, usedPrefix }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
const users = global.db.data.users[m.sender]
if (!text) return conn.reply(m.chat, `ꕥ يجب عليك إدخال مبلغ *${global.currency}* والمراهنة على لون.\n> مثال: *${usedPrefix + command} 2500 أحمر*`, m)
let args = text.trim().split(" ")
if (args.length !== 2) return conn.reply(m.chat, `ꕥ تنسيق خاطئ. يجب عليك إدخال مبلغ *${global.currency}* والمراهنة على لون ما.\n> مثال: *${usedPrefix + command} 2500 أحمر*`, m)
let coin = parseInt(args[0])
let color = args[1].toLowerCase()
if (isNaN(coin) || coin <= 0) return conn.reply(m.chat, `ꕥ الرجاء إدخال مبلغ صالح للرهان.`, m)
if (!(color === 'black' || color === 'red')) return conn.reply(m.chat, `ꕥ يجب أن تراهن على لون صالح: *أسود* أو *أحمر*.`, m)
if (coin > users.coin) return conn.reply(m.chat, `ꕥ ليس لديك ما يكفي من *${global.currency}* لوضع هذا الرهان.`, m)
const resultColor = Math.random() < 0.5 ? 'black' : 'red'
const win = color === resultColor
if (win) {
users.coin += coin
conn.reply(m.chat, `「✿」ظهرت عجلة الروليت على *${resultColor}* وقد فزت بـ *¥${coin.toLocaleString()} ${global.currency}*!`, m)
} else {
users.coin -= coin
conn.reply(m.chat, `「✿」خرجت العجلة على *${resultColor}* وخسرت *¥${coin.toLocaleString()} ${global.currency}*!`, m)
}}

handler.tags = ['rpg']
handler.help = ['ruleta']
handler.command = ['ruleta', 'roulette', 'rt']
handler.group = true

export default handler
