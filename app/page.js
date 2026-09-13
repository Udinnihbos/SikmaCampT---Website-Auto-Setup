"use client";

import { useState } from "react";

const CHANNEL_TYPE_LABEL = {
  text: "#",
  voice: "))",
  announcement: "!",
  forum: "◆",
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [config, setConfig] = useState(null);
  const [token, setToken] = useState(null);
  const [expiresInMinutes, setExpiresInMinutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setError("");
    setToken(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
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
        body: JSON.stringify({ config }),
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
          <p className="section-title">roles</p>
          <div style={{ marginBottom: 24 }}>
            {(config.roles || []).map((role, i) => (
              <span className="role-chip" key={i}>
                <span className="role-dot" style={{ background: role.color || "#6fd3f5" }} />
                {role.name}
              </span>
            ))}
            {(!config.roles || config.roles.length === 0) && (
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Tidak ada role diusulkan.</span>
            )}
          </div>

          <p className="section-title">categories &amp; channels</p>
          <ul className="tree">
            {(config.categories || []).map((cat, i) => (
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
