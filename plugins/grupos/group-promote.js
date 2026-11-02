var handler = async (m, { conn, usedPrefix, command, text, groupMetadata, isAdmin }) => {
let mentionedJid = await m.mentionedJid
let user = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null
if (!user) return conn.reply(m.chat, `✎ يجب عليك ذكر مستخدم لتتمكن من ترقيته إلى مسؤول.`, m)
try {
const groupInfo = await conn.groupMetadata(m.chat)
const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
if (user === ownerGroup || groupInfo.participants.some(p => p.id === user && p.admin))
return conn.reply(m.chat, '> المستخدم المذكور لديه بالفعل امتيازات المسؤول.', m)
await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
await conn.reply(m.chat, `ꕥ تمت إضافته بنجاح كمسؤول للمجموعة.`, m)
} catch (e) {
conn.reply(m.chat, `⚠︎ حدثت مشكلة.\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${e.message}`, m)
}}

handler.help = ['promote']
handler.tags = ['grupos']
handler.command = ['promote', 'promover']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler