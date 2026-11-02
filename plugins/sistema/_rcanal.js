export async function before(m, { conn }) {
  try {
    const canales = [global.idcanal || '120363410090342500@newsletter', global.idcanal2 || '120363410090342500@newsletter']
    const channelRD = global.channelRD || { id: canales[0], name: '🎃 فلاش بوت • الهالوين 🦇' }

    global.rcanal = {
      contextInfo: {
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: 100,
          newsletterName: channelRD.name,
        },
        matchedText: ""
      }
    }

  } catch (e) {
    console.log('خطأ في إنشاء القناة:', e)
  }
}
