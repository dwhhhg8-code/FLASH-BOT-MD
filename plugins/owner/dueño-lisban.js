const handler = async (m, {conn, isOwner}) => {
  const chats = Object.entries(global.db.data.chats).filter((chat) => chat[1].isBanned);
  const users = Object.entries(global.db.data.users).filter((user) => user[1].banned);

  const caption = `
╔══✦🌌🎄✦══╗
   𝐒𝐇𝐀𝐃𝐎𝐖 𝐆𝐀𝐑𝐃𝐄𝐍 ❄️
   𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐁𝐀𝐍𝐄𝐀𝐃𝐎𝐒
╚══✦🌌🎄✦══╝

👤 *الأرواح مختومة بالظلال*:
├ الإجمالي : ${users.length} ${users ? '\n' + users.map(([jid], i) => `
├ ${isOwner ? '@' + jid.split`@`[0] : jid}`.trim()).join('\n') : '├'}
└────

💬 *النطاقات المحرمة تحت الثلج*:
├ الإجمالي : ${chats.length} ${chats ? '\n' + chats.map(([jid], i) => `
├ ${isOwner ? '@' + jid.split`@`[0] : jid}`.trim()).join('\n') : '├'}
└────

✨ في عيد الميلاد الكئيب هذا، يراقب FLASH BOT بصمت...
`.trim();

  m.reply(caption, null, {mentions: conn.parseMention(caption)});
};

handler.command = ['banlist', 'listban']
handler.rowner = true;
export default handler;
