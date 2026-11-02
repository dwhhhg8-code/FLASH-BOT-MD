import fs from 'fs';
import path from 'path';
import { resolverObjetivo, nombreSeguro } from '../../lib/anime-mention.js'

let handler = async (m, { conn, participants, groupMetadata, text, args, usedPrefix }) => {
    const { who, via, hasMention } = await resolverObjetivo(m, { conn, participants, groupMetadata, text, args });
    const hayMencion = hasMention || via === 'mention' || via === 'text';

    const name = await nombreSeguro(conn, who);
    const name2 = await nombreSeguro(conn, m.sender);
    m.react('🚬');

    let str;
    if (hayMencion) {
        str = `\`${name2}\` *يدخن بجوار* \`${name}\`.`;
    } else if (via === 'quoted') {
        str = `\`${name2}\` *يدخن بجوار* \`${name}\`.`;
    } else {
        str = `\`${name2}\` *يشعل سيجارة ويبدأ بالتدخين.*`.trim();
    }
    
    if (m.isGroup) {
        let mentions = [who];
        await conn.sendMessage(m.chat, { text: str, mentions }, { quoted: m });
    }
}

handler.help = ['smoke @tag'];
handler.tags = ['anime'];
handler.command = ['smoke', 'fumar', 'fumando'];
handler.group = true;

export default handler;
