import fetch from 'node-fetch'
import { xpRange } from '../../lib/levelling.js'
import { arabicForCommand } from '../../lib/arabic-aliases.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const botname = global.botname || "فلاش بوت"
const dev = global.dev || "سيد كاجينو"
const banners = [
  "https://u.pone.rs/jsdvjbfl.mp4",
  "https://u.pone.rs/uehppizl.mp4",
  "https://u.pone.rs/vazblnca.mp4"
]
let availableBanners = []

function getNextBanner() {
  if (!availableBanners.length) {
    availableBanners = [...banners].sort(() => Math.random() - 0.5)
  }
  return availableBanners.shift()
}
const allMenuAudio = "https://u.pone.rs/drnkzprg.m4a"
const channelRD = global.channelRD || { id: "0@newsletter", name: "قناة الظل" }

async function sendAllMenuAudio(conn, m) {
  await conn.sendMessage(
    m.chat,
    {
      audio: { url: allMenuAudio },
      mimetype: 'audio/mp4',
      fileName: 'الظل allmenu.m4a',
      ptt: true
    },
    { quoted: m }
  )
}

let handler = async (m, { conn, usedPrefix, __dirname, participants }) => {
  let mentionedJid = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  try {
    let user = global.db.data.users[m.sender] || {}
    let name = await conn.getName(m.sender)
    let totalreg = Object.keys(global.db.data.users).length
    let groupUserCount = m.isGroup ? participants.length : '-'
    let groupsCount = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us')).length
    let uptime = clockString(process.uptime() * 1000)
    let fecha = new Date(Date.now())
    let locale = 'es-PE'
    let dia = fecha.toLocaleDateString(locale, { weekday: 'long' })
    let fechaTxt = fecha.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let hora = fecha.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    let totalCommands = Object.keys(global.plugins).length
    let readMore = String.fromCharCode(8206).repeat(4001)

    let userIdNum = m.sender.split('@')[0]
    let phone = PhoneNumber('+' + userIdNum)
    let pais = phone.getRegionCode() || 'مجال غير معروف'

    let tags = {
      info: 'معلومات الظل',
      main: 'حالة التنصيب',
      anime: 'كابوس أنيمي',
      menu: 'القوائم والطقوس',
      search: 'عمليات البحث الباطنية',
      descargas: 'تنزيلات التشفير',
      socket: 'اتصالات طيفية',
      rg: 'ملف المقاول',
      fun: 'ألعاب مسكونة',
      rpg: 'الاقتصاد السفلي',
      gacha: 'استدعاء الأرواح',
      game: 'ألعاب غامضة',
      grupos: 'الدوائر والطوابق',
      nable: 'تشغيل/إيقاف التشيلو',
      ia: 'ذكاء أركان',
      stalk: 'عين الظل',
      maker: 'الكيمياء البصرية',
      tools: 'أدوات مظلمة',
      sticker: 'الأختام الغامضة',
      owner: 'سيد الليل',
      nsfw: 'منطقة محظورة (+18)'
    }

    let commands = Object.values(global.plugins)
      .filter(v => v.help && v.tags)
      .map(v => ({
        help: Array.isArray(v.help) ? v.help : [v.help],
        tags: Array.isArray(v.tags) ? v.tags : [v.tags]
      }))

    let menuTexto = ''
    for (let tag in tags) {
      let comandos = commands
        .filter(cmd => cmd.tags.includes(tag))
        .map(cmd => cmd.help.map(e => `*│ 🕸️*  ${usedPrefix}${arabicForCommand(e)}`).join('\n'))
        .join('\n')
      if (comandos) {
        menuTexto += `\n*╭──* 🎃 \`${tags[tag]}\` *🦇*
${comandos}
*╰─────────────╯*\n`
      }
    }

    let date = `${dia}, ${fechaTxt}, ${hora}`
    let infoUser = `
🎃 *مرحبًا بك في فلاش بوت!* 🦇
_«في ليلة الهالوين، تتراقص الظلال تحت القمر»_ 🕯️

🕸️ *Contratista:* ${name}

*╭── معلومات الظل 🎃 🦇 ──╮*
│
│ 🦇 *Líder:* ${conn.user?.name || 'اللورد الظل'}
│ 🕸️ *الرتبة:* ${(conn.user.jid == global.conn.user.jid ? 'النواة العليا' : 'الوحدة الطيفية')}
│ 🎃 *Hechizos:* ${totalCommands}
│ ⏳ *Actividad:* ${uptime}
│ 🏰 *Dominio:* ${pais}
│ 👻 *Almas:* ${totalreg}
│ ⚰️ *Aquelarres:* ${groupsCount}
│ 🌘 *ساعة السحرة:* ${date}
│
*╰────────────────────╯*

${readMore}
乂 🎃 𝐑𝐈𝐓𝐔𝐀𝐋𝐄𝐒 𝐘 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𝐃𝐄 𝐋𝐀 𝐒𝐎𝐌𝐁𝐑𝐀 🦇 乂\n`.trim()

    await m.react('🎃')

    const finalBanner = getNextBanner()
    const isVideo = true

    let messageOptions = {
      caption: infoUser + menuTexto,
      contextInfo: {
        forwardingScore: 777,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: '',
          newsletterName: channelRD.name
        }
      }
    }

    // Conserva el contexto de WhatsApp Business del menú sin enviar una imagen adicional.
    const businessThumbnail = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    const fkontak = {
      key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
      message: {
        productMessage: {
          product: {
            productImage: { mimetype: 'image/gif', jpegThumbnail: businessThumbnail },
            title: `قائمة الظل - ${botname}`,
            description: '«أنا من يتصرف في الظل, متظاهرًا بأنني مجرد إضافة بسيطة. »',
            currencyCode: 'USD',
            priceAmount1000: 0,
            retailerId: 'menu'
          },
          businessOwnerJid: '201125166486@s.whatsapp.net'
        }
      }
    }

    if (isVideo) {
      let sent = false
      try {
        const media = await prepareWAMessageMedia(
          { video: { url: finalBanner }, gifPlayback: true },
          { upload: conn.waUploadToServer }
        )
        const msg = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: proto.Message.InteractiveMessage.create({
                contextInfo: messageOptions.contextInfo,
                body: proto.Message.InteractiveMessage.Body.create({ text: infoUser + menuTexto }),
                footer: proto.Message.InteractiveMessage.Footer.create({ text: `${global.dev || dev} • القائمة الكاملة` }),
                header: proto.Message.InteractiveMessage.Header.create({
                  title: `${botname}`,
                  hasMediaAttachment: true,
                  videoMessage: media.videoMessage
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons: [
                    {
                      name: 'cta_url',
                      buttonParamsJson: JSON.stringify({
                        display_text: '🎃 القناة الرسمية 🦇',
                        url: global.channel || 'https://whatsapp.com',
                        has_multiple_buttons: true
                      })
                    }
                  ]
                })
              })
            }
          }
        }, { quoted: fkontak })
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
        sent = true
      } catch (ev) {
        console.error('فشل إرسال القائمة التفاعلية مع الفيديو:', ev)
      }
      if (!sent) {
        try {
          await conn.sendMessage(m.chat, {
            video: { url: finalBanner },
            gifPlayback: true,
            mimetype: 'video/mp4',
            caption: `${botname} • القائمة الكاملة`,
            contextInfo: messageOptions.contextInfo
          }, { quoted: fkontak })
        } catch (ev2) {
          console.error('فشل إرسال فيديو القائمة:', ev2)
        }
        delete messageOptions.caption
        messageOptions.text = infoUser + menuTexto
        messageOptions.mentionedJid = [mentionedJid]
        await conn.sendMessage(m.chat, messageOptions, { quoted: fkontak })
      }
      await sendAllMenuAudio(conn, m)
      return
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: fkontak })
    await sendAllMenuAudio(conn, m)

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { 
      text: `✘ ظهر خطأ من الظل: ${e.message}`,
      mentionedJid: [mentionedJid]
    })
  }
}

handler.help = ['allmenu']
handler.tags = ['main']
handler.command = ['allmenu']
handler.register = true
export default handler

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
    }
