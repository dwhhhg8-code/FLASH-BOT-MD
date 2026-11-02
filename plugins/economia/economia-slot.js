import { delay } from "@whiskeysockets/baileys"

const handler = async (m, { args, usedPrefix, command, conn }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيستطيع *المسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}economy on *`)
}
const users = global.db.data.users[m.sender]
if (!args[0] || isNaN(args[0]) || parseInt(args[0]) <= 0) {
return m.reply(`❀ الرجاء إدخال المبلغ الذي تريد المراهنة عليه.`)
}
const apuesta = parseInt(args[0])
if (Date.now() - users.lastslot < 10000) {
const restante = users.lastslot + 10000 - Date.now()
return m.reply(`ꕥ يجب عليك الانتظار *${formatTime(restante)}* لاستخدام *${usedPrefix + command}* مرة أخرى.`)
}
if (apuesta < 100) return m.reply(`ꕥ الحد الأدنى للرهان هو 100 *${global.currency}*.`)
if (users.coin < apuesta) return m.reply(`ꕥ إن *${global.currency}* الخاص بك لا يكفي للمراهنة بهذا المبلغ.`)
const emojis = ['✾', '❃', '❁']
const getRandomEmojis = () => {
const x = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
const y = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
const z = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
return { x, y, z }
}
const initialText = '「✿」| *الفتحات* \n────────\n'
let { key } = await conn.sendMessage(m.chat, { text: initialText }, { quoted: m })
const animateSlots = async () => {
for (let i = 0; i < 5; i++) {
const { x, y, z } = getRandomEmojis()
const animationText = `「✿」| *SLOTS* 
────────
${x[0]} : ${y[0]} : ${z[0]}
${x[1]} : ${y[1]} : ${z[1]}
${x[2]} : ${y[2]} : ${z[2]}
────────`
await conn.sendMessage(m.chat, { text: animationText, edit: key }, { quoted: m })
await delay(300)
}}
await animateSlots()
const { x, y, z } = getRandomEmojis()
let resultado
if (x[0] === y[0] && y[0] === z[0]) {
resultado = `❀ لقد فزت! *¥${(apuesta * 2).toLocaleString()} ${global.currency}*.`
users.coin += apuesta
} else if (x[0] === y[0] || x[0] === z[0] || y[0] === z[0]) {
resultado = `❀ لقد كدت أن تفعل ذلك. *تبلغ تكلفة المحاولة 10 ين ياباني {global.currency}*.`
users.coin += 10
} else {
resultado = `❀ لقد خسرت *¥${apuesta.toLocaleString()} ${global.currency}*.`
users.coin -= apuesta
}
users.lastslot = Date.now()
const finalText = `「✿」| *SLOTS* 
────────
${x[0]} : ${y[0]} : ${z[0]}
${x[1]} : ${y[1]} : ${z[1]}
${x[2]} : ${y[2]} : ${z[2]}
────────
${resultado}`
await conn.sendMessage(m.chat, { text: finalText, edit: key }, { quoted: m })
}

handler.help = ['slot']
handler.tags = ['rpg']
handler.command = ['slot']
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
