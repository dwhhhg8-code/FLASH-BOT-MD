var handler = async (m, { conn, usedPrefix, command, text, groupMetadata }) => {
let mentionedJid = await m.mentionedJid
let user = mentionedJid && mentionedJid.length 
  ? mentionedJid[0] 
  : m.quoted && await m.quoted.sender 
    ? await m.quoted.sender 
    : null

if (!user) 
  return conn.reply(m.chat, '《✧》 يجب عليك ذكر المستخدم الذي تريد خفض رتبته من المسؤول.', m)

try {
const groupInfo = await conn.groupMetadata(m.chat)
const participant = groupInfo.participants.find(p => 
  p.id === user || 
  p.jid === user || 
  p.lid === user || 
  p.phoneNumber === user
)

if (!participant?.admin)
  return conn.reply(m.chat, `《✧》 *@${user.split('@')[0]}* ليس مسؤولاً عن المجموعة!`, m, { mentions: [user] })

const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
if (user === ownerGroup)
  return conn.reply(m.chat, '《✧》 لا يمكنك خفض رتبة منشئ المجموعة.', m)

if (user === conn.user.jid)
  return conn.reply(m.chat, '《✧》 لا يمكنك خفض رتبة روبوت المشرف.', m)

await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
await conn.reply(m.chat, `✿ تم تخفيض رتبة *@${user.split('@')[0]}* من مشرف المجموعة!`, m, { mentions: [user] })

} catch (e) {
conn.reply(m.chat, `> حدث خطأ غير متوقع أثناء تنفيذ *${usedPrefix + command}*.\n> [خطأ: *${e.message}*]`, m)
}}

handler.help = ['demote']
handler.tags = ['grupos']
handler.command = ['demote', 'degradar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
