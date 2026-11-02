let handler = async (m, { conn, usedPrefix, command }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
let user = global.db.data.users[m.sender]
const cooldown = 2 * 60 * 1000
user.lastwork = user.lastwork || 0
if (Date.now() < user.lastwork) {
const tiempoRestante = formatTime(user.lastwork - Date.now())
return conn.reply(m.chat, `ꕥ يجب عليك الانتظار *${tiempoRestante}* لاستخدام *${usedPrefix + command}* مرة أخرى.`, m)
}
user.lastwork = Date.now() + cooldown
let rsl = Math.floor(Math.random() * 1501) + 2000
await conn.reply(m.chat, `❀ ${pickRandom(trabajo)} *¥${rsl.toLocaleString()} ${global.currency}*.`, m)
user.coin += rsl
}

handler.help = ['work']
handler.tags = ['rpg']
handler.command = ['w', 'work', 'chambear', 'chamba', 'trabajar']
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
return list[Math.floor(list.length * Math.random())]
}
const trabajo = [
"أنت تعمل كقاطع ملفات تعريف الارتباط وتكسب",
"يعمل لدى شركة عسكرية خاصة, يكسب",
"قم باستضافة حدث تذوق النبيذ واحصل على",
"قمت بتنظيف المدخنة والعثور عليها",
"أنت تطور الألعاب من أجل لقمة العيش وتفوز",
"لقد عملت لساعات إضافية في المكتب",
"أنت تعمل كخاطف العروس وتكسب",
"جاء شخص ما وقدم مسرحية. أعطوك للبحث",
"لقد اشتريت وبيعت سلعًا وكسبت",
"أنت تعمل في مطعم جدتك كطاهية وتكسب",
"أنت تعمل لمدة 10 دقائق في مطعم بيتزا هت المحلي. لقد فزت",
"أنت تعمل ككاتب كعكة الحظ وتكسب",
"تنظر في حقيبتك وتقرر بيع بعض العناصر عديمة الفائدة التي لا تحتاجها. اتضح أن كل تلك القمامة كانت ذات قيمة",
"أنت تطور الألعاب من أجل لقمة العيش وتفوز",
"أنت تعمل طوال اليوم في الشركة من أجل",
"لقد قمت بتصميم شعار لشركة ل",
"لقد عمل بأقصى ما يستطيع في شركة طباعة كانت تقوم بالتوظيف وحصل على ما يستحقه!",
"أنت تعمل كقاطع شجيرات وتكسب",
"أنت تعمل كممثل صوتي لـ SpongeBob SquarePants وتمكنت من الفوز",
"كنت تزرع وانتصرت",
"أنت تعمل كباني قلعة رملية وتكسب",
"أنت تعمل كفنان في الشارع وتكسب",
"لقد قمت بعمل اجتماعي لسبب وجيه! لقضيتك الصالحة التي تلقيتها",
"لقد قمت بإصلاح دبابة T-60 التالفة في أفغانستان. الطاقم دفع لك",
"أنت تعمل كعالم بيئة ثعبان البحر وتكسب",
"أنت تعمل في ديزني لاند كباندا ترتدي زيًا وتفوز",
"يمكنك إصلاح آلات الممرات واستلامها",
"لقد قمت ببعض الوظائف الغريبة في المدينة وحصلت عليها",
"تقوم بتنظيف بعض العفن السام من فتحة التهوية وتفوز",
"لقد قمت بحل لغز تفشي الكوليرا وكافأتك الحكومة بمبلغ مالي",
"أنت تعمل كعالم حيوان وتكسب",
"لقد بعت شطائر السمك وحصلت",
"يمكنك إصلاح آلات الممرات واستلامها"
]
