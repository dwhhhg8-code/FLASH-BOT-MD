let handler = async (m, { args, usedPrefix, command }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
let user = global.db.data.users[m.sender]
if (!args[0]) return m.reply(`❀ أدخل مبلغ *${global.currency}* الذي تريد إيداعه.`)
if ((args[0]) < 1) return m.reply(`ꕥ الرجاء إدخال مبلغ صالح وهو *${global.currency}*.`)
if (args[0] == 'all') {
let count = parseInt(user.coin)
user.coin -= count * 1
user.bank += count * 1
await m.reply(`❀ لقد قمت بإيداع *${count.toLocaleString()} ${global.currency}* في البنك, ولن يتمكنوا من سرقتها منك بعد الآن.`)
return !0
}
if (!Number(args[0])) return m.reply(`ꕥ يجب عليك إيداع مبلغ صالح.\n> مثال 1 » *${usedPrefix}d 25000*\n> مثال 2 » *${usedPrefix}d الكل*`)
let count = parseInt(args[0])
if (!user.coin) return m.reply(`ꕥ ليس لديك ما يكفي من محفظة *${global.currency}*.`)
if (user.coin < count) return m.reply(`✧ ليس لديك سوى *¥${user.coin.toLocaleString()} ${global.currency}* في محفظتك.`)
user.coin -= count * 1
user.bank += count * 1
await m.reply(`❀ لقد قمت بإيداع *¥${count.toLocaleString()} ${global.currency}* في البنك, ولن يتمكنوا من سرقتها منك بعد الآن.`)}

handler.help = ['depositar']
handler.tags = ['rpg']
handler.command = ['deposit', 'depositar', 'd', 'dep']
handler.group = true

export default handler
