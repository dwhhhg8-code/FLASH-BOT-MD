import fetch from 'node-fetch';
import { Jimp } from 'jimp'

const handler = async (m, { conn, command, usedPrefix, text }) => {
  const isSubBots = [conn.user.jid, ...global.owner.map(([number]) => `${number}@s.whatsapp.net`)].includes(m.sender);
  if (!isSubBots) return m.reply(`「✦」الأمر *${command}* مقيد. لا يمكن تنفيذه إلا بواسطة المقبس أو المالكين المعتمدين.`);

  try {
    const value = text ? text.trim() : '';

    switch (command) {
      case 'setpfp':
      case 'setimg': {
        const q = m.quoted || m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image\/(png|jpe?g)/.test(mime)) {
          return conn.reply(m.chat, `✐ يرجى الرد أو إرسال صورة صالحة بتنسيق PNG أو JPEG لتحديث الصورة الشخصية.`, m);
        }

        const media = await q.download();
        if (!media) return conn.reply(m.chat, `ꕥ لا يمكن الحصول على الصورة.`, m);

        const image = await Jimp.read(media);
        const buffer = await image.getBuffer('image/jpeg');
        await conn.updateProfilePicture(conn.user.jid, buffer);

        conn.reply(m.chat, `❒ تم تحديث صورة ملفك الشخصي بشكل صحيح.`, m);
        break;
      }

      case 'setstatus':
      case 'setbio': {
        if (!text) return conn.reply(m.chat, `✐ أدخل النص الذي تريد تعيينه كسيرة ذاتية جديدة.`, m);
        await conn.updateProfileStatus(text);
        conn.reply(m.chat, `❒ تم تحديث السيرة الذاتية بشكل صحيح:\n> 🜸 *"${text}"*`, m);
        break;
      }

      case 'setusername':
      case 'setuser': {
        if (!value) return conn.reply(m.chat, `✐ أدخل اسم المستخدم الجديد الذي تريد إنشاءه.`, m);
        if (value.length < 3 || value.length > 25) {
          return conn.reply(m.chat, `ꕥ يجب أن يحتوي الاسم على ما بين 3 إلى 25 حرفًا.`, m);
        }
        await conn.updateProfileName(value);
        m.reply(`❒ تم تحديث اسم المستخدم بنجاح:\n> ✐ *${value}*`);
        break;
      }
    }
  } catch (error) {
    m.reply(`⚠︎ حدث خطأ غير متوقع.\n> إذا استمرت المشكلة, يرجى الإبلاغ عنها باستخدام *${usedPrefix}report*.\n\n🜸 التفاصيل: ${error.message}`);
  }
};

handler.help = ['setpfp', 'setbio', 'setuser'];
handler.tags = ['socket'];
handler.command = ['setpfp', 'setimage', 'setstatus', 'setbio', 'setusername', 'setuser'];

export default handler;
