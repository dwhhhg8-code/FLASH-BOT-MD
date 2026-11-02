import axios from 'axios'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

async function sendCustomPedido(m, conn, texto, cantidad) {
  try {
    const img = 'https://files.catbox.moe/rjgi98.jpg'
    const res = await axios.get(img, { responseType: 'arraybuffer' })
    const imgBuffer = Buffer.from(res.data)

    const orderMessage = {
      orderId: 'FAKE-' + Date.now(),
      thumbnail: imgBuffer,
      itemCount: parseInt(cantidad),
      status: 1,
      surface: 1,
      message: texto,
      orderTitle: 'تم إرسال الطلب عن طريق الكتالوج',
      token: null,
      sellerJid: null,
      totalAmount1000: '0',
      totalCurrencyCode: 'GTQ'
    }

    const msg = generateWAMessageFromContent(m.chat, { orderMessage }, { quoted: m })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (err) {
    console.error(err)
    m.reply('⚠️ خطأ في إرسال الطلب.', m)
  }
}

let handler = async (m, { conn, args }) => {
  const input = args.join(' ')
  if (!input.includes('|')) return m.reply('*ⓘ* استخدم التنسيق: `رسالة .pedido|الكمية`\nمثال: `.pedido hello|1370`')

  const [texto, cantidad] = input.split('|')
  if (!texto || !cantidad || isNaN(cantidad)) return m.reply('*ⓘ* تأكد من إدخال رسالة وكمية صالحة.\nمثال: `.pedido hello|1370`')

  await sendCustomPedido(m, conn, texto.trim(), cantidad.trim())
}

handler.command = ['pedido']
handler.help = ['pedido <mensaje>|<cantidad>']
handler.tags = ['fun']
export default handler
