import { enviarReaccionAnime } from '../../lib/anime-media.js'
import { resolverObjetivo, nombreSeguro } from '../../lib/anime-mention.js'
let handler = async (m, { conn, participants, groupMetadata, text, args, usedPrefix }) => {
  const { who, via, hasMention } = await resolverObjetivo(m, { conn, participants, groupMetadata, text, args });
  const hayMencion = hasMention || via === 'mention' || via === 'text';
  const name = await nombreSeguro(conn, who);
  const name2 = await nombreSeguro(conn, m.sender);
  await m.react('🗡️');

  let str = hayMencion
    ? `\`${name2}\` *قُتل* \`${name}\` 💫.`
    : via === 'quoted'
    ? `\`${name2}\` *مقتول* \`${name}\`.`
    : `\`${name2}\` *قتل نفسه 😵*`;

    if (m.isGroup) {
        try {
            await enviarReaccionAnime(conn, m, { reaccion: 'kill', caption: str, mentions: [who] });
        } catch (e) {
            console.error('[anime-kill] فشل في إرسال GIF:', e.message)
            await conn.sendMessage(m.chat, { text: str, mentions: [who] }, { quoted: m });
        }
    }
};

handler.help = ['kill', 'matar @tag'];
handler.tags = ['anime'];
handler.command = ['kill', 'matar'];
handler.group = true;

export default handler;
