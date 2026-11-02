const handler = async (m, { conn, text, command, usedPrefix }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) return conn.reply(m.chat, `《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`, m)
const user = global.db.data.users[m.sender]
if (!text) return conn.reply(m.chat, `❀ يجب أن تراهن بمبلغ صالح.\n> مثال » *${usedPrefix + command} 150 (الرأس/الكتابة).*`, m)
const args = text.trim().split(/\s+/)
if (!args[0] || !args[1]) return conn.reply(m.chat, `❀ التنسيق غير صحيح, يجب عليك إدخال المبلغ ثم الكتابة/الكتابة.\n> مثال » *${usedPrefix + command} 150 كتابة*`, m)
const cantidad = parseFloat(args[0])
const eleccion = args[1].toLowerCase()
if (isNaN(cantidad)) return conn.reply(m.chat, `ꕥ المبلغ غير صالح, الرجاء إدخال رقم صالح.\n> مثال » *${usedPrefix + command} 200 cross*`, m)
if (Math.abs(cantidad) < 100) return conn.reply(m.chat, `ꕥ الحد الأدنى لمبلغ الرهان هو *100 ${global.currency}*.`, m)
if (!['cara', 'cruz'].includes(eleccion)) return conn.reply(m.chat, `ꕥ انتخاب غير صالح. يُسمح فقط بـ *الرؤوس* أو *الأجزاء*.\n> مثال » *${usedPrefix + command} 200 رأس*`, m)
if (cantidad > user.coin) return conn.reply(m.chat, `ꕥ ليس لديك ما يكفي من *${global.currency}* للمراهنة, لديك *¥${user.coin.toLocaleString()} ${global.currency}*.`, m)
const resultado = Math.random() < 0.5 ? 'cara' : 'cruz'
const acierto = resultado === eleccion
const cambio = acierto ? cantidad : -cantidad
user.coin += cambio
if (user.coin < 0) user.coin = 0
const mensaje = `「✿」لقد هبطت العملة على *${capitalize(resultado)}* ولديك ${acierto ? 'ganado' : 'perdido'} *¥${Math.abs(cambio).toLocaleString()} ${global.currency}*!\n> كان اختيارك *${capitalize(eleccion)}*`
return conn.reply(m.chat, mensaje, m)
}

handler.help = ['flip']
handler.tags = ['rpg']
handler.command = ['cf', 'suerte', 'coinflip', 'flip']
handler.group = true

export default handler

function capitalize(txt) {
return txt.charAt(0).toUpperCase() + txt.slice(1)
}
