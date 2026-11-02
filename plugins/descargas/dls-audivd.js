import { join } from 'path'
import { promises as fs } from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const handler = async (m, { conn }) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''

    if (!/video/.test(mime)) return m.reply('✨ *بوت فلاش — تحليل*\n\n❌ قم بالرد على مقطع فيديو لاستخراج الصوت منه.')

    await m.react("⏳")

    let tempVideo
    let tempAudio
    try {
        const videoBuffer = await q.download()
        if (!videoBuffer) throw new Error('تعذر الحصول على المخزن المؤقت للفيديو.')

        const tempDir = join(process.cwd(), './tmp')
        await fs.stat(tempDir).catch(() => fs.mkdir(tempDir, { recursive: true }))

        tempVideo = join(tempDir, `${Date.now()}.mp4`)
        tempAudio = join(tempDir, `${Date.now()}.mp3`)

        await fs.writeFile(tempVideo, videoBuffer)

        await execFileAsync('ffmpeg', [
            '-y',
            '-i', tempVideo,
            '-vn',
            '-ar', '44100',
            '-ac', '2',
            '-b:a', '192k',
            tempAudio
        ], { timeout: 120000 })

        const audioBuffer = await fs.readFile(tempAudio)
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: m })
        await m.react("✅")

    } catch (e) {
        console.error(e)
        await m.reply('❌فشلت معالجة الملف:' + e.message)
    } finally {
        await fs.unlink(tempVideo).catch(() => {})
        await fs.unlink(tempAudio).catch(() => {})
    }
}

handler.help = ['audivd']
handler.tags = ['tools']
handler.command = ['audivd']
handler.register = true

export default handler
