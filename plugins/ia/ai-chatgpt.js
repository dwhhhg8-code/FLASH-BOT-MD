import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
        let helpMsg =
        `🎃🧠 *هالوين غامض أوراكل (GPT)* 🦇\n\n` +
        `❖ *الاستدعاء:*\n` +
        `اكتب سؤالك أو تهجئة بعد الأمر.\n\n` +
        `❖ *أمثلة:*\n` +
        `▸ ${usedPrefix + command} أخبرني بقصة رعب في السحرة\n` +
        `▸ ${usedPrefix + command} اكتب لي رمزًا لصفحة الويب المظلمة\n` +
        `▸ ${usedPrefix + command} ما معنى الظلال؟`

        return conn.sendMessage(m.chat, { text: helpMsg }, { quoted: m })
    }

    try {
        await conn.sendPresenceUpdate('composing', m.chat)

        try {
            await conn.sendMessage(m.chat, { react: { text: '🎃', key: m.key } })
        } catch (e) {}

        let username = m.pushName || "contratista"
        let systemPrompt = `
        Eres un sabio arcano y asistente sombrío de FLASH BOT en temática de Halloween.
        Tu nombre: ChatGPT Flash Halloween.
        El contratista que te habla se llama: ${username}.
        Responde en español con un tono misterioso, elocuente, sabio y útil.
        `.trim()

        let apiUrl = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai&system=${encodeURIComponent(systemPrompt)}`
        let req = await fetch(apiUrl)
        let response = await req.text()

        if (!response) throw new Error('تعذر الحصول على استجابة من الخادم.')

        const fkontak = {
            key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'ChatGPT' },
            message: {
                locationMessage: {
                    name: 'ChatGPT • Premiun 👑',
                    jpegThumbnail: await (await fetch('https://files.catbox.moe/s2ajod.jpg')).buffer(),
                    vcard:
                        'BEGIN:VCARD\n' +
                        'VERSION:3.0\n' +
                        'N:;ChatGPT;;;\n' +
                        'FN:ChatGPT\n' +
                        'ORG:OpenAI\n' +
                        'TITLE:Asistente IA\n' +
                        'item1.TEL;waid=00000000000:+0 000 000 0000\n' +
                        'item1.X-ABLabel:IA\n' +
                        'X-WA-BIZ-DESCRIPTION:استجابات سريعة وواضحة ودقيقة.\n' +
                        'X-WA-BIZ-NAME:ChatGPT\n' +
                        'END:VCARD'
                }
            },
            participant: '0@s.whatsapp.net'
        }

        await conn.sendMessage(
            m.chat,
            { text: response.trim() },
            { quoted: fkontak }
        )

        try {
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        } catch (e) {}

    } catch (error) {
        console.error(error)

        try {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        } catch (e) {}

        await conn.sendMessage(m.chat, { text: '❌ *حدث خطأ أثناء الاتصال بالسيرفر.*' }, { quoted: m })
    }
}

handler.command = /^(openai|chatgpt|ia|ai|chatgpt2|ia2)$/i
handler.help = ['ai <pregunta>', 'chatgpt <pregunta>']
handler.tags = ['ia']
handler.group = true

export default handler
