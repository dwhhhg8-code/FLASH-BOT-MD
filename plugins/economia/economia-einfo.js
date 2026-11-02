function formatTime(ms) {
  if (ms <= 0 || isNaN(ms)) return 'Ahora';
  const totalSeconds = Math.ceil(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor(totalSeconds % 86400 / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (days) parts.push(days + "يوم" + (days !== 1 ? 's' : ''));
  if (hours) parts.push(hours + "وقت" + (hours !== 1 ? 's' : ''));
  if (minutes || hours || days) parts.push(minutes + "دقائق" + (minutes !== 1 ? 's' : ''));
  parts.push(seconds + "ثانية" + (seconds !== 1 ? 's' : ''));
  return parts.join(" ");
}

let handler = async (m, { conn, command, usedPrefix }) => {
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply("《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\nيمكن لـ *المسؤول* تنشيطها باستخدام الأمر:\n» *" + usedPrefix + "economy on*");
  }

  let user = global.db.data.users[m.sender];
  if (!user) {
    return conn.reply(m.chat, "ꕥ لم يتم العثور على بيانات اقتصادية لهذا المستخدم.", m);
  }

  const now = Date.now();
  const timers = {
    'Work': user.lastwork,
    'Slut': user.lastslut,
    'Crime': user.lastcrime,
    'Steal': user.lastrob,
    'Daily': user.lastDaily,
    'Weekly': user.lastweekly,
    'Monthly': user.lastmonthly,
    'Cofre': user.lastcofre,
    'Adventure': user.lastAdventure,
    'Dungeon': user.lastDungeon,
    'Fish': user.lastFish,
    'Hunt': user.lastHunt,
    'Mine': user.lastmine
  };

  const lines = Object.entries(timers).map(([name, time]) => {
    const diff = typeof time === "number" ? time - now : 0;
    return "ⴵ " + name + " » *" + formatTime(diff) + '*';
  });

  const totalCoins = ((user.coin || 0) + (user.bank || 0)).toLocaleString();
  const username = user.name || (await conn.getName(m.sender)) || m.sender.split('@')[0];

  const msg = "*☽ المستخدم `<" + username + ">`*\n\n" + lines.join("\n") + ("\n\n⛁ إجمالي العملات » *¥" + totalCoins + " " + currency + '*');
  await m.reply(msg.trim());
};

handler.help = ["einfo"];
handler.tags = ['rpg'];
handler.command = ["economyinfo", 'infoeconomy', "einfo"];
handler.group = true;

export default handler;
