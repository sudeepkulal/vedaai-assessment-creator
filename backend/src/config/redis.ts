import { ConnectionOptions } from 'bullmq';

/**
 * Redis connection configuration.
 * Supports both local Docker Redis and Upstash Redis (TLS).
 *
 * Upstash requires TLS – enable it by setting REDIS_TLS=true in your env,
 * OR it is automatically enabled when REDIS_PASSWORD is set (Upstash always
 * requires a password, so this is a safe heuristic).
 */
const useTLS =
  process.env.REDIS_TLS === 'true' ||
  (!!process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.length > 0);

export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
  // TLS is required for Upstash and other managed Redis providers
  ...(useTLS ? { tls: {} } : {}),
};

console.log(
  `[Redis] Configured: ${redisConnection.host}:${redisConnection.port} | TLS: ${useTLS}`
);
