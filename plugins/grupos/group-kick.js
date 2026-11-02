var handler = async (m, { conn, participants, usedPrefix, command }) => {
  let mentionedJid = await m.mentionedJid
  let user = mentionedJid && mentionedJid.length
    ? mentionedJid[0]
    : m.quoted && await m.quoted.sender
      ? await m.quoted.sender
      : null

  if (!user) return conn.reply(m.chat, `☽ يجب عليك ذكر المستخدم لتتمكن من طرده من المجموعة.`, m)

  try {
    const groupInfo = await conn.groupMetadata(m.chat)
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

    if (user === conn.user.jid) return conn.reply(m.chat, `☽ لا أستطيع إزالة البوت من المجموعة.`, m)
    if (user === ownerGroup) return conn.reply(m.chat, `☽ لا أستطيع حذف صاحب المجموعة.`, m)
    if (user === ownerBot) return conn.reply(m.chat, `☽ لا أستطيع حذف صاحب البوت.`, m)

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

    await conn.reply(
      m.chat,
      `☽ 『 فلاش بوت 』 ☽\n\nلقد طردت الظلال @${user.split('@')[0]}.\n\n✦ هكذا ينتهي به الأمر بمن يتحدى قواعد المملكة.\n✦ من يريد أيضًا مرافقته في الظلام الأبدي؟`,
      m,
      { mentions: [user] }
    )
  } catch (e) {
    conn.reply(
      m.chat,
      `⚠︎ حدثت مشكلة.\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${e.message}`,
      m
    )
  }
}

handler.help = ['kick']
handler.tags = ['grupos']
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
