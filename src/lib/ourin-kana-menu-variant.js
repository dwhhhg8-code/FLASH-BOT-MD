import config from "../../config.js";
import { ButtonV2 } from "./ourin-builder.js";
import { getAssetBuffer } from "./ourin-asset-manager.js";
import { getCategories, getCommandsByCategory, getPluginCount } from "./ourin-plugins.js";
import { getCasesByCategory } from "../../case/ourin.js";
import { saluranCtx } from "./ourin-context.js";

const PANEL_FOOTER = "𐙚 𝑲𝒂𝒏𝒂-𝑨𝒔𝒔𝒊𝒔𝒕𝒂𝒏𝒕 ᰔᩚ";

const CATEGORY_EMOJIS = {
  owner: "👑",
  main: "🏠",
  utility: "🔧",
  tools: "🛠️",
  fun: "🎮",
  game: "🎯",
  download: "📥",
  downloader: "📥",
  search: "🔍",
  sticker: "🖼️",
  media: "🎬",
  ai: "🤖",
  group: "👥",
  religi: "☪️",
  islamic: "🕌",
  info: "ℹ️",
  cek: "📋",
  economy: "💰",
  user: "📊",
  canvas: "🎨",
  random: "🎲",
  premium: "💎",
  ephoto: "🖌️",
  jpm: "📨",
  pushkontak: "📱",
  panel: "🖥️",
  store: "🛒",
  rpg: "🗡️",
  gacha: "🎴",
};

const CATEGORY_ORDER = [
  "owner",
  "main",
  "utility",
  "tools",
  "fun",
  "game",
  "download",
  "search",
  "sticker",
  "media",
  "ai",
  "group",
  "religi",
  "info",
  "cek",
  "economy",
  "user",
  "canvas",
  "random",
  "premium",
  "ephoto",
  "jpm",
  "pushkontak",
  "panel",
  "store",
  "rpg",
  "gacha",
];

const CATEGORY_LABELS = {
  owner: "Owner",
  main: "Principal",
  utility: "Utilidad",
  tools: "Herramientas",
  fun: "هزار",
  game: "Juegos",
  download: "Descargas",
  downloader: "Descargas",
  search: "عمليات البحث",
  sticker: "Stickers",
  media: "Media",
  ai: "IA",
  group: "الجروبات",
  religi: "دِين",
  islamic: "اسلامية",
  info: "معلومة",
  cek: "Consultas",
  economy: "اقتصاد",
  user: "المستخدم",
  canvas: "Canvas",
  random: "Random",
  premium: "Premium",
  ephoto: "Ephoto",
  jpm: "JPM",
  pushkontak: "دفع جهات الاتصال",
  panel: "Panel",
  store: "Tienda",
  rpg: "RPG",
  gacha: "Gacha",
};


function getAllMenuThumbnail() {
  return (
    getAssetBuffer("com.ourin-almenu", config.assets) ||
    getAssetBuffer("ourin", config.assets) ||
    getAssetBuffer("ourin2", config.assets) ||
    null
  );
}

function getMenuAudio() {
  return getAssetBuffer("Ourin-mp3", config.assets) || null;
}

async function getMenuAudioOpusPath(audio) {
  const fs = await import("fs");
  const path = await import("path");
  const { spawn } = await import("child_process");

  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const destPath = path.join(tempDir, "kana_menu_audio_opus.ogg");
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) return destPath;

  const mp3Path = path.join(tempDir, "kana_menu_audio.mp3");
  fs.writeFileSync(mp3Path, audio);

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i",
      mp3Path,
      "-vn",
      "-c:a",
      "libopus",
      "-b:a",
      "48k",
      "-vbr",
      "on",
      destPath,
    ]);

    ffmpeg.on("close", (code) => {
      try {
        if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
      } catch {}

      if (code === 0 && fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
        resolve(destPath);
      } else {
        reject(new Error(`خطأ FFmpeg ${code}`));
      }
    });

    ffmpeg.on("error", (error) => {
      try {
        if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
      } catch {}
      reject(error);
    });
  });
}

async function sendMenuAudio(sock, m, db) {
  const audioEnabled = db?.setting?.("audioMenu") !== false;
  if (!audioEnabled) return;

  const audio = getMenuAudio();
  if (!audio) {
    console.error("[kana-menu-variant] لم يتم العثور على الأصول الصوتية لقائمة [kana-menu-variant]: Ourin-mp3");
    return;
  }

  const quotedAudio = {
    key: {
      fromMe: false,
      participant: m.sender,
    },
    message: {
      conversation: "قم بتشغيل شقيق الموسيقى",
    },
  };

  try {
    const oggPath = await getMenuAudioOpusPath(audio);
    await sock.sendMessage(
      m.chat,
      {
        audio: { url: oggPath },
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
      },
      { quoted: quotedAudio },
    );
  } catch (error) {
    console.error("فشل تحويل [kana-menu-variant] opus, وتم إرسال ملفات mp3 عادية:", error?.message || error);
    await sock.sendMessage(
      m.chat,
      {
        audio,
        mimetype: "audio/mpeg",
        ptt: false,
      },
      { quoted: quotedAudio },
    );
  }
}

function formatUptime(seconds = process.uptime()) {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function cleanName(value = "المستخدم") {
  return String(value || "المستخدم").replace(/[\n\r\t]+/g, " ").trim() || "المستخدم";
}

function getSaludarCommand(prefix = ".") {
  // Se mantiene como botón normal al estilo `.prueba`, pero marcando que
  // viene desde el botón para que `.prueba4` pueda validarlo.
  return `${prefix}prueba4 --من الزر`;
}

function getMode(db) {
  return db?.setting?.("botMode") || config.mode || config.config?.mode || "self";
}

function getRole(m, user = {}) {
  if (m.isOwner) return "👑مالك";
  if (m.isPartner) return "🤝 شريك";
  if (m.isPremium || user.isPremium) return "💎 قسط";
  return "🏷️ مستخدم";
}

function buildBody(m, { db, plugins }) {
  const user = db?.getUser?.(m.sender) || {};
  const rawName = cleanName(user.regName || m.pushName || m.sender?.split("@")[0] || "المستخدم");
  const displayName = rawName.startsWith("~") ? rawName : `~${rawName}`;
  const botName = config.bot?.name || "FLASH BOT";
  const botMode = getMode(db);
  const commands = plugins?.count || getPluginCount() || global.plugins?.size || 916;
  const users = db?.getUserCount?.() || Object.keys(db?.data?.users || {}).length || 0;
  const registered = user.isRegistered ? "✅ Registrado" : "❌ غير مسجل";
  const energi = user.energi ?? config.energi?.default ?? 100;
  const level = user.level || user.rpg?.level || 1;
  const exp = user.exp || user.rpg?.exp || 0;
  const koin = user.koin || 0;

  return (
    `مرحبًا *@${displayName}* 👋\n\n` +
    `مرحبًا بك مجددًا في *${botName}*!\n\n` +
    `╭╮ \`✯ تفاصيل الروبوت\`\n` +
    `││ الرقم: ${botName} \n` +
    `││ الوضع : ${botMode}\n` +
    `││ الأوامر: ${commands}\n` +
    `││ نشط : ${formatUptime()}\n` +
    `││ المستخدمين: ${users}\n` +
    `││ مكتبة: \`ourin-baileys\`\n` +
    `╰╯\n\n` +
    `╭╮ \`❀ تفاصيل المستخدم\`\n` +
    `││ الرقم: _${rawName.replace(/^~/, "")}_\n` +
    `││ السجل: ${registered}\n` +
    `││ الدور : ${getRole(m, user)}\n` +
    `││ الطاقة : ${energi} ⚡\n` +
    `││ المستوى : ${level} (${exp} exp)\n` +
    `││ العملات المعدنية: ${koin} 🪙\n` +
    `╰╯\n\n` +
    `اضغط على زر "الفئات" أدناه لاستكشاف الميزات!`
  );
}

function getCategoryRows(prefix = ".", m = {}) {
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const casesByCategory = getCasesByCategory();
  const allCategories = [
    ...new Set([...categories, ...Object.keys(casesByCategory)]),
  ];

  return allCategories
    .filter((category) => {
      if (category === "owner" && !m.isOwner) return false;
      const total =
        (commandsByCategory[category] || []).length +
        (casesByCategory[category] || []).length;
      return total > 0;
    })
    .sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    })
    .map((category) => {
      const total =
        (commandsByCategory[category] || []).length +
        (casesByCategory[category] || []).length;
      const emoji = CATEGORY_EMOJIS[category] || "📁";
      const label = CATEGORY_LABELS[category] || category;

      return {
        title: `القائمة ${emoji} ${label}`,
        description: `راجع أوامر ${total} لـ ${label}`,
        id: `${prefix}menucat ${category}`,
      };
    });
}

function getSelectParams(prefix = ".", m = {}) {
  return {
    title: "فئات",
    sections: [
      {
        title: "الرجاء تحديد القائمة",
        rows: getCategoryRows(prefix, m),
      },
    ],
  };
}

function buildFallbackButtons(prefix = ".", m = {}) {
  return [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify(getSelectParams(prefix, m)),
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "saludar",
        id: getSaludarCommand(prefix),
      }),
    },
  ];
}

async function sendPruebaStylePanel(sock, m, bodyText, prefix = ".") {
  const thumbnail = getAllMenuThumbnail();
  const botName = config.bot?.name || "FLASH BOT";

  const builder = new ButtonV2(sock)
    .setTitle(botName)
    .setSubtitle(botName)
    .setBody(bodyText)
    .setFooter(PANEL_FOOTER)
    .setContextInfo({
      ...saluranCtx(),
      mentionedJid: [m.sender],
    })
    .addRawButton({
      buttonId: "categorias",
      buttonText: { displayText: "فئات" },
      type: 1,
      nativeFlowInfo: {
        name: "single_select",
        paramsJson: JSON.stringify(getSelectParams(prefix, m)),
      },
    })
    .addButton("saludar", getSaludarCommand(prefix));

  if (thumbnail) builder.setThumbnail(thumbnail);

  return builder.send(m.chat, { quoted: m });
}

async function sendFallback(sock, m, bodyText, prefix = ".") {
  const thumbnail = getAllMenuThumbnail();
  const payload = {
    caption: bodyText,
    footer: PANEL_FOOTER,
    title: config.bot?.name || "FLASH BOT",
    subtitle: config.bot?.name || "FLASH BOT",
    interactiveButtons: buildFallbackButtons(prefix, m),
    mentions: [m.sender],
    contextInfo: {
      ...saluranCtx(),
      mentionedJid: [m.sender],
    },
  };

  if (thumbnail) payload.image = thumbnail;
  else payload.text = bodyText;

  return sock.sendMessage(m.chat, payload, { quoted: m });
}

async function sendKanaMenuVariant(sock, m, { db, plugins = {}, prefix = m.prefix || config.command?.prefix || "." } = {}) {
  const bodyText = buildBody(m, { db, plugins });

  try {
    // Misma estructura que `.prueba`: ButtonV2 + buttonsMessage + miniatura.
    // بس بيغيّر المصغّرة لصورة allmenu.
    await sendPruebaStylePanel(sock, m, bodyText, prefix);
  } catch (error) {
    console.error("[kana-menu-variant] فشلت لوحة القائمة Allmenu في ButtonV2, باستخدام الخيار الاحتياطي:", error?.message || error);
    await sendFallback(sock, m, bodyText, prefix);
  }

  try {
    // يبعت نفس الأوديو المحلي اللي بيستخدمه المنيو الرئيسي، كرسالة صوتية Opus.
    await sendMenuAudio(sock, m, db);
  } catch (audioError) {
    console.error("فشل صوت القائمة [kana-menu-variant]:", audioError?.message || audioError);
  }
}

export { sendKanaMenuVariant };
