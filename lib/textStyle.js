// Mapping buat font "small caps" - gak ada blok unicode linear buat ini,
// jadi tabelnya di-hardcode (huruf besar/kecil sumber dianggap sama).
const SMALL_CAPS_MAP = {
  a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ",
  i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ",
  q: "ǫ", r: "ʀ", s: "ꜱ", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x",
  y: "ʏ", z: "ᴢ",
};

// Mathematical Sans-Serif Bold - ini blok unicode resmi jadi bisa dihitung dari offset.
function toBoldSansChar(ch) {
  const code = ch.codePointAt(0);
  if (ch >= "a" && ch <= "z") return String.fromCodePoint(0x1d5ee + (code - 97));
  if (ch >= "A" && ch <= "Z") return String.fromCodePoint(0x1d5d4 + (code - 65));
  if (ch >= "0" && ch <= "9") return String.fromCodePoint(0x1d7ec + (code - 48));
  return ch;
}

export const FONT_STYLES = [
  { id: "normal", label: "Normal", transform: (s) => s },
  {
    id: "smallcaps",
    label: "ꜱᴍᴀʟʟ ᴄᴀᴘꜱ",
    transform: (s) =>
      [...s].map((ch) => SMALL_CAPS_MAP[ch.toLowerCase()] || ch).join(""),
  },
  {
    id: "boldsans",
    label: "𝗕𝗼𝗹𝗱 𝘀𝗮𝗻𝘀",
    transform: (s) => [...s].map(toBoldSansChar).join(""),
  },
];

// Pemisah/hiasan emoji buat nama channel. Fungsi return nama channel yang udah jadi.
// `position` dipakai khusus buat style "tree" (ᴘᴏsɪsɪ pertama/tengah/terakhir di dalam category).
export const CONNECTOR_STYLES = [
  {
    id: "none",
    label: "Tanpa hiasan",
    apply: (name) => name,
  },
  {
    id: "pipe",
    label: "emoji┃nama",
    apply: (name, emoji) => (emoji ? `${emoji}┃${name}` : name),
  },
  {
    id: "bracket",
    label: "「 emoji」 nama",
    apply: (name, emoji) => (emoji ? `「 ${emoji}」 ${name}` : name),
  },
  {
    id: "doublepipe",
    label: "emoji〢nama",
    apply: (name, emoji) => (emoji ? `${emoji}〢${name}` : name),
  },
  {
    id: "dashpipe",
    label: "emoji┆nama",
    apply: (name, emoji) => (emoji ? `${emoji}┆${name}` : name),
  },
  {
    id: "tree",
    label: "Garis (╭・│╰・)",
    apply: (name, emoji, position) => {
      const connector = position === "first" ? "╭・" : position === "last" ? "╰・" : "│";
      return emoji ? `${emoji}${connector}${name}` : `${connector}${name}`;
    },
  },
];

export function getFontStyle(id) {
  return FONT_STYLES.find((f) => f.id === id) || FONT_STYLES[0];
}

export function getConnectorStyle(id) {
  return CONNECTOR_STYLES.find((c) => c.id === id) || CONNECTOR_STYLES[0];
}

// Terapkan font + connector style ke seluruh config (roles, categories, channels).
// Font style kena ke semua nama. Connector style (emoji+garis) cuma kena ke nama channel.
export function applyStyle(config, fontStyleId, connectorStyleId) {
  if (!config) return config;

  const font = getFontStyle(fontStyleId);
  const connector = getConnectorStyle(connectorStyleId);

  const roles = (config.roles || []).map((role) => ({
    ...role,
    name: font.transform(role.name),
  }));

  const categories = (config.categories || []).map((cat) => {
    const channels = cat.channels || [];
    const styledChannels = channels.map((ch, idx) => {
      const position = idx === 0 ? "first" : idx === channels.length - 1 ? "last" : "middle";
      const styledBaseName = font.transform(ch.name);
      return {
        ...ch,
        name: connector.apply(styledBaseName, ch.emoji, position),
      };
    });
    return {
      ...cat,
      name: font.transform(cat.name),
      channels: styledChannels,
    };
  });

  return { roles, categories };
}
