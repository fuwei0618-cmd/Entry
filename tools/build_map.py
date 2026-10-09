# 產生 map/index.html：從 Origina 地圖擷取（tools/extract_map.js 輸出 mapdata.json），做成可單獨加到主畫面的「地圖」頁
import json,re,sys,html
root=sys.argv[1] if len(sys.argv)>1 else '.'
data=json.load(open(sys.argv[2]))
src=open(f'{root}/index.html',encoding='utf8').read()
apps=json.loads(re.search(r'const APPS=(\[.*?\]);\n',src,re.S).group(1))
css=re.search(r'/\* overlays: map \+ in-app viewer \*/(.*?)@media \(prefers-reduced-motion',src,re.S).group(1)
body=data['html']
appmap={n:u for n,u,_ in apps}
grid=''.join(f'<button class="ga" data-app="{html.escape(n)}"><i>{svg}</i><span>{html.escape(n)}</span></button>' for n,u,svg in apps)
page=f'''<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#FFF8EC">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Origina 地圖">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="apple-touch-icon.png">
<title>Origina 地圖</title>
<script src="../sync/origina-sync.js" data-role="host"></script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500;700&display=swap">
<style>
:root{{--paper:#FFF8EC;--ink:#3E2E24;--muted:#7A6555;--accent:#D9583F;--f:"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;color-scheme:light}}
html,body{{margin:0;background:var(--paper);color:var(--ink);font-family:var(--f);-webkit-user-select:none;user-select:none}}
button{{font:inherit;color:inherit;cursor:pointer}}
.btn{{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;border-radius:12px;border:0;font-weight:700;font-size:14px;text-decoration:none}}
.btn.light{{background:#EFE3D0;color:var(--ink)}}
#home{{min-height:100vh;display:flex;flex-direction:column}}
{css}
.mlab{{text-decoration:none}}
.ga{{border:0;background:none;display:grid;justify-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--ink);padding:4px 0}}
.ga i{{width:min(72px,17vw);aspect-ratio:1;border-radius:24%;background:#ECE8E1;display:grid;place-items:center;box-shadow:0 2px 6px rgba(62,46,36,.14)}}
.ga svg{{width:62%;height:62%;fill:#2B2724}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:14px 8px;background:#F6EBDA;border-radius:16px;padding:16px 10px}}
.sec{{margin:6px 0 -4px;font-size:13px;letter-spacing:.14em;color:var(--muted);font-weight:700}}
</style></head><body>
<div id="home">
<div class="ovbar"><h2>Origina 地圖</h2><span style="display:flex;gap:8px"><a class="btn light" href="https://claude.ai/artifact/6tKf8aWatDsrMuhC2wVAhm" target="_blank" rel="noopener">總表 ↗</a><a class="btn light" href="../">進入 Origina</a></span></div>
<div class="ovbody"><div class="mwrap"><div class="mnote">點 App 圖示直接打開 · 點地名進入 Origina 那個空間</div>
{body}
<div class="sec">全部 App</div><div class="grid">{grid}</div>
</div></div></div>
<div id="appView" class="ov" hidden></div>
<script>
const APPS={json.dumps(appmap,ensure_ascii=False)};
const appV=document.getElementById('appView'),home=document.getElementById('home');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}})[c]);
function openApp(n){{const u=APPS[n];if(!u)return;
  appV.innerHTML=`<div class="ovbar"><button class="btn light" id="appBack">✕ 回到地圖</button><h2>${{esc(n)}}</h2><a class="btn light" href="${{u}}" target="_blank" rel="noopener" aria-label="在新分頁開啟">↗</a></div><iframe src="${{u}}" title="${{esc(n)}}" allow="clipboard-write; fullscreen"></iframe>`;
  appV.hidden=false;home.style.display='none';document.getElementById('appBack').onclick=closeApp;history.pushState({{app:n}},'','?app='+encodeURIComponent(n));}}
function closeApp(){{appV.hidden=true;appV.innerHTML='';home.style.display='';history.replaceState(null,'',location.pathname);}}
{{const a=new URLSearchParams(location.search).get('app');if(a&&APPS[a])setTimeout(()=>openApp(a),0);}}
addEventListener('popstate',()=>{{if(!appV.hidden)closeApp();}});
document.querySelectorAll('[data-app]').forEach(b=>b.addEventListener('click',()=>openApp(b.dataset.app)));
document.querySelectorAll('[data-g]').forEach(b=>b.addEventListener('click',()=>{{location.href='../?go='+encodeURIComponent(b.dataset.g);}}));
</script></body></html>'''
open(f'{root}/map/index.html','w',encoding='utf8').write(page)
json.dump({"name":"Origina 地圖","short_name":"Origina 地圖","start_url":"./","scope":"./","display":"standalone","background_color":"#FFF8EC","theme_color":"#FFF8EC","icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"}]},open(f'{root}/map/manifest.webmanifest','w'),ensure_ascii=False,indent=1)
print('ok',len(page))
