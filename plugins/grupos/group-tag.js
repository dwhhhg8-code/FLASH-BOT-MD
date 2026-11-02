import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  try {
    const chatId = m.chat
    if (!chatId.endsWith('@g.us')) {
      return await conn.sendMessage(chatId, { text: `لا يمكن استخدام هذا الأمر إلا في مجموعات.` }, { quoted: m })
    }

    let raw = (typeof text === 'string' && text.trim() ? text : (args || []).join(' ')).trim()
    if (raw) {
      raw = raw.replace(/^[\s#!./>]*\s*(tag|todos|hidetag)\b\s*/i, '').trim()
    }
    if (!raw && typeof m.text === 'string') {
      raw = m.text.replace(/^[\s#!./>]*\s*(tag|todos|hidetag)\b\s*/i, '').trim()
    }

    const metadata = await conn.groupMetadata(chatId)
    const allMentions = (metadata.participants || []).map(p => p.id).filter(Boolean)
    if (!allMentions.length) {
      return await conn.sendMessage(chatId, { text: `لم أتمكن من الحصول على قائمة الأعضاء.` }, { quoted: m })
    }

    let messageToForward = null

    const streamToBuffer = async (stream) => {
      let buffer = Buffer.alloc(0)
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
      return buffer
    }

    const getQuotedMessage = m.quoted?.message || m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (getQuotedMessage && !raw) {
      try {
        const quoted = getQuotedMessage
        if (quoted.imageMessage) {
          const buffer = await streamToBuffer(await downloadContentFromMessage(quoted.imageMessage, 'image'))
          messageToForward = { image: buffer, caption: quoted.imageMessage.caption || '' }
        } else if (quoted.videoMessage) {
          const buffer = await streamToBuffer(await downloadContentFromMessage(quoted.videoMessage, 'video'))
          messageToForward = { video: buffer, caption: quoted.videoMessage.caption || '' }
        } else if (quoted.audioMessage) {
          const buffer = await streamToBuffer(await downloadContentFromMessage(quoted.audioMessage, 'audio'))
          messageToForward = { audio: buffer, mimetype: quoted.audioMessage.mimetype || 'audio/mp4' }
        } else if (quoted.stickerMessage) {
          const buffer = await streamToBuffer(await downloadContentFromMessage(quoted.stickerMessage, 'sticker'))
          messageToForward = { sticker: buffer }
        } else if (quoted.documentMessage) {
          const buffer = await streamToBuffer(await downloadContentFromMessage(quoted.documentMessage, 'document'))
          messageToForward = { document: buffer, mimetype: quoted.documentMessage.mimetype || 'application/pdf', caption: quoted.documentMessage.caption || '' }
        } else if (quoted.conversation || quoted.extendedTextMessage?.text) {
          messageToForward = { text: quoted.conversation || quoted.extendedTextMessage.text }
        }
      } catch (e) {
        console.error('حدث خطأ أثناء التنزيل في .tag:', e?.message || e)
        messageToForward = null
      }
    }

    if (!messageToForward && raw) {
      messageToForward = { text: raw }
    }

    if (!messageToForward) {
      return await conn.sendMessage(chatId, { text: `يجب عليك الرد على رسالة أو كتابة شيء لوضع علامة على المجموعة.\n\nمثال: *${usedPrefix || '.'}${command || 'tag'} مرحبًا*` }, { quoted: m })
    }

    try {
      if (conn.sendPresenceUpdate) await conn.sendPresenceUpdate('composing', chatId).catch(() => {})
    } catch {}

    await conn.sendMessage(chatId, { ...messageToForward, mentions: allMentions }, { quoted: m })

  } catch (error) {
    console.error(error)
    await conn.sendMessage(m.chat, { text: `حدث خطأ أثناء تنفيذ أمر العلامة.` }, { quoted: m })
  }
}

handler.command = ['tag', 'hidetag']
handler.tags = ['grupos']
handler.group = true
handler.admin = true
handler.botAdmin = false

export default handler
