let handler = async (m, { args, usedPrefix, command }) => {
    const chat = global.db.data.chats[m.chat]
    if (!chat.economy && m.isGroup) {
        return m.reply(
            `《✦》تم تعطيل أوامر *الاقتصاد* في هذه المجموعة.\n\n` +
            `يمكن للمسؤول تنشيطها باستخدام:\n` +
            `» *${usedPrefix}economy on*`
        )
    }

    let user = global.db.data.users[m.sender]
    const currency = global.currency || "¥"

    if (!args[0]) {
        return m.reply(
            `❀ أدخل المبلغ ${currency} الذي ترغب في سحبه.\n\n` +
            `مثال:\n` +
            `» ${usedPrefix + command} 25000\n` +
            `» ${usedPrefix + command} الكل`
        )
    }

    if (args[0].toLowerCase() === 'all' || args[0] === 'الكل') {
        let count = user.bank
        if (count <= 0) return m.reply(`ꕥ ليس لديك ${currency} في البنك.`)

        user.bank -= count
        user.coin += count

        return m.reply(
            `❀ لقد قمت بسحب *${currency}${count.toLocaleString()}* من البنك.\n` +
            `يمكنك الآن استخدامه... ولكن يمكنهم أيضًا سرقته.`
        )
    }

    if (isNaN(args[0])) {
        return m.reply(
            `ꕥ يجب عليك سحب مبلغ صالح.\n\n` +
            `مثال:\n` +
            `» ${usedPrefix + command} 25000\n` +
            `» ${usedPrefix + command} الكل`
        )
    }

    let count = parseInt(args[0])

    if (user.bank <= 0) return m.reply(`ꕥ ليس لديك ما يكفي من ${currency} في البنك.`)
    if (user.bank < count) {
        return m.reply(
            `ꕥ ليس لديك سوى *${currency}${user.bank.toLocaleString()}* في البنك.`
        )
    }

    user.bank -= count
    user.coin += count

    return m.reply(
        `❀ لقد قمت بسحب *${currency}${count.toLocaleString()}* من البنك.\n` +
        `يمكنك الآن استخدامه... ولكن يمكنهم أيضًا سرقته منك.`
    )
}

handler.help = ['retirar']
handler.tags = ['rpg']
handler.command = ['withdraw', 'retirar', 'with']
handler.group = true

export default handler
