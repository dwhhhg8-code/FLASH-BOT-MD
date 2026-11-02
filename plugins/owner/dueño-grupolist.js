const handler = async (m, { conn }) => {
  let txt = '';
  try {    
    const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
    const totalGroups = groups.length;
    for (let i = 0; i < groups.length; i++) {
      const [jid, chat] = groups[i];
      const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
      const participants = groupMetadata.participants || [];
      const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
      const isBotAdmin = bot?.admin || false;
      const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
      const participantStatus = isParticipant ? '👤 Participante' : '❌مشارك سابق';
      const totalParticipants = participants.length;
      txt += `*◉ الجروب ${i + 1}*
      *➤ الاسم:* ${await conn.getName(jid)}
      *➤ ID:* ${jid}
      *➤ Admin:* ${isBotAdmin ? '✔ Sí' : '❌ لا'}
      *➤ الحالة:* ${participantStatus}
      *➤ الإجمالي de Participantes:* ${totalParticipants}
      *➤ Link:* ${isBotAdmin ? `https://chat.whatsapp.com/${await conn.groupInviteCode(jid) || '--- (Error) ---'}` : '--- (بدون مشرف) ---'}\n\n`;
    }
    m.reply(`🎄🌌 *تقرير عيد الميلاد لمجموعة FLASH BOT* 🎅\n\n❄️ *—◉ إجمالي النطاقات التي تمت مراقبتها:* ${totalGroups}\n\n${txt}\n✨ تحتفل الظلال تحت الثلج, لكنها لا تتوقف أبدًا عن المراقبة...`.trim());
  } catch {
    const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
    const totalGroups = groups.length;
    for (let i = 0; i < groups.length; i++) {
      const [jid, chat] = groups[i];
      const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
      const participants = groupMetadata.participants || [];
      const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
      const isBotAdmin = bot?.admin || false;
      const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
      const participantStatus = isParticipant ? '👤 Participante' : '❌مشارك سابق';
      const totalParticipants = participants.length;    
      txt += `*◉ الجروب ${i + 1}*
      *➤ الاسم:* ${await conn.getName(jid)}
      *➤ ID:* ${jid}
      *➤ Admin:* ${isBotAdmin ? '✔ Sí' : '❌ لا'}
      *➤ الحالة:* ${participantStatus}
      *➤ الإجمالي de Participantes:* ${totalParticipants}
      *➤ Link:* ${isBotAdmin ? '--- (Error) ---' : '--- (بدون مشرف) ---'}\n\n`;
    }
    m.reply(`🎄👾 *تقرير مجموعة عيد الميلاد من FLASH BOT* 🌌\n\n❄️ *—◉ إجمالي النطاقات التي تمت مراقبتها:* ${totalGroups}\n\n${txt}\n✨ حتى في عيد الميلاد, الظلال لا تهدأ أبدًا...`.trim());
  }    
};
handler.help = ['groups', 'grouplist'];
handler.tags = ['owner'];
handler.command = ['listgroup', 'gruposlista', 'grouplist', 'listagrupos']
handler.rowner = true;
handler.private = true

export default handler;
