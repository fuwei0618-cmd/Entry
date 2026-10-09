// Origina 地圖小工具（Scriptable）
// 用法：Scriptable App → 右上角 + → 貼上這整段 → 命名「Origina 地圖」
// 主畫面長按 → 編輯 → 加入小工具 → Scriptable → 選「特大」(iPad) 或「中」→ 長按小工具 → 編輯小工具 → Script 選「Origina 地圖」
// 點地圖上的 App 圖示會直接打開那個 App；點其他地方打開 Origina 地圖頁
const BASE = "https://fuwei0618-cmd.github.io/Entry/map/";
const fm = FileManager.local();
const dir = fm.joinPath(fm.documentsDirectory(), "origina");
if (!fm.fileExists(dir)) fm.createDirectory(dir);

async function load(name, isImage) {
  const path = fm.joinPath(dir, name);
  try {
    const req = new Request(BASE + name + "?t=" + Date.now());
    if (isImage) { const img = await req.loadImage(); fm.writeImage(path, img); return img; }
    const json = await req.loadJSON(); fm.writeString(path, JSON.stringify(json)); return json;
  } catch (e) {
    if (fm.fileExists(path)) return isImage ? fm.readImage(path) : JSON.parse(fm.readString(path));
    throw e;
  }
}

const cfg = await load("widget.json", false);
const img = await load("widget.png", true);

const w = new ListWidget();
w.setPadding(0, 0, 0, 0);
w.backgroundImage = img;
w.url = cfg.home;

const urlAt = {};
for (const c of cfg.cells) urlAt[c.c + "," + c.r] = c.url;

// 把小工具切成 cols × rows 的格子，有 App 的格子就能點
for (let r = 0; r < cfg.rows; r++) {
  const row = w.addStack();
  row.layoutHorizontally();
  for (let c = 0; c < cfg.cols; c++) {
    const cell = row.addStack();
    cell.layoutVertically();
    cell.addSpacer();
    const inner = cell.addStack();
    inner.addSpacer();
    cell.addSpacer();
    const u = urlAt[c + "," + r];
    if (u) cell.url = u;
  }
}

w.refreshAfterDate = new Date(Date.now() + 6 * 3600 * 1000);
if (config.runsInWidget) Script.setWidget(w);
else if (Device.isPad()) await w.presentExtraLarge();
else await w.presentMedium();
Script.complete();
