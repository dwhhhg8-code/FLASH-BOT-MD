let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.menfess = conn.menfess ? conn.menfess : {};
    if (!text) throw m.reply(`🎄 مثال:\n\n${usedPrefix + command} رقم الرسالة\n\n✨ الاستخدام: ${usedPrefix + command} ${m.sender.split`@`[0]} مرحبًا.`);

    let split = text.trim().split(/ (.+)/); 
    let jid = split[0]; 
    let pesan = split[1]; 

    if (!jid || !pesan) throw m.reply(`🎄 مثال:\n\n${usedPrefix + command} رقم الرسالة\n\n✨ الاستخدام: ${usedPrefix + command} ${m.sender.split`@`[0]} مرحبًا.`);

    jid = jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net'; 
    let data = (await conn.onWhatsApp(jid))[0] || {}; 
    if (!data.exists) throw m.reply(`❄️ الرقم غير مسجل على الواتساب.`);
    if (jid == m.sender) throw m.reply(`🎁 لا يمكنك إرسال رسالة لنفسك.`);

    let mf = Object.values(conn.menfess).find(mf => mf.status === true);
    if (mf) return !0;

    let id = Math.floor(1000 + Math.random() * 9000); 
    let teks = 
`🌑🎄 *اعتراف في ظلال عيد الميلاد* 🎄🌑

*أهلاً* @${data.jid.split("@")[0]}, وصلتك رسالة مستخبية بين الأنوار والظلال...  
للرد استخدم:  
✨ مثال: .respuesta <id> <الرسالة>

🌌 *ID:* ${id}  
🎁 *الرسالة:*  

${pesan}

❄️✨ "حتى في عيد الميلاد, الظلال تحفظ الأسرار..." ✨❄️`.trim();

    try {
        let sentMessage = await conn.sendMessage(data.jid, {
            text: teks,
            contextInfo: {
                mentionedJid: [data.jid]
            }
        });

        if (sentMessage) {
            conn.menfess[id] = {
                id,
                dari: m.sender,
                penerima: data.jid,
                pesan: pesan,
                status: false 
            };
            return conn.reply(m.chat, `🎅 تم إرسال الاعتراف بنجاح.\n👻 *المُعرِّف:* ${id}`, m);
        }

    } catch (e) {
        console.error(e);
        m.reply(`👻 حدث خطأ في ظلال عيد الميلاد...`);
    }
}

handler.tags = ['fun'];
handler.help = ['confesar'].map(v => v + ' <número mensaje>');
handler.command = ['confesar', 'confesiones'];
handler.register = true;
handler.private = true;

export default handler;
