import moment from "moment-timezone"
import fs from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import fetch from "node-fetch"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const baileysMod = await import("@whiskeysockets/baileys")
const prepareWAMessageMedia =
  baileysMod.prepareWAMessageMedia ||
  baileysMod.default?.prepareWAMessageMedia

if (typeof prepareWAMessageMedia !== "function") {
  throw new Error("إصدار Baileys الخاص بك لا يكشف PreparWAMessageMedia")
}

function clockString(ms) {
  let h = isNaN(ms) ? "--" : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":")
}

async function getBufferFromUrl(url, timeoutMs = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const r = await fetch(url, { signal: controller.signal })
    if (!r.ok) throw new Error(`تعذر التنزيل: ${url}`)
    const arrayBuffer = await r.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } finally {
    clearTimeout(timer)
  }
}

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const userData = global.db?.data?.users?.[m.sender] || {}
    const isRegistered = !!userData.registered

    const tz = "America/Tegucigalpa"
    const time = moment.tz(tz).format("HH:mm:ss")
    const date = moment.tz(tz).format("DD/MM/YYYY")
    const uptime = clockString(process.uptime() * 1000)

    const tagUser = "@" + m.sender.split("@")[0]
    const name = (await conn.getName(m.sender)) || "User"
    const meName =
      (await conn.getName(conn.user?.id || conn.user?.jid || "")) ||
      global.botname ||
      "Bot"

    let profilePic
    try {
      profilePic = await conn.profilePictureUrl(m.sender, "image")
    } catch {
      profilePic = global.icono || "https://i.pinimg.com/originals/9d/6c/4e/9d6c4eeb7898079652b7f2c2e5c65632.jpg"
    }
    if (!profilePic) profilePic = global.icono || "https://i.pinimg.com/originals/9d/6c/4e/9d6c4eeb7898079652b7f2c2e5c65632.jpg"

    let botNameToShow = global.botname || meName
    let bannerUrl = global.banner || "https://i.pinimg.com/originals/9d/6c/4e/9d6c4eeb7898079652b7f2c2e5c65632.jpg"

    const channelUrl = global.channel || "https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v"
    const botType = (conn.user?.jid || "") === (global.conn?.user?.jid || "") ? "Principal" : "Sub-Bot"

    const senderBotNumber = (conn.user?.jid || "").split("@")[0]
    let configPath
    if ((conn.user?.jid || "") === (global.conn?.user?.jid || "")) configPath = join("./Sessions", "config.json")
    else configPath = join("./Sessions/SubBot", senderBotNumber, "config.json")

    if (configPath && fs.existsSync(configPath)) {
      try {
        const botConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"))
        if (botConfig?.name) botNameToShow = botConfig.name
        if (botConfig?.banner) bannerUrl = botConfig.banner
      } catch {}
    }

    const infoUser = [
      "─┈➤ 👤 *`المستخدم`*",
      `𔓕 *الاسم*    : ${name}`,
      `𔓕 *المنشن*   : ${tagUser}`,
      `𔓕 *التسجيل*  : ${isRegistered ? "✅ مسجّل" : "❌ غير مسجّل"}`
    ].join("\n")

    const infoBot = [
      "╭──┈ 𓆩⚡𓆪 *`𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏`* 𓆩⚡𓆪",
      `│ 🤖 *الاسم*    : ${botNameToShow}`,
      `│ 👑 *النوع*    : ${botType}`,
      `│ 🔣 *البادئة*  : ${usedPrefix}`,
      `│ ⏱️ *التشغيل*  : ${uptime}`,
      `│ 🕐 *الساعة*   : ${time}`,
      `│ 📅 *التاريخ*  : ${date}`,
      "╰─━─━─━─━─━─━─━─━─━─━─━─━─━─━─━─━─━─━─━─"
    ].join("\n")

    const menuText = [
      `أهلاً بيك يا *${tagUser}* 👋`,
      `منوّر بوت *${botNameToShow}* 🔥`,
      `_« اتفرج على كل الأوامر اللي تحت »_`,
      ``,
      infoUser,
      ``,
      infoBot,
      ``,
      ` 📢 *\`القناة الرسمية\`*`,
      `🔗 ${channelUrl}`
    ].join("\n")

    const thumbBuffer = await getBufferFromUrl(bannerUrl).catch(() => null)

    let media = null
    if (thumbBuffer) {
      try {
        media = await prepareWAMessageMedia(
          { image: thumbBuffer },
          { upload: conn.waUploadToServer }
        )
      } catch (e) {
        console.error('خطأ في تحضير وسائط القائمة:', e)
        media = null
      }
    }

    const sections = [
      {
        title: "👑 أوامر المالك",
        highlight_label: "👑",
        rows: [
          { title: "منيو المالك", description: "الأوامر الخاصة بصاحب البوت", id: `${usedPrefix}menuowner` }
        ]
      },
      {
        title: "📂 أقسام الأوامر",
        highlight_label: "🔥",
        rows: [
          { title: "منيو الجروبات", description: "أوامر إدارة الجروبات", id: `${usedPrefix}menugrupo` },
          { title: "منيو التحميل", description: "تحميل الفيديوهات والصور والأغاني", id: `${usedPrefix}menudescargas` },
          { title: "منيو الترفيه", description: "ألعاب وترفيه وضحك", id: `${usedPrefix}menufun` },
          { title: "منيو الجاتشا", description: "شخصيات ووايفو وجاتشا", id: `${usedPrefix}menugacha` },
          { title: "منيو الذكاء الاصطناعي", description: "شات جي بي تي وجيميني والرسم", id: `${usedPrefix}menuia` },
          { title: "منيو الأدوات", description: "أدوات وخدمات مفيدة", id: `${usedPrefix}menuherramientas` },
          { title: "منيو الأنمي", description: "صور وأنمي ووايفو", id: `${usedPrefix}menuanime` }
        ]
      }
    ]

    const nativeFlowPayload = {
      body: { text: `𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪` },
      footer: { text: menuText },
      header: media ? {
        title: `𓆩⚡𓆪 ${botNameToShow} 𓆩⚡𓆪`,
        subtitle: `👤 ${name} • ⏱ ${uptime}`,
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      } : undefined,
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "📜 كل الأقسام",
              sections
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({ display_text: "🚀 سرعة البوت", id: `${usedPrefix}ping` })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({ display_text: "📝 تسجيل", id: `${usedPrefix}reg` })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({ display_text: "📢 القناة", url: channelUrl, merchant_url: channelUrl })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({ display_text: "📜 كل الأوامر", id: `${usedPrefix}allmenu` })
          }
        ],
        messageParamsJson: JSON.stringify({
          bottom_sheet: {
            list_title: "🐢 كل القوائم",
            button_title: "🍄 القوائم",
            in_thread_buttons_limit: 2,
            divider_indices: [1, 2, 3, 999]
          }
        })
      },
      contextInfo: { mentionedJid: [m.sender], forwardingScore: 777, isForwarded: true }
    }

    await conn.relayMessage(
      m.chat,
      { viewOnceMessage: { message: { interactiveMessage: nativeFlowPayload } } },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    await m.reply(`Error: ${e?.message || e}`)
  }
}

handler.command = ["help", "menu", "m"]
export default handler
