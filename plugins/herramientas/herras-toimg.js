let handler = async (m, { conn, usedPrefix, command }) => {
if (!m.quoted) {
return conn.reply(m.chat, `ꕤ يجب عليك اقتباس ملصق لتحويله إلى صورة.`, m, rcanal)
}
await m.react('🕒')
let xx = m.quoted
let imgBuffer = await xx.download()   
if (!imgBuffer) {
await m.react('✖️')
return conn.reply(m.chat, `✩ لا يمكن معالجة الملصق.`, m)
}
await conn.sendMessage(m.chat, { image: imgBuffer, caption: '✿ *تفضلي :D*' }, { quoted: m })
await m.react('✔️')
}

handler.help = ['toimg']
handler.tags = ['tools']
handler.command = ['toimg', 'jpg', 'img'] 

export default handler
