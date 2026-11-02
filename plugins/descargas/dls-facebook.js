import fetch from 'node-fetch'
import { YOSOYO_FB_KEY } from '../../lib/secrets.js'

const TIMEOUT = 25000

async function getJson(url, timeout = TIMEOUT) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } })
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

// محاولة أولى: Yosoyyo (يتطلب مفتاحًا مضبوطًا في .env)
async function viaYosoyyo(url) {
  if (!YOSOYO_FB_KEY) return null
  const json = await getJson(`https://yosoyyo-api-ofc.onrender.com/api/facebook?url=${encodeURIComponent(url)}&apiKey=${YOSOYO_FB_KEY}`)
  const data = json.result || json.data || json
  const media = data.media || {}
  const video = media.video_hd || media.video_sd
  if (!video) return null
  return {
    video,
    title: data.info?.title || 'فيديو الفيسبوك',
    duration: data.info?.duration || '',
    author: data.author?.username || ''
  }
}

// احتياطي بدون مفتاح: siputzx
async function viaSiputzx(url) {
  const json = await getJson(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(url)}`)
  const data = json.data || {}
  const downloads = Array.isArray(data.downloads) ? data.downloads : []
  const video = (downloads.find(d => /hd/i.test(d.quality || '')) || downloads.find(d => d.type === 'video') || downloads[0])?.url
  if (!video) return null
  return {
    video,
    title: data.title || 'فيديو الفيسبوك',
    duration: data.duration || '',
    author: ''
  }
}

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, '「✦」يرجى تقديم رابط صالح للفيسبوك.', m)
  }

  try {
    if (m.react) await m.react('🕒')

    let result = null
    for (const provider of [viaYosoyyo, viaSiputzx]) {
      try {
        result = await provider(args[0])
        if (result?.video) break
      } catch (err) {
        console.warn('[facebook] فشل المزوّد:', err?.message || err)
      }
    }

    if (!result?.video) {
      if (m.react) await m.react('✖️')
      return conn.reply(m.chat, 'تعذر الحصول على رابط تنزيل الفيديو. لم يُرجع الخادم أي فيديو.', m)
    }

    const duracion = result.duration ? `\n⏱️ *المدة:* ${result.duration}` : ''
    const autorTxt = result.author ? `\n👤 *الناشر:* ${result.author}` : ''

    let txt = `*✦ تنزيل الفيسبوك ✦*\n\n`
    txt += `📝 *العنوان:* ${result.title}${duracion}${autorTxt}\n\n`
    txt += `> ✩ هنا طلبك.`

    await conn.sendFile(m.chat, result.video, 'facebook.mp4', txt, m)

    if (m.react) await m.react('✔️')
  } catch (error) {
    console.log('خطأ في واجهة برمجة تطبيقات فيسبوك:', error.message)
    if (m.react) await m.react('✖️')
    await m.reply(`Error: ${error.message}`)
  }
}

handler.command = ['facebook', 'fb']
handler.tags = ['descargas']
handler.help = ['facebook', 'fb']

export default handler
