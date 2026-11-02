import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    return conn.reply(m.chat, '✐ الرجاء إدخال مصطلح البحث أو رابط TikTok.', m)
  }

  const isUrl = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/[^\s&]+/i.test(text)

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  const dir = path.join(process.cwd(), 'tmp')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  try {
    if (m.react) await m.react('🕒')

    if (isUrl) {
      const res = await axios.get(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`,
        { timeout: 20000 }
      )

      const data = res.data?.data
      if (!data?.play && !data?.images) {
        if (m.react) await m.react('✖️')
        return conn.reply(m.chat, 'ꕥ رابط غير صالح أو لا يحتوي على محتوى قابل للتنزيل.', m)
      }

      const { title, duration, author, created_at, type, images, music, play } = data

      const caption = `✐ العنوان » ${title || 'محتوى تيك توك'}\nⴵ المؤلف » ${author?.nickname || author?.unique_id || 'غير متوفر'}\n✰ المدة » ${duration ?? 'غير متوفر'} ثانية\n❒ التاريخ » ${created_at ?? 'غير متوفر'}`

      if (type === 'image' && Array.isArray(images) && images.length) {
        for (let i = 0; i < Math.min(images.length, 10); i++) {
          await conn.sendMessage(
            m.chat,
            { image: { url: images[i] }, caption: i === 0 ? caption : undefined },
            { quoted: m }
          )
        }

        if (music) {
          await conn.sendMessage(
            m.chat,
            { audio: { url: music }, mimetype: 'audio/mp4', fileName: 'tiktok_audio.mp4' },
            { quoted: m }
          )
        }

        if (m.react) await m.react('✔️')
        return
      }

      if (play) {
        const tempPath = path.join(dir, `ptv_${Date.now()}.mp4`)
        try {
          const videoRes = await axios({ url: play, method: 'GET', responseType: 'arraybuffer', timeout: 30000 })
          await fs.promises.writeFile(tempPath, Buffer.from(videoRes.data))

          const content = await generateWAMessageContent(
            { video: { url: tempPath }, ptv: true },
            { upload: conn.waUploadToServer }
          )

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

          const msg = generateWAMessageFromContent(m.chat, content, { userJid: conn.user.id })
          await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
        } finally {
          if (fs.existsSync(tempPath)) {
            await fs.promises.unlink(tempPath).catch(console.error)
          }
        }

        if (m.react) await m.react('✔️')
        return
      }

      if (m.react) await m.react('✖️')
      return conn.reply(m.chat, 'ꕥ لم يتم العثور على فيديو قابل للتنزيل في هذا الرابط.', m)
    }

    await conn.reply(m.chat, `✧ *إرسال الفيديوهات بتنسيق PTV إلى:* *${text.toUpperCase()}* 🎬`, m)

    const form = new URLSearchParams()
    form.append('keywords', text)
    form.append('count', '20')
    form.append('cursor', '0')
    form.append('HD', '1')

    const res = await axios({
      method: 'POST',
      url: 'https://tikwm.com/api/feed/search',
      timeout: 20000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': 'current_language=ar',
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
      },
      data: form.toString()
    })

    let results = res.data?.data?.videos?.filter(v => v.play) || []
    if (results.length < 1) {
      if (m.react) await m.react('✖️')
      return conn.reply(m.chat, 'ꕥلم يتم العثور على نتائج صالحة.', m)
    }

    shuffleArray(results)
    const topResults = results.slice(0, 4)

    for (const v of topResults) {
      const tempPath = path.join(dir, `ptv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`)
      try {
        const videoRes = await axios({ url: v.play, method: 'GET', responseType: 'arraybuffer', timeout: 30000 })
        await fs.promises.writeFile(tempPath, Buffer.from(videoRes.data))

        const content = await generateWAMessageContent(
          { video: { url: tempPath }, ptv: true },
          { upload: conn.waUploadToServer }
        )

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

        const msg = generateWAMessageFromContent(m.chat, content, { userJid: conn.user.id })
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      } finally {
        if (fs.existsSync(tempPath)) {
          await fs.promises.unlink(tempPath).catch(console.error)
        }
      }
    }

    if (m.react) await m.react('🔥')
  } catch (e) {
    if (m.react) await m.react('✖️')
    await conn.reply(
      m.chat,
      `⚠︎ حدثت مشكلة.\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n🜸 التفاصيل: ${e.message}`,
      m
    )
  }
}

handler.help = ['ptvsearch <texto|link>']
handler.tags = ['search']
handler.command = ['ptvsearch', 'ptvtt', 'ttptv']
handler.group = true
handler.coin = 23

export default handler
