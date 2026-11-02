import fetch from 'node-fetch'

var handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return conn.reply(m.chat, `🌑 *𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏*\nيجب عليك تقديم اسم الأنمي أو المانجا للكشف عن معلوماته.`, m)

  try {
    await m.react('🎭') 
    let res = await fetch('https://api.jikan.moe/v4/manga?q=' + text)
    if (!res.ok) {
      await m.react('✖️')
      return conn.reply(m.chat, `⚠️ فشلت الطقوس...\n> استخدم *${usedPrefix}report* للإبلاغ عنها.`, m)
    }

    let json = await res.json()
    let data = json.data[0]

    let {
      chapters,
      title_japanese,
      url,
      type,
      score,
      members,
      background,
      status,
      volumes,
      synopsis,
      favorites
    } = data

    let author = data.authors?.[0]?.name || 'غير محدد'

    const traducir = async (txt) => {
      if (!txt) return 'غير محدد'
      try {
        let tr = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(txt)}&langpair=en|es`)
        let trjson = await tr.json()
        return trjson.responseData.translatedText || txt
      } catch {
        return txt
      }
    }

    synopsis = await traducir(synopsis)
    background = await traducir(background)

    let animeinfo = `🌑 * كتالوج الظلال *
    
❖ *Título:* ${title_japanese}
❖ *Capítulos:* ${chapters}
❖ *Tipo:* ${type}
❖ *الحالة:* ${status}
❖ *Volúmenes:* ${volumes}
❖ *Favoritos:* ${favorites}
❖ *Puntaje:* ${score}
❖ *Miembros:* ${members}
❖ *Autor:* ${author}
❖ *Contexto:* ${background}
❖ *Sinopsis:* ${synopsis}
❖ *Enlace:* ${url}

🜁 *تم استخراج المعلومات من الأرشيف المخفي لمملكة الظلال.*`

    await conn.sendFile(
      m.chat,
      data.images.jpg.image_url,
      'Flash_manga.jpg',
      animeinfo,
      m
    )

    await m.react('✔️')

  } catch (error) {
    await m.react('✖️')
    await conn.reply(
      m.chat,
      `⚠️ فشلت الطقوس...\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${error.message}`,
      m
    )
  }
}

handler.help = ['infoanime']
handler.tags = ['search']
handler.command = ['infoanime']
handler.group = true

export default handler
