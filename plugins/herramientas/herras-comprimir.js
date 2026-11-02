import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';

const handler = async (m, { conn, text }) => {
  let buffer;
  try {
    if (m.quoted && (m.quoted.msg || {}).mimetype?.startsWith('image/')) {
      
      buffer = await m.quoted.download();
    } else if (text && text.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif)$/i)) {
      
      const res = await fetch(text);
      if (!res.ok) throw new Error(`🌑🎄 ظلال الأعياد لم تتمكن من تحميل الصورة...`);
      buffer = await res.buffer();
    } else {
      return m.reply(`❌🌑🎄 *الرد على الصورة أو إرسال رابط مباشر صالح مع الأمر* _.compress_ 🎅`);
    }

    m.react('🎄');

    const urlCatbox = await catbox(buffer); 

    const apiURL = `https://api.siputzx.my.id/api/iloveimg/compress?image=${encodeURIComponent(urlCatbox)}`;
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error(`🌑🎄 خطأ HTTP لعيد الميلاد القاتم ${response.status}`);
    const compressed = await response.buffer();

    await conn.sendMessage(m.chat, {
      image: compressed,
      caption: `> 🌕🎄 *الصورة مضغوطة بواسطة Festive Flash* 🎄🌑\n> ✨ *تم تحسينها في LoveIMG Kingdom*`
    }, { quoted: m });

    m.react('✅');
  } catch (err) {
    console.error(err);
    m.react('❌');
    m.reply(`✖️🌑🎄 *فشلت طقوس عيد الميلاد القاتمة في ضغط الصورة.*\n\n🪵 *التفاصيل القاتمة:* ${err.message}`);
  }
};

handler.help = ['comprimir'];
handler.tags = ['tools'];
handler.command = ['compress', 'comprimir'];

export default handler;

async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const random = crypto.randomBytes(5).toString('hex');
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, `${random}.${ext}`);

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android)',
    }
  });

  return await res.text();
  }
