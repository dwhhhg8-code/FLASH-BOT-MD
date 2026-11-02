import { exec } from 'child_process'
import fs from 'fs'
import util from 'util'
import crypto from 'crypto'
import webp from 'node-webpmux'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const execAsync = util.promisify(exec)

async function addExif(webpBuffer, packname, author) {
  const img = new webp.Image()
  const stickerPackId = crypto.randomBytes(32).toString('hex')
  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': ['\u{1F916}']
  }
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00
  ])
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)
  await img.load(webpBuffer)
  img.exif = exif
  return await img.save(null)
}

const styles = {
  circle: 'دائرة (انقطاع دائري)',
  crop: 'انقطاع مركزي 512x512',
  bw: 'أبيض وأسود',
  invert: 'عكس الألوان',
  blur: 'Desenfoque',
  pixel: 'Pixelado',
  sepia: 'Sepia',
  neon: 'حدود النيون'
}

const listText =
  '\u25AE\u25AE _قائمة الأنماط_ (*s* <style>)\n\n' +
  Object.keys(styles).map(k => '\u2022 *s ' + k + '* \u2014 ' + styles[k]).join('\n') +
  '\n\n\u2022 *القائمة*'

let handler = async (m, { conn, args }) => {
  const from = m.chat
  if (!from) return

  const opt = (args[0] || '').toLowerCase()

  if (opt === 'list') {
    return conn.sendMessage(from, { text: listText }, { quoted: m })
  }

  if (opt === 'details') {
    try {
      const detailText =
        '🎃🦇 _FLASH BOT • طوابع الهالوين الغامضة_\n\n' +
        'هذه هي الأنماط الداكنة المتوفرة لصياغة ختمك المخصص:\n\n' +
        Object.keys(styles).map(k => '🕯️ *s ' + k + '* \u2014 ' + styles[k]).join('\n')
      await conn.relayMessage(from, {
        interactiveMessage: {
          header: { title: '🎃 فلاش بوت • الهالوين 🦇' },
          body: { text: detailText },
          nativeFlowMessage: {
            buttons: [{ name: 'inapp_signup', buttonParamsJson: '{}' }],
            messageParamsJson: ''
          },
          contextInfo: {}
        }
      }, { quoted: m })
    } catch (e) {
      await conn.sendMessage(from, { text: listText }, { quoted: m })
    }
    return
  }

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image|video/.test(mime)) {
    const helpText =
      '' + (m.pushName || 'contratista') + ', قم بالرد على *صورة* أو *فيديو* لتصنع ختمك المتجهم في عيد الهالوين 🦇\n\n' +
      'اضغط على زر *انظر التفاصيل* لرؤية جميع النماذج المتوفرة في الفرن 🕯️'

    try {
      await conn.relayMessage(from, {
        interactiveMessage: {
          header: { title: global.packsticker || 'بوت الظل' },
          body: { text: helpText },
          nativeFlowMessage: {
            buttons: [{
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({ display_text: 'انظر التفاصيل', id: '.s details' })
            }],
            messageParamsJson: ''
          },
          contextInfo: {}
        }
      }, { quoted: m })
    } catch (e) {
      await conn.sendMessage(from, { text: helpText }, { quoted: m })
    }
    return
  }

  const isVideo = /video/.test(mime)

  let buffer
  try {
    buffer = await q.download()
  } catch {
    try {
      const { downloadMediaMessage } = await import('@whiskeysockets/baileys')
      buffer = await downloadMediaMessage(q, 'buffer', {}, { logger: console })
    } catch (e) {
      return conn.sendMessage(from, { text: 'حدث خطأ أثناء التنزيل' + (isVideo ? 'video' : 'imagen') + '.' }, { quoted: m })
    }
  }
  if (!buffer) {
    return conn.sendMessage(from, { text: '' }, { quoted: m })
  }

  const ts = Date.now()
  const input = '' + ts + '.' + (isVideo ? 'mp4' : 'jpg')
  const output = '' + ts + '.webp'

  await fs.promises.mkdir('./tmp', { recursive: true })
  await fs.promises.writeFile(input, buffer)

  const style = opt || 'circle'
  if (style && style !== '' && !styles[style]) {
    await conn.sendMessage(from, { text: listText }, { quoted: m })
    if (fs.existsSync(input)) await fs.promises.unlink(input)
    return
  }

  const baseContain =
    'fps=15,' +
    'scale=512:512:force_original_aspect_ratio=decrease,' +
    'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0'

  const baseCoverCrop =
    'fps=15,' +
    'scale=512:512:force_original_aspect_ratio=increase,' +
    'المحاصيل = 512:512'

  const geqCircle = "geq=lum='p(X,Y)':a='if(lte(hypot(X-256,Y-256),256),255,0)'"

  const vf =
    style === 'circle' ? (baseCoverCrop + '' + geqCircle) :
    style === 'crop' ? baseCoverCrop :
    style === 'bw' ? (baseContain + ',hue=s=0') :
    style === 'invert' ? (baseContain + ',negate') :
    style === 'blur' ? (baseContain + ',gblur=sigma=6') :
    style === 'pixel' ? (baseContain + ',scale=128:128:flags=neighbor,scale=512:512:flags=neighbor') :
    style === 'sepia' ? (baseContain + ',colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131') :
    style === 'neon' ? (baseContain + ',edgedetect=low=0.08:high=0.2') :
    (baseCoverCrop + '' + geqCircle)

  const ffmpegCmd = isVideo
    ? 'ffmpeg -y -i "' + input + '" -t 8 -an -vf "' + vf + '" -loop 0 -fps_mode passthrough "' + output + '"'
    : 'ffmpeg -y -i "' + input + '" -an -vf "' + vf + '" -loop 0 -fps_mode passthrough "' + output + '"'

  try {
    await execAsync(ffmpegCmd)
    let stickerBuffer = await fs.promises.readFile(output)

    const packName = global.packsticker || 'بوت الظل'
    const author = global.dev || 'haitham'
    stickerBuffer = await addExif(stickerBuffer, packName, author)

    await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: m })
  } catch (e) {
    const err = (e?.stderr || e?.stdout || e?.message || String(e) || '').toString()
    await conn.sendMessage(from, {
      text: 'حدث خطأ أثناء إنشاء الملصق.\n\nالنمط: *' + style + '*\nخطأ:\n```\n' + err.slice(0, 3500) + '\n```'
    }, { quoted: m })
  } finally {
    if (fs.existsSync(input)) await fs.promises.unlink(input)
    if (fs.existsSync(output)) await fs.promises.unlink(output)
  }
}

handler.help = ['sticker', 's', 'stiker']
handler.tags = ['sticker']
handler.command = ['sticker', 's', 'stiker']

export default handler
