let handler = async (m, { conn, usedPrefix }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
let mentionedJid = await m.mentionedJid
let who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : m.sender
let name = await (async () => global.db.data.users[who].name || (async () => { try { const n = await conn.getName(who); return typeof n === 'string' && n.trim() ? n : who.split('@')[0] } catch { return who.split('@')[0] } })())()
if (!(who in global.db.data.users)) return m.reply(`ꕥ لم يتم العثور على المستخدم في قاعدة البيانات الخاصة بي.`)
let user = global.db.data.users[who]
let coin = user.coin || 0
let bank = user.bank || 0
let total = (user.coin || 0) + (user.bank || 0)
const texto = `> ✿ » Economia -  Balance « ✿
 
ᰔᩚ المستخدم » *${name}*   
⛀ Cartera » *¥${coin.toLocaleString()} ${global.currency}*
⚿ Banco » *¥${bank.toLocaleString()} ${global.currency}*
⛁ الإجمالي » *¥${total.toLocaleString()} ${global.currency}*

> *Para proteger tu dinero, ¡depósitalo en el banco usando #deposit!*`
await conn.reply(m.chat, texto, m)
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank'] 
handler.group = true 

export default handler
