import { fileTypeFromBuffer } from 'file-type'
import { IMGBB_API_KEY } from '../../lib/secrets.js'
import fetch from 'node-fetch'
import axios from 'axios'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

async function sendCustomPedido(m, conn, texto) {
  try {
    const img = 'https://files.catbox.moe/deo9r9.jpg'
    const res = await axios.get(img, { responseType: 'arraybuffer' })
    const imgBuffer = Buffer.from(res.data)

    const orderMessage = {
      orderId: 'FAKE-' + Date.now(),
      thumbnail: imgBuffer,
      itemCount: 1,
      status: 1,
      surface: 1,
      message: texto,
      orderTitle: '🌑 الظل - الكتالوج 🎄',
      token: null,
      sellerJid: null,
      totalAmount1000: '0',
      totalCurrencyCode: 'VES'
    }

    const msg = generateWAMessageFromContent(m.chat, { orderMessage }, { quoted: m })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (err) {
    console.error(err)
    m.reply('⚠️ خطأ في إرسال الكتالوج.', m)
  }
}

const handler = async (m, { conn, text, command }) => {
  const ImgBB_API_Key = IMGBB_API_KEY
  const ImgBB_API_Url = `https://api.imgbb.com/1/upload?key=${ImgBB_API_Key}`
    
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || q.mediaType || ''
    
  if (!/image/g.test(mime)) {
    return sendCustomPedido(
      m,
      conn,
      `🌑 *قائمة الظل* 🌑\n\n🎄 تذكر أن هذه القدرة تتمثل في تحميل الصور إلى الظلال 🎄\n> اهتمام: الظل\n\n🚩 قم بإرفاق *صورة* أو اقتباسها لاستدعاء التحميل.`
    )
  }

  await m.react("⏳")

  try {
    const media = await q.download()
    const fileBase64 = media.toString('base64')

    const formData = new URLSearchParams()
    formData.append('image', fileBase64)
        
    const response = await fetch(ImgBB_API_Url, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const data = await response.json()

    if (data.status === 200 && data.success) {
      const result = data.data
            
      const replyText = 
`*— 🌑 تسلق الظل الناجح —*

🎄 *URL:* ${result.url}
🎁 *Tipo:* ${result.mime}
✨ *Tamaño:* ${(result.size / 1024).toFixed(2)} KB
⛄ *Expiración:* ${result.expiration ? `${result.expiration} s` : 'Nunca'}

> Att: Flash 🎄`

      return sendCustomPedido(m, conn, replyText)
    } else {
      throw new Error(`❌ فشل Las Sombras في تحميل الصورة: ${data.error ? data.error.message : 'خطأ غير معروف في الاستجابة.'}`)
    }

  } catch (error) {
    console.error("خطأ في معالج imgbb:", error)
    await m.reply(`⚠️ حدث خطأ أثناء معالجة الصورة أو تحميلها:\n${error.message}`)
    await m.react("❌")
  }
}

handler.help = ['imgbbflash']
handler.tags = ['tools']
handler.command = ['imgbbflash', 'uploadflash']
export default handler
