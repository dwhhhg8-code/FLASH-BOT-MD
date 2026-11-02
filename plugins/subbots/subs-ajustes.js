import { jidDecode } from '@whiskeysockets/baileys'
import path from 'path'
import fs from 'fs'
import ws from 'ws'

const linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
const handler = async (m, { conn, command, usedPrefix, text, isOwner, isROwner }) => {
try {
const isSubBots = isOwner || isROwner || m.fromMe || (conn.user.jid === m.sender)
if (!isSubBots) return m.reply(`❀ لا يمكن تنفيذ الأمر *${command}* إلا بواسطة المقبس.`)
switch (command) {
case 'self': case 'public': case 'antiprivado': case 'antiprivate': case 'gponly': case 'sologp': {
const config = global.db.data.settings[conn.user.jid]
const value = text ? text.trim().toLowerCase() : ''
const type = /self|public/.test(command) ? 'self' : /antiprivado|antiprivate/.test(command) ? 'antiPrivate' : /gponly|sologp/.test(command) ? 'gponly' : null
if (!type) return m.reply(`ꕥ وضع غير معروف.`)
const isEnable = config[type] || false
const enable = value === 'enable' || value === 'on'
const disable = value === 'disable' || value === 'off'
if (enable || disable) {
if (isEnable === enable)
return m.reply(`ꕥ كان الوضع *${type}* هو ${enable ? 'مفعّل' : 'متوقّف'} بالفعل.`)
config[type] = enable
return conn.reply(m.chat, `✎ اجعل *${enable ? 'مفعّل' : 'متوقّف'}* الوضع *${type}* للمقبس.`, m)
}
conn.reply(m.chat, `✦ يمكنك تمكين أو تعطيل وضع *${type}* باستخدام:\n\n● تمكين » ${usedPrefix}${command} تمكين\n● تعطيل » ${usedPrefix}${command} تعطيل\n\n✧ الحالة الحالية » *${isEnable ? '✓ مفعّل' : '✗ متوقّف'}*`, m)
break
}
case 'join': {
if (!text) return m.reply(`❀ يجب عليك إرسال رابط دعوة للانضمام إلى المجموعة.`)
const [_, code] = text.match(linkRegex) || []
if (!code) return m.reply(`ꕥ رابط الدعوة غير صالح.`)
await m.react('🕒')
try {
await conn.groupAcceptInvite(code)
} catch (e) {
if (/account_reachout_restricted/i.test(e.message || e)) {
const info = await conn.groupGetInviteInfo(code).catch(() => null)
if (info?.id) {
const expiration = Math.floor(Date.now() / 1000) + 86400 * 7
await conn.groupAcceptInviteV4(conn.user.jid, {
groupJid: info.id,
inviteCode: code,
inviteExpiration: expiration
})
} else {
return m.reply(`❀ تم تقييد حساب WhatsApp الخاص بالروبوت مؤقتًا بواسطة WhatsApp من الانضمام إلى المجموعات (account_reachout_restricted). انتظر من 24 إلى 72 ساعة حتى يتم رفع القيد.`)
}
} else if (/Connection Closed/i.test(e.message || e)) {
return m.reply(`❀ الاتصال مع WhatsApp معطل. انتظر حتى يقوم الروبوت بإعادة الاتصال تلقائيًا وحاول مرة أخرى.`)
} else {
throw e
}
}
await m.react('✔️')
m.reply(`❀ لقد انضم ${botname} إلى المجموعة بنجاح.`)
break
}
case 'salir': case 'leave': {
await m.react('🕒')
const id = text || m.chat
const chat = global.db.data.chats[m.chat]
chat.welcome = false
await conn.reply(id, `حسنًا, لقد فهمت 😓 سأترك المجموعة وداعًا للجميع 👋, ${botname} يقول وداعًا 🌌`)
await conn.groupLeave(id)
chat.welcome = true
await m.react('✔️')
break
}
case 'logout': {
const rawId = conn.user?.id || ''
const cleanId = jidDecode(rawId)?.user || rawId.split('@')[0]
const index = global.conns?.findIndex(c => c.user.jid === m.sender)
if (global.conn.user.jid === conn.user.jid)
return conn.reply(m.chat, '❀ تم تعطيل هذا الأمر في الجلسات الرئيسية.', m)
if (index === -1 || !global.conns[index])
return conn.reply(m.chat, '⚠︎ الجلسة مغلقة بالفعل أو لم يتم العثور على اتصال نشط.', m)
conn.reply(m.chat, '✩ تم إغلاق جلستك بنجاح.', m)
setTimeout(async () => {
await global.conns[index].logout()
global.conns.splice(index, 1)
const sessionPath = path.join(global.jadi, cleanId)
if (fs.existsSync(sessionPath)) {
fs.rmSync(sessionPath, { recursive: true, force: true })
console.log(`⚠︎ تم حذف جلسة ${cleanId} من ${sessionPath}`)
}}, 3000)
break
}
case 'reload': {
const rawId = conn.user?.id || ''
const cleanId = jidDecode(rawId)?.user || rawId.split('@')[0]
const sessionPath = path.join(global.jadi, cleanId)
if (!fs.existsSync(sessionPath)) return conn.reply(m.chat, '⌗ لا يمكن تنفيذ هذا الأمر إلا من خلال مثيل Sub-Bot.', m)
await m.react('🕒')
if (typeof global.reloadHandler !== 'function')
throw new Error('لم يتم العثور على الدالة global.reloadHandler')
await global.reloadHandler(true)
await m.react('✔️')
conn.reply(m.chat, '✿ تم إعادة تحميل الجلسة بنجاح.', m)
break
}}} catch (error) {
await m.react('✖️')
conn.reply(m.chat, `⚠︎ حدثت مشكلة.\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${error.message || error}`, m)
}}

handler.command = ['self', 'public', 'antiprivate', 'gponly', 'sologp', 'join', 'salir', 'leave', 'logout', 'reload']
handler.help = ['self', 'public', 'antiprivate', 'gponly', 'sologp', 'join', 'salir', 'leave', 'logout', 'reload']
handler.tags = ['socket']

export default handler
