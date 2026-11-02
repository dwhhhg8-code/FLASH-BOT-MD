let handler = async (m, { conn, usedPrefix, command }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
let user = global.db.data.users[m.sender]
user.lastslut = user.lastslut || 0
const cooldown = 5 * 60 * 1000
if (Date.now() < user.lastslut) {
const restante = user.lastslut - Date.now()
const tiempoRestante = formatTime(restante)
return conn.reply(m.chat, `ꕥ يجب عليك الانتظار *${tiempoRestante}* لاستخدام *${usedPrefix + command}* مرة أخرى.`, m)
}
user.lastslut = Date.now() + cooldown
const evento = pickRandom(slut)
let cantidad
if (evento.tipo === 'victoria') {
cantidad = Math.floor(Math.random() * 1501) + 4000
user.coin += cantidad
} else {
cantidad = Math.floor(Math.random() * 1001) + 3000
user.coin -= cantidad
if (user.coin < 0) user.coin = 0
}
const mensaje = `❀ ${evento.mensaje} *¥${cantidad.toLocaleString()} ${global.currency}*`
await conn.reply(m.chat, mensaje, m)
}

handler.help = ['slut']
handler.tags = ['rpg']
handler.command = ['slut', 'protituirse']
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
const slut = [
{ tipo: 'victoria', mensaje: "لقد قمت بمداعبة قضيب عميل عادي وفزت." },
{ tipo: 'victoria', mensaje: "المشرف يأتي في فمك, لقد فزت." },
{ tipo: 'victoria', mensaje: "المشرف يتلمس ثدييك, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد ألبسوك زي نيكو كواي في الأماكن العامة, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد لعبت دور المشرف لمدة يوم, فزت." },
{ tipo: 'victoria', mensaje: "إذا سمحت لشخص غريب أن يتلمسك للحصول على المال, فقد فزت." },
{ tipo: 'victoria', mensaje: "أنت خادمة المشرف ليوم واحد, لقد فزت." },
{ tipo: 'victoria', mensaje: "يدفع لك المثلي الجنس لتفعل ذلك معه, لقد فزت." },
{ tipo: 'victoria', mensaje: "ماتت SugarMommy, لقد فزت." },
{ tipo: 'victoria', mensaje: "يموت SuggarDaddy الخاص بك, لقد فزت." },
{ tipo: 'victoria', mensaje: "إذا سمحت لشخص غريب أن يلمس مؤخرتك من أجل المال, فقد فزت." },
{ tipo: 'victoria', mensaje: "إذا سمحت لشخص غريب أن يلمس مؤخرتك من أجل المال, فقد فزت." },
{ tipo: 'victoria', mensaje: "شخص ما يقيدك وأنت حيوانه الأليف الجنسي لمدة ساعة, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد ألبسوك زي تلميذة في الأماكن العامة, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد ألبسوك ملابس جبهة مورو الإسلامية للتحرير في الأماكن العامة, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد استخدمك أعضاء المجموعة ككيس نائب الرئيس, لقد فزت." },
{ tipo: 'victoria', mensaje: "أنت عاهرة المشرفين ليوم واحد, لقد فزت." },
{ tipo: 'victoria', mensaje: "اختطفك بعض الكائنات الفضائية واستخدموك كأداة جنسية, لقد فزت." },
{ tipo: 'victoria', mensaje: "قزم لدغ ساقك, لقد فزت." },
{ tipo: 'derrota', mensaje: "لقد حاولت تحصيل الرسوم من العميل الخطأ وقاموا بالإبلاغ عنك, لقد خسرت." },
{ tipo: 'derrota', mensaje: "قام المشرف بحظرك بعد الخدمة, لقد خسرت." },
{ tipo: 'derrota', mensaje: "لقد ارتديت ملابسك دون أن يدفع لك أحد, لقد خسرت." },
{ tipo: 'derrota', mensaje: "لقد تركتك SuggarMommy من أجل وايفو جديد, لقد خسرت." },
{ tipo: 'derrota', mensaje: "لقد سرق شخص غريب زيك التنكري قبل الحدث, فخسرت." },
{ tipo: 'derrota', mensaje: "لقد تحسسوك دون أن تدفع أي شيء, لقد خسرت." },
{ tipo: 'derrota', mensaje: "لقد ندم الرجل المثلي على ذلك في اللحظة الأخيرة, لقد خسرت." },
{ tipo: 'derrota', mensaje: "لقد أعادك الفضائيون بالصدمة, لقد خسرت." }
]
