import { useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import fs from "fs"
import path from "path"
import pino from 'pino'
import { open } from 'lmdb'
import { makeWASocket } from '../../lib/simple.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const lmdbPath = path.resolve(process.cwd(), 'database/lmdb_store')
if (!fs.existsSync(path.dirname(lmdbPath))) {
  fs.mkdirSync(path.dirname(lmdbPath), { recursive: true })
}
const dbLmdb = open({
  path: lmdbPath,
  compression: true
})

const FlashJBOptions = {}
const newsletterJid = '120363410090342500@newsletter'
const newsletterName = '👑 فلاش بوت| ᴄʜᴀɴɴᴇʟ-ʙᴏᴛ 🌌'

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    let who
    if (m.mentionedJid && m.mentionedJid[0]) {
        who = m.mentionedJid[0]
    } else if (args[0] && args[0].match(/^\d+$/)) {
        who = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    } else {
        return conn.reply(m.chat, `*❌ المستخدم مفقود.*\n\n> *يجب عليك ذكر أو إدخال رقم هاتف* المستخدم الذي سيتم إرسال الرمز إليه.`, m);
    }

    let id = `${who.split`@`[0]}`
    let pathFlashJadiBot = path.join(global.jadi || 'Sessions/SubBot', id)

    FlashJBOptions.pathFlashJadiBot = pathFlashJadiBot
    FlashJBOptions.m = m
    FlashJBOptions.conn = conn
    FlashJBOptions.args = args
    FlashJBOptions.usedPrefix = usedPrefix
    FlashJBOptions.command = command
    FlashJBOptions.userToSendCode = who 

    await FlashJadiBot(FlashJBOptions)
} 

handler.help = ['darcode <@user|number>']
handler.tags = ['owner']
handler.command = ['darcode']
export default handler 

export async function FlashJadiBot(options) {
    let { pathFlashJadiBot, m, conn, args, usedPrefix, command, userToSendCode } = options
    let userJid = userToSendCode 

    if (!fs.existsSync(pathFlashJadiBot)){
        fs.mkdirSync(pathFlashJadiBot, { recursive: true })
    }

    const pathCreds = path.join(pathFlashJadiBot, "creds.json")
    if (fs.existsSync(pathCreds)) {
        fs.unlinkSync(pathCreds)
    }

    const rcanal = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid,
            newsletterName,
            serverMessageId: -1
        }
    }

    let { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(pathFlashJadiBot)

    const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
        browser: ['Ubuntu', 'Chrome', '110.0.5585.95'], 
        version: version,
        generateHighQualityLinkPreview: true
    }

    let sock = makeWASocket(connectionOptions)

    async function connectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update

        if (qr) { 
            try {
                let phoneNumber = userJid.split('@')[0]
                let rawCode = await sock.requestPairingCode(phoneNumber)
                let formattedCode = rawCode.match(/.{1,4}/g)?.join("-")

                const pairingCodeMessage = `*🔑 رمز ربط الروبوت الفرعي*\n\n> *مرحبًا, ${phoneNumber}.* أنشأ مالك الروبوت رمزًا لك لربط الروبوت الفرعي الخاص بك.\n\n*الكود:* \`\`\`${formattedCode}\`\`\``

                await conn.sendMessage(userJid, { 
                    text: pairingCodeMessage.trim(),
                    contextInfo: { ...rcanal }
                }, { ephemeralExpiration: 60 * 60 * 24 * 7 })

                await conn.reply(m.chat, `✅ *تم إرسال الرمز بنجاح* إلى المستخدم: @${phoneNumber}.\n\n> *تم إرسال الرمز إلى عنوان المستخدم الخاص*`, m, { 
                    mentions: [userJid],
                    contextInfo: { ...rcanal }
                })

            } catch (e) {
                console.error('حدث خطأ أثناء إنشاء الرمز أو إرساله:', e)
            }
        }

        if (connection === 'open') {
            await dbLmdb.put(`subbot_registered_${userJid}`, { jid: userJid, time: Date.now() })
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
            if (fs.existsSync(pathFlashJadiBot) && (reason === 401 || reason === 405)) {
                fs.rmSync(pathFlashJadiBot, { recursive: true, force: true })
            }
        }
    }

    sock.connectionUpdate = connectionUpdate.bind(sock)
    sock.credsUpdate = saveCreds.bind(sock, true)
    sock.ev.on("connection.update", sock.connectionUpdate)
    sock.ev.on("creds.update", sock.credsUpdate)
}
