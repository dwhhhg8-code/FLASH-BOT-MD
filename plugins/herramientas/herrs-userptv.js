import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { downloadContentFromMessage, generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  let q = m.quoted ? m.quoted : m
  let mime = ''
  let mediaMsg = null

  if (m.quoted) {
    let msgObj = m.quoted.mediaMessage || m.quoted.msg
    if (msgObj) {
      let type = Object.keys(msgObj)[0]
      mediaMsg = msgObj[type]
      mime = mediaMsg?.mimetype || ''
    }
  }
  if (!mediaMsg) {
    mediaMsg = m.msg || q
    mime = mediaMsg?.mimetype || ''
  }

  if (!mime || !mime.startsWith('video/')) {
    return m.reply(
      `⚠️ *وضع الاستخدام المتعدد الوظائف*\n\n` +
      `> قم بالرد أو إرسال مقطع فيديو بالتنسيق:\n` +
      `> \`${usedPrefix + command} | قدر` +
      `*أمثلة للوجهات الصالحة:*\n` +
      `> 📢 *رابط القناة:* \`https://whatsapp.com/channel/xxxxxx\`\n` +
      `> 👥 *رابط المجموعة:* \`https://chat.whatsapp.com/xxxxxx\`\n` +
      `> 🆔 *المعرف المباشر:* \`120363xxx@newsletter\` o \`120363xxx@g.us\``
    )
  }

  let target = text.split('|')[1]?.trim()
  if (!target) return m.reply(`❌ يحدد وجهة صالحة بعد الشريط العمودي ( | ).`)

  let chatId = target
  let isNewsletter = false

  if (target.includes('whatsapp.com/channel/')) {
    try {
      const htmlRes = await axios.get(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      })
      const match = htmlRes.data.match(/"id":"(\d+@newsletter)"/)
      if (match && match[1]) {
        chatId = match[1]
        isNewsletter = true
      } else {
        throw new Error('لم يتم العثور على المعرف العام في رمز القناة.')
      }
    } catch (e) {
      return m.reply(`❌ تعذر حل رابط القناة.\n> التفاصيل: ${e.message}`)
    }
  } 
  else if (target.includes('chat.whatsapp.com/')) {
    try {
      const htmlRes = await axios.get(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      })
      
      const matchUrl = htmlRes.data.match(/whatsapp:\/\/chat\?code=([a-zA-Z0-9_-]+)/)
      const matchId = htmlRes.data.match(/"g\.us.*?id":"(\d+@g\.us)"/) || htmlRes.data.match(/"chat_jid":"(\d+@g\.us)"/)

      if (matchId && matchId[1]) {
        chatId = matchId[1]
      } else {
        let code = target.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]{20,24})/)?.[1]
        if (!code) throw new Error('تعذر استخراج رمز الدعوة من الرابط.')
        
        try {
          let queryGroup = await conn.query({
            tag: 'iq',
            attrs: { type: 'get', xmlns: 'w:g2', to: '@g.us' },
            content: [{ tag: 'invite', attrs: { code } }]
          })
          let groupNode = queryGroup?.content?.[0]
          if (groupNode && groupNode.attrs?.id) {
            chatId = `${groupNode.attrs.id}@g.us`
          } else {
            throw new Error('لم يُرجع الاستعلام الأصلي المباشر أي معرف.')
          }
        } catch {
          throw new Error('الرابط غير صالح أو منتهي الصلاحية أو لا يمكن استخراج المعرف خارجيًا.')
        }
      }
    } catch (e) {
      return m.reply(`❌ تعذر الحصول على معرف المجموعة.\n> التفاصيل: ${e.message}`)
    }
  } 
  else if (/^\d+$/.test(target.replace(/[-+()\s]/g, ''))) {
    let cleanNumber = target.replace(/[-+()\s]/g, '')
    chatId = `${cleanNumber}@s.whatsapp.net`
  }

  if (!chatId.includes('@')) {
    if (chatId.endsWith('g.us')) chatId = `${chatId}@g.us`
    else if (chatId.endsWith('newsletter')) {
      chatId = `${chatId}@newsletter`
      isNewsletter = true
    }
    else chatId = `${chatId}@s.whatsapp.net`
  }

  if (chatId.endsWith('@newsletter')) {
    isNewsletter = true
  }

  await m.reply(`⏳ *إرسال البث التلفزيوني المباشر إلى الوجهة...*`)

  let video
  try {
    const messageType = mime.split('/')[0]
    const stream = await downloadContentFromMessage(mediaMsg, messageType)
    let buffer = Buffer.from([])

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    video = buffer

    if (!video || video.length < 1) {
      throw new Error('لا يمكن تحميل الفيديو.')
    }
  } catch (e) {
    console.error(e)
    return m.reply(`❌ فشل تنزيل الفيديو.\n\n> ${e.message}`)
  }

  const dir = path.join(process.cwd(), 'tmp')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const tempPath = path.join(dir, `ptv_${Date.now()}.mp4`)

  try {
    await fs.promises.writeFile(tempPath, video)

    const content = await generateWAMessageContent(
      { video: { url: tempPath }, ptv: true },
      {
        jid: isNewsletter ? chatId : undefined,
        upload: async (readStream, opts) => {
          const up = await conn.waUploadToServer(readStream, {
            ...opts,
            ...(isNewsletter ? { newsletter: true } : {})
          })
          return up
        }
      }
    )

    if (!isNewsletter) {
      const quotedMsg = m.quoted || m
      const quotedType = quotedMsg.mtype || m.mtype
      const quotedContent = quotedMsg.msg || quotedMsg
      if (quotedContent && quotedType) {
        content.ptvMessage.contextInfo = {
          stanzaId: quotedMsg.id || m.id,
          participant: quotedMsg.sender || m.sender,
          quotedMessage: proto.Message.create({ [quotedType]: quotedContent })
        }
        if (m.chat !== (quotedMsg.chat || m.chat)) {
          content.ptvMessage.contextInfo.remoteJid = quotedMsg.chat
        }
      }
    }

    const msg = generateWAMessageFromContent(chatId, content, { userJid: conn.user.id })

    await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id })

    await m.react('✅')
    return m.reply(`✅ *النجاح*\n\n> تم إرسال الفيديو بنجاح كـ PTV إلى الوجهة المحددة.`)
  } catch (err) {
    return m.reply(`❌ *خطأ*\n\n> الخطأ: ${err.message}`)
  } finally {
    if (fs.existsSync(tempPath)) {
      await fs.promises.unlink(tempPath).catch(console.error)
    }
  }
}

handler.help = ['userptv']
handler.tags = ['tools']
handler.command = ['userptv']
handler.register = true
handler.rowner = false
handler.owner = false
handler.premium = false

export default handler
