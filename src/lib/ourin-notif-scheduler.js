import { getDatabase } from './ourin-database.js'
import { logger } from './ourin-logger.js'
import { CronJob } from 'cron'

const TZ = 'Asia/Jakarta'

let sock = null
const notifCronJobs = new Map()
let refreshJob = null

const MAKAN_MESSAGES = [
    '🍽️ *حان وقت تناول {label}!*\n\n⏰ *{jam} WIB*\n\nلا تفوت الطعام, فجسدك يحتاج إلى الطاقة ليظل منتجًا 💪\n{menu}\n\n📌 _تم جدولته بواسطة @{sender}_',
    '🥗 *مرحبًا @{sender}, إنه {jam} بالفعل!*\n\nحان وقت ملء معدتك 🍛\nتناول شيئًا مغذيًا لتحافظ على لياقتك!\n{menu}',
    '🍜 *تذكير الطعام {label}*\n\n⏰ *{jam} WIB*\n\nالمعدة الفارغة تولد مزاجًا سيئًا 😤\nدعونا نأكل قبل مواصلة الأنشطة!\n{menu}\n\n📌 _مبرمج بواسطة @{sender}_',
    '🍜 *تناول الطعام أولاً @{sender}!*\n\nهل تستخدم؟ {menu}',
]

const TIDUR_MESSAGES = [
    '🌙 *حان وقت الراحة!*\n\n⏰ *{jam} WIB*\n\nاترك هاتفك الخلوي وأغمض عينيك 😴\nالنوم الجيد يبقي ذهنك منتعشًا للغد!\n_تصبح على خير_ 🌟\n\n📌 _تم تحديد موعد بواسطة @{sender}_',
    '💤 *إنه بالفعل {jam} @{sender}!*\n\nدعونا نرتاح, لا نبقى مستيقظين 🛏️\nالصحة هي الاستثمار الأكثر قيمة\n_أتمنى لك أحلامًا سعيدة_ ✨',
    '😴 *تذكير بالنوم ليلاً*\n\n⏰ *{jam} WIB*\n\nشاشة الهاتف الخليوي هي عدو النوم المريح 📵\nأوقف الإشعارات واذهب إلى السرير الآن!\n_تصبح على خير_ 🌜\n\n📌 _تم الجدول بواسطة @{sender}_',
    '*اذهب للنوم @{sender}!*\n\n⏰ إنها بالفعل *{jam}*',
]

function getRandomMessage(templates, jam, menu, label, senderJid) {
    const idx = Math.floor(Math.random() * templates.length)
    const senderMention = senderJid ? senderJid.split('@')[0] : ''
    let msg = templates[idx]
        .replace(/\{jam\}/g, jam)
        .replace(/\{label\}/g, label || '')
        .replace(/\{menu\}/g, menu ? `🍴 _${menu}_` : '')
        .replace(/\{sender\}/g, senderMention)
    return msg.trim()
}

function getMealLabel(jam) {
    const hour = parseInt(jam.split(':')[0], 10)
    if (hour >= 4 && hour < 10) return 'pagi'
    if (hour >= 10 && hour < 15) return 'siang'
    if (hour >= 15 && hour < 18) return 'sore'
    return 'malam'
}

function clearNotifCronJobs() {
    for (const [, job] of notifCronJobs) job.stop()
    notifCronJobs.clear()
}

function buildCronJobs() {
    clearNotifCronJobs()
    if (!sock) return

    const db = getDatabase()
    const makanData = db.setting('notifMakan') || {}
    const tidurData = db.setting('notifTidur') || {}
    const todayStr = new Date(new Date().toLocaleString('en-US', { timeZone: TZ })).toISOString().slice(0, 10)

    for (const [key, entry] of Object.entries(makanData)) {
        if (!entry.enabled || !entry.jadwal) continue
        for (const jam of entry.jadwal) {
            const [h, m] = jam.split(':').map(Number)
            const cronKey = `makan_${key}_${jam}`
            if (notifCronJobs.has(cronKey)) continue

            const job = new CronJob(`${m} ${h} * * *`, async () => {
                await processEntry(entry, jam, 'makan', key, db, todayStr)
            }, null, true, TZ)

            notifCronJobs.set(cronKey, job)
        }
    }

    for (const [key, entry] of Object.entries(tidurData)) {
        if (!entry.enabled || !entry.jadwal) continue
        for (const jam of entry.jadwal) {
            const [h, m] = jam.split(':').map(Number)
            const cronKey = `tidur_${key}_${jam}`
            if (notifCronJobs.has(cronKey)) continue

            const job = new CronJob(`${m} ${h} * * *`, async () => {
                await processEntry(entry, jam, 'tidur', key, db, todayStr)
            }, null, true, TZ)

            notifCronJobs.set(cronKey, job)
        }
    }

    logger.info('NotifScheduler', `إشعار ${notifCronJobs.size} CronJobs نشط (${TZ})`)
}

async function processEntry(entry, jam, type, key, db, dateStr) {
    const lastSent = entry.lastSent || {}
    const sentKey = `${jam}_${dateStr}`
    if (lastSent[sentKey]) return

    try {
        const templates = type === 'makan' ? MAKAN_MESSAGES : TIDUR_MESSAGES
        const label = type === 'makan' ? getMealLabel(jam) : ''
        const menu = entry.menu || ''
        const text = getRandomMessage(templates, jam, menu, label, entry.sender)

        const isGroup = entry.chatJid.endsWith('@g.us')
        let mentions = [entry.sender]

        if (isGroup) {
            try {
                const meta = await sock.groupMetadata(entry.chatJid)
                const participants = (meta.participants || []).map(p => p.id)
                mentions = [...new Set([entry.sender, ...participants])]
            } catch {}
        }

        await sock.sendMessage(entry.chatJid, { text, mentions })

        lastSent[sentKey] = true
        entry.lastSent = lastSent

        const settingKey = type === 'makan' ? 'notifMakan' : 'notifTidur'
        const allData = db.setting(settingKey) || {}
        allData[key] = entry
        db.setting(settingKey, allData)

        cleanOldSentKeys(lastSent)
        logger.info('NotifScheduler', `تم إرسال إشعار ${type} إلى ${entry.chatJid} (${jam})`)

        await new Promise(r => setTimeout(r, 300))
    } catch (err) {
        logger.error('NotifScheduler', `فشل إرسال ${type} إلى ${entry.chatJid}: ${err.message}`)
    }
}

function cleanOldSentKeys(lastSent) {
    const keys = Object.keys(lastSent)
    if (keys.length <= 20) return
    const sorted = keys.sort()
    const toRemove = sorted.slice(0, sorted.length - 10)
    for (const k of toRemove) delete lastSent[k]
}

function getNotifKey(sender, chatJid) {
    return `${sender}_${chatJid}`
}

function setNotifMakan(sender, chatJid, jadwal, menu) {
    const db = getDatabase()
    const data = db.setting('notifMakan') || {}
    const key = getNotifKey(sender, chatJid)
    data[key] = {
        sender, chatJid, jadwal,
        menu: menu || '',
        enabled: true,
        lastSent: data[key]?.lastSent || {},
        createdAt: data[key]?.createdAt || Date.now()
    }
    db.setting('notifMakan', data)
    buildCronJobs()
    return data[key]
}

function setNotifTidur(sender, chatJid, jadwal) {
    const db = getDatabase()
    const data = db.setting('notifTidur') || {}
    const key = getNotifKey(sender, chatJid)
    data[key] = {
        sender, chatJid, jadwal,
        enabled: true,
        lastSent: data[key]?.lastSent || {},
        createdAt: data[key]?.createdAt || Date.now()
    }
    db.setting('notifTidur', data)
    buildCronJobs()
    return data[key]
}

function toggleNotif(type, sender, chatJid, enabled) {
    const db = getDatabase()
    const settingKey = type === 'makan' ? 'notifMakan' : 'notifTidur'
    const data = db.setting(settingKey) || {}
    const key = getNotifKey(sender, chatJid)
    if (!data[key]) return null
    data[key].enabled = enabled
    db.setting(settingKey, data)
    buildCronJobs()
    return data[key]
}

function getNotif(type, sender, chatJid) {
    const db = getDatabase()
    const settingKey = type === 'makan' ? 'notifMakan' : 'notifTidur'
    const data = db.setting(settingKey) || {}
    return data[getNotifKey(sender, chatJid)] || null
}

function deleteNotif(type, sender, chatJid) {
    const db = getDatabase()
    const settingKey = type === 'makan' ? 'notifMakan' : 'notifTidur'
    const data = db.setting(settingKey) || {}
    const key = getNotifKey(sender, chatJid)
    if (!data[key]) return false
    delete data[key]
    db.setting(settingKey, data)
    buildCronJobs()
    return true
}

function parseJadwal(input) {
    const times = input.split(',').map(t => t.trim()).filter(Boolean)
    const valid = []
    for (const t of times) {
        const match = t.match(/^(\d{1,2})[.:](\d{2})$/)
        if (!match) continue
        const h = parseInt(match[1], 10)
        const m = parseInt(match[2], 10)
        if (h < 0 || h > 23 || m < 0 || m > 59) continue
        valid.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
    return [...new Set(valid)].sort()
}

function initNotifScheduler(socketInstance) {
    sock = socketInstance

    if (refreshJob) refreshJob.stop()
    refreshJob = new CronJob('1 0 * * *', () => {
        buildCronJobs()
    }, null, true, TZ)

    buildCronJobs()
    logger.info('NotifScheduler', 'بدأ جدولة إشعارات الوجبات والنوم (CronJob, دقيق لكل مرة)')
}

function stopNotifScheduler() {
    clearNotifCronJobs()
    if (refreshJob) {
        refreshJob.stop()
        refreshJob = null
    }
    logger.info('NotifScheduler', 'توقف جدولة الإخطار')
}

export {
    initNotifScheduler, stopNotifScheduler,
    setNotifMakan, setNotifTidur,
    toggleNotif, getNotif, deleteNotif, parseJadwal
}
