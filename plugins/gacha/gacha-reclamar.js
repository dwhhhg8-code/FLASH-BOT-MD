import { promises as fs } from 'fs';

async function loadCharacters() {
  const data = await fs.readFile("./lib/characters.json", "utf-8");
  return JSON.parse(data);
}

function getCharacterById(id, db) {
  return Object.values(db).flatMap(x => x.characters).find(c => c.id === id);
}

let handler = async (m, { conn, usedPrefix, command }) => {

  const chatData = global.db.data.chats?.[m.chat] || {};
  if (!chatData.gacha && m.isGroup) {
    return m.reply("ꕥ أوامر *Gacha* معطلة في هذه المجموعة.\n\nيمكن لـ *مسؤول* تنشيطها باستخدام الأمر:\n» *" + usedPrefix + "gacha on*");
  }

  try {
    const userData = global.db.data.users[m.sender];
    const now = Date.now();

    if (userData.lastClaim && now < userData.lastClaim) {
      const wait = Math.ceil((userData.lastClaim - now) / 1000);
      const min = Math.floor(wait / 60);
      const sec = wait % 60;
      let msg = '';
      if (min > 0) msg += min + "دقائق" + (min !== 1 ? 's' : '') + " ";
      if (sec > 0 || msg === '') msg += sec + "ثانية" + (sec !== 1 ? 's' : '');
      return m.reply("ꕥ يجب عليك الإنتظار *" + msg.trim() + "*للاستخدام*" + (usedPrefix + command) + "* مرة أخرى.");
    }

    const lastCharName = chatData.lastRolledCharacter?.name || '';
    const validQuote = m.quoted?.id === chatData.lastRolledMsgId || (m.quoted?.text?.includes(lastCharName) && lastCharName);
    if (!validQuote) {
      return m.reply("❀ يجب عليك ذكر شخصية صالح للمطالبة به.");
    }

    const charId = chatData.lastRolledId;
    const dbChars = await loadCharacters();
    const char = getCharacterById(charId, dbChars);
    if (!char) return m.reply("ꕥ لم يتم العثور على الشخصية في Characters.json");

    if (!global.db.data.characters) global.db.data.characters = {};
    if (!global.db.data.characters[charId]) global.db.data.characters[charId] = {};
    const charData = global.db.data.characters[charId];

    charData.name = charData.name || char.name;
    charData.value = typeof charData.value === 'number' ? charData.value : char.value || 0;
    charData.votes = charData.votes || 0;

    if (charData.reservedBy && charData.reservedBy !== m.sender && now < charData.reservedUntil) {
      let reservedName = await (async () => {
        try {
          const n = await conn.getName(charData.reservedBy);
          return n?.trim() ? n : charData.reservedBy.split('@')[0];
        } catch {
          return charData.reservedBy.split('@')[0];
        }
      })();
      const remaining = ((charData.reservedUntil - now) / 1000).toFixed(1);
      return m.reply("ꕥ هذه الشخصية محمية بواسطة *" + reservedName + "*خلال*" + remaining + "s.*");
    }

    if (charData.expiresAt && now > charData.expiresAt && !charData.user && !(charData.reservedBy && now < charData.reservedUntil)) {
      const expired = ((now - charData.expiresAt) / 1000).toFixed(1);
      return m.reply("ꕥانتهت صلاحية الشخصية »" + expired + 's.');
    }

    if (charData.user) {
      let claimedName = await (async () => {
        try {
          const n = await conn.getName(charData.user);
          return n?.trim() ? n : charData.user.split('@')[0];
        } catch {
          return charData.user.split('@')[0];
        }
      })();
      return m.reply("ꕥ الشخصية *" + charData.name + "*تم المطالبة به بالفعل من قبل*" + claimedName + '*');
    }

    charData.user = m.sender;
    charData.claimedAt = now;
    delete charData.reservedBy;
    delete charData.reservedUntil;
    userData.lastClaim = now + 1800000;

    if (!Array.isArray(userData.characters)) userData.characters = [];
    if (!userData.characters.includes(charId)) userData.characters.push(charId);

    let userName = await (async () => {
      try {
        const n = await conn.getName(m.sender);
        return n?.trim() ? n : m.sender.split('@')[0];
      } catch {
        return m.sender.split('@')[0];
      }
    })();

    const charName = charData.name;
    const customMsg = userData.claimMessage;
    const ttl = typeof charData.expiresAt === "number" ? ((now - charData.expiresAt + 60000) / 1000).toFixed(1) : '∞';
    const claimText = customMsg
      ? customMsg.replace(/€user/g, '*' + userName + '*').replace(/€character/g, '*' + charName + '*')
      : '*' + charName + "*تم المطالبة به من قبل*" + userName + '*';

    await m.react('🎃');
    await conn.reply(m.chat, "🎃🦇 " + claimText + " (" + ttl + 's)', m);
  } catch (err) {
    await conn.reply(m.chat, "⚠︎ حدثت مشكلة.\n> استخدم *" + usedPrefix + "report* للإبلاغ عنه.\n\n" + err.message, m);
  }
};

handler.help = ['claim'];
handler.tags = ["gacha"];
handler.command = ["claim", 'c', 'reclamar'];
handler.group = true;

export default handler;
