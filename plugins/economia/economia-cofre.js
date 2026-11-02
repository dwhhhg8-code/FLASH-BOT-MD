var handler = async (m, { conn, usedPrefix, command }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
let user = global.db.data.users[m.sender]
let now = Date.now()
let gap = 86400000
user.lastcofre = user.lastcofre || 0
user.coin = user.coin || 0
user.exp = user.exp || 0
if (now < user.lastcofre) {
let wait = formatTime(Math.floor((user.lastcofre - now) / 1000))
return conn.reply(m.chat, `ꕥ يجب عليك الانتظار *${wait}* لاستخدام *${usedPrefix + command}* مرة أخرى.`, m)
}
let reward = Math.floor(Math.random() * (60000 - 40000 + 1)) + 40000
let expGain = Math.floor(Math.random() * (111)) + 50
user.coin += reward
user.exp += expGain
user.lastcofre = now + gap
conn.reply(m.chat, `「✿」 ${pickRandom(cofres)}\n> لقد استلمت *¥${reward.toLocaleString()} ${global.currency}*.`, m)
}

handler.help = ['cofre']
handler.tags = ['rpg']
handler.command = ['coffer', 'cofre', 'abrircofre', 'cofreabrir']
handler.group = true

export default handler

function formatTime(totalSec) {
const h = Math.floor(totalSec / 3600)
const m = Math.floor((totalSec % 3600) / 60)
const s = totalSec % 60
const txt = []
if (h > 0) txt.push(`${h} hora${h !== 1 ? 's' : ''}`)
if (m > 0 || h > 0) txt.push(`${m} minuto${m !== 1 ? 's' : ''}`)
txt.push(`${s} segundo${s !== 1 ? 's' : ''}`)
return txt.join(' ')
}
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const cofres = [
"لقد عثرت على صندوق قديم على متن سفينة غارقة.",
"لقد اكتشفت صندوقًا مزينًا بنقوش معقدة في جزيرة صحراوية.",
"لقد عثرت على صندوق سحري يفتح بكلمة سرية.",
"لقد وجدت صندوقًا خشبيًا مهترئًا مليئًا بالعملات الذهبية.",
"لقد اكتشفت صندوقًا مغطى بالكروم في غابة كثيفة.",
"لقد دخلت الكهف ووجدت صندوقًا مليئًا بالمجوهرات اللامعة.",
"ظهر صندوق غامض على الشاطئ مليئًا بكنوز من زمن آخر.",
"لقد اكتشفت صندوقًا مخفيًا خلف شلال يفيض بالأحجار الكريمة.",
"لقد عثرت على صندوق مسحور يحمل تاريخ المغامرين القدماء.",
"لقد عثرت على صندوق من الحديد المطاوع, يحرسه تنين عجوز.",
"لقد اكتشفت صندوقًا في مقبرة قديمة يحتوي على آثار مقدسة.",
"لقد صادفت صندوقًا, عند فتحه, يطلق سحابة من غبار الذهب.",
"لقد عثرت على صندوق في قاع بحيرة مغطى بالطحالب والأسرار.",
"لقد عثرت على صندوق ينبعث منه ضوء سحري في الظلام.",
"لقد اكتشفت صندوقًا كريستاليًا مقطوعًا مليئًا بأدوات القوة.",
"وجدت صندوقًا في علية مغبرة, مليئًا بالرسائل والذكريات.",
"لقد دخلت القلعة ووجدت صندوقًا مليئًا بالأسلحة القديمة.",
"لقد اكتشفت صندوقًا في ساحة المعركة مليئًا بالكنوز من المحاربين الذين سقطوا.",
"لقد صادفت صندوقًا لا يفتح إلا من خلال حل اللغز.",
"لقد وجدت صندوقًا خشبيًا نبيلًا مليئًا بجواهر الثقافات المفقودة."
]
