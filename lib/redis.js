import { Redis } from "@upstash/redis";

// Butuh env: UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN
// Ambil dari dashboard Upstash (upstash.com) - gratis, cukup untuk skala ini.
export const redis = Redis.fromEnv();

export const TOKEN_TTL_SECONDS = 60 * 30; // token hidup 30 menit
