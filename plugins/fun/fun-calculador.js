const handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `في الظل, يجب أن تذكر مستخدمًا لاستدعاء مصيره.`, m);

  const percentages = Math.floor(Math.random() * 500);
  let emoji = '';
  let description = '';

  switch (command) {
    case 'gay':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `💙 كشفت الظلال أن ${text.toUpperCase()} هو *${percentages}%* مثلي الجنس ${emoji}\n> نسبة منخفضة... يهمس الظلال: *أنت جوتو ولست مثليًا* يا لها من جوتو هاهاها 😂.`;
      } else if (percentages > 100) {
        description = `💜 تكشف مملكة الظلال أن ${text.toUpperCase()} هو *${percentages}%* مثلي الجنس ${emoji}\n> حتى أنه أكثر مثليًا مما كنا نعتقد.`;
      } else {
        description = `🖤 ​​​​مملكة الظلال تعلن أن ${text.toUpperCase()} هو *${percentages}%* مثلي الجنس ${emoji}\n> مصيرك محدد بقوس قزح 😂.`;
      }
      break;

    case 'lesbiana':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `👻 كشفت الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> ربما تحتاج إلى المزيد من القصص الرومانسية في الظلام.`;
      } else if (percentages > 100) {
        description = `❣️ تعلن مملكة الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> حب شديد للفتيات.`;
      } else {
        description = `💗 تهمس الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> استمر في ازدهار الحب تحت النجوم.`;
      }
      break;

    case 'pajero':
    case 'pajera':
      emoji = '😏💦';
      if (percentages < 50) {
        description = `🧡 تكشف الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> ربما تحتاج إلى المزيد من الهوايات في الليل المظلم.`;
      } else if (percentages > 100) {
        description = `💕 تعلن مملكة الظل أن ${text.toUpperCase()} هي *${percentages}%* ${command} ${emoji}\n> مقاومة رائعة في الظلام.`;
      } else {
        description = `💞 يهمس الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> استمر في تدريبك الفردي بكل فخر 😂.`;
      }
      break;

    case 'puto':
    case 'puta':
      emoji = '🔥🥵';
      if (percentages < 50) {
        description = `😼 تكشف الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> حظًا أوفر في غزوتك القادمة.`;
      } else if (percentages > 100) {
        description = `😻 تعلن مملكة الظل أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> أنت مشتعل في الظلام.`;
      } else {
        description = `😺 تهمس الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> احتفظ بهذا السحر الناري.`;
      }
      break;

    case 'manco':
    case 'manca':
      emoji = '💩';
      if (percentages < 50) {
        description = `🌟 تكشف الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> أنت لست الوحيد في هذا النادي الغامض.`;
      } else if (percentages > 100) {
        description = `💌 تعلن مملكة الظلام أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> موهبة خاصة جدًا في الظلام.`;
      } else {
        description = `🥷 يهمس الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> حافظ على هذا الموقف الشجاع.`;
      }
      break;

    case 'rata':
      emoji = '🐁';
      if (percentages < 50) {
        description = `💥 تكشف الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> لا حرج في الاستمتاع بجبنة الظل.`;
      } else if (percentages > 100) {
        description = `💖 تعلن The Dark Kingdom أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> ماوس فاخر حقيقي.`;
      } else {
        description = `👑 يهمس الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> تناول الجبن بمسؤولية في الظلام.`;
      }
      break;

    case 'prostituto':
    case 'prostituta':
      emoji = '🫦👅';
      if (percentages < 50) {
        description = `❀ تكشف الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> سوق الظل مزدهر.`;
      } else if (percentages > 100) {
        description = `💖 تعلن The Dark Kingdom أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> محترف ظل حقيقي.`;
      } else {
        description = `✨️ يهمس الظلال أن ${text.toUpperCase()} هو *${percentages}%* ${command} ${emoji}\n> إنه دائمًا وقت العمل في الظلام.`;
      }
      break;

    default:
      m.reply(`🍭 أمر غير صالح في مملكة الظلال.`);
  }

  const responses = [
    "🌌 لقد تحدث الكون الغامض.",
    "🕸️يؤكده علماء الظل.",
    "✨كشف قدر من الظلمات."
  ];

  const response = responses[Math.floor(Math.random() * responses.length)];

  const cal = `👻 *الحاسبة القاتمة*

${description}

➤ ${response}`.trim();

  await m.react('🎃')

  async function loading() {
    var hawemod = [
      "🎃《 █▒▒▒▒▒▒▒▒▒▒▒》10% 🦇",
      "🎃《 ████▒▒▒▒▒▒▒▒》30% 🦇",
      "🎃《 ███████▒▒▒▒▒》50% 🦇",
      "🎃《 ██████████▒▒》80% 🦇",
      "🎃《 ████████████》100% 🦇"
    ];

    let { key } = await conn.sendMessage(
      m.chat,
      { text: `🎃 ظلال الهالوين تحسب مصير الآخرة... 🕯️`, mentions: conn.parseMention(cal) },
      { quoted: global.fkontak }
    );

    for (let i = 0; i < hawemod.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await conn.sendMessage(
        m.chat,
        { text: hawemod[i], edit: key, mentions: conn.parseMention(cal) },
        { quoted: global.fkontak }
      );
    }

    await conn.sendMessage(
      m.chat,
      { text: cal, edit: key, mentions: conn.parseMention(cal) },
      { quoted: global.fkontak }
    );
  }

  loading();
};

handler.help = ['gay <@tag>', 'lesbiana <@tag>', 'pajero <@tag>', 'pajera <@tag>', 'puto <@tag>', 'puta <@tag>', 'manco <@tag>', 'manca <@tag>', 'rata <@tag>', 'prostituta <@tag>', 'prostituto <@tag>'];
handler.tags = ['fun'];
handler.register = true;
handler.group = true;
handler.command = ['gay', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituta', 'prostituto'];

export default handler;
