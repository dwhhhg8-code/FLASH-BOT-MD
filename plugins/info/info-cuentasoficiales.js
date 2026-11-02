let handler = async (m, {conn, command}) => {
  await m.react('🎃')

  const footer = (typeof global !== 'undefined' && global.wm) ? global.wm : '𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪';

  let fkontak = {
    key: {participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo'},
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Phone\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  }

  let media = 'https://files.catbox.moe/lcn1kw.mp4'

  let texto = `⚡ أهلاً بيك في الحسابات الرسمية لـ 𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪 ⚡
⚡ 𝙒𝙀𝙇𝘾𝙊𝙈𝙀 𝙏𝙊 𝙏𝙃𝙀 𝙊𝙁𝙁𝙄𝘾𝙄𝘼𝙇 𝘼𝘾𝘾𝙊𝙐𝙉𝙏𝙎
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪 • 𝙀𝙂𝙔𝙋𝙏 🦅
『⚡』 أوامر بالعربي المصري وقوة الظل...
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
✅ *GITHUB الرسمي*
https://github.com/dwhhhg8-code
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
✅ *القناة الرسمية*
https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
👑 المالك: +20 112 516 6486 (haitham)
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
⚡ 𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪 — قوة الظل مش بتنام ⚡`

  await conn.sendButton(m.chat, texto, footer, media, [
   ['👑 المالك ⚡', '#owner'],
   ['⚡ العودة إلى القائمة', '/menu']
       ],
    null, [
   ['⚡فلاش بوت ⚡', 'https://github.com/dwhhhg8-code/FLASH-BOT-MD']
       ],
    fkontak
  )
}

handler.command = ['cuentasoficiales']

export default handler
