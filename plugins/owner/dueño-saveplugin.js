import fs from 'fs';
import path from 'path';

const RAIZ = path.join(process.cwd(), 'plugins');

let handler = async (m, { text, usedPrefix, command }) => {
  const emoji = '📥';
  const emoji2 = '⚠️';
  const msm = '❌';

  if (!text) {
    return m.reply(`${emoji} الرجاء إدخال اسم المكون الإضافي.\n\n▸ أمثلة:\n• *${usedPrefix}${command} my-plugin* → محفوظ في plugins/mi-plugin.js\n• *${usedPrefix}${command} fun/mi-plugin* → محفوظ في plugins/fun/mi-plugin.js`);
  }

  if (!m.quoted || !m.quoted.text) {
    return m.reply(`${emoji2} قم بالرد على الرسالة التي تحتوي على رمز البرنامج المساعد.`);
  }

  let relativo = text.trim().replace(/\\/g, '/').replace(/^plugins\//i, '').replace(/^\.\//, '');
  if (!relativo || relativo.includes('..') || path.isAbsolute(relativo)) {
    return m.reply(`${msm} مسار غير صالح. استخدم على سبيل المثال: *my-plugin* أو *fun/my-plugin*.`);
  }
  if (!relativo.endsWith('.js')) relativo += '.js';

  const destino = path.join(RAIZ, relativo);
  if (!destino.startsWith(RAIZ)) return m.reply(`${msm} مسار غير صالح.`);

  try {
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, m.quoted.text);
    m.reply(`تم حفظ المكون الإضافي ${emoji} بنجاح في: plugins/${relativo}`);
  } catch (error) {
    m.reply(`${msm} حدث خطأ أثناء حفظ المكون الإضافي:\n${error.message}`);
  }
};

handler.help = ['saveplugin'];
handler.tags = ['owner'];
handler.command = ['saveplugin'];
handler.owner = true;

export default handler;
