import fs from 'fs'
import { prepareWAMessageMedia, generateWAMessageFromContent } from "@whiskeysockets/baileys"

const botname = "فلاش بوت"
const channelRD = global.channelRD || { id: "0@newsletter", name: "قناة الظل" }

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const delay = ms => new Promise(res => setTimeout(res, ms))

    let user = global.db.data.users[m.sender] || {}
    let nombre = await conn.getName(m.sender)
    let limite = user.limit || 0
    let totalreg = Object.keys(global.db.data.users).length
    let groupsCount = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us')).length
    let muptime = clockString(process.uptime() * 1000)

    let infoUser = `
🎃 ʜᴏʟᴀ, ${nombre} 🦇
*«ظلال المعشر ترحب بكم...»* 🕯️

*乂 معلومات المقاول 🎃 🦇*
┌ ◦ الحالة: المستخدم 🕯️
└  ◦ ʟíᴍɪᴛᴇ: ${limite} 🩸

*乂 🕸️ ɪɴꜰᴏ ᴅᴇ ʟᴀ ꜱᴏᴍʙʀᴀ ⚰️*
┌  ◦ ᴄíʀᴄᴜʟᴏꜱ: ${groupsCount} 🏰
│  ◦ ᴛɪᴇᴍᴘᴏ ᴀᴄᴛɪᴠᴏ: ${muptime} ⏳
│  ◦ ᴀʟᴍᴀꜱ: ${totalreg} 👻
└  ◦ ʀᴇɪɴᴏ: ʟɪɴᴜx 🌘
`.trim()

    let comandosGrupo = `
*╭──* 🎃 \`دوائر أكويلاري\` *🦇*
*│ 🕸️*  .اقفلبوت
*│ 🕸️*  .اقفلجروب <رقم> segundos/minutos/horas
*│ 🕸️*  .اقفل
*│ 🕸️*  .تشغيل
*│ 🕸️*  .دليت
*│ 🕸️*  .شيلالاساسي
*│ 🕸️*  .تنزيل
*│ 🕸️*  .استطلاع <خيار1|خيار2|...>
*│ 🕸️*  .اشباح
*│ 🕸️*  .اطردالاشباح
*│ 🕸️*  .معلوماتجروب
*│ 🕸️*  .استدعاء
*│ 🕸️*  .اطرد
*│ 🕸️*  .ايديجروب
*│ 🕸️*  .رقمالمعرف
*│ 🕸️*  .ايديجروب <@منشن|رقم>
*│ 🕸️*  .المتصلين
*│ 🕸️*  .لينك
*│ 🕸️*  .بروفايل
*│ 🕸️*  .ارفع
*│ 🕸️*  .تتبع
*│ 🕸️*  .استرجع
*│ 🕸️*  .بنرالجروب
*│ 🕸️*  .صورهالجروب
*│ 🕸️*  .وصفجروب
*│ 🕸️*  .وصفالجروب
*│ 🕸️*  .اسمجروب
*│ 🕸️*  .اسمالمجموعه
*│ 🕸️*  .حددالاساسي
*│ 🕸️*  .فكحظربوت
*│ 🕸️*  .اهلاوسهلا
*│ 🕸️*  .اهلاوسهلا @usuario *🦇*
*│ 🕸️*  .اهلاوسهلا
*│ 🕸️*  .ترحيب
*│ 🕸️*  .ضدالخاص
*│ 🕸️*  .ضدالبرايفت
*│ 🕸️*  .قيد
*│ 🕸️*  .منعالاوامر
*│ 🕸️*  .رفعالمستويات
*│ 🕸️*  .تلقائيالمستوي
*│ 🕸️*  .قبولتلقائي
*│ 🕸️*  .اقبلتلقائي
*│ 🕸️*  .رفضتلقائي
*│ 🕸️*  .ارفضتلقائي
*│ 🕸️*  .رداوتوماتيك
*│ 🕸️*  .ردتلقائي
*│ 🕸️*  .وضعالادمن
*│ 🕸️*  .للمالكفقط
*│ 🕸️*  .اقلب
*│ 🕸️*  .ردودفعل
*│ 🕸️*  .اباحي
*│ 🕸️*  .وضعالاباحي
*│ 🕸️*  .ضدالسبام
*│ 🕸️*  .دائم
*│ 🕸️*  .وضعالبوتالفرعي
*│ 🕸️*  .سوب
*│ 🕸️*  .كشف
*│ 🕸️*  .ذكرني
*│ 🕸️*  .مانعالروابط
*│ 🕸️*  .ضدالوهمي
*│ 🕸️*  .قراءهتلقائيه
*╰─────────────╯*`.trim()

    let finalMenu = infoUser + '\n\n' + comandosGrupo
    let videoUrl = 'https://u.pone.rs/lmgkuuie.jpg'

    let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;Itachi;;;\nFN:Itachi\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Celular\nEND:VCARD`
    let qkontak = { 
      key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" }, 
      message: { contactMessage: { displayName: "فلاش بوت", vcard: vcard } } 
    }

    await m.react('🎃')

    let media
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 8000)
      media = await prepareWAMessageMedia({ image: { url: videoUrl } }, { upload: conn.waUploadToServer })
      clearTimeout(t)
    } catch {
      media = null
    }

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: finalMenu },
            footer: { text: "🎃 " + botname + " 🦇" },
            header: media ? {
              hasMediaAttachment: true,
              imageMessage: media.imageMessage
            } : undefined,
            nativeFlowMessage: {
              buttons: [
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🎃 القناة الرسمية 🦇",
                    url: "https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O"
                  })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "💻 تنصيب 🎃",
                    id: `${usedPrefix}code`
                  })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🦇 بينغ ⚡",
                    id: `${usedPrefix}ping`
                  })
                },

                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "👑 اللورد الظل 🦇",
                    id: `${usedPrefix}owner`
                  })
                }
              ]
            },
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardingScore: 999,
              forwardedNewsletterMessageInfo: {
                newsletterJid: channelRD.id,
                serverMessageId: '',
                newsletterName: channelRD.name
              }
            }
          }
        }
      }
    }, { quoted: qkontak })

    await conn.relayMessage(m.chat, msg.message, {})
    await delay(400)

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { text: `✘ ظهر خطأ في قائمة المجموعة: ${e.message}` })
  }
}

handler.help = ['menugrupo']
handler.tags = ['main']
handler.command = ['menugrupo']
handler.register = true

export default handler

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
  }
