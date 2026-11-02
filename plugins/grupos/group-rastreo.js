import { performance} from 'perf_hooks';

const handler = async (m, { conn, text}) => {
  let target;
  if (m.mentionedJid && m.mentionedJid.length) {
    target = m.mentionedJid[0];
} else if (m.quoted) {
    target = m.quoted.sender;
} else {
    target = text? text: m.sender;
}

  const name = await conn.getName(target);
  const number = target.replace(/\D/g, '').slice(0, 2);

  const countryMap = {
    '58': 'فنزويلا 🇻🇪',
    '57': 'كولومبيا 🇨🇴',
    '52': 'المكسيك 🇲🇽',
    '51': 'بيرو 🇵🇪',
    '54': 'الأرجنتين 🇦🇷',
    '55': 'البرازيل 🇧🇷',
    '56': 'تشيلي 🇨🇱',
    '1': 'الولايات المتحدة 🇺🇸',
    '34': 'اسبانيا 🇪🇸',
    '91': 'الهند 🇮🇳',
    '81': 'اليابان 🇯🇵',
    '49': 'ألمانيا 🇩🇪',
    '33': 'فرنسا 🇫🇷'
};

  const country = countryMap[number] || '🌍بلد غير معروف';

  const loading = [
    '*💻بدء التتبع الرقمي...*',
    '*📡 مسح الشبكات المحلية...*',
    '*🔍 تحليل حزم UDP...*',
    '*🧠 فك تشفير البيانات الوصفية...*',
    '*📁 الوصول إلى السجلات المخفية...*',
    '*💣 إدخال الأوامر في النواة...*'
  ];

  for (let line of loading) {
    await m.reply(line);
}

  const old = performance.now();
  const neww = performance.now();
  const speed = (neww - old).toFixed(2);

  const result = `*تم تتبع شخصية ☠ بنجاح ☠*
*⏳ الوقت de rastreo:* ${speed}ms

    𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝙳𝙾𝚇𝚇𝙴𝙰𝙳𝙰 𝙲𝙾𝙽 𝙴𝚇𝙸𝚃𝙾*\n*⏳ 𝙳𝙾𝚇𝚇𝙴𝙰𝙳𝙾 𝙴𝙽: ${speed} 𝚜𝚎𝚐𝚞𝚗𝚍𝚘𝚜!*

*النتائج التي تم الحصول عليها:*

*الاسم:* ${text}
*Ip:* 92.28.211.234
*N:* 43 7462
*W:* 12.4893
*الرقم:* 6979191519182016
*IPV6:* fe80::5dcd::ef69::fb22::d9888%12 
*UPNP:* ممكّن
*DMZ:* 10.112.42.15
*MAC:* 5A:78:3E:7E:00
*ISP:* Ucom unversal 
*DNS:* 8.8.8.8
*ALT DNS:* 1.1.1.8.1  
*لاحقة DNS:* Dlink
*WAN:* 100.23.10.15
*نوع الشبكة الواسعة:* شبكة خاصة
*GATEWAY:* 192.168.0.1
*قناع الشبكة الفرعية:* 255.255.0.255
*منافذ UDP المفتوحة:* 8080.80
*منافذ TCP المفتوحة:* 443
*بائع جهاز التوجيه:* إريكسون
*بائع الجهاز:* WIN32-X
*نوع الاتصال:* شركة TPLINK
*ICMPHOPS:* 192.168.0.1 192.168.1.1 100.73.43.4
host-132.12.32.167.ucom.com
host-132.12.111.ucom.com
36.134.67.189 216.239.78.11
Sof02s32inf14.1e100.net
*HTTP:* 192.168.3.1:433-->92.28.211.234:80
*Http:* 192.168.625-->92.28.211.455:80
*Http:* 192.168.817-->92.28.211.8:971
*Upd:* 192.168452-->92.28.211:7265288
*Tcp:* 192.168.682-->92.28.211:62227.7
*Tcp:* 192.168.725-->92.28.211:67wu2
*Tcp:* 192.168.629-->92.28.211.167:8615
*جهاز ماك خارجي:* 6U:77:89:ER:O4
*قفزات المودم:* 64

*👤 Objetivo:* ${name}
*🌐 País detectado:* ${country}
*حالة 🔐:* النظام معرض للخطر

⚠ لقد خسرت بالفعل... نحن نتتبعك حتى آخر طرد.`;

  await m.reply(result, null, { mentions: [target]});
};

handler.help = ['rastrear'];
handler.tags = ['grupos'];
handler.command = ['rastrear'];
handler.group = true;
handler.register = true;

export default handler;
