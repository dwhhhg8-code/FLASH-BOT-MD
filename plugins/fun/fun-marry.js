import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { resolverObjetivo, nombreSeguro, resolveToRealJid, jidParaTag, normalizeJid } from '../../lib/anime-mention.js'
import { enviarReaccionAnime } from '../../lib/anime-media.js'

// Videos del matrimonio (tipo GIF)
const PROPOSE_VIDEO = 'https://u.pone.rs/cbytrubz.mp4' // video de la propuesta con botones
const ACCEPT_VIDEOS = [
  'https://u.pone.rs/cbytrubz.mp4',
  'https://u.pone.rs/anlnteir.mp4',
  'https://u.pone.rs/juruzpxb.mp4',
  'https://u.pone.rs/fgacpkse.mp4'
]

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const num = (jid) => String(jid || '').split('@')[0].replace(/[^0-9]/g, '')
// Token de mención (@userpart): el cliente lo pinta como tag con el nombre
const part = (jid) => String(jid || '').split('@')[0]

// ── Guardas de botones: solo la persona propuesta puede responder ─────
// Los botones quick_reply envían texto, por lo que CUALQUIERA del grupo
// podía presionarlos. Se registra cada propuesta (con su target) y se
// verifica que el que presiona SEA la persona a la que se le propuso,
// dentro de la ventana de 50 segundos.
const TTL_PROPOSAL_MS = 50000

const pendientesMarriage = () => {
  if (!global.pendingMarries) global.pendingMarries = new Map()
  return global.pendingMarries
}

const pendientesDivorcio = () => {
  if (!global.pendingDivorces) global.pendingDivorces = new Map()
  return global.pendingDivorces
}

// Identidades equivalentes de un JID (normalizado, formato del grupo y
// dígitos) para comparar a pesar de variantes LID/PN.
const idsDePersona = (conn, participants, groupMetadata, jid) => {
  const n = normalizeJid(jid, conn)
  return new Set([n, jidParaTag(jid, conn, participants, groupMetadata), num(n)].filter(Boolean))
}

const mismaPersona = (a, b, conn, participants, groupMetadata) => {
  const A = idsDePersona(conn, participants, groupMetadata, a)
  const B = idsDePersona(conn, participants, groupMetadata, b)
  return [...A].some((x) => B.has(x))
}

/**
 * Busca la propuesta activa para `suitorId` en este chat y verifica que
 * quien presionó el botón sea la persona propuesta (target).
 * @returns {{ok:true} | {ok:false, motivo:'inactive'|'locked'}}
 */
const validarRespuestaPropuesta = (m, conn, participants, groupMetadata, userId, suitorId) => {
  const mapa = pendientesMarriage()
  const presser = new Set()
  for (const j of [userId, m?.sender]) {
    for (const x of idsDePersona(conn, participants, groupMetadata, j)) presser.add(x)
  }

  let activa = null
  for (const [key, pend] of mapa) {
    if (pend.chat !== m.chat) continue
    if (!mismaPersona(pend.suitor, suitorId, conn, participants, groupMetadata)) continue
    if (Date.now() - pend.ts > TTL_PROPOSAL_MS) {
      mapa.delete(key)
      continue
    }
    activa = { key, pend }
    break
  }

  if (!activa) return { ok: false, motivo: 'inactive' }

  const targetIds = new Set()
  for (const j of [activa.pend.target, activa.pend.who]) {
    for (const x of idsDePersona(conn, participants, groupMetadata, j)) targetIds.add(x)
  }
  if (![...presser].some((x) => targetIds.has(x))) return { ok: false, motivo: 'locked' }

  mapa.delete(activa.key)
  return { ok: true }
}

export const __testMarry = { validarRespuestaPropuesta, idsDePersona, mismaPersona, pendientesMarriage, TTL_PROPOSAL_MS }

/**
 * يبعت رسالة تفاعلية بفيديو GIF في الهيدر + أزرار
 * quick_reply + menciones (via contextInfo del InteractiveMessage).
 */
async function sendVideoButtons(conn, m, { video, text, footer, buttons, mentions = [] }) {
  let headerMedia = {}
  try {
    const media = await prepareWAMessageMedia(
      { video: { url: video }, gifPlayback: true },
      { upload: conn.waUploadToServer }
    )
    if (media?.videoMessage) headerMedia.videoMessage = media.videoMessage
  } catch (e) {
    console.error('[الزواج] لم يتمكن من تحضير الفيديو:', e?.message)
  }

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({ text }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
          header: proto.Message.InteractiveMessage.Header.create({
            title: '💍 طلب الزواج',
            hasMediaAttachment: !!headerMedia.videoMessage,
            ...headerMedia
          }),
          contextInfo: { mentionedJid: mentions },
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: buttons.map(([label, id]) => ({
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({ display_text: label, id })
            }))
          })
        })
      }
    }
  }, { quoted: m, userJid: conn.user.id })

  return conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

const handler = async (m, { conn, command, usedPrefix, text, args, participants, groupMetadata }) => {
  const users = global.db.data.users
  const rcanal = typeof global.rcanal !== 'undefined' ? global.rcanal : {}
  const ctx = { conn, participants, groupMetadata, text, args }

  // Resuelve LIDs → JID real y devuelve variantes para buscar en la DB
  const resolveJid = (jid) => resolveToRealJid(jid, conn, participants, groupMetadata) || jid
  const jidVars = (...jids) => [...new Set(jids.filter(Boolean))]
  const marryOf = (uid, ...variants) => {
    for (const j of jidVars(uid, ...variants)) {
      const v = users[j]?.marry
      if (v) return v
    }
    return ''
  }

  const userId = resolveJid(m.sender)

  if (!users[userId]) users[userId] = {}

  if (command === 'divorce' || command === 'divorciarse') {
    const partnerRaw = marryOf(userId, m.sender)

    if (!partnerRaw) {
      return conn.sendMessage(
        m.chat,
        { text: '💔 أنت لست متزوجة من أحد في مملكة الظلال.', ...rcanal },
        { quoted: m }
      )
    }

    const partnerId = resolveJid(partnerRaw)
    const partnerTag = jidParaTag(partnerId, conn, participants, groupMetadata)
    const partnerName = await nombreSeguro(conn, partnerId)

    await conn.sendButton(
      m.chat,
      `هل أنت متأكد أنك تريد كسر اتفاقيتك مع *${partnerName}* @${part(partnerTag)}؟`,
      'فلاش بوت',
      null,
      [
        ['نعم, احصل على الطلاق', `${usedPrefix}confirmdivorce`],
        ['NO', `${usedPrefix}canceldivorce`]
      ],
      null,
      null,
      m,
      { mentions: [partnerTag] }
    )

    // بس اللي طلب الطلاق هو اللي يقدر يأكّده
    pendientesDivorcio().set(`${m.chat}|${userId}`, Date.now())

    return
  }

  if (command === 'confirmdivorce') {
    // 🔒 بس اللي طلب الطلاق يقدر يأكّد (وفي وقت قصير)
    const claveDiv = `${m.chat}|${userId}`
    const tDiv = pendientesDivorcio().get(claveDiv)
    if (!tDiv || Date.now() - tDiv > 120000) {
      return m.reply('⌛ هذا التأكيد لم يعد نشطًا. استخدم #divorce مرة أخرى.')
    }
    pendientesDivorcio().delete(claveDiv)

    const partnerRaw = marryOf(userId, m.sender)
    if (!partnerRaw) return

    const partnerId = resolveJid(partnerRaw)

    // Limpiar ambos lados (variantes raw y resuelta por compatibilidad)
    for (const j of jidVars(userId, m.sender)) {
      if (users[j]) users[j].marry = ''
    }
    for (const j of jidVars(partnerId, partnerRaw)) {
      if (users[j]) users[j].marry = ''
    }

    const name1 = await nombreSeguro(conn, userId)
    const name2 = await nombreSeguro(conn, partnerId)
    const userTagDiv = jidParaTag(userId, conn, participants, groupMetadata)
    const partnerTagDiv = jidParaTag(partnerId, conn, participants, groupMetadata)

    return conn.sendMessage(
      m.chat,
      {
        text: `💔 تم انتهاك الاتفاقية.\n\n*${name1}* @${part(userTagDiv)} و *${name2}* @${part(partnerTagDiv)} لم يعدا متحدين.`,
        mentions: [userTagDiv, partnerTagDiv],
        ...rcanal
      },
      { quoted: m }
    )
  }

  if (command === 'marry' || command === 'casarse') {
    // Resuelve: mención → citado → número escrito (maneja LIDs correctamente)
    const { who, via } = await resolverObjetivo(m, ctx)

    if (via === 'self') {
      return conn.sendMessage(
        m.chat,
        {
          text: '💍 اذكر أو رد على الشخص الذي تريد إبرام العهد معه.',
          ...rcanal
        },
        { quoted: m }
      )
    }

    const partnerId = resolveJid(who)

    if (num(partnerId) === num(userId)) {
      return m.reply('🌌 لا يمكنك الزواج من ظلك.')
    }

    if (!users[partnerId]) users[partnerId] = {}

    const nameSuitor = await nombreSeguro(conn, userId)
    const nameTarget = await nombreSeguro(conn, partnerId)
    // JIDs en el formato que el grupo usa (LID en grupos LID): así el
    // cliente pinta el tag con el nombre en vez de mostrar el LID crudo
    const userTag = jidParaTag(userId, conn, participants, groupMetadata)
    const partnerTag = jidParaTag(partnerId, conn, participants, groupMetadata)

    if (marryOf(userId, m.sender)) {
      const current = resolveJid(marryOf(userId, m.sender))
      const currentTag = jidParaTag(current, conn, participants, groupMetadata)
      const currentName = await nombreSeguro(conn, current)
      return conn.sendMessage(
        m.chat,
        {
          text: `⚠️ أنت متزوج بالفعل من *${currentName}* @${part(currentTag)}.`,
          mentions: [currentTag],
          ...rcanal
        },
        { quoted: m }
      )
    }

    if (marryOf(partnerId, who)) {
      return conn.sendMessage(
        m.chat,
        {
          text: `⚠️ *${nameTarget}* @${part(partnerTag)} لديه بالفعل اتفاق مع شخص آخر.`,
          mentions: [partnerTag],
          ...rcanal
        },
        { quoted: m }
      )
    }

    // Propuesta con video tipo GIF + botones + tags con nombre
    // (mentionedJid con el JID del grupo → el cliente renderiza @nombre)
    await sendVideoButtons(conn, m, {
      video: PROPOSE_VIDEO,
      text: `💒 *${nameSuitor}* @${part(userTag)} يقترح الزواج الأبدي على *${nameTarget}* @${part(partnerTag)}.\n\nهل توافق على إبرام هذه الاتفاقية, ${nameTarget}؟ 💍`,
      footer: 'لديك 50 ثانية.',
      buttons: [
        ['أقبل 💍', `${usedPrefix}acceptmarry ${userId}`],
        ['رفض ❌', `${usedPrefix}declinemarry ${userId}`]
      ],
      mentions: [userTag, partnerTag]
    })

    // Registrar la propuesta: solo la persona propuesta podrá responder
    pendientesMarriage().set(`${m.chat}|${userId}|${partnerId}`, {
      chat: m.chat,
      suitor: userId,
      target: partnerId,
      who,
      ts: Date.now()
    })

    setTimeout(async () => {
      const clave = `${m.chat}|${userId}|${partnerId}`
      if (pendientesMarriage().has(clave)) pendientesMarriage().delete(clave)
      if (users[userId] && !users[userId].marry) {
        const nameSuitor2 = await nombreSeguro(conn, userId)
        const userTagExp = jidParaTag(userId, conn, participants, groupMetadata)
        conn.sendMessage(
          m.chat,
          {
            text: `🥀 *${nameSuitor2}* @${part(userTagExp)}, لقد وقفت... لقد انتهى الوقت.`,
            mentions: [userTagExp],
            ...rcanal
          },
          { quoted: m }
        )
      }
    }, 50000)

    return
  }

  if (command === 'acceptmarry') {
    const suitorRaw =
      text?.split(' ')[0] ||
      m.quoted?.sender ||
      m.message?.extendedTextMessage?.contextInfo?.participant

    if (!suitorRaw) return

    const suitorId = resolveJid(suitorRaw)

    // 🔒 بس الشخص اللي اتعرض عليه يقدر يقبل
    const validacion = validarRespuestaPropuesta(m, conn, participants, groupMetadata, userId, suitorId)
    if (!validacion.ok) {
      return m.reply(
        validacion.motivo === 'locked'
          ? '🔒 فقط الشخص المقترح يمكنه قبول هذا الاقتراح أو رفضه.'
          : '⌛ هذا الاقتراح لم يعد فعالا.'
      )
    }

    if (!users[suitorId]) users[suitorId] = {}

    if (marryOf(userId, m.sender) || marryOf(suitorId, suitorRaw)) {
      return m.reply('⚠️أحدهما متزوج بالفعل.')
    }

    users[userId].marry = suitorId
    users[suitorId].marry = userId

    const nameSuitor = await nombreSeguro(conn, suitorId)
    const nameTarget = await nombreSeguro(conn, userId)
    const suitorTag = jidParaTag(suitorId, conn, participants, groupMetadata)
    const userTag = jidParaTag(userId, conn, participants, groupMetadata)

    // Video tipo GIF aleatorio al aceptar
    return conn.sendMessage(
      m.chat,
      {
        video: { url: pick(ACCEPT_VIDEOS) },
        gifPlayback: true,
        caption: `💒 『☽』 لقد أبرمت الظلال الاتفاق.\n\n*${nameSuitor}* @${part(suitorTag)} و *${nameTarget}* @${part(userTag)} متزوجان الآن.\n\n🎉🥳 *تحيا عرائس NJD!*`,
        mentions: [suitorTag, userTag],
        ...rcanal
      },
      { quoted: m }
    )
  }

  if (command === 'declinemarry') {
    const suitorRaw =
      text?.split(' ')[0] ||
      m.quoted?.sender ||
      m.message?.extendedTextMessage?.contextInfo?.participant

    if (!suitorRaw) return

    const suitorId = resolveJid(suitorRaw)

    // 🔒 بس الشخص اللي اتعرض عليه يقدر يرفض
    const validacion = validarRespuestaPropuesta(m, conn, participants, groupMetadata, userId, suitorId)
    if (!validacion.ok) {
      return m.reply(
        validacion.motivo === 'locked'
          ? '🔒 فقط الشخص المقترح يمكنه قبول هذا الاقتراح أو رفضه.'
          : '⌛ هذا الاقتراح لم يعد فعالا.'
      )
    }

    const nameSuitor = await nombreSeguro(conn, suitorId)
    const nameTarget = await nombreSeguro(conn, userId)
    const suitorTag = jidParaTag(suitorId, conn, participants, groupMetadata)
    const userTag = jidParaTag(userId, conn, participants, groupMetadata)
    const caption = `💔 *${nameTarget}* @${part(userTag)} رفض *${nameSuitor}* @${part(suitorTag)} عند المذبح.`

    // Usa los GIFs del sistema sad (mismo que el comando #sad)
    try {
      await enviarReaccionAnime(conn, m, { reaccion: 'sad', caption, mentions: [suitorTag, userTag] })
    } catch (e) {
      console.error('[الزواج] لا يمكن إرسال صورة GIF حزينة:', e?.message)
      await conn.sendMessage(
        m.chat,
        { text: caption, mentions: [suitorTag, userTag], ...rcanal },
        { quoted: m }
      )
    }

    return
  }
}

handler.help = ['marry @tag', 'divorce']
handler.tags = ['fun']
handler.command = [
  'marry',
  'casarse',
  'divorce',
  'divorciarse',
  'confirmdivorce',
  'acceptmarry',
  'declinemarry'
]

handler.group = true

export default handler
