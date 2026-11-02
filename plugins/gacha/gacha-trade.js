import { promises as fs } from 'fs';
let pendingTrade = {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!global.db.data.chats?.[m.chat]?.gacha && m.isGroup) {
      return m.reply(`ꕥ أوامر *Gacha* معطلة في هذه المجموعة.\n\nيمكن لـ *مسؤول* تنشيطها من خلال:\n» *${usedPrefix}gacha on*`);
    }

    if (!args.length || !m.text.includes('/')) {
      return m.reply(`❀ يجب عليك تحديد شخصيتين للمتاجرة.\n> ✐ مثال: *${usedPrefix + command} Character1 / Character2*\n> حيث "Character1" هي الشخصية التي تريد المتاجرة بها و"Character2" هي الشخصية التي تريد الحصول عليها.`);
    }

    const text = m.text.slice(m.text.indexOf(" ") + 1).trim();
    const [giveName, getName] = text.split('/').map(s => s.trim().toLowerCase());

    const giveId = Object.keys(global.db.data.characters).find(id =>
      (global.db.data.characters[id]?.name || '').toLowerCase() === giveName &&
      global.db.data.characters[id]?.user === m.sender
    );
    const getId = Object.keys(global.db.data.characters).find(id =>
      (global.db.data.characters[id]?.name || '').toLowerCase() === getName
    );

    if (!giveId || !getId) {
      const missing = !giveId ? giveName : getName;
      return m.reply(`ꕥ لم يتم العثور على الشخصية *${missing}*.`);
    }

    const giveChar = global.db.data.characters[giveId];
    const getChar = global.db.data.characters[getId];
    const giveVal = typeof giveChar.value === "number" ? giveChar.value : 0;
    const getVal = typeof getChar.value === "number" ? getChar.value : 0;

    if (getChar.user === m.sender) return m.reply(`ꕥ لقد قمت بالفعل بملكية الشخصية *${getChar.name}* بواسطتك.`);
    if (!getChar.user) return m.reply(`ꕥ لم تتم المطالبة بالشخصية *${getChar.name}* من قبل أي شخص.`);
    if (!giveChar.user || giveChar.user !== m.sender) return m.reply(`ꕥ *${giveChar.name}* لم تتم المطالبة به بواسطتك.`);

    const targetUser = getChar.user;
    const senderName = await (async () => global.db.data.users[m.sender]?.name?.trim() || (await conn.getName(m.sender).catch(() => m.sender.split('@')[0])))();
    const targetName = await (async () => global.db.data.users[targetUser]?.name?.trim() || (await conn.getName(targetUser).catch(() => targetUser.split('@')[0])))();

    pendingTrade[targetUser] = {
      from: m.sender,
      to: targetUser,
      chat: m.chat,
      give: giveId,
      get: getId,
      timeout: setTimeout(() => delete pendingTrade[targetUser], 60000)
    };

    await conn.reply(m.chat,
      `「✿」 *${targetName}*, *${senderName}* أرسل إليك طلب تداول.\n\n✦ [${targetName}] *${getChar.name}* (${getVal})\n✦ [${senderName}] *${giveChar.name}* (${giveVal})\n\n✐ للقبول يستجيب التبادل لهذه الرسالة بـ "قبول", وينتهي الطلب خلال 60 ثانية.`,
      m,
      { mentions: [targetUser] }
    );
  } catch (err) {
    await conn.reply(m.chat, `⚠︎ حدثت مشكلة.\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${err.message}`, m);
  }
};

handler.before = async (m, { conn }) => {
  try {
    if (m.text.trim().toLowerCase() !== "aceptar") return;

    const tradeEntry = Object.entries(pendingTrade).find(([, t]) => t.chat === m.chat);
    if (!tradeEntry) return;

    const [key, trade] = tradeEntry;
    if (m.sender !== trade.to) {
      const targetName = await (async () => global.db.data.users[trade.to]?.name?.trim() || (await conn.getName(trade.to).catch(() => trade.to.split('@')[0])))();
      return m.reply(`ꕥ فقط *${targetName}* يمكنه قبول طلب التبادل.`);
    }

    const giveChar = global.db.data.characters[trade.give];
    const getChar = global.db.data.characters[trade.get];
    if (!giveChar || !getChar || giveChar.user !== trade.from || getChar.user !== trade.to) {
      delete pendingTrade[key];
      return m.reply("⚠︎ إحدى الشخصيات لم تعد متاحة للاستبدال.");
    }

    giveChar.user = trade.to;
    getChar.user = trade.from;

    const fromUser = global.db.data.users[trade.from];
    const toUser = global.db.data.users[trade.to];

    if (!toUser.characters.includes(trade.give)) toUser.characters.push(trade.give);
    if (!fromUser.characters.includes(trade.get)) fromUser.characters.push(trade.get);

    fromUser.characters = fromUser.characters.filter(id => id !== trade.give);
    toUser.characters = toUser.characters.filter(id => id !== trade.get);

    if (fromUser.favorite === trade.give) delete fromUser.favorite;
    if (toUser.favorite === trade.get) delete toUser.favorite;

    clearTimeout(trade.timeout);
    delete pendingTrade[key];

    const fromName = await (async () => fromUser?.name?.trim() || (await conn.getName(trade.from).catch(() => trade.from.split('@')[0])))();
    const toName = await (async () => toUser?.name?.trim() || (await conn.getName(trade.to).catch(() => trade.to.split('@')[0])))();

    await m.reply(`「✿」التداول مقبول!\n\n✦ ${toName} » *${giveChar.name}*\n✦ ${fromName} » *${getChar.name}*`);
    return true;
  } catch (err) {
    await conn.reply(m.chat, `⚠︎ حدثت مشكلة.\n> استخدم *تقرير* للإبلاغ عنها.\n\n${err.message}`, m);
  }
};

handler.help = ["trade"];
handler.tags = ["gacha"];
handler.command = ["trade", "intercambiar"];
handler.group = true;

export default handler;
