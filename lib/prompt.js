export const SYSTEM_PROMPT = `Kamu adalah mesin yang mengubah deskripsi server Discord dari user menjadi rancangan struktur server dalam format JSON.

ATURAN:
- Balas HANYA dengan JSON valid. Tanpa markdown, tanpa backtick, tanpa penjelasan tambahan.
- Ikuti schema ini persis:

{
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
          "topic": string        // boleh string kosong kalau tidak relevan
        }
      ]
    }
  ]
}

BATASAN:
- Maksimal 20 role.
- Maksimal 40 channel total (jaga-jaga rate limit Discord).
- Gunakan bahasa yang sama dengan input user untuk nama role/channel.
- Nama channel pakai format Discord yang wajar (lowercase, spasi jadi tanda hubung untuk channel text, boleh pakai emoji secukupnya).
- Jangan bikin role bernama "@everyone".`;

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
      totalChannels++;
    }
  }
  if (totalChannels > 40) return "Terlalu banyak channel (maks 40)";

  return null; // valid
}
