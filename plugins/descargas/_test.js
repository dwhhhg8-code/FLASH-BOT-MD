import fetch from "node-fetch";

const testYtmp3Full = async (m, { conn, text }) => {
  try {
    console.log('[INFO] تم استلام الأمر:', text);

    if (!text?.trim()) {
      console.log('[WARN] لم يتم إرسال عنوان URL أو نص');
      return conn.reply(m.chat, '❀ أرسل رابط يوتيوب أو رسالة نصية للمحاولة.', m);
    }

    await m.react('🕒');
    console.log('[INFO] تم إرسال الرموز التعبيرية المنتظرة');

    const endpoint = `https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(text)}`;
    console.log('[INFO] استدعاء واجهة برمجة التطبيقات باستخدام GET:', endpoint);

    const res = await fetch(endpoint, { method: 'GET', redirect: 'follow' }).then(r => r.text());
    console.log('[INFO] تم تلقي استجابة واجهة برمجة التطبيقات (API) الكاملة');
    console.log(res); 

    if (res.length > 4000) {
      console.log('[INFO] المحتوى طويل جدًا, يتم إرساله كملف');
      await conn.sendMessage(m.chat, {
        document: Buffer.from(res, 'utf-8'),
        fileName: 'respuesta-completa.txt',
        mimetype: 'text/plain'
      }, { quoted: m });
    } else {
      console.log('[INFO] إرسال المحتوى كاملاً كرسالة نصية');
      await conn.sendMessage(m.chat, { text: res }, { quoted: m });
    }

    await m.react('✔️');
    console.log('[SUCCESS] تم إرسال المحتوى بنجاح');

  } catch (err) {
    console.error('[ERROR] اختبار Ytmp3Full:', err);
    await m.react('✖️');
    return conn.reply(m.chat, '⚠ حدث خطأ أثناء جلب المحتوى\n' + (err.message || err), m);
  }
};

testYtmp3Full.command = ['testytmp3full'];
testYtmp3Full.tags = ['descargas'];
testYtmp3Full.group = true;

export default testYtmp3Full;
