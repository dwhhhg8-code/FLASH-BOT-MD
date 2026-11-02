let handler = async (m, { conn, usedPrefix, command }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
let user = global.db.data.users[m.sender]
if (!user) return conn.reply(m.chat, `ꕥ لم يتم العثور على المستخدم في قاعدة البيانات.`, m)
if (user.health >= 100) return conn.reply(m.chat, `❀ صحتك بالفعل في الحد الأقصى.`, m)
if (user.coin <= 0) return conn.reply(m.chat, `ꕥ ليس لديك ما يكفي من ${global.currency} لشفاء نفسك.`, m)
const faltante = 100 - user.health
const disponible = Math.floor(user.coin / 50)
const curable = Math.min(faltante, disponible)
user.health += curable
user.coin -= curable * 50
user.lastHeal = Date.now()
const info = `❀ Te has curado ${curable} punto${curable !== 1 ? 's' : ''} de salud.\n⛁ ${global.currency} restantes: ¥${user.coin.toLocaleString()}\n♡ Salud actual: ${user.health}`
await conn.sendMessage(m.chat, { text: info }, { quoted: m })
}

handler.help = ['heal']
handler.tags = ['rpg']
handler.command = ['heal', 'curar']
handler.group = true

export default handler
