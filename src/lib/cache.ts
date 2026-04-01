import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Default TTL: 5 minutes
const DEFAULT_TTL = 300;

export async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
  if (!redis) return fetcher();

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch (err) {
    console.error("Redis get error:", err);
  }

  const data = await fetcher();

  try {
    await redis.set(key, JSON.stringify(data), { ex: ttl });
  } catch (err) {
    console.error("Redis set error:", err);
  }

  return data;
}

export async function invalidateCache(pattern?: string) {
  if (!redis) return;

  try {
    if (pattern) {
      // Scan and delete matching keys
      let cursor = 0;
      do {
        const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
        cursor = Number(nextCursor);
        if (keys.length > 0) {
          await Promise.all(keys.map((key) => redis.del(key)));
        }
      } while (cursor !== 0);
    } else {
      // Flush all cached data
      await redis.flushdb();
    }
  } catch (err) {
    console.error("Redis invalidate error:", err);
  }
}
