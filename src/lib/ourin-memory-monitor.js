import { logger } from "./ourin-logger.js";
const RSS_LIMIT = 1024 * 1024 * 1024;
const CHECK_INTERVAL = 5 * 60 * 1000;

let monitorTimer = null;

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + "MB";
}

function startMemoryMonitor() {
  if (monitorTimer) return;

  monitorTimer = setInterval(() => {
    const mem = process.memoryUsage();

    if (global.gc) global.gc();

    if (mem.rss >= RSS_LIMIT) {
      logger.warn(
        "memory",
        `تجاوز RSS ${formatMB(mem.rss)} حد ${formatMB(RSS_LIMIT)}, ويتم إعادة التشغيل`,
      );
      process.exit(1);
    }

    logger.system(
      "memory",
      `rss ${formatMB(mem.rss)} · الكومة ${formatMB(mem.heapUsed)}/${formatMB(mem.heapTotal)}`,
    );
  }, CHECK_INTERVAL);

  if (monitorTimer.unref) monitorTimer.unref();
  logger.success(
    "memory",
    `مراقبة نشطة, والحد من ${formatMB(RSS_LIMIT)}, والتحقق من كل ${CHECK_INTERVAL / 60000}m`,
  );
}

function stopMemoryMonitor() {
  if (monitorTimer) {
    clearInterval(monitorTimer);
    monitorTimer = null;
  }
}

export { startMemoryMonitor, stopMemoryMonitor };
