import { redis } from "@/lib/redis";

export async function GET(req, { params }) {
  // Lapisan proteksi tambahan: bot wajib kirim header x-bot-secret yang cocok
  // dengan env AUTOSETUP_BOT_SECRET. Set env yang sama di web (Vercel) dan di bot.
  const expectedSecret = process.env.AUTOSETUP_BOT_SECRET;
  if (expectedSecret) {
    const givenSecret = req.headers.get("x-bot-secret");
    if (givenSecret !== expectedSecret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { token } = params;
  if (!token || token.length > 64) {
    return Response.json({ error: "Token tidak valid" }, { status: 400 });
  }

  const key = `autosetup:${token}`;
  const raw = await redis.get(key);

  if (!raw) {
    return Response.json({ error: "Token tidak ditemukan atau sudah kedaluwarsa" }, { status: 404 });
  }

  // One-time use: langsung hapus setelah diambil bot
  await redis.del(key);

  const config = typeof raw === "string" ? JSON.parse(raw) : raw;
  return Response.json({ config });
}
