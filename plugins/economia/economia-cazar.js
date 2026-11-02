let handler = async (m, { conn, usedPrefix, command }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
let user = global.db.data.users[m.sender]
if (!user) {
global.db.data.users[m.sender] = { exp: 0, coin: 0, health: 100, lastHunt: 0 }
user = global.db.data.users[m.sender]
}
user.coin = user.coin || 0
user.exp = user.exp || 0
user.health = user.health || 100
user.lastHunt = user.lastHunt || 0  
if (user.health < 5)
return conn.reply(m.chat, `ꕥ ليس لديك ما يكفي من الصحة *للصيد* مرة أخرى.\n> استخدم *"${usedPrefix}heal"* لشفاء نفسك.`, m)
const cooldown = 15 * 60 * 1000
const now = Date.now()
if (now < user.lastHunt) {
const restante = user.lastHunt - now
return conn.reply(m.chat, `ꕥ يجب عليك الانتظار *${formatTime(restante)}* لاستخدام *${usedPrefix + command}* مرة أخرى.`, m)
}
user.lastHunt = now + cooldown
const evento = pickRandom(eventos)
let monedas, experiencia, salud
if (evento.tipo === 'victoria') {
monedas = Math.floor(Math.random() * 10001) + 1000
experiencia = Math.floor(Math.random() * 91) + 30
salud = Math.floor(Math.random() * 5) + 3
user.coin += monedas
user.exp += experiencia
user.health -= salud
} else {
monedas = Math.floor(Math.random() * 2001) + 4000
experiencia = Math.floor(Math.random() * 41) + 30
salud = Math.floor(Math.random() * 5) + 3
user.coin -= monedas
user.exp -= experiencia
user.health -= salud
if (user.coin < 0) user.coin = 0
if (user.exp < 0) user.exp = 0
}
if (user.health < 0) user.health = 0
conn.reply(m.chat, `❀ ${evento.mensaje} *¥${monedas.toLocaleString()} ${currency}*`, m)
}

handler.tags = ['rpg']
handler.help = ['cazar', 'hunt']
handler.command = ['cazar', 'hunt']
handler.group = true

export default handler

function formatTime(ms) {
const totalSec = Math.ceil(ms / 1000)
const min = Math.floor((totalSec % 3600) / 60)
const sec = totalSec % 60
const parts = []
if (min > 0) parts.push(`${min} minuto${min !== 1 ? 's' : ''}`)
parts.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
return parts.join(' ')
}
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const eventos = [
{ tipo: 'victoria', mensaje: 'بشجاعة كبيرة, تمكنت من اصطياد الدب! كانت المطاردة مكثفة, لكن مهارتك قادتك إلى النصر, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد اصطدت نمرًا شرسًا! بعد مطاردة مثيرة, انتصرت, فزت.' },
{ tipo: 'victoria', mensaje: 'لقد تمكنت من اصطياد الفيل بالمكر والمثابرة. لقد كان تحديًا, لكنك فعلت ذلك, وفزت.' },
{ tipo: 'victoria', mensaje: 'لقد اشتعلت الباندا! كانت المطاردة هادئة, لكنها ناجحة, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد اصطدت خنزيرًا بريًا بعد عملية صيد مثيرة. أحسنت! لقد فزت' },
{ tipo: 'victoria', mensaje: 'بمهارة كبيرة, تمكنت من اصطياد تمساح. إنجاز مثير للإعجاب! لقد فزت' },
{ tipo: 'victoria', mensaje: 'لقد اشتعلت الديك! لم يكن الأمر صعبًا, لكنه لا يزال انتصارًا, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'بالصبر تمكنت من اصطياد حصان. أحسنت! لقد فزت' },
{ tipo: 'victoria', mensaje: 'لقد حددت موقع مجموعة من الغزلان والتقطت أقوى مجموعة منها. لقد كان هدفك لا تشوبه شائبة, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'ذهبت إلى ضباب الغابة واصطدت ثعلبًا فضيًا لم يتمكن أحد من اصطياده, فزت.' },
{ tipo: 'derrota', mensaje: 'لقد هربت فريستك ولم تتمكن من الإمساك بأي شيء هذه المرة, لقد خسرت.' },
{ tipo: 'derrota', mensaje: 'لقد تعثرت أثناء التصويب وهربت الفريسة. لقد ذهب جهدك سدى, لقد خسرت.' },
{ tipo: 'derrota', mensaje: 'هدير صرف انتباهك ولم تتمكن من إصابة الهدف, لقد خسرت.' },
{ tipo: 'derrota', mensaje: 'انكسر قوسك في اللحظة الحاسمة. بدون أداة, فشلت, خسرت.' },
{ tipo: 'derrota', mensaje: 'لقد دمر هطول الأمطار المفاجئ طريق الصيد الخاص بك. لقد عدت بلا أجر, لقد خسرت.' }
]
