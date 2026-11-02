import fs from 'fs';
import path from 'path';
import { enviarReaccionAnime } from '../../lib/anime-media.js'
import { resolverObjetivo, nombreSeguro } from '../../lib/anime-mention.js'

let handler = async (m, { conn, participants, groupMetadata, text, args, usedPrefix }) => {
    const { who, via, hasMention } = await resolverObjetivo(m, { conn, participants, groupMetadata, text, args });
    const hayMencion = hasMention || via === 'mention' || via === 'text';

    const name = await nombreSeguro(conn, who);
    const name2 = await nombreSeguro(conn, m.sender);
    m.react('😮‍💨');

    let str;
    if (hayMencion) {
        str = `\`${name2}\` *تثاءبت للتو أمام* \`${name}\`.`;
    } else if (via === 'quoted') {
        str = `\`${name2}\` *تثاءبت للتو أمام* \`${name}\`.`;
    } else {
        str = `\`${name2}\` *لقد تثاءب للتو... كم هو نعسان.*`.trim();
    }
    
    if (m.isGroup) {
        try {
            await enviarReaccionAnime(conn, m, { reaccion: 'yawn', caption: str, mentions: [who] });
        } catch (e) {
            console.error('[anime-yawn] فشل في إرسال GIF:', e.message)
            await conn.sendMessage(m.chat, { text: str, mentions: [who] }, { quoted: m });
        }
    }
}

handler.help = ['yawn @tag'];
handler.tags = ['anime'];
handler.command = ['yawn', 'bostezo', 'bostezar'];
handler.group = true;

export default handler;
