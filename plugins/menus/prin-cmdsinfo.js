import { readdirSync, unlinkSync, existsSync, promises as fs } from 'fs';
import path from 'path';
import cp from 'child_process';
import { promisify } from 'util';
import moment from 'moment-timezone';

const exec = promisify(cp.exec).bind(cp);
const linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;

const handler = async (m, { conn, text, command, usedPrefix, args }) => {
  try {
    const nombre = m.pushName || 'مجهول';
    const tag = '@' + m.sender.split('@')[0];
    const usertag = Array.from(new Set([...text.matchAll(/@(\d{5,})/g)]), m => `${m[1]}@s.whatsapp.net`);
    const chatLabel = m.isGroup ? (await conn.getName(m.chat) || 'جروب') : 'خاص';
    const horario = moment.tz('America/Caracas').format('DD/MM/YYYY hh:mm:ss A');

    switch (command) {
      case 'suggest':
      case 'sug': {
        if (!text) return conn.sendMessage(m.chat, { text: '🎃 يرجى كتابة الاقتراح الذي تريد إرساله إلى المطور.', ...rcanal }, { quoted: m });
        if (text.length < 10) return conn.sendMessage(m.chat, { text: '🦇 يجب أن يحتوي الاقتراح على 10 أحرف على الأقل.', ...rcanal }, { quoted: m });
        await m.react('⏳');

        const sug = `「🎃」 تم استلام اقتراح أركانا 🦇

🕯️ المستخدم » *${nombre}*
✩ Tag » *${tag}*
🕸️ Sugerencia » ${text}
🏰 Chat » *${chatLabel}*
⏳ Horario » *${horario}*
⚰️ InfoBot » *${botname} / ${vs}*`;

        await conn.sendMessage(`${suittag}@s.whatsapp.net`, { text: sug, mentions: [m.sender, ...usertag], ...rcanal }, { quoted: m });
        await m.react('🎃');
        await conn.sendMessage(m.chat, { text: '🎃 تم إرسال رسالتك بين الظلال إلى المطور. شكرًا لك على التعاون مع FLASH BOT.', ...rcanal }, { quoted: m });
        break;
      }

      case 'report':
      case 'reportar': {
        if (!text) return conn.sendMessage(m.chat, { text: '🎃 يرجى وصف الخلل أو الكراك الذي تريد الإبلاغ عنه.', ...rcanal }, { quoted: m });
        if (text.length < 10) return conn.sendMessage(m.chat, { text: '🦇 يجب أن يحتوي التقرير على 10 أحرف على الأقل.', ...rcanal }, { quoted: m });
        await m.react('⏳');

        const rep = `「🎃」 تم استلام تقرير الاختراق 🦇

🕯️ المستخدم » *${nombre}*
✩ Tag » *${tag}*
🕸️ Reporte » ${text}
🏰 Chat » *${chatLabel}*
⏳ Horario » *${horario}*
⚰️ InfoBot » *${botname} / ${vs}*`;

        await conn.sendMessage(`${suittag}@s.whatsapp.net`, { text: rep, mentions: [m.sender, ...usertag], ...rcanal }, { quoted: m });
        await m.react('🎃');
        await conn.sendMessage(m.chat, { text: '🎃 تم إرسال بلاغ الشذوذ إلى محكمة الظل.', ...rcanal }, { quoted: m });
        break;
      }

      case 'invite': {
        if (!text) return conn.sendMessage(m.chat, { text: '🎃 يجب عليك إرسال رابط صالح لاستدعاء اللورد شادو إلى سحرتك.', ...rcanal }, { quoted: m });
        let [_, code] = text.match(linkRegex) || [];
        if (!code) return conn.sendMessage(m.chat, { text: '🦇 رابط الدعوة غير صالح.', ...rcanal }, { quoted: m });
        await m.react('⏳');

        const invite = `「🎃」 تم استلام المكالمة 🦇

🕯️ المستخدم » *${nombre}*
✩ Tag » *${tag}*
🏰 Chat » *${chatLabel}*
⏳ Horario » *${horario}*
⚰️ InfoBot » *${botname} / ${vs}*
🕸️ Link » ${text}`;

        const mainBotNumber = global.conn.user.jid.split('@')[0];
        const senderBotNumber = conn.user.jid.split('@')[0];
        const destino = mainBotNumber === senderBotNumber ? `${suittag}@s.whatsapp.net` : `${senderBotNumber}@s.whatsapp.net`;

        await conn.sendMessage(destino, { text: invite, mentions: [m.sender, ...usertag], ...rcanal }, { quoted: m });
        await m.react('🎃');
        await conn.sendMessage(m.chat, { text: '🎃 تم إرسال لفيفة الدعوة بنجاح.', ...rcanal }, { quoted: m });
        break;
      }

      case 'fixmsg':
      case 'ds': {
        if (global.conn.user.jid !== conn.user.jid)
          return conn.sendMessage(m.chat, { text: '🎃 لا يمكن تنفيذ هذا الأمر الغامض إلا من قلب الظل الرئيسي.', ...rcanal }, { quoted: m });
        await m.react('⏳');

        const chatIdList = m.isGroup ? [m.chat, m.sender] : [m.sender];
        const sessionPath = './Sessions/';
        let files = await fs.readdir(sessionPath);
        let count = 0;

        for (let file of files) {
          for (let id of chatIdList) {
            if (file.includes(id.split('@')[0])) {
              await fs.unlink(path.join(sessionPath, file));
              count++;
              break;
            }
          }
        }

        await m.react(count === 0 ? '✖️' : '🎃');
        await conn.sendMessage(m.chat, { text: count === 0
          ? '🦇 لم يتم العثور على بقايا الجلسة المتعلقة بمعرفك.'
          : `🎃 *${count}* تمت إزالة الملفات المتبقية من السرداب بنجاح.`, ...rcanal }, { quoted: m });
        break;
      }
    }
  } catch (err) {
    await m.react('✖️');
    await conn.sendMessage(m.chat, { text: `⚠︎ حدث اضطراب في الهاوية.\n> استخدم *${usedPrefix}report* لإبلاغ المحكمة.\n\n🦇 التفاصيل: ${err.message}`, ...rcanal }, { quoted: m });
  }
};

handler.help = ['suggest', 'reporte', 'invite', 'fixmsg'];
handler.tags = ['main'];
handler.command = ['suggest', 'sug', 'report', 'reportar', 'invite', 'fixmsg', 'ds'];

export default handler;
