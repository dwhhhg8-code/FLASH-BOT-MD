import { obtenerImagenNSFW } from '../../lib/nsfw-media.js';

const handler = async (m, { conn, command, args}) => {
  try {
    if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
      return m.reply(`🚫 محتوى *NSFW* معطل في هذه المجموعة.\n🛡️ يمكن للمسؤول تفعيله باستخدام: *.on nsfw*`);
}

    const categorias = ['waifu', 'neko', 'trap', 'blowjob'];
    const categoria = args[0]?.toLowerCase();

    if (!categoria ||!categorias.includes(categoria)) {
      return m.reply(`🔞 *الاستخدام الصحيح للأمر:*

.hentaisearch <categoría>

📂 الفئات المتوفرة:
${categorias.map(c => `• ${c}`).join('\n')}\n\n📌 مثال:\n.hentaisearch waifu`);
}

    const url = await obtenerImagenNSFW(categoria);

    await conn.sendFile(m.chat, url, `${categoria}.jpg`, `
🔞 *NSFW: ${categoria.toUpperCase()}*
${pickRandom(['🥵', '👀', '🔥', '🍑', '😳'])} *Disfrútala con moderación* ${pickRandom(['🌚', '💦', '🫦'])}
`, m);
} catch (e) {
    console.error(e);
    m.reply('❌ خطأ في الحصول على الصورة. حاول مرة أخرى لاحقًا.');
}
};

handler.command = ['hentaisearch'];
handler.tags = ['nsfw'];
handler.help = ['hentaisearch <categoría>'];
handler.group = true;

export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
