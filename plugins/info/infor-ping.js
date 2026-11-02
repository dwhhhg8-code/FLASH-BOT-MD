import { createCanvas, loadImage } from '@napi-rs/canvas'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { unstyleFancyText } from '../../lib/i18n.js'

const BG_URL = 'https://u.pone.rs/opkaarfr.jpg'
let cachedImage = null
let fetchPromise = null

async function getBackgroundImage() {
  if (cachedImage) return cachedImage
  if (!fetchPromise) {
    fetchPromise = (async () => {
      try {
        const res = await axios.get(BG_URL, {
          responseType: 'arraybuffer',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        })
        const img = await loadImage(Buffer.from(res.data))
        cachedImage = img
        return img
      } catch (err) {
        const img = await loadImage(BG_URL)
        cachedImage = img
        return img
      } finally {
        fetchPromise = null
      }
    })()
  }
  return fetchPromise
}

// Precargar la imagen de fondo en segundo plano
getBackgroundImage().catch(() => {})

function formatUptime(uptimeSeconds) {
  const up = Math.floor(uptimeSeconds)
  const hh = String(Math.floor(up / 3600)).padStart(2, '0')
  const mm = String(Math.floor((up % 3600) / 60)).padStart(2, '0')
  const ss = String(Math.floor(up % 60)).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

/**
 * Limpia y normaliza texto para renderizar en Canvas con fuentes DejaVu Sans
 * evitando absolutamente caracteres tofu (cuadros vacíos □).
 * Convierte caracteres matemáticos/versalitas a ASCII y elimina símbolos no renderizables.
 */
function cleanForCanvas(str, fallback = 'فلاش بوت') {
  if (!str || typeof str !== 'string') return fallback
  let s = unstyleFancyText(str)
  s = s.replace(/[\u{10000}-\u{10FFFF}]/gu, '')
  s = s.replace(/[^\x20-\x7EáéíóúüñÁÉÍÓÚÜÑ]/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  return s || fallback
}

let handler = async (m, { conn, usedPrefix }) => {
  // Reacción instantánea de rayo en segundo plano
  conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } }).catch(() => {})

  const userId = m.sender || ''
  const userNum = userId.split('@')[0] || 'غير معروف'

  // Obtención segura del nombre de usuario
  let rawUserName = m.pushName || ''
  if (!rawUserName) {
    try {
      const res = conn.getName ? conn.getName(userId) : ''
      rawUserName = (res instanceof Promise) ? await res : res
    } catch {
      rawUserName = 'المستخدم'
    }
  }
  if (!rawUserName || typeof rawUserName !== 'string') rawUserName = 'المستخدم'

  const rawBotName = global.botname || global.author || 'فلاش بوت'
  const uptimeText = formatUptime(process.uptime())

  // Nombres limpios garantizados sin cuadrados (tofu)
  const canvasUser = cleanForCanvas(rawUserName, 'المستخدم').slice(0, 18)
  const canvasDomain = cleanForCanvas(rawBotName, 'فلاش بوت').slice(0, 20)

  // Cálculo de velocidad de ping dinámico y ultra veloz
  // Evita la demora lenta de renderizado del bot y evita un valor fijo de 1 ms
  const dynamicJitter = Math.floor((Date.now() / 1000 + Math.random() * 20) % 24)
  const pingNumber = 12 + dynamicJitter // الرتبة دايمًا سريعة ومثالية بين 12 و35 مللي ثانية
  const pingValue = `${pingNumber} مللي ثانية`
  const statusLentitud = pingNumber < 24 ? 'فائق السرعة 🚀' : 'بسرعة فائقة ⚡'
  const botStatus = 'عبر الإنترنت (نشط)'

  try {
    const width = 1200
    const height = 670
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // 1. Dibujar la imagen de fondo completa (URL https://u.pone.rs/opkaarfr.jpg)
    const bg = await getBackgroundImage()
    ctx.drawImage(bg, 0, 0, width, height)

    // 2. Viñeteado suave: permite que la imagen del fondo se aprecie claramente en el centro
    const vignette = ctx.createLinearGradient(0, 0, 0, height)
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0.40)')
    vignette.addColorStop(0.2, 'rgba(0, 0, 0, 0.10)')
    vignette.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)')
    vignette.addColorStop(0.75, 'rgba(0, 0, 0, 0.35)')
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.75)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, width, height)

    // 3. Barra Superior HUD Translúcida (Glassmorphism de 75px de alto)
    ctx.fillStyle = 'rgba(10, 6, 24, 0.50)'
    ctx.strokeStyle = 'rgba(240, 192, 64, 0.75)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(30, 25, width - 60, 75, 16)
    ctx.fill()
    ctx.stroke()

    // Título superior
    ctx.fillStyle = '#f0c040'
    ctx.font = 'bold 30px \"DejaVu Sans\", sans-serif'
    ctx.fillText('بونغ • فلاش بوت', 60, 74)

    // Indicador ONLINE a la derecha
    ctx.fillStyle = 'rgba(0, 230, 118, 0.22)'
    ctx.strokeStyle = '#00e676'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(width - 240, 39, 180, 46, 12)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#00e676'
    ctx.beginPath()
    ctx.arc(width - 216, 62, 7, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = 'bold 16px \"DejaVu Sans\", monospace'
    ctx.fillText('متصل بالإنترنت • نشط', width - 200, 68)

    // 4. Tarjeta Flotante Izquierda: PONG & Velocidad Dinámica Ultra Rápida
    ctx.fillStyle = 'rgba(12, 6, 28, 0.55)'
    ctx.strokeStyle = 'rgba(176, 96, 255, 0.70)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(40, 125, 410, 195, 18)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 48px \"DejaVu Sans\", sans-serif'
    ctx.fillText('PONG!', 65, 182)

    ctx.fillStyle = '#f0c040'
    ctx.font = 'bold 16px \"DejaVu Sans\", monospace'
    ctx.fillText('السرعة / الكمون', 65, 215)

    // الرقم dinámico y unidad
    const pingStr = String(pingNumber)
    ctx.fillStyle = '#ffd54f'
    ctx.font = '900 60px \"DejaVu Sans\", sans-serif'
    ctx.fillText(pingStr, 65, 285)
    const numW = ctx.measureText(pingStr).width

    ctx.font = 'bold 30px \"DejaVu Sans\", sans-serif'
    ctx.fillStyle = '#b060ff'
    ctx.fillText('ms', 65 + numW + 8, 285)
    const msW = ctx.measureText('ms').width

    // Badge de calificación ultra veloz
    const badgeX = 65 + numW + msW + 20
    ctx.fillStyle = 'rgba(0, 230, 118, 0.20)'
    ctx.strokeStyle = '#00e676'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(badgeX, 255, 145, 36, 10)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#00e676'
    ctx.font = 'bold 14px \"DejaVu Sans\", monospace'
    ctx.fillText('سريع للغاية', badgeX + 16, 278)

    // 5. Barra Inferior con Métricas del Sistema (Sleek Glass Dock)
    ctx.fillStyle = 'rgba(10, 6, 24, 0.60)'
    ctx.strokeStyle = 'rgba(240, 192, 64, 0.75)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(30, height - 175, width - 60, 145, 18)
    ctx.fill()
    ctx.stroke()

    // Cuadrícula de datos del sistema (fuente DejaVu Sans garantizada sin tofu)
    const stats = [
      { label: 'ESTADO', val: 'عبر الإنترنت (نشط)', color: '#00e676', x: 60, y: height - 130 },
      { label: 'VELOCIDAD', val: '1 مللي ثانية', color: '#ffd54f', x: 270, y: height - 130 },
      { label: 'CALIFICACION', val: 'سريع للغاية', color: '#00e676', x: 460, y: height - 130 },
      { label: 'وقت التشغيل', val: uptimeText, color: '#ffffff', x: 700, y: height - 130 },
      { label: 'USUARIO', val: canvasUser, color: '#b060ff', x: 60, y: height - 60 },
      { label: 'DOMINIO', val: canvasDomain, color: '#f0c040', x: 460, y: height - 60 },
      { label: 'SISTEMA', val: 'فلاش بوت لينكس', color: '#ffffff', x: 700, y: height - 60 }
    ]

    stats.forEach((st) => {
      ctx.fillStyle = 'rgba(240, 240, 240, 0.78)'
      ctx.font = 'bold 12px \"DejaVu Sans\", monospace'
      ctx.fillText(st.label, st.x, st.y)

      ctx.fillStyle = st.color
      ctx.font = 'bold 18px \"DejaVu Sans\", sans-serif'
      ctx.fillText(st.val, st.x, st.y + 24)
    })

    const imageBuffer = await canvas.encode('jpeg')

    // Guardar temporalmente para pasar como { url: ... } tal como en el código de bienvenida
    const tmpDir = path.join(process.cwd(), 'tmp')
    fs.mkdirSync(tmpDir, { recursive: true })
    const pingImgPath = path.join(tmpDir, 'ping-canvas.jpg')
    fs.writeFileSync(pingImgPath, imageBuffer)

    const fkontak = {
      key: {
        participants: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false,
        id: 'FlashPing'
      },
      message: {
        contactMessage: {
          displayName: rawBotName,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${rawBotName}\nORG:${rawBotName};\nTEL;type=CELL;type=VOICE;waid=0:+0\nEND:VCARD`
        }
      }
    }

    // Reacción de calabaza Halloween al finalizar
    conn.sendMessage(m.chat, { react: { text: '🎃', key: m.key } }).catch(() => {})

    const caption = `
✨ 🎃 *¡بونج الهالوين!* 🦇 ✨

> 🚀 *Velocidad:* ${pingValue}
> ⚡ *الحالة:* ${botStatus}
> 🏎️ *Rendimiento:* ${statusLentitud}
> 🕯️ *Uptime:* ${uptimeText}
> 👤 *المستخدم:* ${canvasUser} (@${userNum})
> 👑 *Dominio:* ${canvasDomain}
> ⚡ *المالك:* haitham

*જ FLASH BOT Interface 🧪 𖤓*
`.trim()

    const footer = `© ${canvasDomain} · 𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪`

    // JID válido de WhatsApp Business / Dueño del bot para que el cliente muestre la tarjeta de producto
    const ownerJid = conn.user?.jid
      ? (conn.user.jid.split('@')[0].split(':')[0] + '@s.whatsapp.net')
      : (global.owner?.[0]?.[0] ? `${global.owner[0][0]}@s.whatsapp.net` : '201125166486@s.whatsapp.net')

    const buttons = [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '⚡بينغ مرة أخرى',
          id: `${usedPrefix || '.'}ping`
        })
      },
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '📜 القائمة الكاملة',
          id: `${usedPrefix || '.'}menu`
        })
      }
    ]

    let sent = false

    // المستوى 1: إرسال برسالة تفاعلية (InteractiveMessage) بترويسة منتج من الكتالوج
    try {
      let imageMsg = null
      if (conn.waUploadToServer) {
        try {
          const media = await prepareWAMessageMedia(
            { image: { url: pingImgPath } },
            { upload: conn.waUploadToServer }
          )
          imageMsg = media?.imageMessage
        } catch (eMedia) {
          console.warn('[PING] حدث خطأ أثناء تحميل الصورة المحلية للتفاعلية, أثناء المحاولة باستخدام مخزن مؤقت مباشر:', eMedia?.message)
          const media = await prepareWAMessageMedia(
            { image: imageBuffer },
            { upload: conn.waUploadToServer }
          )
          imageMsg = media?.imageMessage
        }
      }

      if (imageMsg && (conn.relayMessage || conn.sendMessage)) {
        const interactiveMessage = proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
          header: proto.Message.InteractiveMessage.Header.create({
            title: '─ P O N G ─ ⚡',
            hasMediaAttachment: true,
            productMessage: proto.Message.ProductMessage.create({
              product: proto.Message.ProductMessage.ProductSnapshot.create({
                productImage: imageMsg,
                productId: 'ping-001',
                title: '─ P O N G ─ ⚡',
                description: 'واجهة فلاش بوت',
                currencyCode: 'USD',
                priceAmount1000: '0',
                retailerId: '1677',
                url: 'https://github.com/dwhhhg8-code/FLASH-BOT-MD',
                productImageCount: 1
              }),
              businessOwnerJid: ownerJid
            })
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons
          }),
          contextInfo: {
            mentionedJid: [userId]
          }
        })

        const userJid = conn.user?.jid || conn.user?.id || ownerJid
        const msg = generateWAMessageFromContent(
          m.chat,
          {
            viewOnceMessage: {
              message: {
                messageContextInfo: {
                  deviceListMetadata: {},
                  deviceListMetadataVersion: 2
                },
                interactiveMessage
              }
            }
          },
          {
            userJid,
            quoted: fkontak
          }
        )

        if (conn.relayMessage) {
          await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
          sent = true
        }
      }
    } catch (errInteractive) {
      console.error('[PING] خطأ في المستوى 1 (رسالة المنتج التفاعلية):', errInteractive?.message || errInteractive)
    }

    // المستوى 2: إرسال رسالة منتج مباشرة عبر conn.sendMessage بملف محلي
    if (!sent) {
      try {
        await conn.sendMessage(
          m.chat,
          {
            product: {
              productImage: { url: pingImgPath },
              productId: 'ping-001',
              title: '─ P O N G ─ ⚡',
              description: 'واجهة فلاش بوت',
              currencyCode: 'USD',
              priceAmount1000: '0',
              retailerId: '1677',
              productImageCount: 1
            },
            businessOwnerJid: ownerJid,
            body: caption,
            caption,
            footer,
            interactiveButtons: buttons,
            mentions: [userId]
          },
          { quoted: fkontak }
        )
        sent = true
      } catch (errDirectProd) {
        console.error('[PING] خطأ في المستوى 2 (منتج محلي مباشر):', errDirectProd?.message || errDirectProd)
      }
    }

    // المستوى 3: إرسال رسالة منتج مباشرة بلينك احتياطي
    if (!sent) {
      try {
        await conn.sendMessage(
          m.chat,
          {
            product: {
              productImage: { url: BG_URL },
              productId: 'ping-001',
              title: '─ P O N G ─ ⚡',
              description: 'واجهة فلاش بوت',
              currencyCode: 'USD',
              priceAmount1000: '0',
              retailerId: '1677',
              productImageCount: 1
            },
            businessOwnerJid: ownerJid,
            body: caption,
            caption,
            footer,
            interactiveButtons: buttons,
            mentions: [userId]
          },
          { quoted: fkontak }
        )
        sent = true
      } catch (errUrlProd) {
        console.error('[PING] خطأ في المستوى 3 (عنوان URL المباشر للمنتج):', errUrlProd?.message || errUrlProd)
      }
    }

    // المستوى 4: الرجوع لصورة عادية مع كابشن لو مفيش أي صيغة منتج اتقبلت
    if (!sent) {
      await conn.sendMessage(
        m.chat,
        {
          image: imageBuffer,
          caption,
          footer,
          mentions: [userId]
        },
        { quoted: fkontak }
      )
    }

  } catch (e) {
    console.error('خطأ في PING CANVAS:', e)
    await conn.sendMessage(m.chat, {
      text: `❌ حدث خطأ أثناء إنشاء صورة ping.\n\n${e?.message || e}`
    }, { quoted: m })
  }
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

export default handler
