import fetch from 'node-fetch';
import { PIXABAY_API_KEY } from '../../lib/secrets.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return m.reply(
      `🎭 بحثك مفقود, ظل...\n\nأمثلة:\n` +
      `• ${usedPrefix}wp سماحة في الظل\n` +
      `• ${usedPrefix}wallpaper عيد الميلاد`
    );
  }

  try {
    let apiKey = PIXABAY_API_KEY;
    let res = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(text)}&image_type=photo&orientation=vertical&per_page=50`);
    let data = await res.json();

    if (!data.hits?.length) return m.reply(`❄️ لا توجد نتائج لـ: "${text}". تغيير البحث.`);

    let img = data.hits[Math.floor(Math.random() * data.hits.length)].largeImageURL;

    let fkontak = {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: {
        contactMessage: {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Phone\nEND:VCARD`
        }
      },
      participant: '0@s.whatsapp.net'
    };

    let str = `❄️✨ الظل يبتسم وسط أضواء الاحتفالات...\n🔎 البحث: *${text}*\n⚔️ FLASH-BOT • لوحة عيد الميلاد 🎄`;

    await conn.sendButton(
      m.chat,
      str,
      '🎄✨ FLASH-BOT - يحتفل الظل أيضًا بعيد الميلاد UwU ✨🎄',
      img,
      [
        ['🔄 الظل التالي', `${usedPrefix}${command} ${text}`],
        ['🎄عيد الميلاد بينتريست', `${usedPrefix}pinterest ${text}`]
      ],
      null,
      [['فلاش بوت ⚔️', 'https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O']],
      fkontak
    );
  } catch (e) {
    console.log('[خلفية] خطأ:', e);
    await m.reply(`⚠️ خطأ في ${usedPrefix}${command}. استخدم *${usedPrefix}report* إذا استمر.`);
  }
};

handler.help = ['wallpaper']
handler.tags = ['descargas']
handler.command = ['wallpaper', 'wp'];
export default handler;
