import axios from 'axios';

let handler = async (m, { command, conn }) => {
  try {
    const res = await axios.get('https://meme-api.com/gimme/memesESP');
    const memeUrl = res.data.url;

    if (!memeUrl) throw 'لم يتم العثور على ميمي باللغة الإسبانية';

    const wm = (typeof global !== 'undefined' && global.wm) ? global.wm : 'فلاش بوت ⚔️';
    const bot = 'فلاش بوت ⚔️';

    let fkontak = {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: {
        contactMessage: {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Phone\nEND:VCARD`
        }
      },
      participant: '0@s.whatsapp.net'
    };

    let caption = `☽ 『ميمات فلاش بوت 』 ☽

🧠 إليكم ميمي باللغة الإسبانية تم استدعاؤهم من الظل...
✦ لينير الضحك ليلتك المظلمة.`;

    await conn.sendButton(
      m.chat,
      caption,
      wm,
      memeUrl,
      [
        ['☽ الميم التالي ☽', '.meme'],
        ['☽ العودة إلى القائمة ☽', '/menu']
      ],
      null,
      [[bot, 'https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O']],
      fkontak
    );

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
    m.reply('⚠️ لم تتمكن الظلال من العثور على ميمي باللغة الإسبانية...');
    console.error(e);
  }
};

handler.command = handler.help = ['meme'];
handler.tags = ['fun'];
export default handler;
