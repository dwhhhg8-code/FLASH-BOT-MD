let handler = async (m, { conn, args, usedPrefix }) => {
  if (!global.db.data.chats?.[m.chat]?.gacha && m.isGroup) {
    return m.reply(`ꕥ أوامر *Gacha* معطلة في هذه المجموعة.\n\nيمكن لـ *مسؤول* تنشيطها من خلال:\n» *${usedPrefix}gacha on*`);
  }
  try {
    const senderUser = global.db.data.users[m.sender];
    if (!Array.isArray(senderUser.characters)) senderUser.characters = [];

    if (!args.length) {
      return m.reply("❀ يجب كتابة اسم الشخصية والاقتباس أو ذكر المستخدم الذي سيحصل عليه");
    }

    const mentioned = m.mentionedJid;
    const target = mentioned[0] || (m.quoted && m.quoted.sender);
    if (!target) {
      return m.reply("❀ يجب عليك ذكر رسالة المستلم أو الاقتباس منها.");
    }

    const charName = m.quoted
      ? args.join(" ").toLowerCase().trim()
      : args.slice(0, -1).join(" ").toLowerCase().trim();

    const charId = Object.keys(global.db.data.characters).find(id => {
      const c = global.db.data.characters[id];
      return typeof c.name === "string" && c.name.toLowerCase() === charName && c.user === m.sender;
    });

    if (!charId) {
      return m.reply(`ꕥ لم يتم العثور على الشخصية *${charName}* أو لم تتم المطالبة به بواسطتك.`);
    }

    const char = global.db.data.characters[charId];
    if (!senderUser.characters.includes(charId)) {
      return m.reply(`ꕥ *${char.name}* لم تتم المطالبة به بواسطتك.`);
    }

    const targetUser = global.db.data.users[target];
    if (!targetUser) {
      return m.reply("ꕥ المستخدم المذكور غير مسجل.");
    }
    if (!Array.isArray(targetUser.characters)) targetUser.characters = [];

    if (!targetUser.characters.includes(charId)) {
      targetUser.characters.push(charId);
    }
    senderUser.characters = senderUser.characters.filter(id => id !== charId);
    char.user = target;

    if (senderUser.sales?.[charId]?.user === m.sender) delete senderUser.sales[charId];
    if (senderUser.favorite === charId) delete senderUser.favorite;
    if (global.db.data.users[m.sender]?.favorite === charId) delete global.db.data.users[m.sender].favorite;

    const senderName = await (async () =>
      senderUser.name?.trim() ||
      (await conn.getName(m.sender).catch(() => m.sender.split('@')[0])))();
    const targetName = await (async () =>
      targetUser.name?.trim() ||
      (await conn.getName(target).catch(() => target.split('@')[0])))();

    await conn.reply(
      m.chat,
      `❀ تم إهداء *${char.name}* إلى *${targetName}* من *${senderName}*.`,
      m,
      { mentions: [target] }
    );
  } catch (err) {
    await conn.reply(
      m.chat,
      `⚠︎ حدثت مشكلة.\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${err.message}`,
      m
    );
  }
};

handler.help = ["regalar"];
handler.tags = ["gacha"];
handler.command = ["givechar", "givewaifu", "regalar"];
handler.group = true;

export default handler;
