var handler = async (m, { conn, usedPrefix, command }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
const user = global.db.data.users[m.sender]
if (!user) return
user.lastmine = user.lastmine || 0
user.coin = user.coin || 0
user.exp = user.exp || 0
user.health = user.health || 100
user.pickaxedurability = user.pickaxedurability || 100
if (user.health < 5)
return conn.reply(m.chat, `ꕥ ليس لديك ما يكفي من الصحة لتستعيدها مرة أخرى.\n> استخدم *"${usedPrefix}heal"* لشفاء نفسك.`, m)
const gap = 10 * 60 * 1000
const now = Date.now()
if (now < user.lastmine) {
const restante = user.lastmine - now
return conn.reply(m.chat, `ꕥ يجب عليك الانتظار *${formatTime(restante)}* لاستخدام *${usedPrefix + command}* مرة أخرى.`, m)
}
user.lastmine = now + gap
const evento = pickRandom(eventos)
let monedas, experiencia, salud
if (evento.tipo === 'victoria') {
monedas = Math.floor(Math.random() * 2001) + 7000
experiencia = Math.floor(Math.random() * 91) + 10
salud = Math.floor(Math.random() * 3) + 1
user.coin += monedas
user.exp += experiencia
user.health -= salud
} else {
monedas = Math.floor(Math.random() * 2001) + 3000
experiencia = Math.floor(Math.random() * 41) + 10
salud = Math.floor(Math.random() * 5) + 1
user.coin -= monedas
user.exp -= experiencia
user.health -= salud
if (user.coin < 0) user.coin = 0
if (user.exp < 0) user.exp = 0
}
if (user.health < 0) user.health = 0
const mensaje = `❀ ${evento.mensaje} *¥${monedas.toLocaleString()} ${global.currency}*`
await conn.reply(m.chat, mensaje, m)
}

handler.help = ['minar']
handler.tags = ['rpg']
handler.command = ['minar', 'miming', 'mine']
handler.group = true

export default handler

function formatTime(ms) {
const totalSec = Math.ceil(ms / 1000)
const minutes = Math.floor((totalSec % 3600) / 60)
const seconds = totalSec % 60
const parts = []
if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
return parts.join(' ')
}
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const eventos = [
{ tipo: 'victoria', mensaje: 'لقد اكتشفت عرقًا من الذهب بين الصخور غير المستقرة واستخرجته بنجاح, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد عثرت على غرفة سرية بها أحجار كريمة مخبأة لعدة قرون. لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد صادفت عامل منجم مسنًا شاركك الأدوات والمعرفة القيمة, فلقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد حفرت نفقًا منسيًا ووجدت صندوقًا من المعادن النادرة, فلقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد عثرت على كهف مضاء بالبلورات الطبيعية يكشف عن كنز مخفي. لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد منحك الغولم الحجري إمكانية الوصول إلى غرفة من الزمرد بعد حل لغزها, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد قمت بالتنقيب جنبًا إلى جنب مع المستكشفين الآخرين وشاركت معك فوائد المصدر السحري, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'بعد ساعات من الحفر, وجدت غرفة مغلقة مليئة بأحجار القمر, فزت.' },
{ tipo: 'victoria', mensaje: 'لمس منقارك سطحًا معدنيًا: لقد كان صندوقًا به عملات قديمة ذات قيمة كبيرة, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'بعد الخريطة الممزقة, وجدت تجويفًا مليئًا بالياقوت, فزت.' },
{ tipo: 'derrota', mensaje: 'لقد تعطلت أدواتك قبل أن تكتشف وريدًا ثمينًا. لقد رحلت خالي الوفاض, لقد خسرت.' },
{ tipo: 'derrota', mensaje: 'فاجأك انفجار غاز وتسبب في خسارة بعض الغنائم أثناء هروبك, خسرت.' },
{ tipo: 'derrota', mensaje: 'لقد انهار الكهف جزئيًا ودُفنت معادنك, فخسرت.' },
{ tipo: 'derrota', mensaje: 'لقد تعرضت للهجوم من قبل الخفافيش المسببة للعمى وأصيبت دون إكمال المجموعة. لقد خسرت.' },
{ tipo: 'derrota', mensaje: 'تم تفعيل فخ قديم وألحق الضرر بحقيبة ظهرك, مما أدى إلى فقدان العديد من الأحجار الكريمة.' }
]
