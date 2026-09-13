# Autosetup Web

Website AI generator buat bagian pertama dari project autosetup bot: user deskripsiin server Discord yang diinginkan, Gemini generate rancangan (roles + categories + channels) dalam JSON, user konfirmasi, lalu website ngasih **token** sekali-pakai. Token itu nanti dipakai bot Discord lewat command `/autosetup <token>`.

## Alur

```
User → isi deskripsi → POST /api/generate → Gemini balikin JSON struktur
User → preview blueprint → klik konfirmasi → POST /api/setup → simpan config di Redis (TTL 30 menit) → dapat token
Bot Discord → /autosetup <token> → GET /api/setup/<token> → ambil config (sekali pakai, langsung dihapus) → bot eksekusi ke server
```

## Setup lokal

```bash
npm install
cp .env.example .env.local
# isi GEMINI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, AUTOSETUP_BOT_SECRET
npm run dev
```

## Setup Env

```
# Gemini API key - ambil di https://aistudio.google.com/apikey
GEMINI_API_KEY=

# Upstash Redis - buat database gratis di https://upstash.com (pilih Redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Secret bersama antara web ini dan bot Discord.
# Isi bebas (string acak panjang), harus SAMA PERSIS di env bot nanti.
AUTOSETUP_BOT_SECRET=
```

Buka http://localhost:3000

### Dapetin API keys

- **Gemini API key**: https://aistudio.google.com/apikey — gratis, tinggal login akun Google.
- **Upstash Redis**: https://upstash.com — bikin database Redis gratis (dipakai buat nyimpen config sementara pakai token, otomatis expired). Setelah dibuat, copy `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` dari dashboard.
- **AUTOSETUP_BOT_SECRET**: bebas isi string acak (misal generate lewat `openssl rand -hex 32`). Ini buat mastiin cuma bot kamu yang bisa nge-fetch config dari endpoint token, bukan sekadar nebak token orang.

## Deploy ke Vercel

1. Push folder ini ke repo GitHub.
2. Import project di https://vercel.com/new.
3. Di tab **Environment Variables**, masukin 4 variabel yang sama kayak `.env.example`.
4. Deploy. Vercel otomatis detect Next.js.

Setelah deploy, endpoint yang dipakai bot adalah:

```
GET https://<domain-vercel-kamu>/api/setup/<token>
Header: x-bot-secret: <AUTOSETUP_BOT_SECRET yang sama>
```

## Struktur JSON yang dihasilkan AI

```json
{
  "roles": [
    { "name": "Moderator", "color": "#5865F2", "hoist": true, "mentionable": true, "permissions": ["ManageChannels", "KickMembers"] }
  ],
  "categories": [
    {
      "name": "GENERAL",
      "channels": [
        { "name": "welcome", "type": "text", "topic": "Selamat datang di server!" },
        { "name": "Voice Santai", "type": "voice", "topic": "" }
      ]
    }
  ]
}
```

Ini schema yang sama yang bakal dipakai bot Discord nanti buat baca dan eksekusi setup — jadi kalau lo mau custom field tambahan, ubah di `lib/prompt.js` (system prompt + validator) biar konsisten dua sisi.

## Catatan keamanan

- Token cuma valid 30 menit dan otomatis hangus sekali dipakai (dihapus dari Redis setelah bot fetch).
- Endpoint `/api/setup/<token>` butuh header `x-bot-secret` yang cocok — jadi walau token bocor/ketebak, tanpa secret ini tetap ditolak.
- Belum ada rate-limiting di `/api/generate` — kalau nanti dipublish luas, tambahin rate limit (misal per-IP) biar kuota Gemini gak jebol.
