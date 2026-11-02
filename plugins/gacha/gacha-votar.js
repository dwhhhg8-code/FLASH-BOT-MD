import { promises as fs } from 'fs';

async function loadCharacters() {
  const data = await fs.readFile("./lib/characters.json", 'utf-8');
  return JSON.parse(data);
}

function flattenCharacters(series) {
  return Object.values(series).flatMap(s => Array.isArray(s.characters) ? s.characters : []);
}

function getSeriesNameByCharacter(series, characterId) {
  return Object.values(series).find(s => Array.isArray(s.characters) && s.characters.some(c => c.id === characterId))?.name || "غير معروف";
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!global.db.data.chats?.[m.chat]?.gacha && m.isGroup) {
      return m.reply(`ꕥ أوامر *Gacha* معطلة في هذه المجموعة.\n\nيمكن لـ *مسؤول* تنشيطها من خلال:\n» *${usedPrefix}gacha on*`);
    }

    if (!global.db.data.characters) global.db.data.characters = {};
    const user = global.db.data.users[m.sender];
    const now = Date.now();

    if (user.lastVote && now < user.lastVote) {
      const wait = Math.ceil((user.lastVote - now) / 1000);
      const h = Math.floor(wait / 3600);
      const mnt = Math.floor((wait % 3600) / 60);
      const s = wait % 60;
      let time = '';
      if (h) time += `${h} hora${h !== 1 ? 's' : ''} `;
      if (mnt) time += `${mnt} minuto${mnt !== 1 ? 's' : ''} `;
      if (s || !time) time += `${s} segundo${s !== 1 ? 's' : ''}`;
      return m.reply(`ꕥ يجب عليك الانتظار *${time.trim()}* لاستخدام *${usedPrefix + command}* مرة أخرى.`);
    }

    const query = args.join(" ").trim();
    if (!query) return m.reply("❀ يجب عليك تحديد شخصية للتصويت لها.");

    const seriesData = await loadCharacters();
    const allCharacters = flattenCharacters(seriesData);
    const character = allCharacters.find(c => c.name.toLowerCase() === query.toLowerCase());

    if (!character) return m.reply("ꕥ لم يتم العثور على الشخصية. تأكد من صحة الاسم.");

    if (!global.db.data.characters[character.id]) global.db.data.characters[character.id] = {};
    const entry = global.db.data.characters[character.id];

    if (typeof entry.value !== "number") entry.value = Number(character.value || 0);
    if (typeof entry.votes !== "number") entry.votes = 0;
    if (!entry.name) entry.name = character.name;

    if (entry.lastVotedAt && now < entry.lastVotedAt + 7200000) {
      const wait = entry.lastVotedAt + 7200000 - now;
      const h = Math.floor(wait / 3600000);
      const mnt = Math.floor((wait % 3600000) / 60000);
      const s = Math.floor((wait % 60000) / 1000);
      let time = '';
      if (h) time += `${h} hora${h !== 1 ? 's' : ''} `;
      if (mnt) time += `${mnt} minuto${mnt !== 1 ? 's' : ''} `;
      if (s || !time) time += `${s} segundo${s !== 1 ? 's' : ''}`;
      return m.reply(`ꕥ *${entry.name}* تم التصويت عليه مؤخرًا.\n> يجب عليك الانتظار *${time.trim()}* للتصويت له مرة أخرى.`);
    }

    if (!entry.dailyIncrement) entry.dailyIncrement = {};
    const today = new Date().toISOString().slice(0, 10);
    const todayVotes = entry.dailyIncrement[today] || 0;
    if (todayVotes >= 900) return m.reply(`ꕥ الشخصية *${entry.name}* له القيمة القصوى بالفعل.`);

    const increment = Math.min(900 - todayVotes, Math.floor(Math.random() * 201) + 50);
    entry.value += increment;
    entry.votes += 1;
    entry.lastVotedAt = now;
    entry.dailyIncrement[today] = todayVotes + increment;
    user.lastVote = now + 7200000;

    const seriesName = getSeriesNameByCharacter(seriesData, character.id);
    await conn.reply(m.chat, `❀ لقد قمت بالتصويت لـ *${entry.name}* (*${seriesName}*)\n> قيمته الجديدة هي *${entry.value.toLocaleString()}*`, m);
  } catch (err) {
    await conn.reply(m.chat, `⚠︎ حدثت مشكلة.\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${err.message}`, m);
  }
};

handler.help = ["vote"];
handler.tags = ["gacha"];
handler.command = ["vote", "votar"];
handler.group = true;

export default handler;
