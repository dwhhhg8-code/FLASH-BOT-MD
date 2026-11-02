import fetch from 'node-fetch';

const handler = async (m, { conn, command, text, isAdmin }) => {
  if (!isAdmin) {
    return conn.reply(
      m.chat,
      `🎄🗡️ *الظلال بدون أذونات كافية*\n\n> يمكن للمسؤول فقط استدعاء هذه القوة.\n🔒 الحالة الحالية: *لا يوجد مسؤول في المملكة*`,
      m
    );
  }

  let user = m.mentionedJid?.[0] || m.quoted?.sender || text;
  if (!user) {
    return conn.reply(
      m.chat,
      command === 'mute'
        ? '🕯️ *أذكر التلميذ الذي تريد إسكاته في الظل*'
        : '🕯️ *أذكر التلميذ الذي تريد أن يحرره من الصمت*',
      m
    );
  }

  if (!/@s\.whatsapp\.net$/.test(user)) {
    user = user.replace(/[^\d]/g, '');
    if (user.length > 5) user = `${user}@s.whatsapp.net`;
  }

  if (user === conn.user.jid) return conn.reply(m.chat, '🚩 *لا يمكنك كتم صوت روبوت الظل أو تحريره*', m);

  const ownerNumber = global.owner[0][0] + '@s.whatsapp.net';
  if (user === ownerNumber) return conn.reply(m.chat, '🚩 *لا يمكنك إسكات خالق الملكوت*', m);

  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupOwner = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
  if (user === groupOwner) return conn.reply(m.chat, '🚩 *لا يمكنك إسكات سيادة المجموعة*', m);

  if (!global.db.data.users[user]) global.db.data.users[user] = {};
  const userData = global.db.data.users[user];

  const fkontak = {
    key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
    message: {
      locationMessage: {
        name: command === 'mute' ? 'أسكت التلميذ بواسطة الظلال 🎄' : '✨التلميذ يتحرر من الصمت 🎁',
        jpegThumbnail: await (await fetch(
          command === 'mute'
            ? 'https://telegra.ph/file/f8324d9798fa2ed2317bc.png'
            : 'https://telegra.ph/file/aea704d0b242b8c41bf15.png'
        )).buffer(),
        vcard:
          'BEGIN:VCARD\nVERSION:3.0\nN:;Flash;;;\nFN:Flash\nORG:Eminence in Flash\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Flash\nX-WA-BIZ-DESCRIPTION:Reino de las Sombras\nX-WA-BIZ-NAME:Flash\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  };

  if (command === 'mute') {
    if (userData.mute === true) return conn.reply(m.chat, '🚩 *لقد تم إسكات هذا التلميذ بالفعل بواسطة الظلال*', m);
    global.db.data.users[user].mute = true;
    return conn.reply(m.chat, '❄️ *سوف يأكل الظلام رسائلك* 🕯️', fkontak, null, { mentions: [user] });
  }

  if (command === 'unmute') {
    if (userData.mute !== true) return conn.reply(m.chat, '🚩 *هذا التلميذ ليس تحت الصمت الكئيب*', m);
    if (user === m.sender) return conn.reply(m.chat, '🚩 *فقط مسؤول آخر يمكنه تحريرك من الصمت الكئيب*', m);

    global.db.data.users[user].mute = false;
    return conn.reply(m.chat, '🎁 *ستشرق رسائلك من جديد تحت أضواء عيد الميلاد* ✨', fkontak, null, { mentions: [user] });
  }
};

handler.before = async function (m, { conn }) {
  if (!m.isGroup) return;
  const sender = m.sender;
  const userData = global.db.data.users[sender];

  if (userData && userData.mute === true) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key });
    } catch (e) {
      console.error("حدث خطأ أثناء حذف رسالة المستخدم الصامتة:", e);
    }
  }
};

handler.command = ['mute', 'unmute'];
handler.group = true;
handler.admin = true;

export default handler;
