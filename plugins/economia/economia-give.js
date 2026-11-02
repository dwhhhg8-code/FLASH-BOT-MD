async function handler(m, { conn, args, usedPrefix, command }) {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
let mentionedJid = await m.mentionedJid
const who = m.quoted ? await m.quoted.sender : (mentionedJid && mentionedJid[0]) || (args[1] ? (args[1].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : '')   
if (!args[0]) return m.reply(`❀ يجب أن تذكر من تريد إهدائه *${global.currency}*.\n> مثال » *${usedPrefix + command} 25000 @mention*`)
if (!isNumber(args[0]) && args[0].startsWith('@')) return m.reply(`ꕥ حدد أولاً المبلغ الذي تريد تحويله, متبوعاً بالشخص الذي ترسل المبلغ إليه.\nمثال: *${usedPrefix + command} 1000@mention*`)
if (!who) return m.reply(`ꕥ يجب عليك ذكر شخص ما لتحويل *${global.currency}*.`)
if (!(who in global.db.data.users)) return m.reply(`ꕥ المستخدم ليس في قاعدة البيانات.`)
let user = global.db.data.users[m.sender]
let recipient = global.db.data.users[who]
let count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(10, (isNumber(args[0]) ? parseInt(args[0]) : 10)))
if (typeof user.bank !== 'number') user.bank = 0
if (user.bank < count) return m.reply(`ꕥ ليس لديك ما يكفي من *${global.currency}* في البنك للتحويل.`)
user.bank -= count
if (typeof recipient.bank !== 'number') recipient.bank = 0
recipient.bank += count   
if (isNaN(user.bank)) user.bank = 0
let name = await (async () => global.db.data.users[who].name || (async () => { try { const n = await conn.getName(who); return typeof n === 'string' && n.trim() ? n : who.split('@')[0] } catch { return who.split('@')[0] } })())()
m.reply(`❀ لقد حولت *¥${count.toLocaleString()} ${global.currency}* إلى *${name}*\n> لديك الآن *¥${user.bank.toLocaleString()} ${global.currency}* إجمالاً في البنك.`, null, { mentions: [who] })
}

handler.help = ['pay']
handler.tags = ['rpg']
handler.command = ['pay', 'coinsgive', 'givecoins']
handler.group = true

export default handler

function isNumber(x) {
return !isNaN(x)
                                                                  }
