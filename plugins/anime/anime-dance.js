import { enviarReaccionAnime } from '../../lib/anime-media.js'
import { resolverObjetivo, nombreSeguro } from '../../lib/anime-mention.js'

let handler = async (m, { conn, participants, groupMetadata, text, args, usedPrefix }) => {
    const { who, via, hasMention } = await resolverObjetivo(m, { conn, participants, groupMetadata, text, args });
    const hayMencion = hasMention || via === 'mention' || via === 'text';

    const name = await nombreSeguro(conn, who);
    const name2 = await nombreSeguro(conn, m.sender);
    m.react('💃');

    let str;
    if (hayMencion) {
        str = `\`${name2}\` *الرقص مع* \`${name}\`.`;
    } else if (via === 'quoted') {
        str = `\`${name2}\` *يرقص مع* \`${name}\`.`;
    } else {
        str = `\`${name2}\` *يسقط الخطوات المحظورة.*`.trim();
    }
    
    if (m.isGroup) {
        try {
            await enviarReaccionAnime(conn, m, { reaccion: 'dance', caption: str, mentions: [who] });
        } catch (e) {
            console.error('[رقصة الأنمي] لا يمكن إرسال GIF:', e.message)
            await conn.sendMessage(m.chat, { text: str, mentions: [who] }, { quoted: m });
        }
    }
}

handler.help = ['dance/bailar @tag'];
handler.tags = ['anime'];
handler.command = ['dance', 'bailar'];
handler.group = true;

export default handler;
