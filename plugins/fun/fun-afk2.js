import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {
  const user = global.db.data.users[m.sender]

  user.afk = +new Date()
  user.afkReason = text || ''

  let thumb = null
  try {
    thumb = await (await fetch("https://i.postimg.cc/rFfVL8Ps/image.jpg")).buffer()
  } catch {
    thumb = null
  }

  const flash_xyz = {
    key: {
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "FlashCatalog",
      participant: "0@s.whatsapp.net"
    },
    message: {
      productMessage: {
        product: {
          productImage: thumb
            ? {
                mimetype: "image/jpeg",
                jpegThumbnail: thumb
              }
            : undefined,
          title: "واتساب الأعمال • الحالة",
          description: "فريق الظل",
          currencyCode: "USD",
          priceAmount1000: '0',
          retailerId: "FlashCore",
          productImageCount: 1
        },
        businessOwnerJid: "201125166486@s.whatsapp.net"
      }
    }
  }

  await m.react('🎃')

  await conn.sendMessage(
    m.chat,
    {
      text:
        `🎃 *تلميذ الظل • الهالوين* 🦇\n` +
        `لقد دخلت في حالة نشوة الظل (AFK).\n` +
        `○ السبب » *${text || 'غير محدد'}* 🕯️`
    },
    { quoted: flash_xyz }
  )
}

handler.help = ['afk [razón]']
handler.tags = ['fun']
handler.command = ['afk']

export default handler
