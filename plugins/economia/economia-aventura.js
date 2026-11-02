let handler = async (m, { conn, command, usedPrefix }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
let user = global.db.data.users[m.sender]
if (!user) global.db.data.users[m.sender] = user = { coin: 0, exp: 0, health: 100, lastAdventure: 0 }
if (user.coin == null) user.coin = 0
if (user.exp == null) user.exp = 0
if (user.health == null) user.health = 100
if (user.lastAdventure == null) user.lastAdventure = 0
if (user.health < 5)
return conn.reply(m.chat, `ꕥ ليس لديك ما يكفي من الصحة *للمغامرة* مرة أخرى.\n> استخدم *"${usedPrefix}heal"* لشفاء نفسك.`, m)
const cooldown = 20 * 60 * 1000
const now = Date.now()
if (now < user.lastAdventure) {
const restante = user.lastAdventure - now
const wait = formatTime(restante)
return conn.reply(m.chat, `ꕥ يجب عليك الانتظار *${wait}* لاستخدام *${usedPrefix + command}* مرة أخرى.`, m)
}
user.lastAdventure = now + cooldown
const evento = pickRandom(aventuras)
let monedas, experiencia, salud
if (evento.tipo === 'victoria') {
monedas = Math.floor(Math.random() * 3001) + 15000
experiencia = Math.floor(Math.random() * 81) + 40
salud = Math.floor(Math.random() * 6) + 10
user.coin += monedas
user.exp += experiencia
user.health -= salud
} else if (evento.tipo === 'derrota') {
monedas = Math.floor(Math.random() * 2001) + 7000
experiencia = Math.floor(Math.random() * 41) + 40
salud = Math.floor(Math.random() * 6) + 10
user.coin -= monedas
user.exp -= experiencia
user.health -= salud
if (user.coin < 0) user.coin = 0
if (user.exp < 0) user.exp = 0
} else {
experiencia = Math.floor(Math.random() * 61) + 30
user.exp += experiencia
}
if (user.health < 0) user.health = 0
const resultado = `❀ ${evento.mensaje} ${evento.tipo === 'neutro' ? '' : evento.tipo === 'victoria' ? `ganaste. *¥${monedas.toLocaleString()} ${currency}*` : `perdiste. *¥${monedas.toLocaleString()} ${currency}*`}`
await conn.reply(m.chat, resultado, m)
await global.db.write()
}

handler.tags = ['rpg']
handler.help = ['aventura']
handler.command = ['adventure', 'aventura']
handler.group = true

export default handler

function formatTime(ms) {
const totalSec = Math.ceil(ms / 1000)
const min = Math.floor((totalSec % 3600) / 60)
const sec = totalSec % 60
const txt = []
if (min > 0) txt.push(`${min} minuto${min !== 1 ? 's' : ''}`)
txt.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
return txt.join(' ')
}
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const aventuras = [
{ tipo: 'victoria', mensaje: 'لقد هزمت غولًا نصب كمينًا بين أشجار دراكونيا,' },
{ tipo: 'victoria', mensaje: 'تصبح بطلاً لبطولة المصارع فالوريا,' },
{ tipo: 'victoria', mensaje: 'أنت تنقذ كتابًا سحريًا من مذبح Whispers,' },
{ tipo: 'victoria', mensaje: 'يمكنك تحرير القرويين المحاصرين في مناجم أولديران بعد هزيمة المتصيدين,' },
{ tipo: 'victoria', mensaje: 'أنت تهزم تنينًا صغيرًا في Flamear Cliffs,' },
{ tipo: 'victoria', mensaje: 'تجد ذخائر مقدسة في آثار إسكاريا وتحميها من اللصوص,' },
{ tipo: 'victoria', mensaje: 'أنت تنتصر في المبارزة ضد فارس Invalion الفاسد,' },
{ tipo: 'victoria', mensaje: 'لقد تغلبت على قلعة Red Flash الملعونة دون التعرض لأي إصابات,' },
{ tipo: 'victoria', mensaje: 'تتسلل إلى معبد الفراغ وتستعيد بلورة التوازن,' },
{ tipo: 'victoria', mensaje: 'يمكنك حل لغز القبو الأبدي والحصول على كنز أسطوري,' },
{ tipo: 'derrota', mensaje: 'لقد ألقى عليك الساحر الأسود لعنة وهربت خاسرًا للموارد,' },
{ tipo: 'derrota', mensaje: 'تضيع في غابة الزركليا ويهاجمك بعض قطاع الطرق,' },
{ tipo: 'derrota', mensaje: 'يهاجمك البازيليسق وتهرب مجروحًا دون غنيمة,' },
{ tipo: 'derrota', mensaje: 'تفشل غارتك على برج الجليد عندما تقع في فخ سحري,' },
{ tipo: 'derrota', mensaje: 'ستفقد التوجيه بين بوابات غابة المرآة وينتهي بك الأمر بدون مكافأة,' },
{ tipo: 'neutro', mensaje: 'تستكشف الآثار القديمة وتتعلم الأسرار المخفية دون العثور على الكنوز.' },
{ tipo: 'neutro', mensaje: 'أنت تتبع أثر شبح لكنه يختفي في الضباب.' },
{ tipo: 'neutro', mensaje: 'أنت ترافق الأميرة عبر صحاري ثالوريا دون نكسات.' }
]
