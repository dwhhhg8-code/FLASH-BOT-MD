import os from 'os';
const {
  generateWAMessageFromContent,
  proto
} = (await import("@whiskeysockets/baileys"))["default"];

let handler = async (m, { conn}) => {
  try {
    const botname = 'فلاش بوت';
    const botname2 = 'flash';
    const monedas = 'Pesos';
    const banner = 'https://files.catbox.moe/7mpqeg.jpg';
    const prefijos = './#!';
    const canalId = '120363410090342500@newsletter';
    const canalName = 'فلاش بوت';
    const link = 'https://github.com/dwhhhg8-code/FLASH-BOT-MD.git';

    const platform = os.type();
    const now = new Date();
    const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota'}));
    const nodeVersion = process.version;
    const sistemaUptime = rTime(os.uptime());

    const uptime = process.uptime();
    const uptimeDate = new Date(colombianTime.getTime() - uptime * 1000);
    const formattedUptimeDate = uptimeDate.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/^./, m => m.toUpperCase());

    const botType = 'Principal/Owner';
    const duenos = 'haitham';

    const message = `💜 Información del bot ${botname2}

> الاسم المختصر: ${botname2}
> الاسم الكامل: ${botname}
> العملة: ${monedas}
> البادئات: ${prefijos}

> النوع: ${botType}
> المنصة: ${platform}
> NodeJS: ${nodeVersion}
> شغال من: ${formattedUptimeDate}
> مدة التشغيل: ${sistemaUptime}
> المالك: ${duenos}

> المستودع: ${link}`.trim();

    await conn.sendMessage(m.chat, {
      document: Buffer.alloc(1),
      fileName: 'فلاش بوت',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileLength: '0',
      pageCount: '1',
      caption: message,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 0,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: canalId,
          serverMessageId: null,
          newsletterName: canalName
        }
      }
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, '⛔ خطأ عند استدعاء معلومات البوت ...', m);
  }
};

function rTime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d === 1 ? " día, " : "أيام,") : "";
  const hDisplay = h > 0 ? h + (h === 1 ? " hora, " : "ساعات,") : "";
  const mDisplay = m > 0 ? m + (m === 1 ? " minuto, " : "دقائق,") : "";
  const sDisplay = s > 0 ? s + (s === 1 ? " segundo" : "ثواني") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

handler.help = ["info", "infobot", "infosocket"];
handler.tags = ["info"];
handler.command = ["info", "infobot", "infosocket"];

export default handler;
