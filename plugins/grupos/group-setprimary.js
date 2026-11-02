const handler = async (m, { conn }) => {
  const normalizeJid = (jid) => {
    if (!jid) return ''
    try {
      jid = conn?.decodeJid?.(jid) || jid
    } catch {}
    return String(jid).trim().replace(/:\d+@/, '@').toLowerCase()
  }

  const sameBot = (left, right) => {
    const normalizedLeft = normalizeJid(left)
    const normalizedRight = normalizeJid(right)
    if (!normalizedLeft || !normalizedRight) return false
    if (normalizedLeft === normalizedRight) return true

    const leftNumber = normalizedLeft.split('@')[0].replace(/\D/g, '')
    const rightNumber = normalizedRight.split('@')[0].replace(/\D/g, '')
    return Boolean(leftNumber && rightNumber && leftNumber === rightNumber)
  }

  const activeConnections = Array.isArray(global.conns)
    ? global.conns.filter((socket) => {
        const jid = socket?.user?.jid || socket?.user?.id
        return jid && socket.ws?.readyState !== 3
      })
    : []
  const subBots = [...new Set(activeConnections.map((socket) => normalizeJid(socket.user.jid || socket.user.id)))]

  const mainBotJid = global.conn?.user?.jid || global.conn?.user?.id
  if (mainBotJid && !subBots.some((jid) => sameBot(jid, mainBotJid))) {
    subBots.push(normalizeJid(mainBotJid))
  }

  const chat = global.db.data.chats[m.chat]
  const mentionedJid = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
  const currentBotJid = normalizeJid(conn?.user?.jid || conn?.user?.id)
  const requestedJid = mentionedJid[0] || (m.quoted ? await m.quoted.sender : false) || currentBotJid
  const who = subBots.find((jid) => sameBot(jid, requestedJid)) || normalizeJid(requestedJid)

  if (!who) return conn.reply(m.chat, `❀ *الرجاء ذكر السايان (أو السايان الفرعي) أو الرد على رسالة منه لاختياره الإله الأعلى.*`, m)

  if (!subBots.includes(who)) return conn.reply(m.chat, `ꕥ *المستخدم المشار إليه ليس روبوتًا نشطًا على النظام.*`, m)

  if (chat.primaryBot === who) {
    return conn.reply(m.chat, `➜ @${who.split`@`[0]} *تم تكوينه بالفعل باعتباره الروبوت الرئيسي هنا.*`, m, { mentions: [who] });
  }

  try {
    chat.primaryBot = who
    conn.reply(m.chat, `✰ *الإعدادات المحدثة!* ✰\n\n➜ *الظل الأعلى الجديد:* @${who.split`@`[0]}\n> من الآن فصاعدًا, يُفضل تنفيذ الأوامر في هذه المجموعة بواسطة * FLASH BOT*.`, m, { mentions: [who] })
  } catch (e) {
    conn.reply(m.chat, `⚠︎ *حدث خطأ غير متوقع:*\n> ${e.message}`, m)
  }
}

handler.help = ['setprimary']
handler.tags = ['grupos']
handler.command = ['setprimary']
handler.group = true
handler.admin = true

export default handler