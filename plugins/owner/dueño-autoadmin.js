let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('⚠️ هذا الأمر يعمل فقط في المجموعات.')

  if (!isOwner) return m.reply('🚫 هذا الأمر خاص بمبدعي البوت.')

  if (isAdmin) return m.reply('✅ أنت بالفعل مسؤول المجموعة.')

  await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')

  await m.reply('🛡️ لقد تمت ترقيتك إلى مشرف بواسطة الروبوت.')
}

handler.command = ['admin', 'atad', 'autoadmin']

handler.owner = true

handler.botAdmin = true

export default handler
