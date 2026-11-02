import { WAMessageStubType } from '@whiskeysockets/baileys'
const handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
if (!m.messageStubType || !m.isGroup || m.messageStubType === WAMessageStubType.CIPHERTEXT) return
const primaryBot = global.db.data.chats[m.chat].primaryBot
if (primaryBot && conn.user.jid !== primaryBot) throw !1
const chat = global.db.data.chats[m.chat]
const users = m.messageStubParameters?.[0] || ''
const sender = String(m?.sender || '')
const participant = participants.find(p => [p.id, p.lid, p.jid, p.phoneNumber].includes(sender))
const usuario = participant?.phoneNumber || participant?.jid || sender
const groupAdmins = participants.filter(p => p.admin)

const rcanalBase = {
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: global.channelRD?.id || '',
    serverMessageId: '',
    newsletterName: global.channelRD?.name || ''
  },
  matchedText: ""
}

const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://github.com/dwhhhg8-code.png'
const nombre = `> ❀ @${usuario.split('@')[0]} لقد تغير اسم المجموعة.\n> ✦ المجموعة تسمى الآن:\n> *${m.messageStubParameters[0]}*.`
const foto = `> ❀ تم تغيير صورة المجموعة.\n> ✦ تم اتخاذ الإجراء بواسطة:\n> » @${usuario.split('@')[0]}`
const edit = `> ❀ @${usuario.split('@')[0]} لقد سمحت لـ ${m.messageStubParameters[0] == 'on' ? 'مدراء منفردين' : 'todos'} بتكوين المجموعة.`
const newlink = `> ❀ تمت استعادة رابط المجموعة.\n> ✦ تم اتخاذ الإجراء بواسطة:\n> » @${usuario.split('@')[0]}`
const status = `> ❀ المجموعة كانت ${m.messageStubParameters[0] == 'on' ? '*cerrado*' : '*abierto*'} بواسطة @${usuario.split('@')[0]}\n> ✦ الآن يمكن لـ ${m.messageStubParameters[0] == 'on' ? '*مشرفين منفردين*' : '*todos*'} إرسال رسالة.`
const userNumber = users.split('@')[0] || 'مستخدم'
const admingp = `> ❀ @${userNumber} هو الآن مسؤول المجموعة.\n> ✦ تم اتخاذ الإجراء بواسطة:\n> » @${usuario.split('@')[0]}`
const noadmingp = `> ❀ @${userNumber} توقف عن كونك مسؤولاً عن المجموعة.\n> ✦ تم اتخاذ الإجراء بواسطة:\n> » @${usuario.split('@')[0]}`

if (chat.detect && m.messageStubType == 21) {
await this.sendMessage(m.chat, { text: nombre, contextInfo: { ...rcanalBase, mentionedJid: [usuario, ...groupAdmins.map(v => v.id)] } }, { quoted: null })
} if (chat.detect && m.messageStubType == 22) {
const rcanalFoto = { ...rcanalBase }
delete rcanalFoto.matchedText
await this.sendMessage(m.chat, { image: { url: pp }, caption: foto, contextInfo: { ...rcanalFoto, mentionedJid: [usuario, ...groupAdmins.map(v => v.id)] } }, { quoted: null })
} if (chat.detect && m.messageStubType == 23) {
await this.sendMessage(m.chat, { text: newlink, contextInfo: { ...rcanalBase, mentionedJid: [usuario, ...groupAdmins.map(v => v.id)] } }, { quoted: null })
} if (chat.detect && m.messageStubType == 25) {
await this.sendMessage(m.chat, { text: edit, contextInfo: { ...rcanalBase, mentionedJid: [usuario, ...groupAdmins.map(v => v.id)] } }, { quoted: null })
} if (chat.detect && m.messageStubType == 26) {
await this.sendMessage(m.chat, { text: status, contextInfo: { ...rcanalBase, mentionedJid: [usuario, ...groupAdmins.map(v => v.id)] } }, { quoted: null })
} if (chat.detect && m.messageStubType == 29) {
await this.sendMessage(m.chat, { text: admingp, contextInfo: { ...rcanalBase, mentionedJid: [usuario, users, ...groupAdmins.map(v => v.id)].filter(Boolean) } }, { quoted: null })
return
} if (chat.detect && m.messageStubType == 30) {
await this.sendMessage(m.chat, { text: noadmingp, contextInfo: { ...rcanalBase, mentionedJid: [usuario, users, ...groupAdmins.map(v => v.id)].filter(Boolean) } }, { quoted: null })
} else { 
if (m.messageStubType == 2) return
console.log({messageStubType: m.messageStubType,
messageStubParameters: m.messageStubParameters,
type: WAMessageStubType[m.messageStubType], 
})}}

export default handler
