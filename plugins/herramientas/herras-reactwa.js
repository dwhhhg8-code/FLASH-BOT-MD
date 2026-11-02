// plugins/herramientas/herras-reactwa.js

// Reacción en Canales de WhatsApp

// Plugin ESM

// nota: obtén tu API key en esta web: https://reaction-whatsapp.edgeone.dev/

import axios from 'axios'

let handler = async (m, {
    text,
    usedPrefix,
    command
}) => {
    if (!text) {
        throw `❀ *كيفية الاستخدام:*\n\n` +
            `${usedPrefix + command} <link> <emoji>\n\n` +
            `مثال:\n` +
            `${usedPrefix + command} https://whatsapp.com/channel/xxxx/123 😘`
    }

    const parts = text.trim().split(/\s+/)
    const link = parts[0]
    const emoji = parts.slice(1).join(' ').trim()

    if (!link) {
        throw `❌رابط قناة الواتساب غير موجود.`
    }

    if (!/^https?:\/\/(www\.)?whatsapp\.com\/channel\/[^\/]+\/\d+/i.test(link)) {
        throw `❌ الرابط غير صالح.\n\nمثال:\n${usedPrefix + command} https://whatsapp.com/channel/xxxx/123 😘`
    }

    if (!emoji) {
        throw `❌ لم تقم بتقديم الرموز التعبيرية.\n\nمثال:\n${usedPrefix + command} ${link} 😘`
    }

    const apiKey = global.reactApiKey

    if (!apiKey) {
        throw `❌ لم يتم تكوين مفتاح API.\n\nأضفه في src/settings.js:\n\nglobal.reactApiKey = 'API_KEY_DEL_PAIRING'\n\n💡 احصل على مفتاح API الخاص بك على: https://reaction-whatsapp.edgeone.dev/`
    }

    await m.reply('⏳إرسال التفاعل...')

    try {
        const response = await axios.post(
            'https://reaction-whatsapp.edgeone.dev/react',
            {
                link: link,
                emoji: emoji
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 30000
            }
        )

        const data = response.data

        let resultText = '✅ *تم إرسال التفاعل بنجاح!*'

        if (data && typeof data === 'object') {
            if (data.message) {
                resultText += `\n\n${data.message}`
            }

            if (data.status) {
                resultText += `\nالقيمة الدائمة: ${data.status}`
            }

            if (data.emoji) {
                resultText += `\nالرمز التعبيري: ${data.emoji}`
            }
        }

        await m.reply(resultText)

    } catch (error) {
        let msg = 'حدث خطأ أثناء إرسال التفاعل.'

        if (error.response) {
            const status = error.response.status
            const data = error.response.data

            if (status === 401) {
                msg = 'مفتاح API غير صالح أو انتهت صلاحيته بالفعل.'
            } else if (status === 400) {
                msg = 'تم رفض الطلب. تأكد من صحة الرابط والرموز التعبيرية.'
            } else if (status === 403) {
                msg = 'تم رفض الوصول بواسطة واجهة برمجة التطبيقات.'
            } else if (status === 429) {
                msg = 'طلبات كثيرة جدًا. يرجى المحاولة مرة أخرى في وقت لاحق.'
            } else if (data) {
                if (typeof data === 'string') {
                    msg = data
                } else if (data.message) {
                    msg = data.message
                } else if (data.error) {
                    msg = data.error
                }
            }

            msg += `\n\nحالة HTTP: ${status}`

        } else if (error.code === 'ECONNABORTED') {
            msg = 'انتظار الوقت. استغرق خادم API وقتًا طويلاً للاستجابة.'
        } else if (error.message) {
            msg = error.message
        }

        await m.reply(
            `❌ *فشل التفاعل!*\n\n${msg}`
        )
    }
}

handler.help = ['reactwa <link> <emoji>']
handler.tags = ['tools']
handler.command = /^(reactwa|reactionwa|wreact)$/i

handler.limit = true

export default handler
