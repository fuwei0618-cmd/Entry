/* Origina 雲端同步（OneDrive）
 * 用法：<script src="https://fuwei0618-cmd.github.io/Entry/sync/origina-sync.js" data-app="gym" data-keys="origina.gym.v1"></script>
 *   data-app     檔名用（OneDrive「應用程式/Lucky 手冊」資料夾裡的 origina-<app>.json）
 *   data-keys    要同步的 localStorage 鍵，逗號分隔；結尾加 * 代表前綴（例：clips:*）；/regex/ 也可以
 *   data-role="host"  Origina／地圖頁用：不同步資料，只負責登入與把登入借給裡面打開的 App
 *   data-pos     雲朵按鈕位置：bl（左下，預設）br tl tr；data-offset 離底部距離（px，預設 84）
 * 也可以自己接：OriginaSync.init({app, adapter:{export, import, watch}})
 * 登入共用 Lucky 手冊的 Microsoft 應用程式（同一組 client id、同一個 OneDrive 應用程式資料夾），
 * 在 github.io 上登入一次，所有 App（含 Lucky）都通用。 */
(function () {
  "use strict";
  if (window.OriginaSync) return;
  const CLIENT_ID = "d26c5c92-8b34-4c6b-9e0a-c0abbba0c8dc";
  const AUTH = "https://login.microsoftonline.com/consumers/oauth2/v2.0";
  const SCOPES = "Files.ReadWrite.AppFolder User.Read offline_access openid profile";
  const GRAPH = "https://graph.microsoft.com/v1.0";
  const HUB = "https://fuwei0618-cmd.github.io";
  const ON_HUB = location.origin === HUB;
  // github.io：借 Lucky 已登錄的轉址網址與它的 token；其他網域（如 Vercel 投資）：用自己的網址
  const REDIRECT = ON_HUB ? HUB + "/Lucky/" : location.origin + "/";
  const TOK = ON_HUB ? "lucky-token" : "origina-token";
  const PKCE = ON_HUB ? "lucky-pkce" : "origina-pkce";
  const SILENT = "origina-silent";
  const ALLOWED = [HUB, "https://investment-beige-iota.vercel.app"];

  const ls = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };
  const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const rand = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return b64url(a); };
  const inFrame = (() => { try { return window.top !== window.self; } catch (e) { return true; } })();
  const sameTop = (() => { try { return inFrame && window.top.location.origin === location.origin; } catch (e) { return false; } })();

  /* ---------- 登入 ---------- */
  function saveTok(j) { const old = ls(TOK) || {}; ls(TOK, { access: j.access_token, refresh: j.refresh_token || old.refresh, exp: Date.now() + ((j.expires_in || 3600) - 120) * 1000 }); }
  async function tokenRequest(params) {
    try {
      const r = await fetch(AUTH + "/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: CLIENT_ID, scope: SCOPES, ...params }) });
      if (!r.ok) return null; const j = await r.json(); if (!j.access_token) return null; saveTok(j); return j.access_token;
    } catch (e) { return null; }
  }
  let refreshing = null, parentTok = null;
  function askParent(type) {
    return new Promise(res => {
      if (!inFrame) return res(null);
      const id = rand(6), t = setTimeout(() => { removeEventListener("message", on); res(null); }, 2500);
      function on(e) { if (e.data && e.data.originaSync === "reply" && e.data.id === id) { clearTimeout(t); removeEventListener("message", on); res(e.data.token || null); } }
      addEventListener("message", on);
      window.parent.postMessage({ originaSync: type, id }, "*");
    });
  }
  async function getToken() {
    const t = ls(TOK);
    if (t && t.access && t.exp > Date.now()) return t.access;
    if (t && t.refresh) { if (!refreshing) refreshing = tokenRequest({ grant_type: "refresh_token", refresh_token: t.refresh }).finally(() => { refreshing = null; }); const a = await refreshing; if (a) return a; }
    if (inFrame && !sameTop) { if (parentTok && parentTok.exp > Date.now()) return parentTok.v; const v = await askParent("token"); if (v) { parentTok = { v, exp: Date.now() + 10 * 60e3 }; return v; } }
    return null;
  }
  async function login(silent) {
    if (inFrame && !sameTop) { askParent("login"); return; }
    const win = sameTop ? window.top : window;
    const verifier = rand(48), state = rand(16);
    ls(PKCE, { verifier, state, silent: !!silent });
    ls("origina-return", win.location.href);
    const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
    const q = new URLSearchParams({ client_id: CLIENT_ID, response_type: "code", redirect_uri: REDIRECT, scope: SCOPES, code_challenge: challenge, code_challenge_method: "S256", state, response_mode: "query", prompt: silent ? "none" : "select_account" });
    win.location.assign(AUTH + "/authorize?" + q);
  }
  // 非 github.io 網域：自己處理轉址回來的 code
  async function handleRedirect() {
    if (ON_HUB) return;
    const p = new URLSearchParams(location.search);
    if (!p.has("code") && !p.has("error")) return;
    const st = ls(PKCE) || {}; const back = ls("origina-return");
    history.replaceState(null, "", location.pathname + location.hash);
    if (p.get("state") !== st.state) return;
    ls(PKCE, null); ls("origina-return", null);
    if (!p.has("error")) await tokenRequest({ grant_type: "authorization_code", code: p.get("code"), redirect_uri: REDIRECT, code_verifier: st.verifier });
    if (back && back !== location.href) location.replace(back);
  }
  // 登入過但 token 過期（手機版 Microsoft 規定 24 小時）→ 自動靜默重新登入一次
  async function ensureToken(auto) {
    let tok = await getToken();
    if (tok) return tok;
    const t = ls(TOK);
    if (auto && t && t.refresh && !inFrame && navigator.onLine && Date.now() - (ls(SILENT) || 0) > 10 * 60e3) { ls(SILENT, Date.now()); login(true); return new Promise(() => {}); }
    return null;
  }
  async function gfetch(path, opts = {}) {
    for (let i = 0; i < 2; i++) {
      const tok = await getToken(); if (!tok) throw { code: "auth" };
      const r = await fetch(path.startsWith("http") ? path : GRAPH + path, { ...opts, headers: { ...(opts.headers || {}), Authorization: "Bearer " + tok } });
      if (r.status === 401 && i === 0) { const t = ls(TOK) || {}; t.exp = 0; ls(TOK, t); parentTok = null; continue; }
      return r;
    }
  }
  const enc = p => p.split("/").map(encodeURIComponent).join("/");
  const api = {
    async getJSON(name) { const r = await gfetch("/me/drive/special/approot:/" + enc(name) + ":/content"); if (r.status === 404) return null; if (!r.ok) throw { code: "http", status: r.status }; return r.json(); },
    async putJSON(name, obj) { const r = await gfetch("/me/drive/special/approot:/" + enc(name) + ":/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) }); if (!r.ok) throw { code: "http", status: r.status }; return r.json(); },
    async getBlob(name) { const r = await gfetch("/me/drive/special/approot:/" + enc(name) + ":/content"); if (!r.ok) return null; return r.blob(); },
    async exists(name) { const r = await gfetch("/me/drive/special/approot:/" + enc(name)); return r.ok; },
    async putBlob(name, blob) {
      const path = "/me/drive/special/approot:/" + enc(name);
      if (blob.size < 3.9 * 1024 * 1024) { const r = await gfetch(path + ":/content", { method: "PUT", headers: { "Content-Type": blob.type || "application/octet-stream" }, body: blob }); if (!r.ok) throw { code: "http", status: r.status }; return; }
      const s = await gfetch(path + ":/createUploadSession", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item: { "@microsoft.graph.conflictBehavior": "replace" } }) });
      if (!s.ok) throw { code: "http", status: s.status };
      const { uploadUrl } = await s.json(), CH = 320 * 1024 * 10;
      for (let o = 0; o < blob.size; o += CH) {
        const end = Math.min(o + CH, blob.size);
        const r = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Range": `bytes ${o}-${end - 1}/${blob.size}` }, body: blob.slice(o, end) });
        if (!r.ok && r.status !== 202) throw { code: "http", status: r.status };
      }
    }
  };

  /* ---------- 雲朵按鈕 ---------- */
  let badge, txt, hideT;
  function ui(pos, offset) {
    const css = document.createElement("style");
    css.textContent = `.osync{position:fixed;z-index:2147483000;display:flex;align-items:center;gap:6px;height:34px;padding:0 10px;border:0;border-radius:999px;background:rgba(43,39,36,.82);color:#F4EFE7;font:600 12px/1 -apple-system,"PingFang TC","Noto Sans TC",sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.18);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:opacity .3s}
.osync svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8}.osync i{width:7px;height:7px;border-radius:50%;background:#9AA59A}.osync[data-s=ok] i{background:#8FD18F}.osync[data-s=busy] i{background:#F2C14E}.osync[data-s=err] i,.osync[data-s=out] i{background:#E8806B}.osync.quiet span{display:none}.osync.quiet{padding:0 8px;opacity:.75}`;
    document.head.appendChild(css);
    badge = document.createElement("button"); badge.type = "button"; badge.className = "osync"; badge.setAttribute("aria-label", "OneDrive 同步");
    badge.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 18h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.6A3.3 3.3 0 0 0 7 18z"/></svg><i></i><span></span>';
    txt = badge.querySelector("span");
    const v = pos[0] === "t" ? "top" : "bottom", h = pos[1] === "r" ? "right" : "left";
    badge.style[v] = `calc(${offset}px + env(safe-area-inset-${v},0px))`; badge.style[h] = "12px";
    document.body.appendChild(badge);
  }
  function show(state, text, quietAfter) {
    if (!badge) return; badge.dataset.s = state; txt.textContent = text; badge.classList.remove("quiet");
    clearTimeout(hideT); if (quietAfter) hideT = setTimeout(() => badge.classList.add("quiet"), quietAfter);
  }

  /* ---------- 同步 ---------- */
  function keyMatcher(spec) {
    const parts = (spec || "").split(",").map(s => s.trim()).filter(Boolean).map(s => {
      if (s.startsWith("/") && s.endsWith("/")) { const re = new RegExp(s.slice(1, -1)); return k => re.test(k); }
      if (s.endsWith("*")) { const p = s.slice(0, -1); return k => k.startsWith(p); }
      return k => k === s;
    });
    return k => parts.some(f => f(k));
  }
  function localAdapter(spec) {
    const match = keyMatcher(spec);
    const keys = () => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (match(k)) out.push(k); } return out; };
    return {
      export() { const o = {}; keys().forEach(k => o[k] = localStorage.getItem(k)); return o; },
      import(o) { let changed = false; keys().forEach(k => { if (!(k in o)) { localStorage.removeItem(k); changed = true; } }); Object.keys(o).forEach(k => { if (match(k) && localStorage.getItem(k) !== o[k]) { _set.call(localStorage, k, o[k]); changed = true; } }); return changed ? "reload" : false; },
      watch(cb) { watchers.push(k => { if (match(k)) cb(); }); }
    };
  }
  const watchers = [];
  const _set = Storage.prototype.setItem, _rm = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (k, v) { const old = this === localStorage ? localStorage.getItem(k) : null; _set.call(this, k, v); if (this === localStorage && old !== String(v)) watchers.forEach(f => f(k)); };
  Storage.prototype.removeItem = function (k) { _rm.call(this, k); if (this === localStorage) watchers.forEach(f => f(k)); };

  let cfg = null, timer = null, pushing = false;
  const metaKey = () => "origina-sync-meta:" + cfg.app;
  const fileName = () => "origina-" + cfg.app + ".json";
  async function pull() {
    const meta = ls(metaKey()) || {};
    const remote = await api.getJSON(fileName());
    if (!remote) { if (!meta.pushedOnce) { await push(true); } return; }
    if ((remote.updatedAt || 0) <= (meta.at || 0)) return;
    if (meta.dirty && meta.at && (meta.localAt || 0) > remote.updatedAt) { await push(true); return; }
    const r = await cfg.adapter.import(remote.data || {}, api);
    ls(metaKey(), { ...meta, at: remote.updatedAt, dirty: false, pushedOnce: true });
    if (r === "reload" && !sessionStorage.getItem("osync-reloaded")) { sessionStorage.setItem("osync-reloaded", "1"); location.reload(); }
  }
  async function push(force) {
    const meta = ls(metaKey()) || {};
    if (!force && !meta.dirty) return;
    if (pushing) { schedule(); return; }
    pushing = true; show("busy", "同步中…");
    try {
      const now = Date.now();
      const data = await cfg.adapter.export(api);
      await api.putJSON(fileName(), { app: cfg.app, updatedAt: now, data });
      const m = ls(metaKey()) || {}; ls(metaKey(), { ...m, at: now, dirty: (m.localAt || 0) > now, pushedOnce: true });
      show("ok", "已同步", 1800);
    } catch (e) { show(e && e.code === "auth" ? "out" : "err", e && e.code === "auth" ? "登入 OneDrive" : "同步失敗，點一下重試"); }
    finally { pushing = false; }
  }
  let ready = false;
  function schedule() { if (!ready) return; clearTimeout(timer); timer = setTimeout(() => push(), 1500); }
  function markDirty() { const m = ls(metaKey()) || {}; ls(metaKey(), { ...m, dirty: true, localAt: Date.now() }); if (ready) { show("busy", "待同步", 0); schedule(); } }
  async function syncNow() {
    show("busy", "同步中…");
    try { await pull(); ready = true; await push(); show("ok", "已同步", 1800); }
    catch (e) { show(e && e.code === "auth" ? "out" : "err", e && e.code === "auth" ? "登入 OneDrive" : "同步失敗，點一下重試"); }
  }

  async function start() {
    await handleRedirect();
    const s = document.currentScript || document.querySelector('script[src*="origina-sync.js"]');
    const d = (window.__originaSyncScript || s || {}).dataset || {};
    if (!cfg && d.app) cfg = { app: d.app, adapter: localAdapter(d.keys), pos: d.pos, offset: d.offset };
    if (d.role === "host") return host();
    if (!cfg) return;
    if (!badge) ui(cfg.pos || "bl", +(cfg.offset || 84));
    badge.onclick = async () => { if (!(await getToken())) login(false); else syncNow(); };
    cfg.adapter.watch && cfg.adapter.watch(markDirty);
    const tok = await ensureToken(true);
    if (!tok) { show("out", "登入 OneDrive 同步", 5000); return; }
    await syncNow();
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") syncNow(); else push(); });
    setTimeout(() => sessionStorage.removeItem("osync-reloaded"), 5000);
  }
  // 主機（Origina／地圖頁）：維持登入、借 token 給 iframe 裡別的網域的 App
  async function host() {
    addEventListener("message", async e => {
      if (!e.data || !e.data.originaSync || e.data.originaSync === "reply" || !ALLOWED.includes(e.origin)) return;
      if (e.data.originaSync === "token") e.source.postMessage({ originaSync: "reply", id: e.data.id, token: await getToken() }, e.origin);
      if (e.data.originaSync === "login") login(false);
    });
    await ensureToken(true);
  }
  window.OriginaSync = {
    init(o) { cfg = { pos: "bl", offset: 84, ...o }; if (document.readyState !== "loading") start(); },
    api, getToken, login, syncNow, markDirty, onStorage: f => watchers.push(f)
  };
  window.__originaSyncScript = document.currentScript;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else setTimeout(start, 0);
})();
