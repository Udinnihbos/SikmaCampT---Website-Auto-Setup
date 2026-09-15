const BASE_SCHEMA = `{
  "roles": [
    {
      "name": string,
      "color": string,          // hex, contoh "#5865F2"
      "hoist": boolean,         // tampil terpisah di member list
      "mentionable": boolean,
      "permissions": string[]   // nama permission gaya discord.js, contoh: "Administrator", "ManageChannels", "SendMessages", "Connect", "ViewChannel"
    }
  ],
  "categories": [
    {
      "name": string,
      "channels": [
        {
          "name": string,
          "type": "text" | "voice" | "announcement" | "forum",
          "topic": string,       // boleh string kosong kalau tidak relevan
          "emoji": string        // SATU emoji paling relevan sama fungsi channel ini, contoh "📢" untuk announcement`;

const FULL_EXTRA_FIELDS = `,
          "nsfw": boolean,       // true cuma kalau memang topiknya butuh (jarang dipakai)
          "slowmode": number,    // slowmode dalam detik, 0 kalau tidak perlu
          "permissionOverwrites": [
            {
              "role": string,    // nama role persis sama seperti di array "roles" di atas, atau "@everyone"
              "allow": string[], // nama permission yang diizinkan buat role ini di channel ini
              "deny": string[]   // nama permission yang ditolak buat role ini di channel ini
            }
          ]`;

const SCHEMA_TAIL = `
        }
      ]
    }
  ]
}`;

const COMMON_RULES = `
BATASAN:
- Maksimal 20 role.
- Maksimal 40 channel total (jaga-jaga rate limit Discord).
- Gunakan bahasa yang sama dengan input user untuk nama role/channel.
- Nama channel pakai format Discord yang wajar (lowercase, spasi jadi tanda hubung untuk channel text, boleh pakai emoji secukupnya).
- Jangan bikin role bernama "@everyone" di array "roles" (itu cuma dipakai sebagai referensi di permissionOverwrites).`;

const FULL_MODE_RULES = `
- Buat channel privat kalau relevan (misal channel staff-only, log moderasi, atau pengumuman yang cuma staff bisa kirim pesan) pakai "permissionOverwrites": deny "ViewChannel" buat "@everyone", allow "ViewChannel" buat role staff terkait. Channel pengumuman biasanya deny "SendMessages" buat "@everyone".
- Jangan kasih "permissionOverwrites" ke channel yang memang untuk semua orang (biarin array-nya kosong []).
- "slowmode" cuma diisi >0 kalau channel-nya rawan spam (misal chat umum yang rame), sisanya 0.`;

export function buildSystemPrompt(mode) {
  const isFull = mode === "full";
  const schema = isFull
    ? BASE_SCHEMA + FULL_EXTRA_FIELDS + SCHEMA_TAIL
    : BASE_SCHEMA + SCHEMA_TAIL;

  return `Kamu adalah mesin yang mengubah deskripsi server Discord dari user menjadi rancangan struktur server dalam format JSON.

ATURAN:
- Balas HANYA dengan JSON valid. Tanpa markdown, tanpa backtick, tanpa penjelasan tambahan.
- Ikuti schema ini persis:

${schema}
${COMMON_RULES}${isFull ? FULL_MODE_RULES : ""}`;
}

export function validateConfig(config) {
  if (!config || typeof config !== "object") return "Config bukan object";
  if (config.roles && !Array.isArray(config.roles)) return "roles harus array";
  if (config.categories && !Array.isArray(config.categories)) return "categories harus array";

  const roles = config.roles || [];
  const categories = config.categories || [];

  if (roles.length > 20) return "Terlalu banyak role (maks 20)";

  let totalChannels = 0;
  for (const cat of categories) {
    if (!cat.name) return "Ada category tanpa nama";
    for (const ch of cat.channels || []) {
      if (!ch.name) return "Ada channel tanpa nama";
      if (ch.permissionOverwrites && !Array.isArray(ch.permissionOverwrites)) {
        return `Channel "${ch.name}": permissionOverwrites harus array`;
      }
      totalChannels++;
    }
  }
  if (totalChannels > 40) return "Terlalu banyak channel (maks 40)";

  return null; // valid
}
