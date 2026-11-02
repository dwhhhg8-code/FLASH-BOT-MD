import sharp from 'sharp'
import { generateWAMessageFromContent, proto } from "@whiskeysockets/baileys"

const COLORES = {
    blanco: "#ffffff",
    verde: "#8ace00",
    rojo: "#ff4d4d",
    azul: "#4d9bff",
    amarillo: "#ffe14d",
    rosa: "#ff7eb6",
    cian: "#4de1e1",
    naranja: "#ff9f45",
    violeta: "#b06bff"
}

const escapeXml = (v = "") => String(v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;")

function wrapText(text, maxChars = 14) {
    const words = String(text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean)
    const lines = []
    let current = ""
    for (const word of words) {
        const next = current ? `${current} ${word}` : word
        if (next.length > maxChars && current) { lines.push(current); current = word }
        else current = next
    }
    if (current) lines.push(current)
    return lines.length ? lines : ["brat"]
}

function buildSvg(text, bg) {
    const width = 768, height = 768
    const lines = wrapText(text)
    const longest = Math.max(...lines.map(l => l.length), 1)
    const fontSize = Math.max(44, Math.min(150, Math.floor((width * 0.82) / Math.max(longest * 0.58, 1)), Math.floor((height * 0.68) / Math.max(lines.length * 1.05, 1))))
    const lineHeight = Math.round(fontSize * 1.03)
    const startY = Math.round((height - lineHeight * lines.length) / 2 + fontSize * 0.8)
    const tspans = lines.map((l, i) => `<tspan x="50%" y="${startY + i * lineHeight}">${escapeXml(l)}</tspan>`).join("")
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <text x="50%" y="50%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900" fill="#111111" style="letter-spacing:-3px">${tspans}</text>
</svg>`
}

var handler = async (m, { conn, usedPrefix, command, text }) => {
    let [txt, color] = text.split('|')
    let textoFinal = txt || m.quoted?.text || text

    if (!textoFinal) return conn.reply(m.chat, '🌑✦ *فلاش بوت* يحتاج إلى رسالة أو رسالة نصية.', m)

    if (!color) {
        const colores = Object.keys(COLORES).map(c => ({
            title: c.charAt(0).toUpperCase() + c.slice(1),
            id: `${usedPrefix + command} ${textoFinal}|${c}`
        }))

        const interactive = proto.Message.InteractiveMessage.fromObject({
            body: { text: `⚡ *Fʟᴀsʜ Bᴏᴛ Cᴀᴛᴀʟᴏɢᴜᴇ*\n\nفي انتظار اختيارك للون لـ:\n> *"${textoFinal.trim()}"*` },
            footer: { text: "FLASH BOT" },
            nativeFlowMessage: {
                buttons: [{
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                        title: "📜 اختر اللون",
                        sections: [{ title: "الألوان المتاحة", rows: colores }]
                    })
                }]
            }
        })

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: { message: { interactiveMessage: interactive } }
        }, { quoted: m })

        return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }

    try {
        await m.react('🕒')

        const bg = COLORES[color.trim().toLowerCase()] || COLORES.blanco
        const pngBuffer = await sharp(Buffer.from(buildSvg(textoFinal.trim(), bg))).png().toBuffer()

        let user = globalThis.db.data.users[m.sender] || {}
        let name = user.name || m.sender.split('@')[0]
        let pack = user.metadatos || `Fʟᴀsʜ Bᴏᴛ ⚡`
        let auth = user.metadatos2 || `@${name}`

        const webpBuffer = await sharp(pngBuffer)
            .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp({ quality: 80 })
            .toBuffer()

        await conn.sendMessage(m.chat, {
            sticker: webpBuffer,
            packname: pack,
            author: auth
        }, { quoted: m })

        await m.react('✔️')

    } catch (e) {
        await m.react('✖️')
        console.error(e)
    }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^(brat|bratcolor)$/i

export default handler
