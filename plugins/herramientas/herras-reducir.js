import { Jimp } from 'jimp'
import axios from 'axios'
import FormData from 'form-data'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import * as baileys from '@whiskeysockets/baileys'

import { IMGBB_API_KEY } from '../../lib/secrets.js'

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

const IMGBB_KEY = IMGBB_API_KEY

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    return conn.reply(m.chat, `❍ قم بالرد على الصورة/الملصق واستخدم:\n*${usedPrefix}reduce 300×300*`, m)
  }

  let input = text.trim().split(/[x×]/i)
  if (input.length !== 2 || isNaN(input[0]) || isNaN(input[1])) {
    return m.reply(`❌ التنسيق غير صحيح.\nالاستخدام: *${usedPrefix}reduce 300×300*`)
  }

  let width = parseInt(input[0])
  let height = parseInt(input[1])

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image|sticker/.test(mime)) {
    return conn.reply(m.chat, `❍ الرد على الصورة/الملصق للتقليل منها.`, m)
  }

  try {
    let media = await downloadMediaMessage(
      q,
      'buffer',
      {},
      {
        logger: console,
        reconnectMode: 'on'
      }
    )

    if (!media) throw new Error('لا يمكن تحميل ملف الواتساب.')

    let image = await Jimp.read(media)
    image.resize({ w: width, h: height })
    let buffer = await image.getBuffer('image/jpeg')

    let formData = new FormData()
    formData.append('image', buffer, { filename: 'imagen.jpg', contentType: 'image/jpeg' })

    let uploadRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
      formData,
      { headers: formData.getHeaders() }
    )

    if (!uploadRes.data?.data?.url) {
      throw new Error('ImgBB لم يُرجع URL')
    }

    let uploadedUrl = uploadRes.data.data.url

    let mediaMsg = await prepareWAMessageMedia(
      { image: buffer },
      { upload: conn.waUploadToServer }
    )

    const buttons = [{
      name: "cta_copy",
      buttonParamsJson: JSON.stringify({
        display_text: "♡ انسخ الرابط",
        copy_code: uploadedUrl
      })
    }]

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `☁️ L I N K:\n${uploadedUrl}`
              }),
              footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: `تم تصغير الصورة إلى *${width}×${height}*`
              }),
              header: proto.Message.InteractiveMessage.Header.fromObject({
                title: "ⓘ صورة مخفضة",
                hasMediaAttachment: true,
                imageMessage: mediaMsg.imageMessage
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons
              })
            })
          }
        }
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error(e)
    m.reply('⚠️ حدث خطأ أثناء معالجة الصورة أو تحميلها.')
  }
}

handler.command = ['reduce', 'reducir']
handler.help = ['reduce', 'reducir']
handler.tags = ['tools']

export default handler
