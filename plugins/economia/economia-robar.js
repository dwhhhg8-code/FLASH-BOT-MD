const handler = async (m, { conn, usedPrefix, command }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
const user = global.db.data.users[m.sender]
user.lastrob = user.lastrob || 0
if (Date.now() < user.lastrob) {
const restante = user.lastrob - Date.now()
return conn.reply(m.chat, `ꕥ يجب عليك الانتظار *${formatTime(restante)}* لاستخدام *${usedPrefix + command}* مرة أخرى.`, m)
}
let mentionedJid = await m.mentionedJid
let who = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null
if (!who) return conn.reply(m.chat, `❀يجب عليك منشن شخص ما لتحاول السرقة منه.`, m)
if (!(who in global.db.data.users)) {
return conn.reply(m.chat, `ꕥ لم يتم العثور على المستخدم في قاعدة البيانات الخاصة بي.`, m)
}
let name = await (async () => global.db.data.users[who].name || (async () => { try { const n = await conn.getName(who); return typeof n === 'string' && n.trim() ? n : who.split('@')[0] } catch { return who.split('@')[0] } })())()
const target = global.db.data.users[who]
const tiempoInactivo = Date.now() - (target.lastwork || 0)
if (tiempoInactivo < 3600000) {
return conn.reply(m.chat, `ꕥ لا يمكنك سرقة *${global.currency}* من المستخدم إلا إذا كان غير نشط لأكثر من ساعة واحدة.`, m)
}
const rob = Math.floor(Math.random() * 1001) + 2000
if (target.coin < rob) {
return conn.reply(m.chat, `ꕥ *${name}* ليس لديه ما يكفي من *${global.currency}* خارج البنك لجعل الأمر يستحق محاولة السرقة.`, m, { mentions: [who] })
}
user.coin += rob
target.coin -= rob
user.lastrob = Date.now() + 7200000
conn.reply(m.chat, `❀ بالقوة *¥${rob.toLocaleString()} ${global.currency}* a *${name}*`, m, { mentions: [who] })
}

handler.help = ['robar']
handler.tags = ['rpg']
handler.command = ['robar', 'steal', 'rob']
handler.group = true

export default handler

function formatTime(ms) {
const totalSec = Math.ceil(ms / 1000)
const hours = Math.floor(totalSec / 3600)
const minutes = Math.floor((totalSec % 3600) / 60)
const seconds = totalSec % 60
const parts = []
if (hours) parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`)
if (minutes) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
return parts.join(' ')
}
