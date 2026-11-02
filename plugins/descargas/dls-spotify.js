import axios from 'axios'
import { searchYouTube } from '../../lib/youtube-search.js'
import { downloadYouTube } from '../../lib/apiowo.js'
import { NYX_API_KEY } from '../../lib/secrets.js'

const DLAPIXY_SPOTIFY = 'https://dlapixy.vercel.app/api/downloads/spotify'
const NYX_SPOTIFY = 'https://nyxdlapi.vercel.app/api/downloads/spotify'
const RETRY_DELAY = 1500

const sleep = ms => new Promise(r => setTimeout(r, ms))

function describeBody(data) {
  if (data == null || data === '') return 'بدون إجابة'
  if (typeof data === 'string') return data.replace(/\s+/g, ' ').slice(0, 150)
  return String(data.error || data.message || JSON.stringify(data)).slice(0, 150)
}

function pickFile(data) {
  const files = Array.isArray(data?.files) ? data.files : []
  return files.find(f => f?.kind === 'audio' && f?.url) || files.find(f => f?.url) || null
}

function normalizeQuality(q) {
  if (!q) return '320kbps'
  return /^\d+$/.test(String(q)) ? `${q}kbps` : String(q)
}

function toResult(data, file) {
  return {
    title: data.title,
    durationSeconds: data.durationSeconds,
    quality: normalizeQuality(file.quality),
    thumbnail: data.thumbnail,
    downloadUrl: file.url,
    mimeType: file.mimeType || 'audio/mpeg'
  }
}

async function fetchDlapixy(text) {
  const errors = []
  const headers = { 'content-type': 'application/json', accept: 'application/json' }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await axios.post(
        DLAPIXY_SPOTIFY,
        { url: text },
        { headers, timeout: 30000, validateStatus: () => true }
      )
      const file = pickFile(res.data)
      if (res.data?.ok && file) return toResult(res.data, file)

      errors.push(`POST HTTP ${res.status}: ${describeBody(res.data)}`)
      if ([400, 401, 403, 404, 405, 422].includes(res.status)) break
    } catch (err) {
      errors.push(`POST ${err.message}`)
    }
    if (attempt < 3) await sleep(RETRY_DELAY)
  }

  try {
    const res = await axios.get(DLAPIXY_SPOTIFY, {
      params: { url: text },
      headers: { accept: 'application/json' },
      timeout: 30000,
      validateStatus: () => true
    })
    const file = pickFile(res.data)
    if (res.data?.ok && file) return toResult(res.data, file)

    errors.push(`GET HTTP ${res.status}: ${describeBody(res.data)}`)
  } catch (err) {
    errors.push(`GET ${err.message}`)
  }

  const summary = [...new Set([errors[0], errors[errors.length - 1]])].join(' | ')
  throw new Error(`دلابيكسي → ${summary}`)
}

// NYX devuelve metadatos (título/artista/miniatura) pero no el audio; se usa
// para localizar la canción en YouTube y descargar el audio de ahí.
async function fetchNyxMetadata(text) {
  const res = await axios.get(NYX_SPOTIFY, {
    params: { url: text, apikey: NYX_API_KEY },
    timeout: 25000,
    validateStatus: () => true
  })
  const r = res.data?.result
  if (!res.data?.status || !r?.title) return null
  return { title: r.title, artist: r.artist, thumbnail: r.thumbnail_url || r.thumbnail }
}

async function fetchYouTubeFallback(text) {
  const meta = await fetchNyxMetadata(text).catch(() => null)
  const query = meta ? `${meta.title} ${String(meta.artist || '').split('·')[0]}`.trim() : text

  const { videos } = await searchYouTube(query)
  const video = videos?.[0]
  if (!video) throw new Error('لم يتم العثور على الأغنية في يوتيوب')

  const dl = await downloadYouTube(video.url, 'audio')
  const downloadUrl = dl.download || dl.download_url || dl.url
  if (!downloadUrl) throw new Error('فشل تحميل الصوت من يوتيوب')

  return {
    title: meta?.title || dl.title || video.title,
    durationSeconds: null,
    quality: '128kbps',
    thumbnail: meta?.thumbnail || dl.thumbnail || video.thumbnail,
    downloadUrl,
    mimeType: 'audio/mpeg'
  }
}

async function fetchSpotify(text) {
  let primaryErr

  try {
    return await fetchDlapixy(text)
  } catch (err) {
    primaryErr = err
  }

  try {
    return await fetchYouTubeFallback(text)
  } catch {}

  throw primaryErr
}

async function sendAudio(conn, m, data) {
  const audio = {
    ptt: false,
    fileName: `${data.title || 'cancion'}.mp3`,
    mimetype: data.mimeType || 'audio/mpeg'
  }

  try {
    await conn.sendMessage(
      m.chat,
      { audio: { url: data.downloadUrl }, ...audio },
      { quoted: m }
    )
  } catch {
    const r = await axios.get(data.downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 120000,
      maxContentLength: 100 * 1024 * 1024
    })
    await conn.sendMessage(
      m.chat,
      { audio: Buffer.from(r.data), ...audio },
      { quoted: m }
    )
  }
}

let handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) return m.reply(`🎃🦇 أدخل اسم Spotify أو الرابط لاستدعاء موسيقى الهالوين الخاصة بك.`)

  await m.react('🎃')

  let stage = 'استعلام واجهة برمجة التطبيقات'

  try {
    const data = await fetchSpotify(text)

    const downloadUrl = data.downloadUrl
    if (!downloadUrl) {
      await m.react('❌')
      return m.reply('🎃 لا يمكن الحصول على لحن الظل.')
    }

    const duracion = data.durationSeconds 
      ? Math.floor(data.durationSeconds / 60) + ':' + String(data.durationSeconds % 60).padStart(2, '0') 
      : 'Desconocida'

    const info = `🎃 استحضار لحن من وراء القبر... *${data.title || 'بدون عنوان'}* 🦇\n\n` +
                 `> ⏳ المدة › *${duracion}*\n` +
                 `> 🕯️ الجودة › *${data.quality || 'Desconocida'}*\n` +
                 `> 🕸️ المصدر › *${text}*`

    stage = 'تقديم الغلاف'

    if (data.thumbnail) {
      try {
        await conn.sendMessage(m.chat, { image: { url: data.thumbnail }, caption: info }, { quoted: m })
      } catch (e) {
        console.log('[سبوتيفي] استدار:', e.message || e)
        await conn.sendMessage(m.chat, { text: info }, { quoted: m })
      }
    } else {
      await conn.sendMessage(m.chat, { text: info }, { quoted: m })
    }

    stage = 'إرسال الصوت'

    await sendAudio(conn, m, data)

    await m.react('✅')

  } catch (e) {
    console.log(`[سبوتيفي] خطأ (${stage}):`, e.message || e)
    await m.react('❌')
    await m.reply(
      `🕷 حدث خطأ أثناء معالجة طلبك.\n\n🜸 المرحلة: ${stage}\n🜸 التفاصيل: ${String(e.message || e).slice(0, 300)}`
    )
  }
}

handler.help = ['spotify *<nombre|url>*']
handler.tags = ['downloader']
handler.command = /^(spotify|spdl)$/i
handler.register = true

export default handler
