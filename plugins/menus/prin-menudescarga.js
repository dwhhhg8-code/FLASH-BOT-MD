import { prepareWAMessageMedia, generateWAMessageFromContent } from "@whiskeysockets/baileys";
import fetch from "node-fetch";

let handler = async (m, { conn, usedPrefix }) => {
    await m.react('🎃')
    const delay = ms => new Promise(res => setTimeout(res, ms))

    let after = '🎃 ღ𝐒𝐇𝐀𝐃𝐎𝐖-𝐁𝐎𝐓-𝐌𝐃 • 𝐇𝐀𝐋𝐋𝐎𝐖𝐄𝐄𝐍༻๖ۣۜ 🦇'
    let user = global.db.data.users[m.sender]
    let nombre = await conn.getName(m.sender)
    let registrado = user?.registered ? '🎃 نعم (الميثاق مختوم)' : '❌ لا'
    let limite = user?.limit || 0
    let totalreg = Object.keys(global.db.data.users).length
    let groupsCount = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us')).length
    let muptime = clockString(process.uptime())

    function clockString(seconds) {
        let h = Math.floor(seconds / 3600)
        let m = Math.floor(seconds % 3600 / 60)
        let s = Math.floor(seconds % 60)
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
    }

    let infoUser = `
🎃 ʜᴏʟᴀ, ${nombre} 🦇
*«ظلال المعشر ترحب بكم...»* 🕯️

*乂 معلومات المقاول 🎃 🦇*
┌ ◦ الحالة: المستخدم 🕯️
│  ◦ ʀᴇɢɪꜱᴛʀᴀᴅᴏ: ${registrado}
└  ◦ ʟíᴍɪᴛᴇ: ${limite} 🩸

*乂 🕸️ ɪɴꜰᴏ ᴅᴇ ʟᴀ ꜱᴏᴍʙʀᴀ ⚰️*
┌  ◦ ᴄíʀᴄᴜʟᴏꜱ: ${groupsCount} 🏰
│  ◦ ᴛɪᴇᴍᴘᴏ ᴀᴄᴛɪᴠᴏ: ${muptime} ⏳
│  ◦ ᴀʟᴍᴀꜱ: ${totalreg} 👻
└  ◦ ʀᴇɪɴᴏ: ʟɪɴᴜx 🌘

ꜱɪ ᴇɴᴄᴜᴇɴᴛʀᴀꜱ ᴀʟɢᴜ́ɴ ᴇʀʀᴏʀ, ᴘᴏʀ ꜰᴀᴠᴏʀ ᴄᴏɴᴛᴀᴄᴛᴀ ᴀʟ ᴏᴡɴᴇʀ.
`.trim()

    let listaDescargas = `
*╭──* 🎃 \`التنزيلات من التشفير\` *🦇*
*│ 🕸️* ${usedPrefix}انمي <اسم> 
*│ 🕸️* ${usedPrefix}تطبيق
*│ 🕸️* ${usedPrefix}فيس
*│ 🕸️* ${usedPrefix}فب
*│ 🕸️* ${usedPrefix}انستا
*│ 🕸️* ${usedPrefix}ايچي
*│ 🕸️* ${usedPrefix}ميديافير
*│ 🕸️* ${usedPrefix}تحميل
*│ 🕸️* ${usedPrefix}ملفصوت
*│ 🕸️* ${usedPrefix}يوتيوبصوت2
*│ 🕸️* ${usedPrefix}فيديوكمستند
*│ 🕸️* ${usedPrefix}يوتيوبفيديو2
*│ 🕸️* ${usedPrefix}سبوتيفاي *<اسم|رابط>*
*│ 🕸️* ${usedPrefix}تيكتوك
*│ 🕸️* ${usedPrefix}خلفيه
*╰─────────────╯*
`.trim()

    let finalMenu = infoUser + '\n\n' + listaDescargas + '\n\n' + after
    let imagenUrl = 'https://u.pone.rs/qhsqizgs.jpg'

    let media;
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 8000);
        let res = await fetch(imagenUrl, { signal: controller.signal });
        if (res.ok) {
            let bufferImage = await res.buffer();
            media = await prepareWAMessageMedia(
                { image: bufferImage },
                { upload: conn.waUploadToServer }
            );
        }
    } catch {
        media = null;
    }

    if (!media) return m.reply('❌لا يمكن تحميل الصورة للقائمة.')

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: media ? {
                        hasMediaAttachment: true,
                        imageMessage: media.imageMessage 
                    } : undefined,
                    body: { text: finalMenu },
                    footer: { text: "🎃 ღ𝐒𝐇𝐀𝐃𝐎𝐖-𝐁𝐎𝐓-𝐌𝐃 • 𝐇𝐀𝐋𝐋𝐎𝐖𝐄𝐄𝐍༻๖ۣۜ 🦇" },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "🎃 اختر القائمة 🦇",
                                    sections: [
                                        {
                                            title: "🎃فلاش بوت MD 🦇",
                                            highlight_label: "HALLOWEEN",
                                            rows: [
                                                { header: "🎃 الكل", title: "📜 القائمة الكاملة", description: "شاهد جميع أوامر الليل", id: `${usedPrefix}allmenu` }
                                            ]
                                        }
                                    ]
                                })
                            }
                        ],
                        messageParamsJson: JSON.stringify({
                            bottom_sheet: {
                                in_thread_buttons_limit: 1,
                                divider_indices: [],
                                list_title: "🎃 اختر القائمة 🦇",
                                button_title: "🎃 ᴍᴇɴᴜ ʟɪsᴛ 🦇"
                            }
                        })
                    },
                    contextInfo: {
                        mentionedJid: [m.sender],
                        isForwarded: true,
                        forwardingScore: 999
                    }
                }
            }
        }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, {})
    await delay(250)
}

handler.help = ['menudescargas']
handler.tags = ['downloader']
handler.command = ['menudescargas', 'menudescar']
handler.register = true

export default handler
