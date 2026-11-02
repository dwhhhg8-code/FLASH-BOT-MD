import fetch from 'node-fetch'
import axios from 'axios'
import fs from 'fs'

const timeout = 60000
const poin = Math.floor(Math.random() * (2000 - 500 + 1)) + 500

const handler = async (m, { conn, usedPrefix }) => {
  const datas = global
  const idioma = datas.db?.data?.users?.[m.sender]?.language || global.defaultLenguaje

  let _translate
  try {
    _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  } catch {
    _translate = { plugins: { game_cancion: { texto1: 'هناك بالفعل لعبة قيد التقدم هنا.' } } }
  }
  const tradutor = _translate.plugins.game_cancion

  conn.tebaklagu = conn.tebaklagu || {}
  const id = m.chat
  if (id in conn.tebaklagu) {
    conn.reply(m.chat, tradutor.texto1, conn.tebaklagu[id][0])
    throw false
  }

  const res = await fetchJson(`https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/tebaklagu.json`)
  const json = res[Math.floor(Math.random() * res.length)]

  const caption = `
┏━━━━━━━━━━━━━━━━━━━┓
🌑 *مملكة الظلال* 🌑
┗━━━━━━━━━━━━━━━━━━━┛

🎵 *احزر عنوان الأغنية* 🎵
الظلال تهمس ألحاناً مخفية...

⏰ الوقت límite: ${(timeout / 1000).toFixed(0)} segundos
💡 Usa *${usedPrefix || '.'}pista* لاستدعاء تلميح الظل
🏆 Recompensa: ${poin} XP sombríos

> Responde a este mensaje para que tu destino sea detectado.

✨ استمع للأغنية... دع الظلام يرشد إجابتك ✨
`.trim()

  conn.tebaklagu[id] = [
    await m.reply(caption),
    json,
    poin,
    setTimeout(() => {
      if (conn.tebaklagu[id]) {
        conn.reply(m.chat, `⏰ تلاشى الوقت في الظل...\n\n🎵 وكانت الإجابة: *${json.jawaban}*`, conn.tebaklagu[id][0])
        delete conn.tebaklagu[id]
      }
    }, timeout),
  ]

  const aa = await conn.sendMessage(
    m.chat,
    { audio: { url: json.link_song }, fileName: 'Flash-song.mp3', mimetype: 'audio/mpeg' },
    { quoted: m }
  )
  if (!aa) return conn.sendFile(m.chat, json.link_song, 'Flash-song.mp3', '', m)
}

handler.help = ['cancion', 'canción']
handler.tags = ['game']
handler.command = ['cancion', 'canción']

export default handler

async function fetchJson(url, options) {
  try {
    const res = await axios({
      method: 'GET',
      url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
      },
      ...(options || {})
    })
    return res.data
  } catch (err) {
    return []
  }
                              }
