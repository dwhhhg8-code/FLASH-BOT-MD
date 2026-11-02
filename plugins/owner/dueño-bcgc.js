const handler = async (m, { conn, isROwner, text}) => {
  const delay = (time) => new Promise((res) => setTimeout(res, time));
  const getGroups = await conn.groupFetchAllParticipating();
  const groups = Object.entries(getGroups).map(([id, data]) => data.id);
  const pesan = m.quoted?.text || text;

  if (!pesan) throw '⚠️ كنت في عداد المفقودين النص لإرساله';

  for (const id of groups) {
    await delay(500);
    await conn.sendMessage(id, { text: `🎃🦇 رسالة من الجماعة 🦇🎃\n\n${pesan}`}, { quoted: m}).catch(() => {});
}

  m.reply(`🎃 تم إرسال الرسالة إلى معاشر ${groups.length} 🦇`);
};

handler.help = ['broadcastgroup', 'bcgc'];
handler.tags = ['owner'];
handler.command = ['bcgc'];
handler.owner = true;

export default handler;
