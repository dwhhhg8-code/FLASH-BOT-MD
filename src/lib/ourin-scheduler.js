import { getDatabase } from "./ourin-database.js";
import { logger } from "./ourin-logger.js";
import { CronJob } from "cron";
import moment from "moment-timezone";
import { saluranCtx } from "./ourin-context.js";
import config from "../../config.js";

const scheduledTasks = new Map();
const activeCronJobs = new Map();
const TZ = "Asia/Jakarta";

function getMsUntilTime(hour, minute = 0) {
  const now = moment.tz(TZ);
  const target = moment
    .tz(TZ)
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0);
  if (target.isSameOrBefore(now)) target.add(1, "day");
  return target.diff(now);
}

function formatTimeRemaining(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function startDailyLimitReset(options = {}) {
  const hour = options.hour ?? 0;
  const minute = options.minute ?? 0;
  const defaultLimit = options.defaultLimit ?? 25;

  if (activeCronJobs.has("dailyLimitReset")) {
    activeCronJobs.get("dailyLimitReset").stop();
    activeCronJobs.delete("dailyLimitReset");
  }

  const job = new CronJob(
    `${minute} ${hour} * * *`,
    async () => {
      try {
        const db = getDatabase();
        const resetCount = db.resetAllEnergi(defaultLimit, -1);
        logger.success(
          "Scheduler",
          `اكتملت إعادة تعيين الحد اليومي! إعادة تعيين مستخدمي ${resetCount} (العادي: ${defaultLimit}, المميز: ∞)`,
        );
        db.incrementStat("dailyResets");
        db.setting("lastLimitReset", new Date().toISOString());
      } catch (error) {
        logger.error("Scheduler", `فشلت إعادة تعيين الحد اليومي: ${error.message}`);
      }
    },
    null,
    true,
    TZ,
  );

  activeCronJobs.set("dailyLimitReset", job);
  logger.info(
    "Scheduler",
    `تم تمكين إعادة تعيين الحد اليومي عند ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} (${TZ})`,
  );
}

async function scheduleMessage(options, sock) {
  const {
    id,
    jid,
    message,
    hour,
    minute = 0,
    repeat = false,
    createdAt = null,
    ...meta
  } = options;

  if (!id || !jid || !message || hour === undefined) {
    throw new Error("الخيارات المطلوبة مفقودة: المعرف, JID, الرسالة, الساعة");
  }

  if (scheduledTasks.has(id)) cancelScheduledMessage(id);

  const task = {
    id,
    jid,
    message,
    hour,
    minute,
    repeat,
    createdAt: createdAt || new Date().toISOString(),
    nextRun: null,
    ...meta,
  };

  if (activeCronJobs.has(id)) {
    activeCronJobs.get(id).stop();
    activeCronJobs.delete(id);
  }

  const job = new CronJob(
    `${minute} ${hour} * * *`,
    async () => {
      try {
        await sock.sendMessage(jid, message);
        logger.success("Scheduler", `الرسالة المجدولة المرسلة: ${id}`);
        const db = getDatabase();
        db.incrementStat("scheduledMessagesSent");

        if (!repeat) {
          job.stop();
          scheduledTasks.delete(id);
          activeCronJobs.delete(id);
        } else {
          task.nextRun = job.nextDate().toISO();
        }
      } catch (error) {
        logger.error(
          "Scheduler",
          `خطأ في إرسال الرسالة المجدولة ${id}: ${error.message}`,
        );
      }
    },
    null,
    true,
    TZ,
  );

  task.nextRun = job.nextDate().toISO();
  activeCronJobs.set(id, job);
  scheduledTasks.set(id, task);

  logger.info(
    "Scheduler",
    `الرسالة المجدولة: ${id} على ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  );
  return task;
}

function cancelScheduledMessage(id) {
  if (activeCronJobs.has(id)) {
    activeCronJobs.get(id).stop();
    activeCronJobs.delete(id);
  }
  if (scheduledTasks.has(id)) {
    scheduledTasks.delete(id);
    logger.info("Scheduler", `الرسالة المجدولة الملغاة: ${id}`);
    return true;
  }
  return false;
}

function getScheduledMessages() {
  return Array.from(scheduledTasks.values());
}

function getScheduledMessage(id) {
  return scheduledTasks.get(id) || null;
}

function saveScheduledMessages() {
  try {
    const db = getDatabase();
    const tasks = Array.from(scheduledTasks.values());
    db.setting("scheduledMessages", tasks);
    logger.debug("Scheduler", `تم حفظ الرسائل المجدولة ${tasks.length}`);
  } catch (error) {
    logger.error(
      "Scheduler",
      `خطأ في حفظ الرسائل المجدولة: ${error.message}`,
    );
  }
}

function loadScheduledMessages(sock) {
  try {
    const db = getDatabase();
    const savedTasks = db.setting("scheduledMessages") || [];
    for (const task of savedTasks) {
      if (task.repeat || new Date(task.nextRun) > new Date()) {
        scheduleMessage(task, sock);
      }
    }
    logger.info("Scheduler", `تم تحميل الرسائل المجدولة ${savedTasks.length}`);
  } catch (error) {
    logger.error(
      "Scheduler",
      `خطأ في تحميل الرسائل المجدولة: ${error.message}`,
    );
  }
}

function stopAllSchedulers() {
  saveScheduledMessages();
  for (const [id, job] of activeCronJobs) {
    job.stop();
    logger.debug("Scheduler", `Stopped: ${id}`);
  }
  activeCronJobs.clear();
  if (groupScheduleSock) groupScheduleSock = null;
  sewaSock = null;
  logger.info("Scheduler", "توقفت جميع المجدولة");
}

function getSchedulerStatus() {
  const db = getDatabase();
  return {
    dailyResetEnabled: activeCronJobs.has("dailyLimitReset"),
    lastLimitReset: db.setting("lastLimitReset") || "Never",
    scheduledMessagesCount: scheduledTasks.size,
    totalResets: db.getStats("dailyResets"),
    totalMessagesSent: db.getStats("scheduledMessagesSent"),
  };
}

const schedulerRegistry = {
  dailyLimitReset: {
    name: "إعادة تعيين الحد اليومي",
    key: "dailyLimitReset",
    description: "إعادة تعيين حد المستخدم في الساعة 00:00",
  },
  groupSchedule: {
    name: "جدول المجموعة",
    key: "groupSchedule",
        description: "فتح/إغلاق المجموعة تلقائيًا",
  },
  sewaChecker: {
    name: "مدقق سيوا",
    key: "sewaChecker",
        description: "تحقق من الإيجارات منتهية الصلاحية كل 10 دقائق",
  },
  scheduledMessages: {
    name: "مخطط الجدول الزمني",
    key: "scheduledMessages",
    description: "تذكير وجداول زمنية مجانية من المالك",
  },
};

function isSchedulerRunning(name) {
  const key = name.toLowerCase().replace(/[\s-]/g, "");
  if (key === "dailylimitreset" || key === "limitreset" || key === "limit")
    return activeCronJobs.has("dailyLimitReset");
  if (key === "groupschedule" || key === "groupsched" || key === "group")
    return activeCronJobs.has("groupSchedule");
  if (key === "sewachecker" || key === "sewa")
    return activeCronJobs.has("sewaChecker");
  if (key === "scheduledmessages" || key === "messages" || key === "msg")
    return scheduledTasks.size > 0;
  return false;
}

function getFullSchedulerStatus() {
  const db = getDatabase();
  const status = {
    schedulers: [
      {
        name: "إعادة تعيين الحد اليومي",
        key: "limitreset",
        running: activeCronJobs.has("dailyLimitReset"),
        description: "إعادة تعيين حد المستخدم في الساعة 00:00",
        lastRun: db.setting("lastLimitReset") || "Never",
        stats: { totalResets: db.getStats("dailyResets") || 0 },
      },
      {
        name: "جدول المجموعة",
        key: "groupschedule",
        running: activeCronJobs.has("groupSchedule"),
        description: "فتح/إغلاق المجموعة مجدولة تلقائيًا",
        lastRun: "-",
        stats: {},
      },
      {
        name: "مدقق سيوا",
        key: "sewa",
        running: activeCronJobs.has("sewaChecker"),
    description: "تحقق من الإيجارات منتهية الصلاحية كل 10 دقائق",
        lastRun: "-",
        stats: {},
      },
      {
        name: "مخطط الجدول الزمني",
        key: "messages",
        running: scheduledTasks.size > 0,
        description: "تذكيرات وجداول زمنية مخصصة للمالك",
        lastRun: "-",
        stats: {
          activeMessages: scheduledTasks.size,
          totalSent: db.getStats("scheduledMessagesSent") || 0,
        },
      },
    ],
    summary: { totalActive: 0, totalInactive: 0 },
  };
  status.schedulers.forEach((s) => {
    if (s.running) status.summary.totalActive++;
    else status.summary.totalInactive++;
  });
  return status;
}

function stopSchedulerByName(name) {
  const key = name.toLowerCase().replace(/[\s-]/g, "");
  let stopped = false;
  let schedulerName = "";

  if (key === "dailylimitreset" || key === "limitreset" || key === "limit") {
    if (activeCronJobs.has("dailyLimitReset")) {
      activeCronJobs.get("dailyLimitReset").stop();
      activeCronJobs.delete("dailyLimitReset");
      stopped = true;
      schedulerName = "إعادة تعيين الحد اليومي";
    }
  }

  if (key === "groupschedule" || key === "groupsched" || key === "group") {
    if (activeCronJobs.has("groupSchedule")) {
      activeCronJobs.get("groupSchedule").stop();
      activeCronJobs.delete("groupSchedule");
    }
    groupScheduleSock = null;
    stopped = true;
    schedulerName = "جدول المجموعة";
  }

  if (key === "sewachecker" || key === "sewa") {
    if (activeCronJobs.has("sewaChecker")) {
      activeCronJobs.get("sewaChecker").stop();
      activeCronJobs.delete("sewaChecker");
      stopped = true;
      schedulerName = "مدقق سيوا";
    }
    sewaSock = null;
  }

  if (key === "scheduledmessages" || key === "messages" || key === "msg") {
    for (const [id] of scheduledTasks) cancelScheduledMessage(id);
    stopped = true;
    schedulerName = "مخطط الجدول الزمني";
  }

  if (key === "all") {
    stopAllSchedulers();
    return { stopped: true, name: "جميع المجدولين" };
  }

  if (stopped) logger.info("Scheduler", `Stopped: ${schedulerName}`);
  return { stopped, name: schedulerName };
}

function startSchedulerByName(name, sock, config = null) {
  const key = name.toLowerCase().replace(/[\s-]/g, "");
  let started = false;
  let schedulerName = "";
  const cfg = config;

  if (key === "dailylimitreset" || key === "limitreset" || key === "limit") {
    if (!activeCronJobs.has("dailyLimitReset")) {
      startDailyLimitReset({
        hour: cfg.scheduler?.resetHour ?? 0,
        minute: cfg.scheduler?.resetMinute ?? 0,
        defaultLimit: cfg.energi?.default ?? 25,
      });
      started = true;
      schedulerName = "إعادة تعيين الحد اليومي";
    }
  }

  if (key === "groupschedule" || key === "groupsched" || key === "group") {
    if (sock) {
      startGroupScheduleChecker(sock);
      started = true;
      schedulerName = "جدول المجموعة";
    }
  }

  if (key === "sewachecker" || key === "sewa") {
    if (sock && !activeCronJobs.has("sewaChecker")) {
      startSewaChecker(sock);
      started = true;
      schedulerName = "مدقق سيوا";
    }
  }

  if (key === "scheduledmessages" || key === "messages" || key === "msg") {
    if (sock) {
      loadScheduledMessages(sock);
      started = true;
      schedulerName = "مخطط الجدول الزمني";
    }
  }

  if (key === "all") {
    if (sock) {
      initScheduler(cfg, sock);
      startGroupScheduleChecker(sock);
      startSewaChecker(sock);
      return { started: true, name: "جميع المجدولين" };
    }
  }

  if (started) logger.info("Scheduler", `Started: ${schedulerName}`);
  return { started, name: schedulerName };
}

function initScheduler(config, sock = null) {
  if (config.features?.dailyLimitReset !== false) {
    startDailyLimitReset({
      hour: config.scheduler?.resetHour ?? 0,
      minute: config.scheduler?.resetMinute ?? 0,
      defaultLimit: config.energi?.default ?? 25,
    });
  }
  if (sock) loadScheduledMessages(sock);

  new CronJob(
    "*/5 * * * *",
    () => {
      if (scheduledTasks.size > 0) saveScheduledMessages();
    },
    null,
    true,
    TZ,
  );

  logger.success("Scheduler", "تمت تهيئة المجدول");
}

let groupScheduleSock = null;
const notifiedGroups = new Set();

async function startGroupScheduleChecker(sock) {
  if (activeCronJobs.has("groupSchedule")) {
    activeCronJobs.get("groupSchedule").stop();
    activeCronJobs.delete("groupSchedule");
  }

  groupScheduleSock = sock;
  notifiedGroups.clear();

  const job = new CronJob(
    "* * * * *",
    async () => {
      if (!groupScheduleSock) return;

      try {
        const db = getDatabase();
        const now = moment.tz(TZ);
        const currentTime = now.format("HH:mm");
        const groups = db.db?.data?.groups || {};
        if (!groups || typeof groups !== "object") return;

        for (const [groupId, group] of Object.entries(groups)) {
          if (!group || typeof group !== "object") continue;
          const notifyKey = `${groupId}_${currentTime}`;
          if (notifiedGroups.has(notifyKey)) continue;

          if (group.scheduleOpen === currentTime) {
            try {
              await groupScheduleSock.groupSettingUpdate(
                groupId,
                "not_announcement",
              );
              await groupScheduleSock.sendMessage(groupId, {
                text: `🔓 *ᴀᴜᴛᴏ ᴏᴘᴇɴ*\n\n> تم فتح المجموعة تلقائيًا وفقًا للجدول الزمني.\n> الوقت: ${currentTime} WIB`,
              });
              notifiedGroups.add(notifyKey);
              logger.success(
                "GroupSchedule",
                `تم فتح المجموعة ${groupId} عند ${currentTime}`,
              );
            } catch (e) {
              if (
                e.message?.includes("not-authorized") ||
                e.message?.includes("admin")
              ) {
                logger.warn(
                  "GroupSchedule",
                  `الروبوت ليس مسؤولاً عن ${groupId}, ولا يمكنه فتح المجموعة`,
                );
                try {
                  await groupScheduleSock.sendMessage(groupId, {
                    text: `⚠️ *ɢᴀɢᴀʟ ᴀᴜᴛᴏ ᴏᴘᴇɴ*\n\n> الروبوت ليس مسؤولاً, ولا يمكنه تغيير إعدادات المجموعة.\n> اجعل الروبوت مسؤولاً لتنشيط هذه الوظيفة.`,
                  });
                } catch {}
              } else {
                logger.error(
                  "GroupSchedule",
                  `خطأ في فتح ${groupId}: ${e.message}`,
                );
              }
              notifiedGroups.add(notifyKey);
            }
          }

          if (group.scheduleClose === currentTime) {
            try {
              await groupScheduleSock.groupSettingUpdate(
                groupId,
                "announcement",
              );
              await groupScheduleSock.sendMessage(groupId, {
                text: `🔒 *ᴀᴜᴛᴏ ᴄʟᴏsᴇ*\n\n> يتم إغلاق المجموعة تلقائيًا وفقًا للجدول الزمني.\n> الوقت: ${currentTime} WIB`,
              });
              notifiedGroups.add(notifyKey);
              logger.success(
                "GroupSchedule",
                `المجموعة المغلقة ${groupId} عند ${currentTime}`,
              );
            } catch (e) {
              if (
                e.message?.includes("not-authorized") ||
                e.message?.includes("admin")
              ) {
                logger.warn(
                  "GroupSchedule",
                  `الروبوت ليس مسؤولاً عن ${groupId}, ولا يمكنه إغلاق المجموعة`,
                );
                try {
                  await groupScheduleSock.sendMessage(groupId, {
                    text: `⚠️ *ɢᴀɢᴀʟ ᴀᴜᴛᴏ ᴄʟᴏsᴇ*\n\n> الروبوت ليس مسؤولاً, ولا يمكنه تغيير إعدادات المجموعة.\n> اجعل الروبوت مسؤولاً لتنشيط هذه الوظيفة.`,
                  });
                } catch {}
              } else {
                logger.error(
                  "GroupSchedule",
                  `خطأ في إغلاق ${groupId}: ${e.message}`,
                );
              }
              notifiedGroups.add(notifyKey);
            }
          }
        }

        if (now.second() === 0 && now.minute() === 0) notifiedGroups.clear();
      } catch (error) {
        logger.error("GroupSchedule", `خطأ في المدقق: ${error.message}`);
      }
    },
    null,
    true,
    TZ,
  );

  activeCronJobs.set("groupSchedule", job);
  logger.info(
    "Scheduler",
    "بدأ مدقق جدول المجموعة (CronJob, كل دقيقة)",
  );
}

let sewaSock = null;

async function startSewaChecker(sock) {
  sewaSock = sock;

  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
  const ONE_HOUR_MS = 60 * 60 * 1000;

  if (activeCronJobs.has("sewaChecker")) {
    activeCronJobs.get("sewaChecker").stop();
    activeCronJobs.delete("sewaChecker");
  }

  const doCheck = async () => {
    try {
      const db = getDatabase();
      const sewaData = db.db.data.sewa;
      if (
        !sewaData ||
        !sewaData.groups ||
        Object.keys(sewaData.groups).length === 0
      )
        return;

      const sewaGroups = db.db.data.sewa.groups || {};
      const now = Date.now();
      let expiredCount = 0;
      let warnedCount = 0;

      for (const [groupId, data] of Object.entries(sewaGroups)) {
        if (data.isLifetime) continue;
        if (data.status === "expired") continue;

        if (data.expiredAt <= now) {
          try {
            await sewaSock.sendText(
              groupId,
              `⏰ *انتهى الاستئجار*\n\nانتهى وقت استئجار الروبوت في هذه المجموعة.\nسيترك الروبوت المجموعة.\n\nاتصل بالمالك لتجديد الاستئجار.`,
              null,
              {
                contextInfo: saluranCtx(),
              },
            );
            await new Promise((r) => setTimeout(r, 2000));
            await sewaSock.groupLeave(groupId);
            data.status = "expired";
            data.expiredLeftAt = Date.now();
            expiredCount++;
            await new Promise((r) => setTimeout(r, 3000));
          } catch (e) {
            logger.error(
              "Scheduler",
              `حدث خطأ أثناء مغادرة المجموعة منتهية الصلاحية: ${e.message}`,
            );
          }
          continue;
        }

        const remaining = data.expiredAt - now;

        if (remaining <= ONE_HOUR_MS && !data._warned1h) {
          try {
            const minutes = Math.floor(remaining / 60000);
            await sewaSock.sendText(
              groupId,
              `⚠️ *إشعار التأجير*\n\nوقت التأجير المتبقي: *${minutes} دقيقة*!\nاتصل بالمالك للتجديد.\n\nإذا لم يتم تجديده, فسيخرج الروبوت تلقائيًا.`,
              null,
              {
                contextInfo: saluranCtx(),
              },
            );
            data._warned1h = true;
            warnedCount++;
            await new Promise((r) => setTimeout(r, 2000));
          } catch {}
        } else if (
          remaining <= THREE_DAYS_MS &&
          remaining > ONE_HOUR_MS &&
          !data._warned3d
        ) {
          try {
            const days = Math.floor(remaining / 86400000);
            const hours = Math.floor((remaining % 86400000) / 3600000);
            await sewaSock.sendText(
              groupId,
              `⚠️ *إشعار التأجير*\n\nوقت التأجير المتبقي: *${days}d ${hours}h*\nاتصل بالمالك للتجديد.\n\nإذا لم يتم تجديده, فسيخرج الروبوت تلقائيًا.`,
              null,
              {
                contextInfo: saluranCtx(),
              },
            );
            data._warned3d = true;
            warnedCount++;
            await new Promise((r) => setTimeout(r, 2000));
          } catch {}
        }
      }

      if (expiredCount > 0 || warnedCount > 0) {
        db.db.write();
        logger.success(
          "Scheduler",
          `التحقق من الإيجار: انتهت صلاحية ${expiredCount}, وتم إخطار ${warnedCount}`,
        );
      }
    } catch (error) {
      logger.error("Scheduler", `خطأ في التحقق من الإيجار: ${error.message}`);
    }
  };

  doCheck();

  const job = new CronJob("*/10 * * * *", doCheck, null, true, TZ);
  activeCronJobs.set("sewaChecker", job);
  logger.info("Scheduler", "تم تفعيل مدقق التأجير (CronJob, كل 10 دقائق)");
}

export {
  initScheduler,
  stopAllSchedulers,
  startDailyLimitReset,
  startGroupScheduleChecker,
  startSewaChecker,
  scheduleMessage,
  cancelScheduledMessage,
  getScheduledMessages,
  getScheduledMessage,
  saveScheduledMessages,
  loadScheduledMessages,
  getMsUntilTime,
  formatTimeRemaining,
  getSchedulerStatus,
  getFullSchedulerStatus,
  isSchedulerRunning,
  startSchedulerByName,
  stopSchedulerByName,
};
