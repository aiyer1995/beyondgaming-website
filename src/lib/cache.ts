import { Redis } from "@upstash/redis";

function createRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  // Skip Redis during Next.js static generation (build time)
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Default TTL: 5 minutes
const DEFAULT_TTL = 300;

export async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
  const redis = createRedis();
  if (!redis) return fetcher();

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch {
    // Silently fall through to fetcher
  }

  const data = await fetcher();

  try {
    await redis.set(key, data, { ex: ttl });
  } catch {
    // Silently ignore cache write failures
  }

  return data;
}

export async function invalidateCache() {
  const redis = createRedis();
  if (!redis) return;

  try {
    await redis.flushdb();
  } catch {
    // Silently ignore
  }
}
