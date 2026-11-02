import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const BASE = "https://animeav1.com";

async function getAnime(query) {
  const url = `${BASE}/catalog?search=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: BASE,
    },
  });

  if (!res.ok) throw new Error("حدث خطأ أثناء البحث عن الأنمي");

  const text = await res.text();
  const $ = cheerio.load(text);
  const firstResult = $("article").first();
  if (!firstResult.length) throw new Error("لم يتم العثور على أنيمي");

  const path = firstResult.find("a.absolute.inset-0").attr("href");
  if (!path) throw new Error("لم يتم العثور على عنوان URL للأنمي");

  const episodesList = await getEpisodes(BASE + path);

  return {
    status: true,
    creator: "...",
    url: BASE + path,
    title: firstResult.find("h3").text().trim(),
    type: firstResult.find(".text-xs.font-bold.text-subs").text().trim(),
    image: firstResult.find("img").attr("src"),
    description: firstResult.find("p").text().trim() || null,
    episodios: episodesList.length,
    episodesList,
    searchQuery: query,
  };
}

async function getEpisodes(animeUrl) {
  const res = await fetch(animeUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: BASE,
    },
  });

  const data = await res.text();
  const $ = cheerio.load(data);
  const eps = [];
  const seen = new Set();

  $("a.absolute.inset-0").each((i, el) => {
    const path = $(el).attr("href");
    if (!path) return;
    const match = path.match(/\/(\d+)$/);
    if (!match) return;
    const epNum = parseInt(match[1], 10);
    if (!seen.has(epNum)) {
      seen.add(epNum);
      eps.push({ num: epNum, url: BASE + path });
    }
  });

  eps.sort((a, b) => a.num - b.num);
  return eps;
}

async function getEpisodeDirectLinkAndLanguage(epUrl) {
  const res = await fetch(epUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: BASE,
    },
  });

  const data = await res.text();
  const $ = cheerio.load(data);
  const script = $("script")
    .filter((i, el) => $(el).html()?.includes("__sveltekit_"))
    .last()
    .html();

  if (!script) return { link: null, language: "Japonés" };

  const downloadsMatch = script.match(/downloads:\{SUB:\[(.*?)\](?:,DUB:\[(.*?)\])?\}/s);
  if (!downloadsMatch) return { link: null, language: "Japonés" };

  const subBlock = downloadsMatch[1] || "";
  const dubBlock = downloadsMatch[2] || "";

  function findPDrainLink(block) {
    const regex = /{server:"PDrain",url:"(https?:\/\/pixeldrain\.com\/u\/[^"]+)"}/g;
    const match = regex.exec(block);
    return match ? match[1] : null;
  }

  const dubLink = findPDrainLink(dubBlock);
  if (dubLink) return { link: dubLink, language: "Español" };

  const subLink = findPDrainLink(subBlock);
  if (subLink) return { link: subLink, language: "Japonés (Sub)" };

  return { link: null, language: "Japonés" };
}

async function getDirectVideo(pixUrl) {
  if (!pixUrl) return null;

  const fileIdMatch = pixUrl.match(/pixeldrain\.com\/u\/([a-zA-Z0-9]+)/);
  if (!fileIdMatch) return null;

  const fileId = fileIdMatch[1];
  const directLink = `https://pixeldrain.com/api/file/${fileId}`;

  return directLink;
}

const handler = async (m, { conn, text, args }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    return m.reply('《✧》 أدخل اسم الأنمي الذي تريد البحث عنه.');
  }

  if (text.includes('ep:')) {
    const searchQuery = text.replace(/ep:\d+/g, '').trim();
    await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });
    return m.reply(`الرجاء استخدام اسم الأنمي فقط للبحث, ثم تحديد الحلقة باستخدام الأزرار.\n\nمثال: *.anime ${searchQuery}*`);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });

    const anime = await getAnime(text);

    if (!anime.status) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❏ لم يتم العثور على الأنمي.');
    }

    const searchId = Date.now().toString();
    global.animeSearches = global.animeSearches || {};

    global.animeSearches[searchId] = {
      ...anime,
      timestamp: Date.now()
    };

    Object.keys(global.animeSearches || {}).forEach(id => {
      if (Date.now() - (global.animeSearches[id]?.timestamp || 0) > 10 * 60 * 1000) {
        delete global.animeSearches[id];
      }
    });

    const displayEpisodes = anime.episodesList.slice(0, 10);

    const episodeButtons = displayEpisodes.map(ep => ({
      buttonId: `ep_${searchId}_${ep.num}`, 
      buttonText: { displayText: `📺 الحلقة ${ep.num}` },
      type: 1
    }));

    const actionButtons = [
      { buttonId: `info_${searchId}`, buttonText: { displayText: 'ℹ️ مزيد من المعلومات' }, type: 1 },
      { buttonId: `list_${searchId}`, buttonText: { displayText: '📋 القائمة الكاملة' }, type: 1 }
    ];

    const info = `
🎬 *${anime.title}*

📁 *Tipo:* ${anime.type}
📊 *Episodios Totales:* ${anime.episodios}
📝 *Descripción:* ${anime.description ? anime.description.slice(0, 100) + (anime.description.length > 100 ? '...' : '') : 'لا يوجد وصف'}

🎯 *اختر الحلقة المراد تنزيلها:*
`.trim();

    if (anime.image) {
      try {
        const thumbRes = await fetch(anime.image);
        if (thumbRes.ok) {
          const thumb = await thumbRes.arrayBuffer();
          await conn.sendMessage(m.chat, {
            image: Buffer.from(thumb),
            caption: info,
            footer: `الحلقات 1-${Math.min(10, anime.episodios)} من ${anime.episodios} | تنتهي صلاحيته خلال 10 دقائق`,
            buttons: [...episodeButtons, ...actionButtons],
            headerType: 4
          }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, {
            text: info,
            footer: `الحلقات 1-${Math.min(10, anime.episodios)} من ${anime.episodios} | تنتهي صلاحيته خلال 10 دقائق`,
            buttons: [...episodeButtons, ...actionButtons],
          }, { quoted: m });
        }
      } catch {
        await conn.sendMessage(m.chat, {
          text: info,
          footer: `الحلقات 1-${Math.min(10, anime.episodios)} من ${anime.episodios} | تنتهي صلاحيته خلال 10 دقائق`,
          buttons: [...episodeButtons, ...actionButtons],
        }, { quoted: m });
      }
    } else {
      await conn.sendMessage(m.chat, {
        text: info,
        footer: `الحلقات 1-${Math.min(10, anime.episodios)} من ${anime.episodios} | تنتهي صلاحيته خلال 10 دقائق`,
        buttons: [...episodeButtons, ...actionButtons],
      }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.error('[بحث عن الأنمي] خطأ:', e);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥خطأ عند البحث عن الانمي. حاول ثانية.');
  }
};

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;

  try {
    if (id.startsWith('ep_')) {
      const parts = id.split('_');
      if (parts.length < 3) return;

      const searchId = parts[1];
      const epNum = parseInt(parts[2]);

      const animeData = global.animeSearches?.[searchId];
      if (!animeData) {
        return m.reply('⚠️ انتهت صلاحية البحث. ابحث عن الأنمي مرة أخرى.');
      }

      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
      m.reply(`⏳ الحصول على الحلقة ${epNum} من ${animeData.title}...`);

      const episode = animeData.episodesList.find(ep => ep.num === epNum);
      if (!episode) {
        return m.reply(`⚠️ لم يتم العثور على الحلقة ${epNum}.`);
      }

      const { link: pixLink, language } = await getEpisodeDirectLinkAndLanguage(episode.url);

      if (!pixLink) {
        return m.reply('⚠️ تعذر الحصول على رابط التنزيل (لم يتم العثور على Pixeldrain).');
      }

      const directLink = await getDirectVideo(pixLink);

      if (!directLink) {
        return m.reply('⚠️ تعذر الحصول على رابط التنزيل النهائي.');
      }

      try {
        await conn.sendMessage(
          m.chat,
          {
            video: { url: directLink },
            fileName: `${animeData.title} - Ep ${epNum}.mp4`,
            mimetype: 'video/mp4',
            caption: `🎬 *${animeData.title}*\n📺 الحلقة ${epNum}\n🗣️ اللغة: ${language}`
          },
          { quoted: m }
        );
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (videoError) {
        console.error('[أزرار الأنمي] حدث خطأ أثناء إرسال الفيديو:', videoError);
        m.reply(`🎬 *${animeData.title}*\n📺 الحلقة ${epNum}\n🗣️ اللغة: ${language}\n\n🔗 *حدث خطأ أثناء إرسال الفيديو!* هذا هو رابط التنزيل المباشر:\n${directLink}`);
        await conn.sendMessage(m.chat, { react: { text: '🔗', key: m.key } });
      }
    }

    if (id.startsWith('info_')) {
      const searchId = id.replace('info_', '');
      const animeData = global.animeSearches?.[searchId];

      if (!animeData) {
        return m.reply('⚠️ انتهت صلاحية البحث.');
      }

      const detailedInfo = `
معلومات مفصلة عن 🎬

📌 *Título:* ${animeData.title}
📁 *Tipo:* ${animeData.type}
📊 *Episodios Totales:* ${animeData.episodios}
📝 *الوصف الكامل:*
${animeData.description || 'لا يوجد وصف متاح'}

🌐 *URL:* ${animeData.url}
🖼️ *صورة:* ${animeData.image || 'غير متوفر'}
`.trim();

      await conn.sendMessage(m.chat, { text: detailedInfo }, { quoted: m });
    }

    if (id.startsWith('list_')) {
      const searchId = id.replace('list_', '');
      const animeData = global.animeSearches?.[searchId];

      if (!animeData) {
        return m.reply('⚠️ انتهت صلاحية البحث.');
      }

      const allEpisodes = animeData.episodesList.map(ep => ep.num);

      let episodeList = `📋 *قائمة كاملة من الحلقات*\n\n`;
      episodeList += `🎬 *${animeData.title}*\n`;
      episodeList += `📊 الإجمالي: حلقات {allEpisodes.length}$\n\n`;

      for (let i = 0; i < allEpisodes.length; i += 10) {
        const chunk = allEpisodes.slice(i, i + 10);
        episodeList += `📁 الحلقات ${i + 1}-${i + chunk.length}: ${chunk.join(', ')}\n`;
      }

      episodeList += `\n💡 الرجاء استخدام أزرار قائمة البحث للاختيار والتنزيل.`;

      await conn.sendMessage(m.chat, { text: episodeList }, { quoted: m });
    }

  } catch (e) {
    console.error('[أزرار الأنمي] خطأ:', e);
    m.reply('💥 حدث خطأ أثناء معالجة اختيارك.');
  }
};

handler.command = ['anime', 'animedl'];
handler.tags = ['descargas'];
handler.help = ['anime <nombre> '];

export default handler;
