// src/Common/Infrastructure/logger.js

const isProd = process.env.NODE_ENV === "production";

/**
 * Универсальный logger.
 * Можно легко заменить на pino / winston, не трогая остальной код.
 */
export const logger = {
  info: (...args) => {
    console.log("[INFO]", ...args);
  },

  warn: (...args) => {
    console.warn("[WARN]", ...args);
  },

  error: (...args) => {
    console.error("[ERROR]", ...args);
  },

  debug: (...args) => {
    if (!isProd) {
      console.debug("[DEBUG]", ...args);
    }
  },
};

export default logger;
