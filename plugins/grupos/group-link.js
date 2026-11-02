
import { generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

let fkontak = { 
    "key": { 
        "participants":"0@s.whatsapp.net", 
        "remoteJid": "status@broadcast", 
        "fromMe": false, 
        "id": "Halo" 
    }, 
    "message": { 
        "contactMessage": { 
            "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:Bot\nitem1.TEL;waid=5219991234567:5219991234567\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
        }
    }, 
    "participant": "0@s.whatsapp.net" 
}

var handler = async (m, { conn, args }) => {
    let group = m.chat
    
    try {
        const pp = await conn.profilePictureUrl(group, 'image').catch((_) => 'https://raw.githubusercontent.com/Andresv27728/dtbs/main/shadow.jpg')
        let inviteCode = await conn.groupInviteCode(group)
        let link = 'https://chat.whatsapp.com/' + inviteCode

        let title = '🔗رابط دعوة المجموعة'
        let bodyText = `*هذا هو رابط الدعوة:*\n\n> \`الرابط:\` ${link}`
        let footerText = 'اضغط على الزر لنسخ الرابط.'

        const buttons = [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({ 
                    display_text: "نسخ الوصلة", 
                    copy_code: link 
                })
            },
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({ 
                    display_text: "افتح الرابط", 
                    url: link 
                })
            }
        ];

        const { imageMessage } = await generateWAMessageContent({ 
            image: { url: pp } 
        }, { upload: conn.waUploadToServer })

        const interactive = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({ text: bodyText }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: footerText }),
                        header: proto.Message.InteractiveMessage.Header.fromObject({ 
                            title: title, 
                            hasMediaAttachment: true, 
                            imageMessage 
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ 
                            buttons, 
                            messageParamsJson: '' 
                        })
                    })
                }
            }
        }, { quoted: fkontak });

        await conn.relayMessage(m.chat, interactive.message, { messageId: interactive.key.id })

    } catch (e) {
        console.error("حدث خطأ أثناء إنشاء/إرسال رابط تفاعلي:", e);
        
        let fallbackLink = 'https://chat.whatsapp.com/' + (await conn.groupInviteCode(group).catch(() => ''))
        let fallbackPP = await conn.profilePictureUrl(group, 'image').catch((_) => 'https://raw.githubusercontent.com/Andresv27728/dtbs/main/shadow.jpg')
        let fallbackMessage = `*❌ فشل إرسال الرسالة التفاعلية. تأكد من أن الروبوت هو مسؤول.*\n\n*➭ إليك الرابط على أية حال:*\n\n> \`Link:\` ${fallbackLink}`
        
        await conn.sendMessage(group, { image: { url: fallbackPP }, caption: fallbackMessage }, { quoted: m })
    }
}

handler.help = ['link']
handler.tags = ['grupos']
handler.command = ['link', 'enlace']
handler.group = true
handler.botAdmin = true

export default handler
