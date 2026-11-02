import acrcloud from 'acrcloud';
import { ACRCLOUD_HOST, ACRCLOUD_KEY, ACRCLOUD_SECRET } from '../../lib/secrets.js';

let acr = new acrcloud({
  host: ACRCLOUD_HOST,
  access_key: ACRCLOUD_KEY,
  access_secret: ACRCLOUD_SECRET
});

let handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';

  if (/video|audio/.test(mime)) {
    const buffer = await q.download();
    const { status, metadata } = await acr.identify(buffer);
    if (status.code !== 0) throw status.msg;

    const { title, artists, album, genres, release_date } = metadata.music[0];

    const txt = `「✦」تحديد الموسيقى

✐ Título » *${title || 'غير متوفر'}*
ⴵ الفنان » *${artists?.map(v => v.name).join(', ') || 'غير معروف'}*
✰ Álbum » *${album?.name || 'غير متوفر'}*
❒ Género » *${genres?.map(v => v.name).join(', ') || 'غير محدد'}*
🜸 Lanzamiento » *${release_date || 'غير مسجل'}*`;

    conn.sendMessage(m.chat, { text: txt, ...rcanal }, { quoted: m });
  } else {
    conn.sendMessage(m.chat, {
      text: `❒ قم بوضع علامة على *صوت أو فيديو قصير* باستخدام الأمر *${usedPrefix + command}* للتعرف على الموسيقى.`,
      ...rcanal
    }, { quoted: m });
  }
};

handler.help = ['whatmusic'];
handler.tags = ['tools'];
handler.command = ['shazam', 'whatmusic'];

export default handler;
