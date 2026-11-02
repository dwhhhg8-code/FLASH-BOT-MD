const baseCoinReward = 10000;

var handler = async (m, { conn, command }) => {
    let user = global.db.data.users[m.sender] || {};
    const isHalloweenCmd = command === 'halloween' || command === 'nochedebrujas';

    if (isHalloweenCmd) {
        user.halloween = user.halloween || 0;
        const currentDate = new Date();
        const cooldown = 30 * 24 * 60 * 60 * 1000;
        let timeRemaining = user.halloween + cooldown - currentDate.getTime();

        if (timeRemaining > 0) {
            return m.reply(`🎃 لقد حصلت بالفعل على عرض الهالوين الخاص بك هذا الشهر. عد مرة أخرى:\n *${msToTime(timeRemaining)}* 🦇`);
        }

        let coinReward = pickRandom([10000, 15000, 20000, 25000]);
        user.coin = (user.coin || 0) + coinReward;
        await m.react('🎃');

        m.reply(`
┏━━━━━━━━━━━━━━━━━━━┓
🎃🦇 *S H A D O W - B O T • HALLOWEEN* 🦇🎃
┗━━━━━━━━━━━━━━━━━━━┛

🕯️ في ليلة السحرة في السحرة،
يكافئك اللورد شادو بقوته الخفية...

💸 لقد تلقيت: *${coinReward} pesos* 🍬

🎃 عيد الهالوين سعيد من الظل! 🦇
`);

        user.halloween = new Date().getTime();
        return;
    }

    user.christmas = user.christmas || 0;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const isDecember = currentDate.getMonth() === 11; 

    const cooldown = 365 * 24 * 60 * 60 * 1000;
    let timeRemaining = user.christmas + cooldown - currentDate.getTime();

    if (!isDecember) {
        return m.reply(`🎄 لا يمكنك المطالبة بهدية عيد الميلاد الخاصة بك إلا في شهر ديسمبر! يعود في ديسمبر من $ {currentYear}. (لاستخدام الهالوين *.halloween*)`);
    }

    if (timeRemaining > 0) {
        return m.reply(`🎅 لقد حصلت بالفعل على هدية عيد الميلاد الخاصة بك هذا العام. عد مرة أخرى:\n *${msToTime(timeRemaining)}*`);
    }

    let coinReward = pickRandom([5000, 10000, 15000, 20000]);

    user.coin = (user.coin || 0) + coinReward;

    m.reply(`
┏━━━━━━━━━━━━━━━━━━━┓
🌑🎄 *S H A D O W - B O T* 🎄🌑
┗━━━━━━━━━━━━━━━━━━━┛

✨ في ظلال عيد الميلاد،
يكافئك الظل بقوته الخفية...

💸 لقد تلقيت: *${coinReward} pesos*

🎅 UwU عيد ميلاد سعيد من الظل! 🎄
`);

    user.christmas = new Date().getTime();
}

handler.help = ['navidad', 'christmas', 'halloween'];
handler.tags = ['rpg'];
handler.command = ['navidad', 'christmas', 'halloween', 'nochedebrujas'];
handler.group = true;
handler.register = true;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function msToTime(duration) {
    var days = Math.floor(duration / (1000 * 60 * 60 * 24));
    var hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return `${days} أيام ${hours} ساعات ${minutes} دقيقة`;
}
