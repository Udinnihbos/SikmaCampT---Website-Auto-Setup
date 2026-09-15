"use client";

import { useState, useMemo } from "react";
import { FONT_STYLES, CONNECTOR_STYLES, applyStyle } from "@/lib/textStyle";
import { recommendBots } from "@/lib/botRecommendations";

const CHANNEL_TYPE_LABEL = {
  text: "#",
  voice: "))",
  announcement: "!",
  forum: "◆",
};

const SETUP_MODES = [
  { id: "basic", label: "Basic", desc: "Channel + role + permission role aja." },
  { id: "full", label: "Full", desc: "+ permission per-channel, slowmode, channel privat otomatis." },
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("basic");
  const [config, setConfig] = useState(null); // config mentah dari AI, gak berubah
  const [fontStyleId, setFontStyleId] = useState("normal");
  const [connectorStyleId, setConnectorStyleId] = useState("none");
  const [token, setToken] = useState(null);
  const [expiresInMinutes, setExpiresInMinutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const styledConfig = useMemo(
    () => applyStyle(config, fontStyleId, connectorStyleId),
    [config, fontStyleId, connectorStyleId]
  );

  const recommendedBots = useMemo(() => (config ? recommendBots(prompt) : []), [config, prompt]);

  async function handleGenerate() {
    setError("");
    setToken(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal generate, coba lagi");
        setConfig(null);
      } else {
        setConfig(data.config);
      }
    } catch {
      setError("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setError("");
    setConfirming(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: styledConfig }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal membuat token");
      } else {
        setToken(data.token);
        setExpiresInMinutes(data.expiresInMinutes);
      }
    } catch {
      setError("Gagal menghubungi server");
    } finally {
      setConfirming(false);
    }
  }

  function handleCopy() {
    if (!token) return;
    navigator.clipboard?.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="wrap">
      <div className="eyebrow">autosetup / blueprint generator</div>
      <h1>Gambar struktur server Discord kamu, biar bot yang bangun.</h1>
      <p className="sub">
        Ceritain server kamu mau kayak gimana. AI bikin rancangan category, channel, dan role-nya.
        Cocok, kamu dapat token — jalankan <code>/autosetup</code> di server Discord kamu untuk eksekusi.
      </p>

      <div className="panel">
        <span className="corner tl" />
        <span className="corner br" />
        <label>Mode setup</label>
        <div className="btn-row" style={{ marginTop: 0, marginBottom: 16 }}>
          {SETUP_MODES.map((m) => (
            <button
              key={m.id}
              className={mode === m.id ? "primary" : "ghost"}
              onClick={() => setMode(m.id)}
              type="button"
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="hint" style={{ marginTop: -8, marginBottom: 18 }}>
          {SETUP_MODES.find((m) => m.id === mode)?.desc}
        </p>

        <label htmlFor="prompt">Deskripsi server</label>
        <textarea
          id="prompt"
          placeholder="Contoh: server komunitas Minecraft survival RPG, ada tim moderator, channel untuk trading, event, dan showcase build pemain."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={2000}
        />
        <div className="btn-row">
          <button className="primary" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
            {loading ? "Menggambar blueprint..." : "Generate blueprint"}
          </button>
          {config && (
            <button className="ghost" onClick={handleGenerate} disabled={loading}>
              Generate ulang
            </button>
          )}
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      {config && (
        <div className="panel">
          <span className="corner tl" />
          <span className="corner br" />
          <p className="section-title">gaya tampilan</p>
          <div style={{ marginBottom: 18 }}>
            <label style={{ marginBottom: 6 }}>Font</label>
            <div className="btn-row" style={{ marginTop: 0 }}>
              {FONT_STYLES.map((f) => (
                <button
                  key={f.id}
                  className={fontStyleId === f.id ? "primary" : "ghost"}
                  onClick={() => setFontStyleId(f.id)}
                  type="button"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ marginBottom: 6 }}>Pemisah emoji channel</label>
            <div className="btn-row" style={{ marginTop: 0 }}>
              {CONNECTOR_STYLES.map((c) => (
                <button
                  key={c.id}
                  className={connectorStyleId === c.id ? "primary" : "ghost"}
                  onClick={() => setConnectorStyleId(c.id)}
                  type="button"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {config && (
        <div className="panel">
          <span className="corner tl" />
          <span className="corner br" />
          <p className="section-title">roles</p>
          <div style={{ marginBottom: 24 }}>
            {(styledConfig.roles || []).map((role, i) => (
              <span className="role-chip" key={i}>
                <span className="role-dot" style={{ background: role.color || "#6fd3f5" }} />
                {role.name}
              </span>
            ))}
            {(!styledConfig.roles || styledConfig.roles.length === 0) && (
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Tidak ada role diusulkan.</span>
            )}
          </div>

          <p className="section-title">categories &amp; channels</p>
          <ul className="tree">
            {(styledConfig.categories || []).map((cat, i) => (
              <li key={i}>
                <div className="cat-name">{cat.name}</div>
                <ul className="chan-list">
                  {(cat.channels || []).map((ch, j) => (
                    <li key={j}>
                      <span className="type">{CHANNEL_TYPE_LABEL[ch.type] || "#"}</span>
                      {ch.name}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {!token && (
            <div className="btn-row">
              <button className="primary" onClick={handleConfirm} disabled={confirming}>
                {confirming ? "Membuat token..." : "Konfirmasi & buat token"}
              </button>
            </div>
          )}
        </div>
      )}

      {config && recommendedBots.length > 0 && (
        <div className="panel">
          <span className="corner tl" />
          <span className="corner br" />
          <p className="section-title">rekomendasi bot buat server ini</p>
          {recommendedBots.map((bot) => (
            <div key={bot.name} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 14 }}>{bot.name}</strong>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cyan-dim)" }}>
                  {bot.category}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 6px" }}>{bot.reason}</p>
              <a
                href={bot.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--cyan)" }}
              >
                Cari di top.gg →
              </a>
            </div>
          ))}
          <p className="hint">
            Rekomendasi berdasarkan deskripsi server kamu, bukan endorsement — cek dulu review & permission
            yang diminta sebelum invite bot manapun ke server.
          </p>
        </div>
      )}

      {token && (
        <div className="panel">
          <span className="corner tl" />
          <span className="corner br" />
          <p className="section-title">token setup ({expiresInMinutes} menit)</p>
          <div className="token-box" onClick={handleCopy} title="Klik untuk copy">
            {token}
          </div>
          <p className="hint">
            {copied ? "Tersalin ✓ — " : ""}Buka Discord, di server tujuan jalankan:
            <br />
            <code>/autosetup token:{token}</code>
            <br />
            Token cuma bisa dipakai sekali dan otomatis hangus setelah {expiresInMinutes} menit.
          </p>
        </div>
      )}
    </main>
  );
}
