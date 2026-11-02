let handler = async (m, { conn, command, usedPrefix }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
let user = global.db.data.users[m.sender]
if (!user) global.db.data.users[m.sender] = user = { coin: 0, exp: 0, lastFish: 0 }
const cooldown = 12 * 60 * 1000
const ahora = Date.now()
if (ahora < user.lastFish) {
const restante = user.lastFish - ahora
const wait = formatTimeMs(restante)
return conn.reply(m.chat, `ꕥ يجب عليك الانتظار *${wait}* لاستخدام *${usedPrefix + command}* مرة أخرى.`, m)
}
user.lastFish = ahora + cooldown
const evento = pickRandom(eventos)
let monedas, experiencia
if (evento.tipo === 'victoria') {
monedas = Math.floor(Math.random() * 2001) + 11000
experiencia = Math.floor(Math.random() * 61) + 30
user.coin += monedas
user.exp += experiencia
} else {
monedas = Math.floor(Math.random() * 2001) + 5000
experiencia = Math.floor(Math.random() * 31) + 30
user.coin -= monedas
user.exp -= experiencia
if (user.exp < 0) user.exp = 0
if (user.coin < 0) user.coin = 0
}
const resultado = `❀ ${evento.mensaje} *¥${monedas.toLocaleString()} ${currency}*`
await conn.reply(m.chat, resultado, m)
await global.db.write()
}

handler.tags = ['rpg']
handler.help = ['pescar', 'fish']
handler.command = ['pescar', 'fish']
handler.group = true

export default handler

function formatTimeMs(ms) {
const totalSec = Math.ceil(ms / 1000)
const min = Math.floor(totalSec / 60)
const sec = totalSec % 60
const partes = []
if (min) partes.push(`${min} minuto${min !== 1 ? 's' : ''}`)
partes.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
return partes.join(' ')
}
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const eventos = [
{ tipo: 'victoria', mensaje: 'لقد اشتعلت سمك السلمون! نكهته رائعة, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد اشتعلت سمك السلمون المرقط! نضارته رائعة, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد اشتعلت سمكة قرش! لقد كانت معركة شديدة, لقد فزت بها.' },
{ tipo: 'victoria', mensaje: 'رائع! لقد اشتعلت الحوت. لقد كانت تجربة فريدة من نوعها, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد اصطدت سمكة المهرج! الملونة ومؤذ, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد اصطدت ثعبان البحر الذهبي! نادرة وقيمة, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد اشتعلت الهامور العملاق! كان الجهد يستحق ذلك, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد قمت بإلقاء القبض على أخطبوط الحبر الأزرق! ذكي ولكن لك, فزت.' },
{ tipo: 'victoria', mensaje: 'لقد سحبت الكارب الملكي! وزنه مثير للإعجاب, لقد فزت.' },
{ tipo: 'victoria', mensaje: 'لقد حصلت على سمكة التنين! مخلوق أسطوري, لقد فزت.' },
{ tipo: 'derrota', mensaje: 'لقد أخرجت القمامة: كيس من البلاستيك, فقدته.' },
{ tipo: 'derrota', mensaje: 'لقد أخرجت القمامة: علبة قديمة, لقد فقدتها.' },
{ tipo: 'derrota', mensaje: 'أنت لم تلتقط أي شيء هذه المرة. كان الماء هادئا, لقد فقدت.' },
{ tipo: 'derrota', mensaje: 'انقطع خطك عندما قبضت على شيء ضخم, لقد خسرت.' },
{ tipo: 'derrota', mensaje: 'لقد انفصلت السمكة بمجرد وصولها إلى السطح, وخسرت.' }
]
