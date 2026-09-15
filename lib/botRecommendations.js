// Daftar statis, sengaja BUKAN di-generate AI - biar gak ada resiko nyaranin bot yang
// udah mati/gak akurat. Isinya bot-bot established yang emang masih luas dipake.
// link pakai top.gg search (bukan invite langsung) biar gak ada link mati kalau bot pindah/ganti.

const BOT_CATALOG = [
  {
    name: "Dyno",
    category: "Moderasi",
    reason: "Auto-moderation, anti-spam, dan logging yang gampang di-setup lewat dashboard web.",
    keywords: ["moderasi", "moderator", "aturan", "rules", "spam", "banned", "ban", "mute"],
  },
  {
    name: "Carl-bot",
    category: "Moderasi & Reaction Roles",
    reason: "Moderasi lengkap plus reaction roles dan auto-role buat member baru.",
    keywords: ["reaction role", "auto role", "verifikasi", "verify", "member baru", "role pilih"],
  },
  {
    name: "YAGPDB",
    category: "Moderasi & Utility",
    reason: "Gratis, open-source, fitur moderasi dan custom command yang fleksibel.",
    keywords: ["custom command", "gratis", "free"],
  },
  {
    name: "MEE6",
    category: "Leveling & Welcome",
    reason: "Sistem level/XP dan pesan welcome otomatis, salah satu yang paling dikenal.",
    keywords: ["level", "leveling", "xp", "rank", "welcome", "selamat datang"],
  },
  {
    name: "Arcane",
    category: "Leveling",
    reason: "Alternatif leveling yang fokus ke XP, role reward, dan leaderboard.",
    keywords: ["level", "leveling", "xp", "rank", "leaderboard"],
  },
  {
    name: "Jockie Music",
    category: "Musik",
    reason: "Bot musik yang masih aktif dan gratis buat voice channel nongkrong bareng.",
    keywords: ["musik", "music", "lagu", "voice", "nongkrong", "playlist"],
  },
  {
    name: "ProBot",
    category: "All-in-one",
    reason: "Gabungan moderasi, leveling, welcome, dan musik dalam satu bot.",
    keywords: ["all in one", "lengkap", "serba bisa"],
  },
  {
    name: "Ticket Tool",
    category: "Support/Tiket",
    reason: "Sistem tiket support buat pertanyaan member atau laporan masalah ke staff.",
    keywords: ["tiket", "ticket", "support", "bantuan", "laporan", "report"],
  },
  {
    name: "Giveaway Bot",
    category: "Giveaway",
    reason: "Ngatur giveaway/undian di server secara otomatis, dari mulai sampai narik pemenang.",
    keywords: ["giveaway", "undian", "hadiah"],
  },
  {
    name: "Statbot",
    category: "Analytics",
    reason: "Statistik aktivitas server (pesan, member aktif, growth) buat pantau perkembangan komunitas.",
    keywords: ["statistik", "analytics", "growth", "aktivitas"],
  },
];

// Bot yang cocok buat hampir semua komunitas, tetep direkomendasikan walau
// gak ada keyword yang match spesifik.
const ALWAYS_RECOMMEND = ["Dyno", "Carl-bot"];

export function recommendBots(description) {
  const text = (description || "").toLowerCase();
  const matched = new Map();

  for (const bot of BOT_CATALOG) {
    const hit = bot.keywords.some((kw) => text.includes(kw));
    if (hit) matched.set(bot.name, bot);
  }

  for (const name of ALWAYS_RECOMMEND) {
    if (!matched.has(name)) {
      const bot = BOT_CATALOG.find((b) => b.name === name);
      if (bot) matched.set(name, bot);
    }
  }

  return [...matched.values()].slice(0, 6).map((bot) => ({
    ...bot,
    link: `https://top.gg/search?q=${encodeURIComponent(bot.name)}`,
  }));
}
