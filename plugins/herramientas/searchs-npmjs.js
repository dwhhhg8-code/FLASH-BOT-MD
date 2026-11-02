import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `🌌 *𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏* 🎄\nيجب عليك تقديم اسم *المكشطة* أو الحزمة.\nمثال: ${usedPrefix + command} yt-search`, m)

  try {
    await m.react('🎭')
    conn.reply(m.chat, `🌌 *استدعاء الظلال* 🎅\nالبحث عن أداة النسخ في السجلات المخفية...`, m)

    let res = await fetch(`http://registry.npmjs.com/-/v1/search?text=${text}`)
    let { objects } = await res.json()

    if (!objects.length) return conn.reply(m.chat, `🌌 *𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏* 🎄\nلم يتم العثور على نتيجة لـ: *${text}*`, m)

    let txt = objects.map(({ package: pkg }) => {
      return `《✧》 *المكشطة التي تم استدعاؤها – إصدار عيد الميلاد* 《✧》

❖ الاسم: ${pkg.name}
❖ الإصدار: V${pkg.version}
❖ Enlace: ${pkg.links.npm}
❖ Descripción: ${pkg.description || 'لا يوجد وصف'}
\n───────────────`
    }).join`\n\n`

    await conn.reply(m.chat, txt, m, fake)
    await m.react('✔️')
  } catch {
    await conn.reply(m.chat, `⚠️ فشلت الطقوس...\n> استخدم *${usedPrefix}report* للإبلاغ عنها.`, m)
    await m.react('✖️')
  }
}

handler.help = ['npmjs']
handler.tags = ['search']
handler.command = ['npmjs']
handler.register = true

export default handler
