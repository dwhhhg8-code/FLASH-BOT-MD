import { promises as fs } from 'fs';

async function loadCharacters() {
  const data = await fs.readFile("./lib/characters.json", "utf-8");
  return JSON.parse(data);
}

function flattenCharacters(obj) {
  return Object.values(obj).flatMap(entry =>
    Array.isArray(entry.characters) ? entry.characters : []
  );
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!global.db.data.chats?.[m.chat]?.["gacha"] && m.isGroup) {
    return m.reply("ꕥ أوامر *Gacha* معطلة في هذه المجموعة.\n\nيمكن لـ *مسؤول* تنشيطها باستخدام الأمر:\n» *" + usedPrefix + "gacha on*");
  }
  if (!global.db.data.characters) global.db.data.characters = {};
  if (!global.db.data.users) global.db.data.users = {};

  try {
    const charactersData = await loadCharacters();
    const allCharacters = flattenCharacters(charactersData);
    const userData = global.db.data.users[m.sender];
    if (!Array.isArray(userData.characters)) {
      userData.characters = [];
    }

    switch (command) {
      case "setfav":
      case "wfav": {
        if (!args.length) {
          return m.reply("❀ يجب عليك تحديد شخصية.\n> مثال » *" + (usedPrefix + command) + "يوكي سو*");
        }
        const query = args.join(" ").toLowerCase().trim();
        const found = allCharacters.find(c => c.name.toLowerCase() === query);
        if (!found) return m.reply("ꕥلم يتم العثور على الشخصية*" + query + "*.");
        if (!userData.characters.includes(found.id)) {
          return m.reply("ꕥ الشخصية *" + found.name + "* لم تتم المطالبة بها من قبلك.");
        }
        const prevFav = userData.favorite;
        userData.favorite = found.id;
        if (prevFav && prevFav !== found.id) {
          const prevChar = global.db.data.characters?.[prevFav];
          const prevName = typeof prevChar?.name === 'string' ? prevChar.name : "الشخصية السابق";
          return m.reply("❀ تم استبدال مفضلتك *" + prevName + "* بواسطة *" + found.name + "*!");
        }
        return m.reply("❀ الآن *" + found.name + "* هي شخصيتك المفضلة!");
      }

      case "favtop":
      case "favoritetop":
      case "favboard": {
        const favCount = {};
        for (const [, u] of Object.entries(global.db.data.users)) {
          const fav = u.favorite;
          if (fav) favCount[fav] = (favCount[fav] || 0) + 1;
        }
        const favList = allCharacters.map(c => ({
          name: c.name,
          favorites: favCount[c.id] || 0
        })).filter(c => c.favorites > 0);

        const page = parseInt(args[0]) || 1;
        const totalPages = Math.max(1, Math.ceil(favList.length / 10));
        if (page < 1 || page > totalPages) {
          return m.reply("ꕥ صفحة غير صالحة. يوجد المجموع *" + totalPages + "* الصفحات.");
        }
        const sorted = favList.sort((a, b) => b.favorites - a.favorites);
        const slice = sorted.slice((page - 1) * 10, page * 10);
        let text = "✰ أهم الشخصيات المفضلة:\n\n";
        slice.forEach((c, i) => {
          text += '#' + ((page - 1) * 10 + i + 1) + " » *" + c.name + "*\n";
          text += "   ♡ " + c.favorites + "مفضل" + (c.favorites !== 1 ? 's' : '') + ".\n";
        });
        text += "\n> الصفحة" + page + " de " + totalPages;
        await conn.reply(m.chat, text.trim(), m);
        break;
      }

      case "deletefav":
      case "delfav": {
        if (!userData.favorite) {
          return m.reply("❀ ليس لديك أي شخصيات مميزة كمفضلة.");
        }
        const favId = userData.favorite;
        const favChar = global.db.data.characters?.[favId] || {};
        let favName = typeof favChar.name === "string" ? favChar.name : null;
        if (!favName) {
          const found = allCharacters.find(c => c.id === favId);
          favName = found?.name || "شخصية غير معروفة";
        }
        delete userData.favorite;
        m.reply("✎ *" + favName + "* لم تعد شخصيتك المفضلة.");
        break;
      }
    }
  } catch (err) {
    await conn.reply(m.chat, "⚠︎ حدثت مشكلة.\n> استخدم *" + usedPrefix + "report* للإبلاغ عنه.\n\n" + err.message, m);
  }
};

handler.help = ["setfav", "favtop", "delfav"];
handler.tags = ["gacha"];
handler.command = ["setfav", 'wfav', "favtop", "favoritetop", 'favboard', "deletefav", "delfav"];
handler.group = true;

export default handler;
