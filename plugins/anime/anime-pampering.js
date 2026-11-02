import fs from 'fs';
import path from 'path';
import { enviarReaccionAnime } from '../../lib/anime-media.js'
import { resolverObjetivo, nombreSeguro } from '../../lib/anime-mention.js'

let handler = async (m, { conn, participants, groupMetadata, text, args, usedPrefix }) => {
    const { who, via, hasMention } = await resolverObjetivo(m, { conn, participants, groupMetadata, text, args });
    const hayMencion = hasMention || via === 'mention' || via === 'text';

    const name = await nombreSeguro(conn, who);
    const name2 = await nombreSeguro(conn, m.sender);
    m.react('🤗');

    let str;
    if (hayMencion) {
        str = `\`${name2}\` *يقدم هدايا مجانية إلى* \`${name}\`.`;
    } else if (via === 'quoted') {
        str = `\`${name2}\` *يقدم هدايا مجانية إلى* \`${name}\`.`;
    } else {
        str = `\`${name2}\` *يقوم بتوزيع الحضن.*`.trim();
    }
    
    if (m.isGroup) {
        try {
            await enviarReaccionAnime(conn, m, { reaccion: 'pat', caption: str, mentions: [who] });
        } catch (e) {
            console.error('[anime-pampering] تعذر إرسال GIF:', e.message)
            await conn.sendMessage(m.chat, { text: str, mentions: [who] }, { quoted: m });
        }
    }
}

handler.help = ['pampering @tag'];
handler.tags = ['anime'];
handler.command = ['pampering', 'mimos', 'apapachar'];
handler.group = true;

export default handler;
