import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { WAMessageStubType } from '@whiskeysockets/baileys'
import { renderWelcomeCard, renderGoodbyeCard } from '../../lib/welcome-card.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const canalId = global.channelRD?.id || '120363410090342500@newsletter'
const canalName = global.channelRD?.name || 'فلاش بوت'
const BACKGROUND = 'https://u.pone.rs/glqjtzaj.jpg'
const LOCAL_BG = path.join(__dirname, '..', 'lib', 'Welcome-bg.jpg')
const LOCAL_AVATAR = path.join(__dirname, '..', 'lib', 'catalogo.jpg')

function extractUserId(rawUser) {
  if (!rawUser) return null
  let id = ''

  if (typeof rawUser === 'object' && rawUser !== null) {
    id = rawUser.phoneNumber || rawUser.id || rawUser.jid || ''
  } else if (typeof rawUser === 'string') {
    const trimmed = rawUser.trim()
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        id = parsed.phoneNumber || parsed.id || parsed.jid || trimmed
      } catch {
        id = trimmed
      }
    } else {
      id = trimmed
    }
  }

  if (!id || typeof id !== 'string') return null

  const cleanNum = id.split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
  if (cleanNum) {
    return `${cleanNum}@s.whatsapp.net`
  }
  return id.includes('@') ? id : `${id}@s.whatsapp.net`
}

export async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
  const targetNumber = (userId || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '') || (userId || '').split('@')[0] || 'usuario'
  const username = `@${targetNumber}`
  const groupName = groupMetadata?.subject || 'المجموعة'

  let profileUrl = null
  try {
    profileUrl = await conn.profilePictureUrl(userId, 'image')
  } catch (e) {
    profileUrl = fs.existsSync(LOCAL_AVATAR) ? LOCAL_AVATAR : null
  }

  const participantsCount = groupMetadata?.participants?.length || 0
  const groupSize = participantsCount + 1

  let imageSource
  try {
    imageSource = await renderWelcomeCard({
      backgroundUrl: BACKGROUND,
      avatarUrl: profileUrl,
      title: 'أهلاً',
      username,
      groupName,
      footerLine: `#${groupSize}`
    })
  } catch (err) {
    console.error('[مرحبًا] فشل عرض البطاقة, باستخدام الخلفية الاحتياطية:', err.message)
    imageSource = fs.existsSync(LOCAL_BG) ? fs.readFileSync(LOCAL_BG) : { url: BACKGROUND }
  }

  const fecha = new Date().toLocaleDateString('es-ES', { timeZone: 'America/Mexico_City', day: 'numeric', month: 'long', year: 'numeric' })
  const desc = groupMetadata?.desc?.toString() || 'لا يوجد وصف'
  const defaultWelcome = 'مرحبا بكم في الظلال! نرجو أن تكون إقامتك أسطورية.'

  const hasCustomWelcome = !!(chat?.sWelcome?.trim() || chat?.sBienvenida?.trim())
  const rawWelcome = hasCustomWelcome ? (chat.sWelcome || chat.sBienvenida) : defaultWelcome

  const mensaje = rawWelcome
    .replace(/@{usuario}/gi, `${username}`)
    .replace(/{usuario}/gi, `${username}`)
    .replace(/{user}/gi, `${username}`)
    .replace(/{grupo}/gi, `*${groupName}*`)
    .replace(/{group}/gi, `*${groupName}*`)
    .replace(/{desc}/gi, `${desc}`)
    .replace(/{miembros}/gi, `${groupSize}`)
    .replace(/{fecha}/gi, `${fecha}`)

  let caption
  if (hasCustomWelcome) {
    caption = mensaje
  } else {
    const formattedMensaje = mensaje.split('\n').join('\n> ')
    caption = `> ── ⚔️ *FLASH BOT* ⚔️ ──
> ​
> 🗡️ *UN NUEVO CONTRATISTA DESPIERTA*
> ​
> ◈ 👤 *Recluta:* ${username}
> ◈ 🏰 *Sector:* *${groupName}*
> ◈ 👥 *Fuerza total:* ${groupSize} unidades reunidas
> ◈ 📜 *الرسالة:* ${formattedMensaje}
> ◈ ⏳ *Registro:* ${fecha}
> ​
> ⛓️ _« I am atomic... The eminence in flash. »_`
  }

  return { imageSource, caption, mentions: [userId], hasCustom: hasCustomWelcome }
}

export async function generarDespedida({ conn, userId, groupMetadata, chat }) {
  const targetNumber = (userId || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '') || (userId || '').split('@')[0] || 'usuario'
  const username = `@${targetNumber}`
  const groupName = groupMetadata?.subject || 'المجموعة'

  let profileUrl = null
  try {
    profileUrl = await conn.profilePictureUrl(userId, 'image')
  } catch (e) {
    profileUrl = fs.existsSync(LOCAL_AVATAR) ? LOCAL_AVATAR : null
  }

  const participantsCount = groupMetadata?.participants?.length || 1
  const groupSize = Math.max(participantsCount - 1, 0)

  let imageSource
  try {
    imageSource = await renderGoodbyeCard({
      backgroundUrl: BACKGROUND,
      avatarUrl: profileUrl,
      title: 'الوداع',
      username,
      groupName,
      footerLine: `${groupSize} اليسار`
    })
  } catch (err) {
    console.error('[مرحبًا] فشل عرض البطاقة, باستخدام الخلفية الاحتياطية:', err.message)
    imageSource = fs.existsSync(LOCAL_BG) ? fs.readFileSync(LOCAL_BG) : { url: BACKGROUND }
  }

  const fecha = new Date().toLocaleDateString('es-ES', { timeZone: 'America/Mexico_City', day: 'numeric', month: 'long', year: 'numeric' })
  const desc = groupMetadata?.desc?.toString() || 'لا يوجد وصف'
  const defaultBye = 'لقد تخلى عن الأمر. نرجو أن ترشد الظلال طريقك الجديد.'

  const hasCustomBye = !!(chat?.sBye?.trim() || chat?.sGoodbye?.trim() || chat?.sDespedida?.trim())
  const rawBye = hasCustomBye ? (chat.sBye || chat.sGoodbye || chat.sDespedida) : defaultBye

  const mensaje = rawBye
    .replace(/@{usuario}/gi, `${username}`)
    .replace(/{usuario}/gi, `${username}`)
    .replace(/{user}/gi, `${username}`)
    .replace(/{grupo}/gi, `*${groupName}*`)
    .replace(/{group}/gi, `*${groupName}*`)
    .replace(/{desc}/gi, `*${desc}*`)
    .replace(/{miembros}/gi, `${groupSize}`)
    .replace(/{fecha}/gi, `${fecha}`)

  let caption
  if (hasCustomBye) {
    caption = mensaje
  } else {
    const formattedMensaje = mensaje.split('\n').join('\n> ')
    caption = `> ── ⚔️ *FLASH BOT* ⚔️ ──
> ​
> 🥀 *UNA SOMBRA SE HA DESVANECIDO*
> ​
> ◈ 👤 *Identificación:* ${username}
> ◈ 🏰 *Sector:* *${groupName}*
> ◈ 👥 *Fuerza restante:* ${groupSize} unidades
> ◈ 📜 *الرسالة:* ${formattedMensaje}
> ◈ ⏳ *Registro:* ${fecha}
> ​
> ⛓️ _« La oscuridad ha borrado todo su rastro. »_`
  }

  return { imageSource, caption, mentions: [userId], hasCustom: hasCustomBye }
}

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0

  const chat = global.db?.data?.chats?.[m.chat]
  if (chat && chat.welcome === false) return !0

  const primaryBot = chat?.primaryBot
  if (primaryBot) {
    const botNum = (conn.user?.jid || conn.user?.id || '').split('@')[0].split(':')[0]
    const primaryNum = primaryBot.split('@')[0].split(':')[0]
    if (botNum && primaryNum && botNum !== primaryNum) return !1
  }

  const rawUsers = Array.isArray(m.messageStubParameters)
    ? m.messageStubParameters
    : (m.messageStubParameters ? [m.messageStubParameters] : [])

  if (!rawUsers.length) return !0

  const isAdd = (
    m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD ||
    m.messageStubType == 27 ||
    m.messageStubType == 31
  )

  const isRemove = (
    m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
    m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE ||
    m.messageStubType == 28 ||
    m.messageStubType == 32
  )

  if (!isAdd && !isRemove) return !0

  for (const rawUser of rawUsers) {
    const userId = extractUserId(rawUser)
    if (!userId) continue

    console.log(`[مرحبًا] كعب الحدث=${m.messageStubType} على ${m.chat} مقابل ${userId}`)

    const contextInfo = {
      mentionedJid: [userId],
      isForwarded: true,
      forwardingScore: 0,
      forwardedNewsletterMessageInfo: {
        newsletterJid: canalId,
        serverMessageId: null,
        newsletterName: canalName
      }
    }

    if (isAdd) {
      try {
        const { imageSource, caption, mentions } = await generarBienvenida({ conn, userId, groupMetadata, chat })
        const opts = { caption, mentions, contextInfo }
        if (Buffer.isBuffer(imageSource)) {
          opts.image = imageSource
        } else if (imageSource?.url) {
          opts.image = imageSource
        }
        try {
          await conn.sendMessage(m.chat, opts, { quoted: null })
        } catch (imgErr) {
          console.warn('[مرحبًا] فشل إرسال الصور, وتم إرسال النص فقط:', imgErr.message)
          await conn.sendMessage(m.chat, { text: caption, mentions, contextInfo }, { quoted: null })
        }
        console.log('[مرحبًا] تم إرسال الترحيب بنجاح إلى', userId)
      } catch (err) {
        console.error('[مكون إضافي للترحيب] حدث خطأ أثناء إرسال الترحيب:', err)
      }
    } else if (isRemove) {
      try {
        const { imageSource, caption, mentions } = await generarDespedida({ conn, userId, groupMetadata, chat })
        const opts = { caption, mentions, contextInfo }
        if (Buffer.isBuffer(imageSource)) {
          opts.image = imageSource
        } else if (imageSource?.url) {
          opts.image = imageSource
        }
        try {
          await conn.sendMessage(m.chat, opts, { quoted: null })
        } catch (imgErr) {
          console.warn('[مرحبًا] فشل إرسال الصور, وتم إرسال النص فقط:', imgErr.message)
          await conn.sendMessage(m.chat, { text: caption, mentions, contextInfo }, { quoted: null })
        }
        console.log('[مرحبا] تم إرسال الوداع بنجاح إلى', userId)
      } catch (err) {
        console.error('[مكون إضافي للترحيب] حدث خطأ أثناء إرسال الوداع:', err)
      }
    }
  }

  return !0
}

export default handler
