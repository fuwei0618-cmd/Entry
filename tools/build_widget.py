# 產生 iPad 主畫面小工具用的地圖圖片 map/widget.html（再用 playwright 截成 map/widget.png）與點擊格 map/widget.json
import json,re,sys,html
root,mapdata=sys.argv[1],sys.argv[2]
d=json.load(open(mapdata))['html']
src=open(f'{root}/index.html',encoding='utf8').read()
apps={n:(u,svg) for n,u,svg in json.loads(re.search(r'const APPS=(\[.*?\]);\n',src,re.S).group(1))}
main=d.split('<div class="insets">')[0]
bg=re.search(r'<svg viewBox="-30.*?</svg>',main,re.S).group(0).replace('preserveAspectRatio="none"','preserveAspectRatio="none" width="1575" height="1000"')
W,H,C,R=2100,1000,8,4;cw,ch=W/C,H/R
spots=[(m.group(3),float(m.group(1)),float(m.group(2)),re.findall(r'data-app="([^"]+)"',m.group(4))) for m in re.finditer(r'<div class="mspot[^"]*" style="left:([\d.]+)%;top:([\d.]+)%">.*?data-g="[^"]+">([^<]+)</button>(.*?)</div>',main,re.S)]
cells={}
def place(name,c,r):
  order=sorted([(abs(cc-c)+abs(rr-r)*1.2,cc,rr) for cc in range(6) for rr in range(R)])
  for _,cc,rr in order:
    if (cc,rr) not in cells:cells[(cc,rr)]=name;return
for n,l,t,al in sorted(spots,key=lambda s:s[0]!='健身房'):
  x,y=l/100*1575,t/100*1000;c,r=x/cw-.5,y/ch-.5
  if len(al)==3:  # 金庫三個並排
    for i,a in enumerate(al):place(a,round(c)-1+i,round(r))
  else:
    for a in al:place(a,c,r)
side={(6,0):'合唱團',(7,0):'Vocal',(6,1):'Podcast',(6,3):'Origina',(7,3):'總表'}
cells.update(side)
EXTRA={'Origina':('https://fuwei0618-cmd.github.io/Entry/',open(f'{root}/tools/home.svg').read()),
       '總表':('https://claude.ai/artifact/6tKf8aWatDsrMuhC2wVAhm','<svg viewBox="0 0 100 100"><g fill="none" stroke="#2B2724" stroke-width="6" stroke-linecap="round"><rect x="20" y="16" width="60" height="68" rx="6"/><path d="M32 36h36M32 50h36M32 64h22"/></g></svg>')}
labels=''.join(f'<span class="pl" style="left:{l/100*1575:.0f}px;top:{t/100*1000:.0f}px">{html.escape(n)}</span>' for n,l,t,al in spots if not al and n in('森林入口','記錄之河','營火','螢火蟲','金庫','玄關'))
tiles='';out=[]
for (c,r),n in sorted(cells.items()):
  u,svg=apps.get(n) or EXTRA[n]
  tiles+=f'<div class="t" style="left:{c*cw:.1f}px;top:{r*ch:.1f}px;width:{cw:.1f}px;height:{ch:.1f}px"><i>{svg}</i><b>{html.escape(n)}</b></div>'
  out.append(dict(c=c,r=r,name=n,url=u))
page=f'''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@700&display=swap"><style>
body{{margin:0;width:{W}px;height:{H}px;position:relative;overflow:hidden;font-family:"Noto Sans TC",sans-serif;background:#A8C18D}}
.map{{position:absolute;left:0;top:0;width:1575px;height:1000px}}
.side{{position:absolute;left:1575px;top:0;width:525px;height:1000px;background:#2A2420}}
.side svg.st{{position:absolute;left:0;top:560px;width:525px;height:250px}}
.side h3{{position:absolute;left:0;right:0;top:500px;margin:0;text-align:center;color:#E8DCC8;font-size:30px;letter-spacing:.2em}}
.pl{{position:absolute;transform:translate(-50%,-50%);background:rgba(255,248,236,.9);color:#3E2E24;font-size:26px;padding:6px 14px;border-radius:99px;white-space:nowrap}}
.t{{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}}
.t i{{width:150px;height:150px;border-radius:36px;background:#ECE8E1;display:grid;place-items:center;box-shadow:0 4px 14px rgba(0,0,0,.25)}}
.t svg{{width:100px;height:100px;fill:#2B2724}}
.t b{{font-size:26px;color:#3E2E24;background:rgba(255,248,236,.92);padding:3px 14px;border-radius:99px}}
</style></head><body><div class="map">{bg}</div>{labels}
<div class="side"><svg class="st" viewBox="0 0 160 76"><path d="M20 70 A60 60 0 0 1 140 70 Z" fill="#B8936D"/></svg><h3>舞台</h3></div>{tiles}</body></html>'''
open(f'{root}/map/widget.html','w',encoding='utf8').write(page)
json.dump(dict(cols=C,rows=R,cells=out,home='https://fuwei0618-cmd.github.io/Entry/map/'),open(f'{root}/map/widget.json','w'),ensure_ascii=False,indent=1)
print(sorted(cells.items()))
