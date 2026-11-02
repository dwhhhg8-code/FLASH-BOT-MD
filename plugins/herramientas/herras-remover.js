import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let imgUrl

    if (args[0] && args[0].match(/^https?:\/\//)) {
      imgUrl = args[0]
    } else if (/image/.test(mime)) {
      await m.reply('🌫️المعالجة في الظل...')
      const media = await q.download()
      imgUrl = await uploadToCatbox(media)
    } else {
      return m.reply('🍎 قم بالرد على صورة أو أدخل عنوان URL صالحًا (JPG/PNG).')
    }

    const apiUrl = `https://api-killua.vercel.app/api/tools/ezremove?imgurl=${encodeURIComponent(imgUrl)}`
    const res = await fetch(apiUrl)

    if (!res.ok) throw new Error('خطأ في معالجة الصورة')

    const buffer = await res.buffer()

    const caption =
`🌑 𖤐 حديقة الظل - إزالة من الخلفية 𖤐

حالة 🍧 › تمت إزالة الخلفية
نتيجة 🍓 › PNG شفافة
🍒 Pedido por › ${m.pushName || 'عضو مجهول'}`.trim()

    await conn.sendMessage(
      m.chat,
      { image: buffer, caption },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    await m.reply('🕷️ فشلت الطقوس... لم أتمكن من إزالة الخلفية.')
  }
}

handler.help = ['remover', 'removebg']
handler.tags = ['tools']
handler.command = ['remover', 'removebg']
handler.group = false
handler.premium = false

export default handler

async function uploadToCatbox(content) {
  const { default: FormData } = await import('form-data')
  const fd = new FormData()
  fd.append('fileToUpload', content, 'image.jpg')
  fd.append('reqtype', 'fileupload')

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: fd
  })

  return await res.text()
}
