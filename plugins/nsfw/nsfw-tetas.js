import { obtenerImagenNSFW } from '../../lib/nsfw-media.js';

let handler = async (m, { conn}) => {
  let chat = global.db.data.chats[m.chat];

  if (!chat.nsfw) return m.reply('⚠️ تم تعطيل خيار NSFW في هذه المجموعة.');

  let text = '*🫨 الثدي*';

  try {
    let img = await obtenerImagenNSFW('boobs');
    await conn.sendMessage(m.chat, { image: { url: img}, caption: text}, { quoted: m});
    m.react('✅');
  } catch (e) {
    m.reply('❌ تعذّر الحصول على الصورة. حاول مرة أخرى لاحقًا.');
  }
};

handler.help = ['tetas'];
handler.command = ['tetas'];
handler.tags = ['nsfw'];
handler.group = true;

export default handler;
