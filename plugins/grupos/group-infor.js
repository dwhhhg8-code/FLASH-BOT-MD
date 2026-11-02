import { promises as fs } from 'fs';

const handler = async (m, { conn, participants, groupMetadata }) => {
  const chat = global.db.data.chats[m.chat];
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => 'https://raw.githubusercontent.com/Andresv27728/dtbs/main/shadow.jpg');

  const {
    antiLink, detect, welcome, sWelcome, sBye,
    modoadmin, nsfw, isBanned, economy, gacha, primaryBot
  } = chat;

  const groupAdmins = participants.filter(p => p.admin);
  const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';
  const creador = (!owner || owner.startsWith('1203') || owner.length < 15) ? 'لم يتم العثور عليه' : `@${owner.split('@')[0]}`;
  const rawPrimary = typeof primaryBot === 'string' ? primaryBot : '';
  const botprimary = rawPrimary.endsWith('@s.whatsapp.net') ? `@${rawPrimary.split('@')[0]}` : 'Aleatorio';
  const totalreg = Object.keys(global.db.data.users).length;

  const text = `معلومات عن السحرة 🎃🦇 🦇🎃
⌦ Aquelarre: *${groupMetadata.subject}*
⌦ المرشد الأعلى: *${creador}*
⌦ اجتمعت النفوس: *${participants.length}*
⌦ الأوصياء (المسؤولون): *${groupAdmins.length}*
⌦ المقاولون العالميون: *${totalreg.toLocaleString()}*
⌦ الظل الرئيسي: *${botprimary}*

طوابع 🕯️ والخيارات النشطة:
» *${botname}*: ${isBanned ? 'في القبو ✗' : 'مستيقظا ✓'}
» Welcome: ${welcome ? 'مقفول ✓' : 'داخل ✗'}
» Alertas: ${detect ? 'مقفول ✓' : 'داخل ✗'}
» Anti-Link: ${antiLink ? 'مقفول ✓' : 'داخل ✗'}
» للمشرفين فقط: ${modoadmin ? 'مقفول ✓' : 'داخل ✗'}
» NSFW: ${nsfw ? 'مقفول ✓' : 'داخل ✗'}

مخطوطات الترحيب 🕸️:
» Welcome: ${(sWelcome || 'لا توجد رسالة').replace(/{usuario}/g, `@${m.sender.split('@')[0]}`).replace(/{grupo}/g, `*${groupMetadata.subject}*`).replace(/{desc}/g, `*${groupMetadata.desc || 'لا يوجد وصف'}*`)}
» Bye: ${(sBye || 'لا توجد رسالة').replace(/{usuario}/g, `@${m.sender.split('@')[0]}`).replace(/{grupo}/g, `*${groupMetadata.subject}*`).replace(/{desc}/g, `*${groupMetadata.desc || 'لا يوجد وصف'}*`)}`;

  conn.sendFile(m.chat, pp, 'img.jpg', text, m, false, {
    mentions: [owner, rawPrimary, m.sender]
  });
};

handler.help = ['infogrupo'];
handler.tags = ['grupos'];
handler.command = ['infogrupo', 'gp'];
handler.group = true;

export default handler;
