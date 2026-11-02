import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import config from "../../config.js";
import { saluranCtx } from "./ourin-context.js";
import {
  delay,
  DisconnectReason,
  jidNormalizedUser,
  useMultiFileAuthState,
} from "ourin";
import { logger } from "./ourin-logger.js";
import { addJadibotOwner } from "./ourin-jadibot-database.js";
import { extendSocket } from "./ourin-socket.js";
import { getAssetBuffer } from "./ourin-asset-manager.js";
const JADIBOT_AUTH_FOLDER = path.join(process.cwd(), "session", "jadibot");

const jadibotSessions = new Map();
const reconnectAttempts = new Map();
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_INTERVAL = 5000;

if (!fs.existsSync(JADIBOT_AUTH_FOLDER)) {
  fs.mkdirSync(JADIBOT_AUTH_FOLDER, { recursive: true });
}

function cleanNumber(value = "") {
  return String(value || "")
    .split("@")[0]
    .split(":")[0]
    .replace(/\D/g, "");
}

function getMainBotNumber(sock) {
  return cleanNumber(sock?.user?.id || sock?.user?.jid || sock?.authState?.creds?.me?.id || "");
}

function isMainBotNumber(sock, jidOrNumber) {
  const target = cleanNumber(jidOrNumber);
  const mainNumber = getMainBotNumber(sock);
  const configuredNumber = cleanNumber(config.session?.pairingNumber || "");
  return Boolean(
    target &&
      ((mainNumber && target === mainNumber) ||
        (configuredNumber && target === configuredNumber))
  );
}

function removeDangerousJadibotSession(sessionId) {
  const authPath = getJadibotAuthPath(`${cleanNumber(sessionId)}@s.whatsapp.net`);
  try {
    if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
  } catch {}
}

function getJadibotAuthPath(jid) {
  const id = jid.replace(/@.+/g, "");
  return path.join(JADIBOT_AUTH_FOLDER, id);
}

function isJadibotActive(jid) {
  const id = jid.replace(/@.+/g, "");
  return jadibotSessions.has(id);
}

function getActiveJadibots() {
  return Array.from(jadibotSessions.entries()).map(([id, data]) => ({
    id,
    jid: id + "@s.whatsapp.net",
    ...data,
  }));
}

function getAllJadibotSessions() {
  const sessions = [];
  if (!fs.existsSync(JADIBOT_AUTH_FOLDER)) return sessions;

  const dirs = fs.readdirSync(JADIBOT_AUTH_FOLDER);
  for (const dir of dirs) {
    const credsPath = path.join(JADIBOT_AUTH_FOLDER, dir, "creds.json");
    if (fs.existsSync(credsPath)) {
      sessions.push({
        id: dir,
        jid: dir + "@s.whatsapp.net",
        isActive: jadibotSessions.has(dir),
        credsPath,
      });
    }
  }
  return sessions;
}

function createJadibotStore() {
  return {
    messages: new Map(),
    chats: new Map(),
    contacts: {},
    bind(ev) {
      ev.on("messages.upsert", ({ messages }) => {
        for (const msg of messages || []) {
          const jid = msg.key?.remoteJid;
          if (!jid) continue;
          if (!this.messages.has(jid)) this.messages.set(jid, new Map());
          const chat = this.messages.get(jid);
          if (msg.key?.id) {
            chat.set(msg.key.id, msg);
            if (chat.size > 200) {
              const keys = [...chat.keys()];
              for (let i = 0; i < keys.length - 150; i++) chat.delete(keys[i]);
            }
          }
          if (!this.chats.has(jid)) {
            this.chats.set(jid, { id: jid });
          }
          if (msg.pushName && jid.endsWith("@s.whatsapp.net")) {
            this.contacts[jid] = {
              ...this.contacts[jid],
              notify: msg.pushName,
            };
          }
        }
      });
      ev.on("chats.upsert", (chats) => {
        for (const chat of chats || []) {
          if (chat.id) this.chats.set(chat.id, chat);
        }
      });
      ev.on("Contacts.Upsert", (contacts) => {
        for (const contact of contacts || []) {
          if (contact.id) {
            this.contacts[contact.id] = {
              ...this.contacts[contact.id],
              ...contact,
            };
          }
        }
      });
    },
    async loadMessage(jid, id) {
      return this.messages.get(jid)?.get(id) || undefined;
    },
  };
}

const rateLimit = new Map();

const ERROR_MESSAGES = {
  401: {
    reason: "الرقم غير مسجل في الواتس اب",
    action: "تأكد من أن هذا الرقم نشط على WhatsApp",
    fatal: true,
  },
  403: {
    reason: "تم رفض / حظر الوصول",
    action: "قد يتم حظر هذا الرقم بواسطة WhatsApp",
    fatal: true,
  },
  405: {
    reason: "طريقة غير مسموح بها",
    action: "حاول مرة أخرى لاحقًا",
    fatal: true,
  },
  406: {
    reason: "عدد مقيد",
    action: "هذا الرقم مقيد عبر الواتساب, انتظر بضع ساعات",
    fatal: true,
  },
  408: {
    reason: "مهلة التطبيق",
    action: "الاتصال بطيء, سيتم محاولة إعادة الاتصال",
    fatal: false,
  },
  409: {
    reason: "تعارض الجلسة",
    action: "يتم استخدام الجلسة على جهاز آخر",
    fatal: true,
  },
  411: {
    reason: "فشلت المصادقة",
    action: "تحتاج إلى مسح QR/الاقتران مرة أخرى",
    fatal: true,
  },
  428: {
    reason: "الحد الأقصى للسرعة",
    action: "الطلبات كثيرة جدًا, انتظر بضع دقائق",
    fatal: true,
  },
  440: {
    reason: "تسجيل الدخول مطلوب",
    action: "انتهت الجلسة, تحتاج إلى تسجيل الدخول مرة أخرى",
    fatal: true,
  },
  500: {
    reason: "خطأ في خادم الواتساب",
    action: "خادم الواتس اب لديه مشاكل",
    fatal: false,
  },
  501: {
    reason: "لم يتم تنفيذه",
    action: "الميزة غير مدعومة بعد",
    fatal: true,
  },
  503: {
    reason: "الخدمة غير متوفرة",
    action: "الواتساب تحت الصيانة",
    fatal: false,
  },
  515: {
    reason: "خطأ في الإرسال",
    action: "سيتم إجراء محاولة لإعادة الاتصال",
    fatal: false,
  },
};

const CONNECTION_CLOSED_REASONS = [
  {
    match: /Connection Closed/i,
    reason: "اتصال مغلق",
    action: "من المحتمل أن الرقم محظور أو أن هناك مشاكل في الشبكة",
    fatal: true,
  },
  {
    match: /write EOF/i,
    reason: "انقطع الاتصال",
    action: "مشكلة في الشبكة, سيتم محاولة إعادة الاتصال",
    fatal: false,
  },
  {
    match: /ECONNRESET/i,
    reason: "إعادة تعيين الاتصال",
    action: "الأحمر غير مستقر",
    fatal: false,
  },
  {
    match: /ETIMEDOUT/i,
    reason: "انتهت المهلة",
    action: "اتصال بطيء",
    fatal: false,
  },
  {
    match: /logged out/i,
    reason: "جلسة مغلقة",
    action: "تم قطع الحساب من الجهاز",
    fatal: true,
  },
  {
    match: /replaced/i,
    reason: "الجلسة المستبدلة",
    action: "تسجيل الدخول على جهاز آخر",
    fatal: true,
  },
  {
    match: /Multidevice mismatch/i,
    reason: "جلسة غير صالحة",
    action: "تحتاج إلى المسح مرة أخرى",
    fatal: true,
  },
  {
    match: /restart required/i,
    reason: "إعادة التشغيل مطلوبة",
    action: "سيتم إعادة التشغيل تلقائيًا",
    fatal: false,
  },
  {
    match: /bad session/i,
    reason: "جلسة تالفة",
    action: "تحتاج إلى المسح مرة أخرى",
    fatal: true,
  },
];

function parseDisconnectError(lastDisconnect) {
  const statusCode = lastDisconnect?.error?.output?.statusCode;
  const errorMessage = lastDisconnect?.error?.message || "خطأ غير معروف";

  if (statusCode && ERROR_MESSAGES[statusCode]) {
    return {
      ...ERROR_MESSAGES[statusCode],
      code: statusCode,
      message: errorMessage,
    };
  }

  for (const pattern of CONNECTION_CLOSED_REASONS) {
    if (pattern.match.test(errorMessage)) {
      return {
        code: statusCode || "N/A",
        reason: pattern.reason,
        action: pattern.action,
        fatal: pattern.fatal,
        message: errorMessage,
      };
    }
  }

  return {
    code: statusCode || "N/A",
    reason: "خطأ غير معروف",
    action: "اتصل بالمسؤول إذا استمر",
    fatal: false,
    message: errorMessage,
  };
}

function isSocketAlive(sock) {
  try {
    if (!sock) return false;
    if (sock.ws && sock.ws.readyState === 1) return true;
    if (sock.user?.id) return true;
    return false;
  } catch {
    return false;
  }
}

async function safeSend(sock, jid, content, options = {}) {
  try {
    if (!jid) return null;
    if (!isSocketAlive(sock)) return null;
    return await sock.sendMessage(jid, content, options);
  } catch {
    return null;
  }
}

async function startJadibot(sock, m, userJid, usePairing = true) {
  if (
    !userJid ||
    typeof userJid !== "string" ||
    !userJid.includes("@s.whatsapp.net")
  ) {
throw new Error("معرف JID للمستخدم غير صالح");
  }

  const id = userJid.replace(/@.+/g, "");

  if (isMainBotNumber(sock, userJid)) {
    throw new Error(
      "لا يمكن ربط رقم الروبوت الرئيسي كروبوت فرعي. استخدم رقم واتساب آخر.",
    );
  }

  if (usePairing) {
    const lastAttempt = rateLimit.get(id) || 0;
    if (Date.now() - lastAttempt < 60000) {
      throw new Error("انتظر دقيقة واحدة قبل المحاولة مرة أخرى.");
    }
    rateLimit.set(id, Date.now());
  }

  const authPath = getJadibotAuthPath(userJid);

  if (jadibotSessions.has(id)) {
    throw new Error("Jadibot نشط الآن لهذه المشكلة!");
  }

  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
  } = await import("ourin");
  const { version } = await fetchLatestBaileysVersion();
  const pinoModule = await import("pino");
  const pinoLogger = pinoModule.default({ level: "silent" });
  const childStore = createJadibotStore();
  const groupMetadataCache = new Map();

  const childSock = makeWASocket({
    version,
    logger: pinoLogger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pinoLogger),
    },
    browser: ["Ubuntu", "Chrome", "20.0.0"],
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: true,
    defaultQueryTimeoutMs: 20000,
    connectTimeoutMs: 20000,
    keepAliveIntervalMs: 10000,
    retryRequestDelayMs: 150,
    getMessage: async (key) => {
      return (await childStore.loadMessage(key.remoteJid, key.id))?.message;
    },
    cachedGroupMetadata: async (jid) => {
      const cached = groupMetadataCache.get(jid);
      if (cached) return cached;
      try {
        const fresh = await childSock.groupMetadata(jid);
        groupMetadataCache.set(jid, fresh);
        return fresh;
      } catch {
        return undefined;
      }
    },
    fireInitQueries: true,
    emitOwnEvents: true,
    shouldSyncHistoryMessage: () => false,
    transactionOpts: { maxCommitRetries: 5, delayBetweenTriesMs: 500 },
  });

  childStore.bind(childSock.ev);
  childSock.store = childStore;
  await extendSocket(childSock);

  let qrCount = 0;
  let lastQRMsg = null;
  let pairingCode = null;
  let heartbeatInterval = null;

  childSock.ev.on("creds.update", saveCreds);

  childSock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !usePairing) {
      qrCount++;
      if (qrCount > 3) {
        await safeSend(sock, m?.chat, {
          text: "❌ انتهت صلاحية رمز الاستجابة السريعة! يرجى المحاولة مرة أخرى.",
        });
        if (lastQRMsg?.key) {
          await safeSend(sock, m?.chat, { delete: lastQRMsg.key });
        }
        jadibotSessions.delete(id);
        reconnectAttempts.delete(id);
        try {
          childSock.ws.close();
        } catch {}
        return;
      }

      try {
        const qrBuffer = await QRCode.toBuffer(qr, {
          scale: 8,
          margin: 4,
          width: 256,
          color: { dark: "#000000ff", light: "#ffffffff" },
        });

        if (lastQRMsg?.key) {
          await safeSend(sock, m?.chat, { delete: lastQRMsg.key });
        }

        if (!m?.chat) return;
        lastQRMsg = await sock.sendMessage(
          m.chat,
          {
            image: qrBuffer,
            caption:
              `🤖 *ᴊᴀᴅɪʙᴏᴛ — Qʀ ᴄᴏᴅᴇ*\n\n` +
              `امسح رمز الاستجابة السريعة هذا ضوئيًا ليصبح روبوتًا.\n\n` +
              `> ⏱️ تنتهي صلاحيته خلال 20 ثانية\n` +
              `> 📊 عدد QR: ${qrCount}/3`,
          },
          { quoted: m },
        );
      } catch (e) {
        logger.error("Jadibot", "خطأ في إرسال QR:" + e.message);
      }
    }

    if (connection === "open") {
      const childNumber = cleanNumber(childSock.user?.id || childSock.user?.jid || userJid);
      if (isMainBotNumber(sock, childNumber)) {
        logger.error(
          "Jadibot",
          `Bloqueado: el subbot ${childNumber} coincide con el bot principal`,
        );
        try {
          childSock.ev.removeAllListeners();
          childSock.ws?.close?.();
          childSock.end?.();
        } catch {}
        jadibotSessions.delete(id);
        reconnectAttempts.delete(id);
        removeDangerousJadibotSession(childNumber || id);
        await safeSend(sock, m?.chat, {
          text:
            `🚫 *تم حظر JadiBot*

` +
            `> No puedes convertir el número del bot principal en subbot.
` +
            `> استخدم رقمًا مختلفًا لتجنب تعارضات/قيود الجلسة.`,
        });
        return;
      }

      logger.info("Jadibot", `Connected: ${id}`);

      reconnectAttempts.delete(id);

      jadibotSessions.set(id, {
        sock: childSock,
        jid: childSock.user?.jid || userJid,
        startedAt: Date.now(),
        ownerJid: m?.sender || userJid,
        status: "connected",
        connectionReady: true,
        pendingMessages: [],
      });

      heartbeatInterval = setInterval(() => {
        try {
          if (!isSocketAlive(childSock)) {
            clearInterval(heartbeatInterval);
          }
        } catch {}
      }, 30000);

      const session = jadibotSessions.get(id);
      if (session) {
        session.heartbeatInterval = heartbeatInterval;
      }

      childSock.sendPresenceUpdate("available").catch(() => {});

      addJadibotOwner(id, m?.sender || userJid);


      if (m?.chat) {
        sock
          .sendMessage(m.chat, {
            text:
              `✅ *ᴊᴀᴅɪʙᴏᴛ ᴛᴇʀʜᴜʙᴜɴɢ*\n\n` +
              `> 📱 الرقم: *@${id}*\n` +
              `> 🟢 الحالة: *متصل*\n` +
              `> ⏱️ Inicio: *${new Date().toLocaleTimeString("id-ID")}*\n\n` +
              `الروبوت الخاص بك نشط وجاهز لتلقي الأوامر!\n\n` +
              `> ℹ️ اكتب \`${m.prefix || "."}stopjadibot\` لإيقافه`,
            mentions: [userJid],
          })
          .catch((e) => {
            logger.error(
              "Jadibot",
              `خطأ في إرسال إشعار الاتصال: ${e.message}`,
            );
          });
      }

      if (lastQRMsg?.key && m?.chat) {
        safeSend(sock, m.chat, { delete: lastQRMsg.key }).catch(() => {});
      }
    }

    if (connection === "close") {
      const errorInfo = parseDisconnectError(lastDisconnect);

      logger.info(
        "Jadibot",
        `Disconnected: ${id}, code: ${errorInfo.code}, reason: ${errorInfo.reason}`,
      );

      const session = jadibotSessions.get(id);
      if (session?.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }

      const attempts = reconnectAttempts.get(id) || 0;

      if (errorInfo.fatal || attempts >= MAX_RECONNECT_ATTEMPTS) {
        jadibotSessions.delete(id);
        reconnectAttempts.delete(id);

        if (errorInfo.fatal) {
          try {
            if (fs.existsSync(authPath)) {
              fs.rmSync(authPath, { recursive: true, force: true });
            }
          } catch {}
        }

        let statusEmoji = "❌";
        if (errorInfo.code === 403 || errorInfo.reason?.includes("banned")) {
          statusEmoji = "🚫";
        } else if (
          errorInfo.code === 406 ||
          errorInfo.reason?.includes("dibatasi")
        ) {
          statusEmoji = "⚠️";
        }

        await safeSend(sock, m?.chat, {
          text:
            `${statusEmoji} *ᴊᴀᴅɪʙᴏᴛ ᴅɪsᴄᴏɴɴᴇᴄᴛᴇᴅ*\n\n` +
            `> 📱 الرقم: *@${id}*\n` +
            `> 🔢 الكود: \`${errorInfo.code}\`\n` +
            `> 📋 السبب: *${errorInfo.reason}*\n` +
            `> ℹ️ ${errorInfo.action}\n\n` +
            (errorInfo.fatal
              ? `> ⚠️ تم حذف الجلسة. استخدم \`.jadibot\` للبدء من جديد.`
              : ""),
          mentions: [userJid],
        });
      } else {
        reconnectAttempts.set(id, attempts + 1);

        await safeSend(sock, m?.chat, {
          text:
            `🔄 *ᴊᴀᴅɪʙᴏᴛ ʀᴇᴄᴏɴɴᴇᴄᴛɪɴɢ...*\n\n` +
            `> 📱 الرقم: *@${id}*\n` +
            `> 📋 السبب: *${errorInfo.reason}*\n` +
            `> 🔁 النية: *${attempts + 1}/${MAX_RECONNECT_ATTEMPTS}*\n\n` +
            `> إعادة الاتصال خلال ثواني ${RECONNECT_INTERVAL / 1000}...`,
          mentions: [userJid],
        });

        setTimeout(() => {
          startJadibot(sock, m, userJid, false).catch((e) => {
            logger.error("Jadibot", `فشلت إعادة الاتصال بـ ${id}: ${e.message}`);
            jadibotSessions.delete(id);
            reconnectAttempts.delete(id);
          });
        }, RECONNECT_INTERVAL);
      }
    }
  });

  const processedMessages = new Map();

  childSock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!childSock.user || !childSock.user.id) {
      childSock.user = {
        id: jidNormalizedUser(id),
        name: "Jadibot",
      };
    }

    if (type !== "notify" && type !== "append") return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const msgId = msg.key?.id;
      if (msgId && processedMessages.has(msgId)) continue;
      if (msgId) processedMessages.set(msgId, Date.now());

      if (msg.key && msg.key.remoteJid === "status@broadcast") continue;

      const msgTimestamp = msg.messageTimestamp
        ? Number(msg.messageTimestamp) * 1000
        : Date.now();
      const msgAge = Date.now() - msgTimestamp;
      if (msgAge > 60 * 60 * 1000) continue;

      const metadataKeys = [
        "senderKeyDistributionMessage",
        "messageContextInfo",
      ];
      const msgType =
        Object.keys(msg.message).find((k) => !metadataKeys.includes(k)) ||
        Object.keys(msg.message)[0];
      const ignoredTypes = [
        "protocolMessage",
        "senderKeyDistributionMessage",
        "reactionMessage",
        "stickerSyncRmrMessage",
        "encReactionMessage",
        "pollUpdateMessage",
        "pollCreationMessage",
        "pollCreationMessageV2",
        "pollCreationMessageV3",
        "keepInChatMessage",
        "deviceSentMessage",
        "call",
        "peerDataOperationRequestMessage",
      ];
      if (ignoredTypes.includes(msgType)) continue;

      if (!isSocketAlive(childSock)) continue;

      const session = jadibotSessions.get(id);
      if (session && !session.connectionReady) {
        session.pendingMessages = session.pendingMessages || [];
        session.pendingMessages.push(msg);
        continue;
      }

      try {
        const { messageHandler } = await import("../handler.js");
        await messageHandler(msg, childSock, {
          isJadibot: true,
          jadibotId: id,
        });
      } catch (e) {
        if (
          e.message?.includes("Connection Closed") ||
          e.message?.includes("428")
        ) {
          logger.info(
            "Jadibot",
            `تم إغلاق اتصال ${id} أثناء تخطي المعالج`,
          );
          break;
        }
        logger.error("Jadibot", `خطأ في المعالج لـ ${id}: ${e.message}`);
      }
    }

    const fiveMinAgo = Date.now() - 300000;
    for (const [key, time] of processedMessages) {
      if (time < fiveMinAgo) processedMessages.delete(key);
    }
  });

  if (usePairing && !state.creds?.registered) {
    try {
      await delay(3000);
      pairingCode = await childSock.requestPairingCode(id);
      pairingCode = pairingCode.match(/.{1,4}/g)?.join("-") || pairingCode;

      if (m && m.chat) {
        let thumbnail = null;
        try {
          if (!!getAssetBuffer("ourin2")) {
            thumbnail = getAssetBuffer("ourin2");
          }
        } catch {}

        await sock.sendMessage(
          m.chat,
          {
            text:
              `🔗 *ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ*\n\n` +
              `أدخل الكود التالي في الواتساب الخاص بك:\n\n` +
              `> 📱 *الإعدادات ← الأجهزة المقترنة ← إقران جهاز*\n\n` +
              `\`\`\`${pairingCode}\`\`\`\n\n` +
              `> 🕕 الرمز صالح لبضع دقائق\n` +
              `> ⚠️ لا تشارك هذا الرمز مع أي شخص`,
            contextInfo: saluranCtx(),
            interactiveButtons: [
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "📋 انسخ رمز الاقتران",
                  copy_code: pairingCode.replace(/-/g, ""),
                }),
              },
            ],
          },
          { quoted: m },
        );
      } else {
        logger.info("Jadibot", `رمز الاقتران لـ ${id}: ${pairingCode}`);
      }
    } catch (e) {
      logger.error("Jadibot", "حدث خطأ أثناء الحصول على رمز الاقتران:" + e.message);

      let errorMsg = "حدث خطأ أثناء الحصول على رمز الاقتران";
      if (
        e.message?.includes("rate") ||
        e.message?.includes("limit") ||
        e.message?.includes("428")
      ) {
        errorMsg = "تم الوصول إلى الحد الأقصى للسرعة! انتظر 5-10 دقائق.";
      } else if (
        e.message?.includes("banned") ||
        e.message?.includes("blocked")
      ) {
        errorMsg = "قد يكون الرقم محظورًا بواسطة WhatsApp.";
      } else if (
        e.message?.includes("Connection Closed") ||
        e.message?.includes("closed")
      ) {
        errorMsg = "انقطع الاتصال. حاول ثانية.";
      }

      await safeSend(sock, m?.chat, {
        text: `❌ *ᴊᴀᴅɪʙᴏᴛ ᴇʀʀᴏʀ*\n\n> ${errorMsg}`,
      });

      try {
        childSock.end?.();
      } catch {}
      jadibotSessions.delete(id);
      reconnectAttempts.delete(id);
      throw new Error(errorMsg);
    }
  }

  return { sock: childSock, pairingCode };
}

async function stopJadibot(jid, deleteSession = false) {
  const id = jid.replace(/@.+/g, "");
  const session = jadibotSessions.get(id);

  if (session) {
    try {
      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }
      session.sock.ev.removeAllListeners();
      session.sock.ws?.close?.();
      session.sock.end?.();
    } catch {}
    jadibotSessions.delete(id);
  }

  reconnectAttempts.delete(id);

  if (deleteSession) {
    const authPath = getJadibotAuthPath(jid);
    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
    }
  }

  return true;
}

async function stopAllJadibots() {
  const stopped = [];
  for (const [id, session] of jadibotSessions) {
    try {
      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }
      session.sock.ev.removeAllListeners();
      session.sock.ws?.close?.();
      session.sock.end?.();
    } catch {}
    stopped.push(id);
  }
  jadibotSessions.clear();
  reconnectAttempts.clear();
  return stopped;
}

async function restartJadibotSession(sock, sessionId) {
  const userJid = sessionId + "@s.whatsapp.net";
  try {
    if (isMainBotNumber(sock, sessionId)) {
      logger.warn(
        "Jadibot",
        `تم تجاهل جلسة الروبوت الفرعي لأنها تطابق الروبوت الأصلي: ${sessionId}`,
      );
      removeDangerousJadibotSession(sessionId);
      return;
    }

    logger.info("Jadibot", `جلسة الاستعادة: ${sessionId}`);

    const dbPath = path.join(JADIBOT_AUTH_FOLDER, sessionId, "data.json");
    let ownerJid = userJid;
    try {
      if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        if (data.owners?.[0]) ownerJid = data.owners[0] + "@s.whatsapp.net";
      }
    } catch {}

    const mockM = {
      chat: ownerJid,
      sender: ownerJid,
      prefix: ".",
      key: {
        remoteJid: ownerJid,
        fromMe: false,
        id: "restart-" + Date.now(),
      },
      reply: async (text) => {
        await safeSend(sock, ownerJid, { text });
      },
      react: async () => {},
    };
    await startJadibot(sock, mockM, userJid, false);
  } catch (e) {
    logger.error("Jadibot", `خطأ في استعادة ${sessionId}: ${e.message}`);
  }
}

function getJadibotStatus(jid) {
  const id = jid.replace(/@.+/g, "");
  const session = jadibotSessions.get(id);
  if (!session) return null;

  return {
    id,
    jid: session.jid,
    status: session.status || "unknown",
    startedAt: session.startedAt,
    ownerJid: session.ownerJid,
    uptime: Date.now() - session.startedAt,
  };
}

export {
  JADIBOT_AUTH_FOLDER,
  jadibotSessions,
  getJadibotAuthPath,
  isJadibotActive,
  getActiveJadibots,
  getAllJadibotSessions,
  startJadibot,
  stopJadibot,
  stopAllJadibots,
  restartJadibotSession,
  getJadibotStatus,
  isSocketAlive,
  safeSend,
};
