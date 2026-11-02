import { resolverObjetivo, nombreSeguro } from '../../lib/anime-mention.js'
const CAFE_VIDEOS = [
  'https://u.pone.rs/wrdixhdu.mp4',
  'https://u.pone.rs/lsvklqjq.mp4',
  'https://u.pone.rs/xzsgbdlb.mp4',
  'https://u.pone.rs/sjlogmhw.mp4',
  'https://u.pone.rs/cwurrbtn.mp4'
]

const UA = 'FlashBot/1.0 (+https://github.com/dwhhhg8-code/FLASH-BOT-MD)'

function mezclar(lista) {
  const c = [...lista]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

function esMp4Valido(buf) {
  if (!buf || buf.length < 1024) return false
  const ascii = buf.subarray(4, 8).toString('ascii')
  if (ascii === 'ftyp') return true
  if (buf.subarray(0, 4).toString('ascii').startsWith('GIF8')) return true
  return false
}

async function descargarVideo(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 20000)
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (!esMp4Valido(buf)) throw new Error('إنه غير صالح الفيديو')
    return buf
  } finally {
    clearTimeout(t)
  }
}

let handler = async (m, { conn, participants, groupMetadata, text, args, usedPrefix }) => {
    const { who, via, hasMention } = await resolverObjetivo(m, { conn, participants, groupMetadata, text, args });
    const hayMencion = hasMention || via === 'mention' || via === 'text';

    const name = await nombreSeguro(conn, who);
    const name2 = await nombreSeguro(conn, m.sender);
    m.react('☕');

    let str;
    if (hayMencion || via === 'quoted') {
        str = `☕ \`${name2}\` *يستمتع بفنجان من القهوة مع* \`${name}\`. يا لها من لحظة لذيذة!`;
    } else {
        str = `☕ \`${name2}\` *يشرب فنجان من القهوة السوداء*. في بعض الأحيان يكون مذاق القهوة وحدها أفضل. ☕`.trim();
    }

    if (m.isGroup) {
        let enviado = false
        let ultimoError = null
        for (const url of mezclar(CAFE_VIDEOS)) {
            try {
                const buf = await descargarVideo(url)
                try {
                    await conn.sendMessage(m.chat, { video: buf, mimetype: 'video/mp4', gifPlayback: true, caption: str, mentions: [who] }, { quoted: m });
                } catch (e) {
                    console.warn('[anime-cafe] gifPlayback Falló, إعادة التشغيل بدون gifPlayback:', e.message)
                    await conn.sendMessage(m.chat, { video: buf, mimetype: 'video/mp4', caption: str, mentions: [who] }, { quoted: m });
                }
                console.log(`[أنمي كافيه] أرسل ${url} (${Math.round(buf.length / 1024)} KB)`)
                enviado = true
                break
            } catch (e) {
                ultimoError = e
                console.warn('[أنمي كافيه] فشل', url, ':', e.message)
            }
        }
        if (!enviado) {
            console.error('[أنمي كافيه] لم يعمل أي فيديو:', ultimoError?.message)
            await conn.sendMessage(m.chat, { text: str, mentions: [who] }, { quoted: m });
        }
    } else {
        await conn.sendMessage(m.chat, { text: str }, { quoted: m });
    }
};

handler.help = ['coffee/cafe @tag'];
handler.tags = ['anime'];
handler.command = ['coffee', 'cafe', 'taza'];
handler.group = true;

export default handler;                               
