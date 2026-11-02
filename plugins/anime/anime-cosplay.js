import { PEXELS_API_KEY } from '../../lib/secrets.js';
let handler = async (m, { conn, usedPrefix}) => {
  try {
    const apiKey = PEXELS_API_KEY;
    const total = 20;
    const res = await fetch(`https://api.pexels.com/v1/search?query=cosplay&per_page=${total}`, {
      headers: { Authorization: apiKey}
});

    const json = await res.json();
    if (!json.photos || json.photos.length === 0) throw new Error("لم يتم العثور على صور");

    const randomIndex = Math.floor(Math.random() * json.photos.length);
    const cosplayUrl = json.photos[randomIndex].src.large;

    await conn.sendMessage(m.chat, { react: { text: "🎭", key: m.key}});

    const buttons = [
      {
        buttonId: `${usedPrefix}cosplay`,
        buttonText: { displayText: "🎭 كوسبلاي آخر"},
        type: 1,
},
      {
        buttonId: `${usedPrefix}waifu`,
        buttonText: { displayText: "💘 وايفو عشوائي"},
        type: 1,
},
    ];

    const msg = {
      image: { url: cosplayUrl},
      caption: `✨ إليك الحل الأمثل للأزياء التنكرية يا أخي.\nهل تريد رؤية زي آخر؟ اضغط على الزر 👇`,
      footer: "🧬 مولد الكوسبلاي",
      buttons: buttons,
      headerType: 4,
};

    await conn.sendMessage(m.chat, msg, { quoted: m});
} catch (e) {
    console.error("❌ خطأ في أمر الكوسبلاي:", e);
    await conn.sendMessage(m.chat, {
      text: "❎ لا يمكن الحصول على الصورة التنكرية. حاول لاحقًا."
}, { quoted: m});
}
};

handler.help = ['cosplay'];
handler.tags = ['anime'];
handler.command = ['cosplay'];
handler.register = true;

export default handler;
