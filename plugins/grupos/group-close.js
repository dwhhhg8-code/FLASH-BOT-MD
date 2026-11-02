import fetch from 'node-fetch'

let handler = async (m, { conn, command, isAdmin, isGroupAdmins }) => {
  if (!m.isGroup) return m.reply('🌑⚠️ *لا يمكن استخدام هذا الأمر إلا في المجموعات.*')

  if (!(isAdmin || isGroupAdmins)) {
    return m.reply('🌑⚠️ *يمكن لمسؤولي المجموعة فقط استخدام هذا الأمر.*')
  }

  let chatId = m.chat
  let action = command.toLowerCase()

  const imgClose = 'https://files.catbox.moe/nnnyne.jpg'
  const imgOpen  = 'https://files.catbox.moe/guofgb.jpg'

  const selectedImage = action === 'open' ? imgOpen : imgClose
  const thumb = await (await fetch(selectedImage)).buffer()

  const businessHeader = {
    key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'FlashGroup' },
    message: {
      locationMessage: {
        name: `⚔️ ${action.toUpperCase()} — فلاش بوت`,
        jpegThumbnail: thumb,
        vcard:
          'BEGIN:VCARD\n' +
          'VERSION:3.0\n' +
          'N:;مجموعة الظل;;;\n' +
          'FN:مجموعة الظل\n' +
          'ORG:فلاش بوت\n' +
          'TITLE:\n' +
          'item1.TEL;waid=5804242773183:+58 0424-2773183\n' +
          'item1.X-ABLabel:Creador\n' +
          'X-WA-BIZ-DESCRIPTION:التحكم في مملكة الظلال\n' +
          'X-WA-BIZ-NAME:FLASH BOT\n' +
          'END:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  }

  if (action === 'close') {
    await conn.groupSettingUpdate(chatId, 'announcement')
    await conn.sendMessage(chatId, {
      text: '🎃⚰️ *لقد أغلق FLASH BOT السحرة في عيد الهالوين هذا...*\n🕷️ يمكن للمسؤولين فقط استدعاء الصوت الآن.'
    }, { quoted: businessHeader })
  }

  if (action === 'open') {
    await conn.groupSettingUpdate(chatId, 'not_announcement')
    await conn.sendMessage(chatId, {
      text: '🎃✨ *أطلق FLASH BOT السهرة...*\n🦇 تردد صدى الأصوات مرة أخرى تحت قمر الهالوين.'
    }, { quoted: businessHeader })
  }
}

handler.help = ['close', 'open']
handler.tags = ['grupos']
handler.command = ['close', 'open']
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler
