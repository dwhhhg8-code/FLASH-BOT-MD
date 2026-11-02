process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './settings.js'
import '../plugins/sistema/_fakes.js'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn, execSync } from 'child_process'
import lodash from 'lodash'
import { flashJadiBot } from '../plugins/subbots/subs-conexion.js'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import os from 'os'
import { format } from 'util'
import boxen from 'boxen'
import pino from 'pino'
import Pino from 'pino'
import path, { join, dirname } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from '../lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import { mongoDB, mongoDBV2 } from '../lib/mongoDB.js'
import store from '../lib/store.js'
import { proto } from '@whiskeysockets/baileys'
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { Browsers, DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys')
import readline, { createInterface } from 'readline'
import NodeCache from 'node-cache'
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const pairingRetryLimit = 40
const pairingRetryDelay = 5000

let { say } = cfonts

function showStartupDesign() {
  console.clear()
  say('فلاش بوت', {
    font: 'block',
    align: 'center',
    colors: ['cyan', 'magenta'],
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
  })
  say(`فلاش بوت • v${global.vs?.replace('^', '') || '1.0.0'}`, {
    font: 'console',
    align: 'center',
    colors: ['magenta', 'cyan'],
  })
  console.log('\n' + boxen(
    chalk.cyanBright.bold('  ✦ النظام جاهز للبدء ✦\n\n') +
    chalk.white('  البوت        ') + chalk.magenta('فلاشبوت\n') +
    chalk.white('  المنصة       ') + chalk.magenta('واتساب متعدد الأجهزة\n') +
    chalk.white('  المطور       ') + chalk.magenta(`${global.dev || 'haitham'}\n`) +
    chalk.white('Node.js') + chalk.magenta(process.version),
    {
      padding: { top: 0, bottom: 1, left: 2, right: 3 },
      margin: { left: 2, right: 2 },
      borderStyle: 'double',
      borderColor: 'cyan',
      title: chalk.cyan.bold(' ✦ 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 ✦ '),
      titleAlignment: 'center',
    }
  ) + '\n')
}

function showLoginMenu() {
  console.log(boxen(
    chalk.yellowBright.bold('  طريقة تسجيل الدخول:\n\n') +
    chalk.cyan.bold('  ➜ رمز الربط من 8 أرقام ') + chalk.gray('(اربطه برقمك)'),
    {
      padding: 1,
      margin: { left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'magenta',
      title: chalk.magenta.bold(' 🚀 تسجيل الدخول '),
      titleAlignment: 'center',
    }
  ) + '\n')
}

showStartupDesign()
protoType()
serialize()

fs.mkdirSync('tmp', { recursive: true });
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
return path.dirname(global.__filename(pathURL, true))
}; global.__require = function require(dir = import.meta.url) {
return createRequire(dir)
}

global.timestamp = {start: new Date}
const __dirname = global.__dirname(import.meta.url)
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#!./]')

global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('database.json'))
global.DATABASE = global.db; 
global.loadDatabase = async function loadDatabase() {
if (global.db.data !== null) return global.db.data
if (global.db._readPromise) return global.db._readPromise
global.db._readPromise = (async () => {
await global.db.read()
global.db.data = {
users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {},
...(global.db.data || {}),
}
global.db.chain = chain(global.db.data)
return global.db.data
})()
try { return await global.db._readPromise }
finally { global.db._readPromise = null }
}
await loadDatabase()

const sessionCredsPath = join(global.sessions, 'creds.json')
if (existsSync(sessionCredsPath)) {
try {
const sessionCreds = JSON.parse(readFileSync(sessionCredsPath, 'utf8'))
if (sessionCreds?.registered !== true) {
rmSync(global.sessions, { recursive: true, force: true })
console.log(chalk.yellowBright('\n⚠ تم حذف جلسة الربط غير المكتملة. بدء ارتباط جديد...\n'))
}
} catch {
rmSync(global.sessions, { recursive: true, force: true })
}
}

const { state, saveCreds: _initialSaveCreds } = await useMultiFileAuthState(global.sessions)
let saveCreds = _initialSaveCreds
async function refreshPrincipalAuth() {
try {
const fresh = await useMultiFileAuthState(global.sessions)
state.creds = fresh.state.creds
state.keys = fresh.state.keys
saveCreds = fresh.saveCreds
connectionOptions.auth.creds = state.creds
connectionOptions.auth.keys = makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" }))
if (global.conn) global.conn.credsUpdate = saveCreds.bind(global.conn, true)
} catch {}
}
let currentBaileysVersion
try {
const latestBaileys = await fetchLatestBaileysVersion()
currentBaileysVersion = latestBaileys.version
console.log(chalk.gray(`[ Baileys ] إصدار الويب: ${currentBaileysVersion.join('.')}`))
} catch (error) {
console.log(chalk.gray(`[Baileys] استخدام الإصدار المتكامل: ${error.message}`))
}
const msgRetryCounterMap = new Map()
const msgRetryCounterCache = new NodeCache({ stdTTL: 3600, checkperiod: 120, useClones: false })
const userDevicesCache = new NodeCache({ stdTTL: 300, checkperiod: 120, useClones: false })
let phoneNumber = process.env.BOT_NUMBER || process.env.PHONE_NUMBER || global.botNumber
const methodCode = process.argv.includes("code") || process.argv.includes("--code")
const MethodMobile = process.argv.includes("mobile") || process.argv.includes("--mobile")
const colors = chalk.bold.white
const qrOption = chalk.blueBright
const textOption = chalk.cyan
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))
// الدخول بالباير كود بس — QR ملغي
let opcion = '2'
if (!fs.existsSync(`./${sessions}/creds.json`)) {
showLoginMenu()
if (process.stdin.isTTY) {
do {
opcion = await question(chalk.magentaBright('➤ اضغط ENTER لتكمل (الرمز من 8 أرقام):'))
if (!/^(1|2)?$/.test(opcion)) {
console.log(chalk.bold.redBright(`الطريقة الوحيدة هي الرمز من 8 أرقام.`))
}} while (!/^(1|2)?$/.test(opcion))
opcion = '2'
}
} 

console.info = () => { }

const connectionOptions = {
logger: pino({ level: 'silent' }),
printQRInTerminal: false,
mobile: MethodMobile,
browser: ['Ubuntu', 'Chrome', '20.0.04'],
...(currentBaileysVersion ? { version: currentBaileysVersion } : {}),
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
},
 markOnlineOnConnect: false,
generateHighQualityLinkPreview: true, 
syncFullHistory: false,
getMessage: async (key) => {
try {
let jid = jidNormalizedUser(key.remoteJid);
let msg = global.conn?.chats?.[jid]?.messages?.[key.id]
return msg?.message
} catch (error) {
return undefined
}},
msgRetryCounterCache: msgRetryCounterCache || new Map(),
userDevicesCache: userDevicesCache || new Map(),
defaultQueryTimeoutMs: 60000,
cachedGroupMetadata: async (jid) => globalThis.conn?.chats?.[jid]?.metadata,
keepAliveIntervalMs: 45000, 
maxIdleTimeMs: 120000, 
}

let reloadHandlerImpl
global.reloadHandler = async (...args) => {
while (!reloadHandlerImpl) await delay(100)
return reloadHandlerImpl(...args)
}

function resetPairingState() {
delete state.creds.me
delete state.creds.pairingCode
delete state.creds.pairingEphemeralKeyPair
global._pairingCodeIssued = false
global._pairingRequestStarted = false
global._pairingCodePromise = null
global._pairingRequested = false
}

async function requestPairingCodeOnce() {
if (global._pairingCodePromise) return global._pairingCodePromise
global._pairingCodePromise = (async () => {
global._pairingRequestStarted = true
global._pairingRequested = true
console.log(chalk.cyanBright(`\n📱 طلب رمز الربط لـ +${global._pairingNumber}...`))
for (let attempt = 0; attempt < 30; attempt++) {
try {
 if (state.creds.registered || global.conn?.user?.id || global._pairingCodeIssued) return
let codeBot = await global.conn.requestPairingCode(global._pairingNumber)
codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
global._pairingCodeIssued = true
 console.log('\n' + boxen(
   chalk.magentaBright.bold('✦ رمز الاقتران ✦\n\n') +
   chalk.white('أدخل هذا الرمز في واتساب:\n\n') +
   chalk.bgMagenta.white.bold(`       ${codeBot}       `) +
     chalk.gray('\n\n إذا أغلق واتساب القناة, سيتم إنشاء رمز آخر.'),
   {
     padding: { top: 0, bottom: 1, left: 2, right: 3 },
     margin: { left: 2, right: 2 },
     borderStyle: 'double',
     borderColor: 'magenta',
     title: chalk.magenta.bold('🔐 فلاش بوت'),
     titleAlignment: 'center',
   }
 ) + '\n')
return
} catch (e) {
if (attempt === 29) {
console.log(chalk.bold.redBright(`\n⚠︎ تعذر على WhatsApp تسليم الرمز: ${e.message}`))
return
}
await delay(2000)
}
}
})()
return global._pairingCodePromise
}

async function requestPairingCodeWhenSocketIsReady() {
 for (let attempt = 0; attempt < 150; attempt++) {
 const socket = global.conn?.ws
 const readyState = socket?.readyState
 const socketIsOpen = socket?.isOpen === true || readyState === 1
 const socketIsClosed = socket?.isClosed === true || socket?.isClosing === true || readyState === 3
 if (socketIsOpen) {
return requestPairingCodeOnce()
}
 if (socketIsClosed) return
await delay(100)
}
console.log(chalk.yellowBright('\n⚠︎ قناة الواتساب لم تكن جاهزة لطلب الكود.'))
}

if (!state.creds.registered) {
if (opcion === '2' || methodCode) {
opcion = '2'
if (phoneNumber) {
global._pairingNumber = phoneNumber.replace(/[^0-9]/g, '')
} else {
do {
phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`[ 🍂 ] الرجاء إدخال رقم الواتس اب.\n${chalk.bold.magentaBright('---> ')}`)))
phoneNumber = phoneNumber.replace(/\D/g,'')
if (!phoneNumber.startsWith('+')) {
phoneNumber = `+${phoneNumber}`
}} while (!await isValidPhoneNumber(phoneNumber))
rl.close()
global._pairingNumber = phoneNumber.replace(/\D/g, '')
}
}}

global.conn = makeWASocket(connectionOptions)
conn.connectionUpdate = connectionUpdate.bind(conn)
conn.credsUpdate = saveCreds
conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
global._reconnectAttempts = 0
global._pairingCodeIssued = false
global._pairingRequestStarted = false
global._pairingReconnectScheduled = false
global._pairingCodePromise = null
global._pairingCloseNoticeShown = false
conn.isInit = false
conn.well = false
conn.logger.info(`[ 🍐 ]  H E C H O\n`)
if (!opts['test']) {
let writingDatabase = false
if (global.db) setInterval(async () => {
if (writingDatabase) return
writingDatabase = true
try {
if (global.db.data) await global.db.write()
if (opts['autocleartmp'] && (global.support || {}).find) {
const tmpDirs = [os.tmpdir(), 'tmp', `${jadi}`]
tmpDirs.forEach((filename) => spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']))
}
} catch (error) { console.error('خطأ في حفظ database.json:', error) }
finally { writingDatabase = false }
}, 30 * 1000)
}

if (!state.creds.registered && (opcion === '2' || methodCode) && global._pairingNumber) {
  setTimeout(() => {
    requestPairingCodeWhenSocketIsReady().catch(console.error)
  }, 2000)
}

const lidCache = global.__flashLidCache || (global.__flashLidCache = new Map())

async function resolveLidToRealJid(lidJid, groupJid, maxRetries = 3, retryDelay = 1000) {
if (!lidJid?.endsWith("@lid") || !groupJid?.endsWith("@g.us")) return lidJid?.includes("@") ? lidJid : `${lidJid}@s.whatsapp.net`
const cached = lidCache.get(lidJid);
if (cached) return cached;
const lidToFind = lidJid.split("@")[0];
let attempts = 0
while (attempts < maxRetries) {
try {
const metadata = await conn.groupMetadata(groupJid)
if (!metadata?.participants) throw new Error("لم يتم الحصول على المشاركين")
for (const participant of metadata.participants) {
try {
const participantJid = participant.phoneNumber || participant.jid || participant.id
if (!participantJid) continue
if (participant.lid?.split('@')[0] === lidToFind && participant.phoneNumber) {
lidCache.set(lidJid, participant.phoneNumber)
return participant.phoneNumber
}
const contactDetails = await conn.onWhatsApp(participantJid)
if (!contactDetails?.[0]?.lid) continue
const possibleLid = contactDetails[0].lid.split("@")[0]
if (possibleLid === lidToFind) {
lidCache.set(lidJid, participantJid)
return participantJid
}} catch (e) {
continue
}}
lidCache.set(lidJid, lidJid)
return lidJid
} catch (e) {
attempts++
if (attempts >= maxRetries) {
lidCache.set(lidJid, lidJid)
return lidJid
}
await new Promise(resolve => setTimeout(resolve, retryDelay))
}}
return lidJid
}

async function extractAndProcessLids(text, groupJid) {
if (!text) return text
const lidMatches = text.match(/\d+@lid/g) || []
let processedText = text
for (const lid of lidMatches) {
try {
const realJid = await resolveLidToRealJid(lid, groupJid);
processedText = processedText.replace(new RegExp(lid, 'g'), realJid)
} catch (e) {
console.error(`خطأ في معالجة LID ${lid}:`, e)
}}
return processedText
}

async function processLidsInMessage(message, groupJid) {
if (!message || !message.key) return message
try {
const messageCopy = {
key: {...message.key},
message: message.message ? {...message.message} : undefined,
...(message.quoted && {quoted: {...message.quoted}}),
...(message.mentionedJid && {mentionedJid: [...message.mentionedJid]})
}
const remoteJid = messageCopy.key.remoteJid || groupJid
if (messageCopy.key?.participant?.endsWith('@lid')) { messageCopy.key.participant = await resolveLidToRealJid(messageCopy.key.participant, remoteJid) }
if (messageCopy.message?.extendedTextMessage?.contextInfo?.participant?.endsWith('@lid')) { messageCopy.message.extendedTextMessage.contextInfo.participant = await resolveLidToRealJid( messageCopy.message.extendedTextMessage.contextInfo.participant, remoteJid ) }
if (messageCopy.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
const mentionedJid = messageCopy.message.extendedTextMessage.contextInfo.mentionedJid
if (Array.isArray(mentionedJid)) {
for (let i = 0; i < mentionedJid.length; i++) {
if (mentionedJid[i]?.endsWith('@lid')) {
mentionedJid[i] = await resolveLidToRealJid(mentionedJid[i], remoteJid)
}}}}
if (messageCopy.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.contextInfo?.mentionedJid) {
const quotedMentionedJid = messageCopy.message.extendedTextMessage.contextInfo.quotedMessage.extendedTextMessage.contextInfo.mentionedJid;
if (Array.isArray(quotedMentionedJid)) {
for (let i = 0; i < quotedMentionedJid.length; i++) {
if (quotedMentionedJid[i]?.endsWith('@lid')) {
quotedMentionedJid[i] = await resolveLidToRealJid(quotedMentionedJid[i], remoteJid)
}}}}
if (messageCopy.message?.conversation) { messageCopy.message.conversation = await extractAndProcessLids(messageCopy.message.conversation, remoteJid) }
if (messageCopy.message?.extendedTextMessage?.text) { messageCopy.message.extendedTextMessage.text = await extractAndProcessLids(messageCopy.message.extendedTextMessage.text, remoteJid) }
if (messageCopy.message?.extendedTextMessage?.contextInfo?.participant && !messageCopy.quoted) {
const quotedSender = await resolveLidToRealJid( messageCopy.message.extendedTextMessage.contextInfo.participant, remoteJid );
messageCopy.quoted = { sender: quotedSender, message: messageCopy.message.extendedTextMessage.contextInfo.quotedMessage }
}
return messageCopy
} catch (e) {
console.error('خطأ في عملية LidsInMessage:', e)
return message
}}

async function connectionUpdate(update) {
if (this !== global.conn) return
const {connection, lastDisconnect, isNewLogin, qr} = update
global.stopped = connection
if (isNewLogin) conn.isInit = true
if (global.db.data == null) loadDatabase()
if (qr && !state.creds.registered && (opcion === '2' || methodCode) && global._pairingNumber && !global._pairingCodeIssued && !global._pairingRequestStarted) {
  void requestPairingCodeWhenSocketIsReady().catch(error => {
    console.log(chalk.redBright(`\n⚠︎ تعذر طلب الرمز: ${error.message}`))
  })
}
 if (connection === "open") {
if (conn.user?.id) {
global._pairingRetries = 0
global._reconnectAttempts = 0
const userJid = jidNormalizedUser(conn.user.id)
const userName = conn.user.name || conn.user.verifiedName || "غير معروف"
await joinChannels(conn)
  const number = conn.user.id?.split(':')[0]?.split('@')[0] || '—'
  console.log('\n' + boxen(
    chalk.greenBright.bold('✦ تم اتصال الروبوت بنجاح ✦\n\n') +
    chalk.white('🤖 بوت') + chalk.cyan('فلاشبوت\n') +
    chalk.white('👤 الحساب') + chalk.cyan(userName) + '\n' +
    chalk.white('📱 الرقم') + chalk.cyan(number) + '\n' +
    chalk.white('🟢 Node.js') + chalk.cyan(process.version) + '\n' +
    chalk.white('🖥️ النظام') + chalk.cyan(os.platform()),
    {
      padding: { top: 0, bottom: 1, left: 2, right: 3 },
      margin: { left: 2, right: 2 },
      borderStyle: 'double',
      borderColor: 'green',
      title: chalk.green.bold('✦ واتساب اون لاين ✦'),
      titleAlignment: 'center',
    }
  ) + '\n')
}}
let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
if (connection === 'close') {
    if (this._reconnectPending) return
    this._reconnectPending = true
    try {
    const isAuthenticated = !!(conn?.user?.id)
    const manualPairing = (opcion === '2' || methodCode) && !state.creds.registered
    if (manualPairing) {
        console.log(chalk.bold.redBright(`\n[DEBUG] سبب الإغلاق -> الكود: ${reason || 'لا يوجد رمز'} | الرسالة: ${lastDisconnect?.error?.message || 'لا توجد رسالة'}`))
        if (global._pairingCodeIssued && !global._pairingCloseNoticeShown) {
            global._pairingCloseNoticeShown = true
            console.log(chalk.bold.yellowBright(`\n⚠︎الواتساب أغلق القناة (428). سيتم إنشاء كود جديد...`))
        } else if (!global._pairingCodeIssued && !global._pairingCloseNoticeShown) {
            global._pairingCloseNoticeShown = true
            console.log(chalk.bold.yellowBright(`\n⚠︎ واتساب أغلق القناة قبل تسليم الكود. جارٍ إعادة المحاولة...`))
        }
        if (reason === DisconnectReason.loggedOut || reason === 401) {
            resetPairingState()
        }
        if ((global._pairingRetries || 0) >= pairingRetryLimit) return
        if (global._pairingReconnectScheduled) return
        global._pairingRetries = (global._pairingRetries || 0) + 1
        global._pairingReconnectScheduled = true
        setTimeout(async () => {
          global._pairingReconnectScheduled = false
          global._pairingCloseNoticeShown = false
          global._pairingCodeIssued = false
          global._pairingRequested = false
          global._pairingRequestStarted = false
          global._pairingCodePromise = null
          await global.reloadHandler(true).catch(console.error)
          requestPairingCodeWhenSocketIsReady().catch(() => {})
        }, global._pairingCodeIssued ? pairingRetryDelay : 12000)
        return
    }
    if (reason === DisconnectReason.badSession || reason === 502) {
global._reconnectAttempts = (global._reconnectAttempts || 0) + 1
const backoff = Math.min(5000 * Math.pow(2, global._reconnectAttempts - 1), 60000)
console.log(chalk.bold.cyanBright(`\n⚠︎ جلسة غير صالحة مؤقتًا (الرمز ${reason}), تتم إعادة التحقق دون حذف بيانات الاعتماد وإعادة الاتصال على ${Math.round(backoff/1000)}s...`))
await delay(backoff)
await refreshPrincipalAuth().catch(() => {})
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionClosed) {
if (!isAuthenticated) {
if (opcion === '2' || methodCode) {
if ((global._pairingRetries || 0) >= pairingRetryLimit) return
global._pairingRetries = (global._pairingRetries || 0) + 1
console.log(chalk.bold.magentaBright(`\n♻ جارٍ إعادة الاتصال (${global._pairingRetries}/${pairingRetryLimit})...`))
await delay(pairingRetryDelay)
await global.reloadHandler(true).catch(console.error)
}
return
}
console.log(chalk.bold.magentaBright(`\n♻ جارٍ إعادة توصيل اتصال الروبوت...`))
await delay(3000)
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionLost) {
if (!isAuthenticated) {
if (opcion === '2' || methodCode) {
if ((global._pairingRetries || 0) >= pairingRetryLimit) return
global._pairingRetries = (global._pairingRetries || 0) + 1
await delay(pairingRetryDelay)
await global.reloadHandler(true).catch(console.error)
}
return
}
console.log(chalk.bold.blueBright(`\n⚠︎ تم فقدان الاتصال بالخادم, جارٍ إعادة توصيل الروبوت...`))
await delay(3000)
await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(chalk.bold.yellowBright(`\nꕥ تم استبدال اتصال الروبوت, جارٍ محاولة إعادة الاتصال...`))
        await delay(5000)
        await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.loggedOut) {
        if (!isAuthenticated) {
            if ((global._pairingRetries || 0) >= pairingRetryLimit) return
            global._pairingRetries = (global._pairingRetries || 0) + 1
            global._pairingRequested = false
            console.log(chalk.bold.yellowBright(`\n⚠︎ تم إغلاق جلسة الربط. محاولة جديدة لـ ${pairingRetryDelay / 1000}s (${global._pairingRetries}/${pairingRetryLimit})...`))
            await delay(pairingRetryDelay)
            await global.reloadHandler(true).catch(console.error)
            return
        }
        console.log(chalk.bold.redBright(`\n⚠︎ تم إغلاق الجلسة بواسطة WhatsApp, جارٍ إعادة التحقق من بيانات الاعتماد المحفوظة دون حذفها...`))
        global._reconnectAttempts = (global._reconnectAttempts || 0) + 1
        if (global._reconnectAttempts > 10) {
        console.log(chalk.bold.redBright(`\n⚠︎ تم تجاوز الحد الأقصى لعدد المحاولات. اربط مرة أخرى بـ "code". لم يتم حذف الجلسات/الرئيسية.`))
        return
        }
        await delay(5000)
        await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.restartRequired) {
if (!isAuthenticated) {
if (opcion === '2' || methodCode) {
if ((global._pairingRetries || 0) >= pairingRetryLimit) return
global._pairingRetries = (global._pairingRetries || 0) + 1
await delay(pairingRetryDelay)
await global.reloadHandler(true).catch(console.error)
}
return
}
console.log(chalk.bold.cyanBright(`\n♻ جارٍ توصيل الروبوت بالخادم...`))
await delay(3000)
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.timedOut) {
if (!isAuthenticated) {
if (opcion === '2' || methodCode) {
if ((global._pairingRetries || 0) >= pairingRetryLimit) return
global._pairingRetries = (global._pairingRetries || 0) + 1
await delay(pairingRetryDelay)
await global.reloadHandler(true).catch(console.error)
}
return
}
console.log(chalk.bold.yellowBright(`\n♻ انتهت مهلة الاتصال, جارٍ إعادة توصيل الروبوت...`))
await delay(5000)
await global.reloadHandler(true).catch(console.error)
    } else {
        if (!isAuthenticated) {
if (opcion === '2' || methodCode) {
if ((global._pairingRetries || 0) >= pairingRetryLimit) return
global._pairingRetries = (global._pairingRetries || 0) + 1
await delay(pairingRetryDelay)
await global.reloadHandler(true).catch(console.error)
}
return
}
        global._reconnectAttempts = (global._reconnectAttempts || 0) + 1
        const backoff = Math.min(3000 * Math.pow(2, global._reconnectAttempts - 1), 60000)
        console.log(chalk.bold.redBright(`\n⚠︎ تم إغلاق الاتصال (السبب: ${reason}), تتم إعادة الاتصال عند ${Math.round(backoff/1000)}s...`))
        await delay(backoff)
        await global.reloadHandler(true).catch(console.error)
        if (connection === 'open') global._reconnectAttempts = 0
    }} finally { this._reconnectPending = false }
}}
process.on('uncaughtException', console.error)
process.on('unhandledRejection', (err) => {
if (err?.message?.includes('Connection Closed') || err?.message?.includes('not open')) return
console.error(err)
})
let isInit = true
let handler = await import('./handler.js')
global._reloading = false
reloadHandlerImpl = async function(restatConn) {
if (global._reloading) return
global._reloading = true
try {
const Handler = restatConn || isInit ? handler : await import(`./handler.js?update=${Date.now()}`);
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error(e);
}
try {
    if (restatConn) {
        await refreshPrincipalAuth().catch(() => {})
        const oldChats = global.conn.chats
        try {
            conn.ev.removeAllListeners()
            conn.end?.(new Error('Restarting'))
            global.conn.ws.close()
            await delay(2000)
        } catch { }
        conn.ev.removeAllListeners()
        const newConn = makeWASocket(connectionOptions, {chats: oldChats})
        global.conn = newConn
        isInit = true
    }
if (conn.handler) conn.ev.off('messages.upsert', conn.handler)
if (conn.connectionUpdate) conn.ev.off('connection.update', conn.connectionUpdate)
if (conn.credsUpdate) conn.ev.off('creds.update', conn.credsUpdate)
const activeSocket = conn
conn.handler = (update) => handler.handler.call(activeSocket, update).catch(error => console.error('خطأ في معالجة الرسائل:', error))
conn.connectionUpdate = connectionUpdate.bind(global.conn)
conn.credsUpdate = saveCreds.bind(global.conn, true)
conn.ev.on('messages.upsert', conn.handler)
conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
isInit = false
} catch (e) {
console.error('خطأ في إعادة التحميل:', e)
} finally {
global._reloading = false
}
return true
}
let rtU = join(process.cwd(), jadi)
if (!existsSync(rtU)) {
mkdirSync(rtU, { recursive: true })
}

global.rutaJadiBot = rtU
if (global.flashSubBotAuto) {
if (!existsSync(global.rutaJadiBot)) {
mkdirSync(global.rutaJadiBot, { recursive: true }) 
console.log(chalk.bold.cyan(`ꕥ تم إنشاء المجلد: ${jadi} بنجاح.`))
} else {
console.log(chalk.bold.cyan(`ꕥ المجلد: ${jadi} تم إنشاؤه بالفعل.`)) 
}
const readRutaJadiBot = readdirSync(rutaJadiBot)
if (readRutaJadiBot.length > 0) {
const creds = 'creds.json'
for (const gjbts of readRutaJadiBot) {
const botPath = join(rutaJadiBot, gjbts)
const readBotPath = readdirSync(botPath)
if (readBotPath.includes(creds)) {
flashJadiBot({subBotPath: botPath, m: null, conn, args: '', usedPrefix: '/', command: 'serbot'})
}}}}

const pluginFolder = join(__dirname, '../plugins')
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}

function scanPluginFiles(dir = pluginFolder, base = '') {
  const found = []
  let entries = []
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return found }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const rel = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) found.push(...scanPluginFiles(join(dir, entry.name), rel))
    else if (pluginFilter(entry.name)) found.push(rel)
  }
  return found
}

function sortPlugins() {
  global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
}

async function loadPluginFile(relPath, cacheBust = false) {
  const abs = join(pluginFolder, relPath)
  if (!existsSync(abs)) { delete global.plugins[relPath]; return }
  try {
    const url = pathToFileURL(abs).href
    const mod = await import(cacheBust ? `${url}?update=${Date.now()}` : url)
    global.plugins[relPath] = normalizeOurinPlugin(mod)
  } catch (e) {
    console.error(`خطأ في تحميل البرنامج المساعد '${relPath}': ${e?.stack || e}`)
    delete global.plugins[relPath]
  }
}

function wrapOurinHandler(ourinHandler) {
  return async function(m, ctx) {
    const conn = ctx.conn || this
    if (!m.prefix) m.prefix = ctx.usedPrefix || global.prefix?.toString?.()?.[0] || "."
    if (!m.command) m.command = ctx.command || ""
    if (!m.args) m.args = ctx.args || (ctx.text ? ctx.text.split(" ").filter(Boolean) : [])
    if (!m.pushName) m.pushName = m.pushName || m.name || conn.getName?.(m.sender)?.catch?.(()=>{}) || "المستخدم"
    if (!m.sender) m.sender = m.sender || m.key?.participant || m.key?.remoteJid
    const sock = conn
    if (!sock.sendMedia) {
      sock.sendMedia = async (jid, url, _unused, m, opts = {}) => {
        const type = opts.type || "document"
        if (type === "audio") return sock.sendMessage(jid, { audio: { url }, mimetype: opts.mimetype || "audio/mpeg", fileName: opts.fileName, ptt: !!opts.ptt }, { quoted: m })
        if (type === "video") return sock.sendMessage(jid, { video: { url }, mimetype: opts.mimetype || "video/mp4", fileName: opts.fileName }, { quoted: m })
        if (type === "image") return sock.sendMessage(jid, { image: { url }, caption: opts.caption }, { quoted: m })
        return sock.sendMessage(jid, { document: { url }, mimetype: opts.mimetype, fileName: opts.fileName }, { quoted: m })
      }
    }
    if (!sock.sendPreview) sock.sendPreview = sock.sendMessage.bind(sock)
    return ourinHandler(m, { sock, ...ctx, text: ctx.text ?? m.text ?? "" })
  }
}
function normalizeOurinPlugin(mod) {
  if (mod && mod.config && typeof mod.handler === "function") {
    const cfg = mod.config
    const h = mod.handler
    h.command = [cfg.name, ...(cfg.alias || [])].filter(Boolean)
    h.help = [cfg.usage || cfg.name]
    h.tags = [cfg.category || "tools"]
    h.disabled = cfg.isEnabled === false
    if (cfg.isOwner) h.rowner = true
    if (cfg.isPremium) h.premium = true
    if (cfg.isGroup) h.group = true
    if (cfg.isPrivate) h.private = true
    const wrapped = wrapOurinHandler(h)
    Object.assign(wrapped, h)
    wrapped.command = h.command
    return wrapped
  }
  const base = mod?.default || mod
  if (base && base.config && typeof base.handler === "function") {
    return normalizeOurinPlugin(base)
  }
  return base
}
async function filesInit() {
for (const relPath of scanPluginFiles()) {
await loadPluginFile(relPath)
}}
await filesInit()
try { serialize() } catch (e) { console.error('إعادة التسلسل بعد فشل filesInit', e) }
console.log(chalk.cyan(`[ ✿ ] تم تحميل المكونات الإضافية: ${Object.keys(global.plugins).length}`))

global.reload = async (_ev, filename) => {
try {
let rel = typeof filename === 'string' ? filename.replace(/\\/g, '/').replace(/^\.\//, '') : ''
if (rel) {
if (!pluginFilter(rel)) return
const existed = rel in global.plugins
const abs = join(pluginFolder, rel)
if (!existsSync(abs)) {
if (existed) conn.logger.warn(`البرنامج المساعد المحذوف - '${rel}'`)
delete global.plugins[rel]
sortPlugins()
return
}
conn.logger.info(`${existed ? 'updated' : 'new'} plugin - '${rel}'`)
await loadPluginFile(rel, true)
sortPlugins()
return
}
} catch (e) {
conn?.logger?.error?.(`خطأ في إعادة تحميل البرنامج المساعد: ${e?.message || e}`)
}
try {
const files = scanPluginFiles()
const before = Object.keys(global.plugins)
for (const relPath of files) if (!before.includes(relPath)) { conn.logger.info(`البرنامج المساعد الجديد - '${relPath}'`); await loadPluginFile(relPath) }
for (const relPath of before) if (!files.includes(relPath)) { conn.logger.warn(`البرنامج المساعد المحذوف - '${relPath}'`); delete global.plugins[relPath] }
sortPlugins()
} catch (e) {
conn?.logger?.error?.(`خطأ عند إعادة فحص المكونات الإضافية: ${e?.message || e}`)
}
}
Object.freeze(global.reload)
function watchPlugins(dir = pluginFolder) {
try {
watch(dir, { recursive: true }, global.reload)
} catch {
const walk = (d) => {
try { watch(d, (event, filename) => global.reload(event, filename ? path.relative(pluginFolder, join(d, String(filename))) : undefined)) } catch {}
for (const entry of readdirSync(d, { withFileTypes: true })) {
if (entry.isDirectory() && !entry.name.startsWith('.')) walk(join(d, entry.name))
}
}
walk(dir)
}
}
watchPlugins()
await global.reloadHandler()
fs.watchFile(join(__dirname, 'Handler.js'), () => {
  global.reloadHandler(false).catch(console.error)
})
rl.close()
async function _quickTest() {
const test = await Promise.all([
spawn('ffmpeg'),
spawn('ffprobe'),
spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
spawn('convert'),
spawn('magick'),
spawn('gm'),
spawn('find', ['--version']),
].map((p) => {
return Promise.race([
new Promise((resolve) => {
p.on('close', (code) => {
resolve(code !== 127);
});
}),
new Promise((resolve) => {
p.on('error', (_) => resolve(false))
})])
}))
const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
const s = global.support = {ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find};
Object.freeze(global.support);
}
setInterval(async () => {
  const baseDir = `./${jadi}/`;
  try {
    if (!existsSync(baseDir)) return;
    const subBots = await fs.promises.readdir(baseDir);
    const tmpExtensions = ['.bak', '.log', '.tmp', '.old']
    for (const bot of subBots) {
      const botPath = join(baseDir, bot);
      const stat = await fs.promises.stat(botPath).catch(() => null);
      if (!stat?.isDirectory()) continue;
      const files = await fs.promises.readdir(botPath);
      for (const file of files) {
        if (tmpExtensions.some(ext => file.endsWith(ext))) {
          try { await fs.promises.unlink(join(botPath, file)) } catch {}
        }
      }
    }
  } catch {}
}, 10 * 60 * 1000)

setInterval(async () => {
const tmpDir = join(process.cwd(), 'tmp')
try {
const filenames = await fs.promises.readdir(tmpDir)
const now = Date.now()
for (const f of filenames) {
try {
const stat = await fs.promises.stat(join(tmpDir, f))
if (now - stat.mtimeMs > 300000) await fs.promises.unlink(join(tmpDir, f)).catch(() => {})
} catch {}}
} catch {}}, 120 * 1000)

setInterval(() => {
  if (!Array.isArray(global.conns)) return
  for (let i = global.conns.length - 1; i >= 0; i--) {
    const sock = global.conns[i]
    if (!sock || (!sock.user && (!sock.ws || sock.ws.readyState === 3))) {
      try { sock?.ev?.removeAllListeners() } catch {}
      try { sock?.ws?.close() } catch {}
      global.conns.splice(i, 1)
    }
  }
}, 60000)
let healthCheckFailures = 0
setInterval(async () => {
    try {
        if (global.conn?.user?.id) {
            const state = global.conn.ws?.readyState
            if (!global.conn.ws || state === 3 || state === 2) {
                healthCheckFailures++
                if (healthCheckFailures >= 5) {
                    console.log(chalk.bold.yellowBright(`\n⚠︎ فحص السلامة: WebSocket معطل (${state}, ${healthCheckFailures} نوايا). جارٍ إعادة الاتصال...`))
                    healthCheckFailures = 0
                    await global.reloadHandler(true).catch(console.error)
                }
            } else {
                healthCheckFailures = 0
            }
        }
    } catch (e) {
        console.error('خطأ في التحقق من الصحة:', e)
    }
}, 120000)

_quickTest().catch(console.error)
async function isValidPhoneNumber(number) {
try {
number = number.replace(/\s+/g, '')
if (number.startsWith('+521')) {
number = number.replace('+521', '+52');
} else if (number.startsWith('+52') && number[4] === '1') {
number = number.replace('+52 1', '+52');
}
const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
return phoneUtil.isValidNumber(parsedNumber)
} catch (error) {
return false
}}

async function joinChannels(sock) {
for (const value of Object.values(global.ch)) {
if (typeof value === 'string' && value.endsWith('@newsletter')) {
await sock.newsletterFollow(value).catch(() => {})
}}}
