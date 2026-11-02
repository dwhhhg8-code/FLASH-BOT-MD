const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const args = text.split('|').map(v => v.trim());

  if (args.length < 3) {
    return m.reply(`⚠️ يجب عليك إدخال رابط المجموعة والرسالة ومقدار البريد العشوائي مفصولين بـ "|".\n\nمثال:\n${usedPrefix + command} https://chat.whatsapp.com/SSSS | مرحبا, كيف حالك؟ | 5`);
  }

  const [groupLink, message, countStr] = args;
  const count = parseInt(countStr, 10);

  if (!groupLink.includes('chat.whatsapp.com')) {
    return m.reply(`❌يرجى تقديم رابط صالح للمجموعة.`);
  }
  if (isNaN(count) || count <= 0) {
    return m.reply(`❌ تحديد عدد صحيح من الرسائل (أكبر من 0).`);
  }

  try {
    const code = groupLink.split('chat.whatsapp.com/')[1];
    const groupId = await conn.groupAcceptInvite(code);

    m.reply(`✅تم الانضمام للمجموعة بنجاح. جارٍ بدء البريد العشوائي من رسائل ${count}...`);

    for (let i = 0; i < count; i++) {
      await conn.sendMessage(groupId, { text: message });
      await delay(1000);
    }

    m.reply(`✅ اكتمل البريد العشوائي. مغادرة المجموعة...`);
    await conn.groupLeave(groupId);
  } catch (error) {
    console.error(error);
    m.reply(`⚠️ خطأ عند محاولة تنفيذ العملية: ${error.message}`);
  }
};

handler.help = ['spam2'];
handler.tags = ['owner'];
handler.command = ['spam2'];
handler.owner = true;

export default handler;
