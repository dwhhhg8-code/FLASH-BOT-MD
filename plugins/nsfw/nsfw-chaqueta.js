let handler = async (m, { conn, usedPrefix, command }) => {
  const chat = global.db.data.chats[m.chat];
  if (!chat.nsfw) {
    return conn.reply(
      m.chat,
      `🌑 الظلال تحمي هذه المملكة...\n❄️ وضع *NSFW* معطل, لا يمكنك استخدام *${command}*.`,
      m
    );
  }

  let who =
    m.quoted?.sender ||
    (m.mentionedJid && m.mentionedJid[0]) ||
    (m.fromMe ? conn.user.jid : m.sender);

  const emoji = "🔥";

  let chaqueta = [
    `${emoji} سترة البداية...`,
    `╭━━╮╭╭╭╮
┃▔╲┣╈╈╈╈━━━╮
┃┈┈▏╰╯╯╯╭╮━┫
┃┈--╭━━━━╈╈━╯
╰━━╯        ╰╯`,
    `╭━━╮   ╭╭╭╮
┃▔╲┣━━╈╈╈╈━━╮
┃┈┈▏   ╰╯╯╯╭╮┫
┃┈--╭━━━━━━╈╈╯
╰━━╯        ╰╯`,
    `╭━━╮╭╭╭╮
┃▔╲┣╈╈╈╈━━━╮
┃┈┈▏╰╯╯╯╭╮━┫
┃┈--╭━━━━╈╈━╯
╰━━╯        ╰╯`,
    `╭━━╮   ╭╭╭╮
┃▔╲┣━━╈╈╈╈━━╮
┃┈┈▏   ╰╯╯╯╭╮┫
┃┈--╭━━━━━━╈╈╯
╰━━╯        ╰╯`,
    `╭━━╮╭╭╭╮
┃▔╲┣╈╈╈╈━━━╮
┃┈┈▏╰╯╯╯╭╮━┫
┃┈--╭━━━━╈╈━╯
╰━━╯        ╰╯`,
    `╭━━╮   ╭╭╭╮
┃▔╲┣━━╈╈╈╈━━╮
┃┈┈▏   ╰╯╯╯╭╮┫
┃┈--╭━━━━━━╈╈╯
╰━━╯        ╰╯`,
    `╭━━╮╭╭╭╮
┃▔╲┣╈╈╈╈━━━╮
┃┈┈▏╰╯╯╯╭╮━┫
┃┈--╭━━━━╈╈━╯
╰━━╯        ╰╯`,
    `╭━━╮   ╭╭╭╮
┃▔╲┣━━╈╈╈╈━━╮
┃┈┈▏   ╰╯╯╯╭╮┫
┃┈--╭━━━━━━╈╈╯
╰━━╯        ╰╯`,
    `╭━━╮╭╭╭╮
┃▔╲┣╈╈╈╈━━━╮
┃┈┈▏╰╯╯╯╭╮━┫
┃┈--╭━━━━╈╈━╯
╰━━╯        ╰╯`,
    `╭━━╮   ╭╭╭╮
┃▔╲┣━━╈╈╈╈━━╮
┃┈┈▏   ╰╯╯╯╭╮┫
┃┈--╭━━━━━━╈╈╯
╰━━╯        ╰╯`,
    `╭━━╮╭╭╭╮
┃▔╲┣╈╈╈╈━━━╮
┃┈┈▏╰╯╯╯╭╮━┫
┃┈--╭━━━━╈╈━╯
╰━━╯        ╰╯`,
    `╭━━╮   ╭╭╭╮
┃▔╲┣━━╈╈╈╈━━╮
┃┈┈▏   ╰╯╯╯╭╮┫
┃┈--╭━━━━━━╈╈╯
╰━━╯        ╰╯`,
    `              .               .   ╭
╭━━╮╭╭╭╮           ╭ ╯
┃▔╲┣╈╈╈╈━━━╮╭╯╭
┃┈┈▏╰╯╯╯╭╮━┫  
┃┈--╭━━━━╈╈━╯╰╮╰
╰━━╯        ╰╯...-    ╰ ╮
   .         . .  .  .. . . .  . .. .  ╰

🔥 *@${m.sender.split('@')[0]} se ha corrido gracias a @${who.split('@')[0]}.*`
  ];

  let { key } = await conn.sendMessage(m.chat, { text: `سترة البداية ${emoji}...` });

  for (let frame of chaqueta) {
    await conn.sendMessage(m.chat, {
      text: frame,
      edit: key,
      mentions: conn.parseMention(frame)
    });
  }
};

handler.command = ['jalame', 'jalamela', 'chaqueteame', 'chaqueta'];
handler.group = true;
handler.register = true;

export default handler;
