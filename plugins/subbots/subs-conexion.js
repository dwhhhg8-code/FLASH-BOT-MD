import { useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'
import NodeCache from 'node-cache'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import pino from 'pino'
import chalk from 'chalk'
import { open } from 'lmdb'
import { makeWASocket } from '../../lib/simple.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PAIRING_CODE_TTL_MS = 45000

const lmdbPath = path.resolve(process.cwd(), 'database/lmdb_store')
if (!fs.existsSync(path.dirname(lmdbPath))) {
  fs.mkdirSync(path.dirname(lmdbPath), { recursive: true })
}
const dbLmdb = open({
  path: lmdbPath,
  compression: true
})

const BANNER_URL = 'https://files.catbox.moe/owpjte.jpg'


const rtx2 = `❐ *_تنصيب بكود من 8 أرقام_*
✩ استخدم الكود ده عشان تبقى *بوت فرعي* مؤقت.
✦ الخطوات:
1 » اضغط ⋮ فوق على اليمين
2 » روح لـ *الأجهزة المرتبطة*
3 » اربط بـ *رقم الهاتف*
4 » اكتب *الكود*`

function resolveExistingModule(...relativePaths) {
  for (const relativePath of relativePaths) {
    const fullPath = path.resolve(__dirname, relativePath)
    if (fs.existsSync(fullPath)) return pathToFileURL(fullPath).href
  }
  return null
}

function getNoopHandlerModule() {
  return {
    handler: async () => {}
  }
}

async function loadHandlerModule(cacheBust = false) {
  const handlerUrl = resolveExistingModule(
    '../../src/handler.js'
  )

  if (!handlerUrl) {
    console.warn('[SUB-BOT] لم يتم العثور على Handler.js; سيتم الاتصال فقط مع Connection.update/creds.update.')
    return getNoopHandlerModule()
  }

  try {
    const url = cacheBust ? `${handlerUrl}?update=${Date.now()}` : handlerUrl
    const handlerModule = await import(url)
    if (typeof handlerModule?.handler === 'function') return handlerModule
  } catch (e) {
    console.error('[SUB-BOT] فشل في تحميل Handler.js:', e)
  }

  return getNoopHandlerModule()
}

const subBotOptions = {}
if (!(global.conns instanceof Array)) global.conns = []

function isActiveConnection(sock) {
  return sock?.user && sock.ws?.readyState !== 3 && sock.ws?.readyState !== undefined
}

function cleanStaleConns() {
  if (!Array.isArray(global.conns)) return
  for (let i = global.conns.length - 1; i >= 0; i--) {
    const sock = global.conns[i]
    if (!sock || (!sock.user && (!sock.ws || sock.ws.readyState === 3))) {
      try { sock?.ev?.removeAllListeners() } catch {}
      try { sock?.ws?.close() } catch {}
      global.conns.splice(i, 1)
    }
  }
}

function isSubBotConnected(jid) {
  if (!jid) return false
  const user = jid.split('@')[0]
  return global.conns.some(sock => sock?.user?.jid && sock.user.jid.split('@')[0] === user)
}

function normalizePhoneNumber(value) {
  return String(value || '').replace(/\D/g, '')
}

function extractPhone(jid = '') {
  return String(jid || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '')
}

function isLidConverted(jid) {
  if (!jid || !jid.endsWith('@s.whatsapp.net')) return false
  const number = jid.replace('@s.whatsapp.net', '')
  if (number.length > 14) return true
  const codes = ["1","7","20","27","30","31","32","33","34","36","39","40","41","43","44","45","46","47","48","49","51","52","53","54","55","56","57","58","60","61","62","63","64","65","66","81","82","84","86","90","91","92","93","94","95","98","212","213","216","218","220","221","234","249","254","255","256","260","263","351","352","353","354","355","356","357","358","359","370","371","372","373","374","375","376","377","378","380","381","382","383","385","386","387","389","420","421","423","852","853","855","856","880","886","960","961","962","963","964","965","966","967","968","970","971","972","973","974","975","976","977","992","993","994","995","996","998"]
  for (const c of codes) {
    if (number.startsWith(c) && number.length >= c.length + 6 && number.length <= c.length + 12) return false
  }
  return true
}

function resolveAnyLidToJid(jid, participants = []) {
  if (!jid || !participants.length) return jid
  const lidNumber = jid.replace(/@.*$/, '')
  const lidFormat = lidNumber + '@lid'
  for (const p of participants) {
    let pLid = '', pJid = ''
    if (p.lid && p.lid.endsWith('@lid')) { pLid = p.lid; pJid = p.id || p.jid || '' }
    else if (p.phoneNumber) { pLid = p.id || ''; pJid = p.phoneNumber }
    else if (p.id && p.id.endsWith('@lid')) { pLid = p.id; pJid = p.jid || '' }
    else { pLid = p.lid || ''; pJid = p.id || p.jid || '' }
    const pLidNum = pLid.replace('@lid', '')
    if (pLid === lidFormat || pLid === jid || pLidNum === lidNumber) {
      if (pJid && !pJid.endsWith('@lid') && !isLidConverted(pJid)) return pJid
    }
  }
  return jid
}

const _lidCache = new Map()

async function resolveSenderToPhone(sender, m, conn) {
  if (!sender) return ''
  if (!sender.endsWith('@lid')) return extractPhone(sender)
  const cached = _lidCache.get(sender)
  if (cached && !cached.endsWith('@lid')) {
    return extractPhone(cached)
  }

  try {
    const repo = conn.signalRepository || conn.repository
    if (repo?.lidMapping?.getPNForLID) {
      const pn = await repo.lidMapping.getPNForLID(sender)
      if (pn && !pn.endsWith('@lid') && !isLidConverted(pn)) {
        _lidCache.set(sender, pn)
        return extractPhone(pn)
      }
    }
  } catch {}

  try {
    if (conn.store?.contacts) {
      for (const [pnJid, contact] of Object.entries(conn.store.contacts)) {
        if (contact.lid === sender || contact.id === sender) {
          if (pnJid && !pnJid.endsWith('@lid') && !isLidConverted(pnJid) && pnJid !== 'status@broadcast') {
            _lidCache.set(sender, pnJid)
            return extractPhone(pnJid)
          }
        }
      }
    }
  } catch {}

  const chatJid = m?.chat || m?.key?.remoteJid
  if (chatJid && chatJid.endsWith('@g.us')) {
    try {
      const metadata = await conn.groupMetadata(chatJid).catch(() => null)
      if (metadata?.participants) {
        const resolved = resolveAnyLidToJid(sender, metadata.participants)
        if (resolved && resolved !== sender && !resolved.endsWith('@lid')) {
          _lidCache.set(sender, resolved)
          return extractPhone(resolved)
        }
      }
    } catch {}
  }

  return ''
}

function getPairingPhoneNumber(m, args, fallbackJid) {
  const explicitArg = (args || []).find(arg => {
    const value = String(arg || '').trim()
    if (/^(--code|code)$/i.test(value)) return false
    return normalizePhoneNumber(value).length >= 8
  })

  const explicitNumber = normalizePhoneNumber(explicitArg)
  if (explicitNumber) return explicitNumber

  let number =
    extractPhone(fallbackJid) ||
    extractPhone(m?.sender) ||
    extractPhone(m?.key?.participant) ||
    extractPhone(m?.participant)

  return number
}

async function sendPairingInteractiveImage(conn, chatId, { bodyText, code, imageUrl }, quoted) {
  let imageMessageHeader = {}

  try {
    const media = await prepareWAMessageMedia(
      { image: { url: imageUrl } },
      { upload: conn.waUploadToServer }
    )
    if (media?.imageMessage) {
      imageMessageHeader = {
        header: {
          hasMediaAttachment: true,
          imageMessage: media.imageMessage
        }
      }
    }
  } catch (e) {
    console.error('تعذر تحميل الصورة للرأس:', e)
  }

  const buttons = [
    {
      name: 'cta_copy',
      buttonParamsJson: JSON.stringify({
        display_text: 'نسخ الكود',
        copy_code: code || '',
        has_multiple_buttons: true
      })
    }
  ]

  const params = {
    bottom_sheet: {
      in_thread_buttons_limit: 1,
      divider_indices: [1],
      list_title: 'خيارات',
      button_title: 'افتح'
    },
    tap_target_configuration: {
      title: 'كود تنصيب البوت الفرعي',
      description: 'تنصيب البوت الفرعي',
      canonical_url: 'https://whatsapp.com',
      domain: 'whatsapp.com',
      button_index: 0
    }
  }

  const interactiveMessage = {
    ...imageMessageHeader,
    body: {
      text: bodyText || ' '
    },
    nativeFlowMessage: {
      messageParamsJson: JSON.stringify(params),
      buttons
    }
  }

  const content = {
    viewOnceMessage: {
      message: {
        interactiveMessage
      }
    }
  }

  const userJid = conn?.user?.id || conn?.user?.jid
  const msg = generateWAMessageFromContent(chatId, content, { userJid, quoted })
  await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id })
  return msg
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('⌗ أمر التنصيب شغال في الجروبات بس.')
  const isEnabled = await dbLmdb.get('setting_jadibotmd')
  if (isEnabled === false) return m.reply(`ꕥ تم تعطيل الأمر *${command}* مؤقتًا.`)

  const now = Date.now()
  const isCodeCommand = command === 'code'
  const cooldownMs = isCodeCommand ? 60000 : 120000

  const userKey = `user_${m.sender}`
  const userData = (await dbLmdb.get(userKey)) || {}
  const lastUse = isCodeCommand ? (userData.lastCodeRequest || 0) : (userData.Subs || 0)
  const remaining = cooldownMs - (now - lastUse)

  if (remaining > 0) {
    const retryMsg = isCodeCommand
      ? `يجب عليك الانتظار حتى يستخدم ${msToTime(remaining)} *${usedPrefix}code* مرة أخرى.`
      : `يجب عليك الانتظار ${msToTime(remaining)} لإعادة ربط *الروبوت الفرعي.*`
    return conn.reply(m.chat, retryMsg, m)
  }

  cleanStaleConns()
  const socklimit = global.conns.filter(isActiveConnection).length
  if (socklimit >= 10) return m.reply('ꕥ لم يتم العثور على مساحات *المقابس* المتوفرة.')

  const mentionedJid = m.mentionedJid || []
  const who = mentionedJid[0] || m.sender
  let pairingNumber = await resolveSenderToPhone(who, m, conn)

  if (!pairingNumber && who.endsWith('@lid')) {
    const argNumber = args.find(a => normalizePhoneNumber(a).length >= 8)
    if (argNumber) {
      pairingNumber = normalizePhoneNumber(argNumber)
    } else {
      return conn.reply(m.chat, `ꕥ لم أتمكن من اكتشاف رقمك الحقيقي لأنك تستخدم جهازًا مقترنًا.\n\nاستخدم الأمر مثل هذا:\n*${usedPrefix}code <رقمك>*\n\nمثال: *${usedPrefix}code 573001234567*`, m)
    }
  }
  const id = pairingNumber || extractPhone(who)
  const jadiDir = global.jadi || 'Sessions/SubBot'
  const subBotPath = path.join(jadiDir, id)

  if (!fs.existsSync(subBotPath)) fs.mkdirSync(subBotPath, { recursive: true })

  subBotOptions.subBotPath = subBotPath
  subBotOptions.m = m
  subBotOptions.conn = conn
  subBotOptions.args = [...args]
  subBotOptions.usedPrefix = usedPrefix
  subBotOptions.command = command
  subBotOptions.pairingPhoneNumber = pairingNumber
  subBotOptions.fromCommand = true

  if (isCodeCommand) userData.lastCodeRequest = now
  else userData.Subs = now

  await dbLmdb.put(userKey, userData)

  await flashJadiBot(subBotOptions)
}

handler.help = ['code']
handler.tags = ['socket']
handler.command = ['code']
export default handler

export async function flashJadiBot(options) {
  let { subBotPath, m, conn, args, usedPrefix, command, pairingPhoneNumber } = options

  // التنصيب بالباير كود بس — QR ملغي
  command = 'code'
  if (!args[0] || !/^(--code|code)$/.test(args[0].trim())) args.unshift('code')

  const mcodeArg = (args[0] && /^(--code|code)$/.test(args[0].trim())) || (args[1] && /^(--code|code)$/.test(args[1].trim()))
  const mcode = options.command === 'code' || mcodeArg
  let txtCode

  if (mcodeArg) {
    if (args[0]) args[0] = args[0].replace(/^--code$|^code$/, '').trim()
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, '').trim()
    if (args[0] === '') args[0] = undefined
  }

  if (mcode && args[0] === undefined) {
    try { fs.rmSync(subBotPath, { recursive: true, force: true }) } catch {}
  }

  const pathCreds = path.join(subBotPath, 'creds.json')
  if (!fs.existsSync(subBotPath)) fs.mkdirSync(subBotPath, { recursive: true })

  try {
    if (args[0] !== undefined) {
      fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], 'base64').toString('utf-8')), null, '\t'))
    }
  } catch {
    conn.reply(m.chat, `ꕥ استخدم الأمر بشكل صحيح » ${usedPrefix + command}`, m)
    return
  }

  let version
  try {
    const latest = await fetchLatestBaileysVersion()
    version = latest?.version
  } catch (e) {
    console.error('[SUB-BOT] تعذر الحصول على الإصدار الأخير من WhatsApp Web:', e.message)
  }
  const msgRetryCounterCache = new NodeCache({ stdTTL: 3600, checkperiod: 120, useClones: false })
  const { state, saveCreds } = await useMultiFileAuthState(subBotPath)
  const connectionOptions = {
    logger: pino({ level: 'fatal' }),
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
    msgRetryCounterCache,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    ...(version ? { version } : {}),
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true,
    syncFullHistory: false,
    defaultQueryTimeoutMs: 60000,
    cachedGroupMetadata: async jid => sock?.chats?.[jid]?.metadata,
    getMessage: async key => sock?.chats?.[key.remoteJid]?.messages?.[key.id]?.message,
    keepAliveIntervalMs: 30000
  }

  let sock = makeWASocket(connectionOptions)
  sock.isInit = false
  sock.isPairingRequested = false
  let isInit = true

  async function sendPairingCode() {
    if (!mcode || sock.user || txtCode || sock.isPairingRequested) return false
    sock.isPairingRequested = true
    await delay(3000)
    try {
      const phoneNumber =
        (pairingPhoneNumber && normalizePhoneNumber(pairingPhoneNumber).length >= 8 ? pairingPhoneNumber : '') ||
        (await resolveSenderToPhone(m?.sender, m, conn)) ||
        (await resolveSenderToPhone(m?.key?.participant, m, conn)) ||
        (await resolveSenderToPhone(m?.participant, m, conn))
      if (!phoneNumber) throw new Error('تعذر اكتشاف رقم المستخدم لإنشاء الرمز.')

      const secret = await sock.requestPairingCode(phoneNumber)
      const formattedSecret = secret.match(/.{1,4}/g)?.join('-') || secret

      const bodyText = `${rtx2}

✧ الرقم المطلوب: +${phoneNumber}
✧ Código: *${formattedSecret}*

> Toca el botón de abajo para copiar tu código de vinculación.`

      txtCode = await sendPairingInteractiveImage(conn, m.chat, {
        bodyText,
        code: secret,
        imageUrl: BANNER_URL
      }, m)

      console.log(`[رمز الاقتران] ${phoneNumber}:${secret}`)

      if (txtCode?.key) setTimeout(() => conn.sendMessage(m.chat, { delete: txtCode.key }).catch(() => {}), PAIRING_CODE_TTL_MS)
      return true
    } catch (e) {
      console.error('خطأ في إنشاء رمز الاقتران:', e)
      sock.isPairingRequested = false
      await m.reply('⚠︎ لم يكن من الممكن إنشاء الكود في هذا الوقت. حاول ثانية.')
      return false
    }
  }

  async function connectionUpdate(update) {
    if (this !== sock) return
    const { connection, lastDisconnect, isNewLogin, qr } = update
    if (isNewLogin) sock.isInit = false

    if (await sendPairingCode()) return

    // QR ملغي — التنصيب بالكود بس
    if (qr && !mcode) return

    const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
    if (connection === 'close') {
      if (this._reconnectPending) return
      this._reconnectPending = true
      try {
      const subReconnectCount = sock._reconnectCount || 0
      if (subReconnectCount >= 20) {
        console.log(chalk.bold.redBright(`\n┆ وصلت الجلسة (+${path.basename(subBotPath)}) إلى الحد الأقصى من عمليات إعادة الاتصال. إعادة محاولة التنظيف...`))
        try { sock.ev.removeAllListeners() } catch {}
        try { sock.ws?.close() } catch {}
        const idx = global.conns.indexOf(sock)
        if (idx >= 0) global.conns.splice(idx, 1)
        return
      }
      const backoff = Math.min(3000 * Math.pow(2, subReconnectCount), 30000)
      sock._reconnectCount = subReconnectCount + 1

      if ([428, 408, 515, 500, 502].includes(reason)) {
        console.log(chalk.bold.magentaBright(`\n┆ انقطع الاتصال (+${path.basename(subBotPath)}), الرمز: ${reason}. جارٍ إعادة الاتصال في ${Math.round(backoff/1000)}s...`))
        await delay(backoff)
        await creloadHandler(true).catch(console.error)
        return
      }

      if (reason === 440) {
        console.log(chalk.bold.magentaBright(`\n┆ تم استبدال الاتصال (+${path.basename(subBotPath)}) بجلسة نشطة أخرى.`))
        return
      }

      if (reason === 405 || reason === 401 || reason === 403) {
        console.log(chalk.bold.magentaBright(`\n┆ تم إغلاق الجلسة (+${path.basename(subBotPath)}) أو تحتوي على بيانات اعتماد غير صالحة.`))
        try { sock.ev.removeAllListeners() } catch {}
        try { sock.ws?.close() } catch {}
        const idx = global.conns.indexOf(sock)
        if (idx >= 0) global.conns.splice(idx, 1)
        fs.rmSync(subBotPath, { recursive: true, force: true })
        return
      }

      await delay(backoff)
      return await creloadHandler(true).catch(console.error)
      } finally { this._reconnectPending = false }
    }

    if (connection === 'open') {
      sock._reconnectCount = 0
      await joinChannels(sock)
      await sock.newsletterFollow('120363410090342500@newsletter').catch(() => {})
      const userJid = sock.authState.creds.me.jid || `${path.basename(subBotPath)}@s.whatsapp.net`
      const userName = sock.authState.creds.me.name || 'مجهول'
      console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ ❍ ${userName} (+${path.basename(subBotPath)}) تم الاتصال بنجاح.\n│\n❒⸺⸺⸺【• متصل •】⸺⸺⸺❒`))
      sock.isInit = true
      if (!global.conns.includes(sock)) global.conns.push(sock)
      const targetChat = m?.chat || userJid
      const userSender = m?.sender || userJid
      await conn.sendMessage(targetChat, { text: isSubBotConnected(userSender) ? `> @${userSender.split('@')[0]}, ❐ لقد قمت بتسجيل _flash_ جديد *Sub-Bot* 👻` : `> ❀ لقد قمت بتسجيل *روبوت فرعي جديد!* [@${userSender.split('@')[0]}]`, mentions: [userSender] }, { quoted: m || null })
    }
  }

  let handlerModule = await loadHandlerModule()
  const creloadHandler = async function (restatConn) {
    try {
      const Handler = await loadHandlerModule()
      if (typeof Handler?.handler === 'function') handlerModule = Handler
    } catch (e) {
      console.error('⚠︎ خطأ عند إعادة تحميل المعالج:', e)
    }

    if (restatConn) {
      const oldChats = sock.chats
      const oldSock = sock
      const reconnectCount = sock._reconnectCount || 0
      try { sock.ev.removeAllListeners() } catch {}
      try { sock.end?.(new Error("Restarting")); sock.ws?.close() } catch {}
      sock = makeWASocket(connectionOptions, { chats: oldChats })
      sock._reconnectCount = reconnectCount
      const connectionIndex = global.conns.indexOf(oldSock)
      if (connectionIndex !== -1) global.conns[connectionIndex] = sock
      sock.isInit = false
      sock.isPairingRequested = false
      isInit = true
    }

    if (!isInit) {
      sock.ev.off('messages.upsert', sock.handler)
      sock.ev.off('connection.update', sock.connectionUpdate)
      sock.ev.off('creds.update', sock.credsUpdate)
    }

    const activeSocket = sock
    sock.handler = update => handlerModule.handler.call(activeSocket, update).catch(error => console.error('[SUB-BOT] خطأ في معالجة الرسائل:', error))
    sock.connectionUpdate = connectionUpdate.bind(sock)
    sock.credsUpdate = saveCreds.bind(sock, true)
    sock.ev.on('messages.upsert', sock.handler)
    sock.ev.on('connection.update', sock.connectionUpdate)
    sock.ev.on('creds.update', sock.credsUpdate)
    isInit = false
    return true
  }

  await creloadHandler(false)
  if (mcode) setTimeout(() => sendPairingCode().catch(console.error), 1500)
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  return `${minutes < 10 ? '0' + minutes : minutes} m y${seconds < 10 ? '0' + seconds : seconds} s `
}

async function joinChannels(sock) {
  for (const value of Object.values(global.ch || {})) {
    if (typeof value === 'string' && value.endsWith('@newsletter')) await sock.newsletterFollow(value).catch(() => {})
  }
}
