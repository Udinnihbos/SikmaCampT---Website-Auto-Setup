import { nanoid } from "nanoid";
import { redis, TOKEN_TTL_SECONDS } from "@/lib/redis";
import { validateConfig } from "@/lib/prompt";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const config = body?.config;
  const validationError = validateConfig(config);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const token = nanoid(10);

  await redis.set(`autosetup:${token}`, JSON.stringify(config), {
    ex: TOKEN_TTL_SECONDS,
  });

  return Response.json({
    token,
    expiresInMinutes: TOKEN_TTL_SECONDS / 60,
  });
}
