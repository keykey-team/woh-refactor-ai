import { redis } from "./redis.js";
import crypto from "node:crypto";

export function buildCacheKey(prefix, query) {
  const version = "v2";
  const raw = JSON.stringify(query || {});
  const hash = crypto.createHash("md5").update(raw).digest("hex");
  return `${version}:${prefix}:${hash}`;
}

function isRedisReady() {
  return Boolean(redis?.isOpen && redis?.isReady);
}

export async function getOrSetCache(key, ttlSeconds, factory) {
  try {
    // если redis недоступен - отдаем данные без кеша
    if (!isRedisReady()) {
      return await factory();
    }

    const cached = await redis.get(key);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn("[cache] JSON parse error, ignoring cache");
      }
    }

    const freshData = await factory();

    // 👉 оборачиваем set отдельно, чтобы не ломало ответ
    try {
      await redis.set(key, JSON.stringify(freshData), {
        EX: ttlSeconds,
      });
    } catch (e) {
      console.warn("[cache] redis.set failed:", e?.message);
    }

    return freshData;
  } catch (err) {
    console.warn("[cache] fallback (redis error):", err?.message);

    // 👉 fallback — просто выполняем factory
    return await factory();
  }
}

export async function delCache(key) {
  if (!isRedisReady()) return 0;
  return redis.del(key);
}

export async function deleteByPrefix(prefix) {
  if (!isRedisReady()) return 0;

  let deleted = 0;
  let cursor = "0";

  do {
    const result = await redis.scan(cursor, {
      MATCH: `${prefix}*`,
      COUNT: 100,
    });

    cursor = result.cursor;

    if (result.keys?.length) {
      const n = await redis.del(result.keys);
      deleted += Number(n || 0);
    }
  } while (cursor !== "0");

  return deleted;
}

export async function invalidateCatalogCache() {
  if (!isRedisReady()) return 0;

  const deletedParts = await Promise.all([
    deleteByPrefix("v2:catalog:cards:"),
    deleteByPrefix("v2:catalog:facets:"),
    deleteByPrefix("v2:catalog:group:"),
    deleteByPrefix("v2:catalog:categories:"),

    // legacy prefixes
    deleteByPrefix("catalog:hits:"),
    deleteByPrefix("catalog:sales:"),
    deleteByPrefix("catalog:groups:"),
    deleteByPrefix("catalog:categories:"),
    deleteByPrefix("catalog:menu:"),
    deleteByPrefix("catalog:facets:"),
    deleteByPrefix("catalog:group:"),
    deleteByPrefix("catalog:filters:"),
  ]);

  return deletedParts.reduce((acc, n) => acc + Number(n || 0), 0);
}