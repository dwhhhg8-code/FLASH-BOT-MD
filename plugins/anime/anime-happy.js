import { enviarReaccionAnime } from '../../lib/anime-media.js'
import { resolverObjetivo, nombreSeguro } from '../../lib/anime-mention.js'

let handler = async (m, { conn, participants, groupMetadata, text, args, usedPrefix }) => {
    const { who, via, hasMention } = await resolverObjetivo(m, { conn, participants, groupMetadata, text, args });
    const hayMencion = hasMention || via === 'mention' || via === 'text';

    const name = await nombreSeguro(conn, who);
    const name2 = await nombreSeguro(conn, m.sender);
    m.react('😁');

    let str;
    if (hayMencion) {
        str = `\`${name2}\` *سعيد لـ* \`${name}\`.`;
    } else if (via === 'quoted') {
        str = `\`${name2}\` *سعيد لـ* \`${name}\`.`;
    } else {
        str = `\`${name2}\` *أنا سعيد للغاية اليوم.*`.trim();
    }
    
    if (m.isGroup) {
        try {
            await enviarReaccionAnime(conn, m, { reaccion: 'happy', caption: str, mentions: [who] });
        } catch (e) {
            console.error('[أنمي سعيد] لا يمكن إرسال GIF:', e.message)
            await conn.sendMessage(m.chat, { text: str, mentions: [who] }, { quoted: m });
        }
    }
}

handler.help = ['happy/feliz @tag'];
handler.tags = ['anime'];
handler.command = ['happy', 'feliz'];
handler.group = true;

export default handler;
