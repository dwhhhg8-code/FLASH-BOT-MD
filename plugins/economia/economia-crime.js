let handler = async (m, { conn, usedPrefix, command }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
let user = global.db.data.users[m.sender]
user.lastcrime = user.lastcrime || 0
user.coin = user.coin || 0
const cooldown = 8 * 60 * 1000
const ahora = Date.now()
if (ahora < user.lastcrime) {
const restante = user.lastcrime - ahora
const wait = formatTimeMs(restante)
return conn.reply(m.chat, `ꕥ يجب عليك الانتظار *${wait}* لاستخدام *${usedPrefix + command}* مرة أخرى.`, m)
}
user.lastcrime = ahora + cooldown
const evento = pickRandom(crimen)
let cantidad
if (evento.tipo === 'victoria') {
cantidad = Math.floor(Math.random() * 1501) + 6000
user.coin += cantidad
} else {
cantidad = Math.floor(Math.random() * 1501) + 4000
user.coin -= cantidad
if (user.coin < 0) user.coin = 0
}
await conn.reply(m.chat, `❀ ${evento.mensaje} *¥${cantidad.toLocaleString()} ${global.currency}*`, m)
}

handler.tags = ['rpg']
handler.help = ['crime']
handler.command = ['crimen', 'crime']
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
const crimen = [
{ tipo: 'victoria', mensaje: "لقد اخترقت جهاز صراف آلي باستخدام أحد ثغرة النظام وسحبت أموالاً دون تنبيهات, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد تسللت إلى أحد القصور كفني وسرقت المجوهرات أثناء فحص الشبكة, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد قمت بتزييف تحويل مصرفي مزيف وحصلت على أموال قبل أن يقوموا بإلغاء المعاملة, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد اعترضت طردًا فاخرًا في حفل استقبال في إحدى الشركات وأعدت بيعه, فربحت." },
{ tipo: 'victoria', mensaje: "لقد أفرغت محفظة منسية في مطعم دون أن يلاحظ أحد, لقد ربحت." },
{ tipo: 'victoria', mensaje: "لقد قمت بالدخول إلى خادم أحد المتاجر الرقمية وقمت بتطبيق خصومات احتيالية للحصول على منتجات مجانية, فربحت." },
{ tipo: 'victoria', mensaje: "لقد تظاهرت بأنك سائق توصيل وسرقت طردًا دون إثارة الشكوك, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد قمت بنسخ المفتاح الرئيسي لمعرض فني وقمت ببيع منحوتة دون تسجيل, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد قمت بإنشاء موقع خيري مزيف وجعلت مئات الأشخاص يتبرعون, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد تلاعبت بقارئ البطاقات في متجر محلي وأفرغت حساباتك الخاصة, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد زورت تذاكر VIP لحدث ما ودخلت إلى منطقة تحتوي على عناصر حصرية, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد خدعت أحد هواة جمع الأعمال الفنية من خلال بيع نسخة طبق الأصل له على أنها قطعة أصلية, وقد فزت." },
{ tipo: 'victoria', mensaje: "لقد حصلت على كلمة المرور الخاصة برجل أعمال في مقهى وقمت بتحويل الأموال إلى حسابك, لقد فزت." },
{ tipo: 'victoria', mensaje: "لقد أقنعت رجلاً مسناً بالمشاركة في استثمار وهمي وسحبت مدخراته, لقد ربحت." },
{ tipo: 'derrota', mensaje: "حاولت بيع ساعة مقلدة لكن المشتري لاحظ الخداع وأبلغ عنك, خسرت." },
{ tipo: 'derrota', mensaje: "لقد اخترقت حسابًا بنكيًا, لكن نسيت إخفاء عنوان IP الخاص بك وتم تعقبك وخسرت." },
{ tipo: 'derrota', mensaje: "لقد سرقت حقيبة ظهر في إحدى المناسبات, لكن الكاميرا الخفية التقطت الحدث بأكمله, وخسرت." },
{ tipo: 'derrota', mensaje: "لقد تسللت إلى متجر فاخر, لكن النظام الصامت قام بتنشيط الإنذار, لقد خسرت." },
{ tipo: 'derrota', mensaje: "لقد تظاهرت بأنك فني في قصر, لكن المالك تعرف عليك واتصل بالأمن, لقد خسرت." },
{ tipo: 'derrota', mensaje: "لقد حاولت بيع وثائق سرية, لكنها كانت مزورة ولم يرغب أحد في شرائها, فخسرت." }
]
