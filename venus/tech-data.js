// 科技美的一份清單：維納斯的桌子（畫在身上）和科技美筆記（排順序）共用
// part：hair/face/skin/shape  kind：yt 科技・養 / xt 科技・修
// when：daily 每天小錢 / regular 定期花費 / once 一次付清・維持幾年 / surgery 一次付清・大手術
// after：正顎後才做；c 花費 1～5、v 美感提升 1～5（畫性價比用）
// pt：在桌子那張人物圖上的位置；names：表格裡對應到這一項的字
const WHEN=[["daily","每天小錢","便宜、天天用"],["regular","定期花費","每隔一段時間回去做"],["once","維持幾年","一次付清，維持一兩年"],["surgery","大手術","一次付清，大筆存錢"]];
const TIER=[["best","最划算","花得少、美感提升多","#8E2B2B"],["save","值得存錢","貴，但提升很多","#C9A24A"],["easy","順手做","便宜，提升普通","#AE8A6A"],["later","先不急","貴，提升普通","#B8A898"]];
function tier(t){if(!t.c)return "later";return t.c<=2?(t.v>=3?"best":"easy"):(t.v>=3?"save":"later");}
const tShort=t=>t.s||t.n;
const STAT=["想做","研究中","預約","做完","回診"];
const TECH=[
 {id:"scalp",n:"頭皮治療",part:"hair",kind:"yt",when:"regular",c:2,v:4,pt:[287,292],cost:"看醫師",
  why:"皮膚科說是基因雄性禿。停藥一段時間了，要先回診重新評估。",
  tip:"台北定方向，桃園顧日常。回診直接說：「我在意身體多毛，所以停了。有沒有外用或其他選擇？」不要自己拿以前的藥量重新開始吃。通常三到六個月才看得出效果。"},
 {id:"perm",n:"燙髮",part:"hair",kind:"xt",when:"regular",c:2,v:5,pt:[334,394],cost:"一次幾千元",
  why:"燙大波浪加頭頂蓬鬆，髮量看起來多一倍，洗完吹乾就有型，不用每天捲。",
  tip:"找很多「細軟髮、髮量少、大波浪」作品的設計師。跟他說你在治療掉髮，藥劑用溫和一點的。第一次先小改。"},
 {id:"lash",n:"種睫毛",part:"face",kind:"xt",when:"regular",c:2,v:3,pt:[272,321],cost:"幾週補一次",
  why:"每天不用夾、不用刷睫毛膏，眼睛直接有神。",tip:"不用動刀，幾週後會自然掉，要定期補。"},
 {id:"brow",n:"霧眉",part:"face",kind:"xt",when:"once",c:2,v:4,pt:[298,312],cost:"六千到一萬，補色另計",
  why:"每天省最多時間的一項，維持一兩年。",tip:"先看店、看作品，挑自然的霧感，不要太黑太方。"},
 {id:"lip",n:"霧唇",part:"face",kind:"xt",when:"once",c:2,v:4,pt:[291,340],cost:"",
  why:"唇色決定氣色，照片和影片裡最明顯。",tip:"正顎會改變嘴型。只做顏色、不改唇形也許可以提早做，先問正顎醫師。"},
 {id:"sun",n:"防曬、A醇",s:"防曬A醇",names:["防曬","A醇"],part:"skin",kind:"yt",when:"daily",c:1,v:4,pt:[309,332],cost:"每月幾百元",
  why:"最便宜的基本功。膠原蛋白不是吃或擦進去的，要刺激皮膚自己長。",tip:"每天防曬；晚上擦 A醇，從低濃度開始。"},
 {id:"skin",n:"皮膚療程",s:"皮膚療程",names:["皮秒","飛梭","水光","電波"],part:"skin",kind:"xt",when:"regular",c:4,v:3,pt:[266,338],cost:"依療程，大多要定期做",
  why:"皮膚好，底妝就可以越薄、越快。目標是水煮蛋肌：表面平滑、顏色均勻、有光澤。",
  tip:"先分清楚最在意哪一種：斑點→皮秒；毛孔、凹凸→飛梭；鬆、沒彈性→音波、電波；乾、暗沉→水光。不要一次買一堆療程。"},
 {id:"pit",n:"腋下除臭",part:"skin",kind:"xt",when:"regular",c:3,v:1,pt:[236,424],cost:"",why:"",tip:"還沒細聊。"},
 {id:"hair-off",n:"除毛",part:"skin",kind:"xt",when:"regular",c:2,v:2,pt:[288,770],cost:"",why:"已經在做。",tip:"如果之後吃治療掉髮的藥，身上多長的毛停藥後大多會退回去，除毛不會白做，只是期間可能要多補幾次。"},
 {id:"lipo",n:"抽脂",nx:1,part:"shape",kind:"xt",when:"surgery",c:5,v:3,pt:[300,548],cost:"先找醫師評估",
  why:"下一個想做的：腹部。",tip:"改變的是脂肪的量，形狀還是要靠運動和體態雕。跟正顎的恢復期錯開。"},
 {id:"jaw",n:"正顎",part:"face",kind:"xt",when:"surgery",c:5,v:5,pt:[308,352],cost:"",
  why:"骨架。臉的結構類的醫美都等它做完。",tip:"如果那時在吃治療掉髮的藥，記得告訴醫師，它會影響血壓。"},
 {id:"aegyo",n:"臥蠶",part:"face",kind:"xt",when:"once",c:3,v:2,after:1,pt:[297,326],cost:"",why:"",tip:"等新臉型穩定再評估。"},
 {id:"liner",n:"眼線",part:"face",kind:"xt",when:"once",c:2,v:2,after:1,pt:[276,318],cost:"",why:"",tip:"等新臉型穩定再評估。"},
 {id:"bags",n:"眼袋、黑眼圈",s:"眼袋",names:["眼袋"],part:"face",kind:"xt",when:"surgery",c:4,v:2,after:1,pt:[270,330],cost:"",why:"",tip:"等新臉型穩定再評估。"},
 {id:"lift",n:"拉皮",part:"face",kind:"xt",when:"surgery",c:5,v:2,after:1,pt:[314,342],cost:"",why:"",tip:"等新臉型穩定再評估。"},
 {id:"teeth",n:"美白牙齒",part:"face",kind:"xt",when:"regular",c:3,v:4,after:1,pt:[290,345],cost:"每一兩年做一次",
  why:"笑起來整個人亮起來，照片裡很明顯。",tip:"正顎前後通常要戴牙套，等牙套拆掉、牙齒排好再美白，不然要重做。"},
 {id:"garden",n:"Desire",part:"skin",kind:"xt",when:"regular",cost:"",why:"只有自己知道的地方。",tip:"想做什麼再寫進來。"},
 {id:"breast",n:"隆乳",part:"shape",kind:"xt",when:"surgery",c:5,v:2,after:1,pt:[322,438],cost:"跟抽脂差不多大筆",why:"美感會提升，但不一定是我要的那種。",tip:"可能吸引不想要的注意，運動、穿衣也可能不方便。抽脂比較不會造成困擾，所以排在抽脂後面。"}
];
const TKEY="origina-tech-v1";
function tLoad(){try{return JSON.parse(localStorage.getItem(TKEY)||"{}")||{}}catch(e){return {}}}
function tSave(o){try{localStorage.setItem(TKEY,JSON.stringify(o))}catch(e){}}
function tByName(w){return TECH.find(t=>t.n===w||(t.names||[]).includes(w));}

// 性價比四象限：橫軸花費、直軸美感提升
function quadSVG(H0){const W=600,H=H0||460,x0=50,x1=W-16,y0=44,y1=H-46,pw=x1-x0,ph=y1-y0,X=c=>x0+(c-.5)/5*pw,Y=v=>y1-(v-.5)/5*ph,mx=X(2.5),my=Y(2.5);
  let g=`<rect x="${x0}" y="${y0}" width="${mx-x0}" height="${my-y0}" fill="#FBEDEA"/><rect x="${mx}" y="${y0}" width="${x1-mx}" height="${my-y0}" fill="#FBF3DF"/><rect x="${x0}" y="${my}" width="${mx-x0}" height="${y1-my}" fill="#F6EFE6"/><rect x="${mx}" y="${my}" width="${x1-mx}" height="${y1-my}" fill="#F1ECE6"/>`;
  [["最划算",x0,y0-12,"#8E2B2B","start"],["值得存錢",x1,y0-12,"#A8842E","end"],["順手做",x0,y1+24,"#8A6E4B","start"],["先不急",x1,y1+24,"#9A8C80","end"]].forEach(([n,x,y,c,an])=>g+=`<text x="${x}" y="${y}" font-size="16" font-weight="700" fill="${c}" text-anchor="${an}" font-family="Songti TC,serif">${n}</text>`);
  g+=`<text x="${(x0+x1)/2}" y="${y1+24}" font-size="12.5" fill="#8A6E4B" text-anchor="middle">花費高 →</text><text x="18" y="${(y0+y1)/2}" font-size="12.5" fill="#8A6E4B" text-anchor="middle" transform="rotate(-90 18 ${(y0+y1)/2})">美感提升多 →</text>`;
  const used={};TECH.filter(t=>t.c).forEach(t=>{const k=t.c+"-"+t.v,n=used[k]=(used[k]||0)+1,y=Y(t.v)-12+(n-1)*19,x=X(t.c)-40;const col=TIER.find(z=>z[0]===tier(t))[3];
    g+=`<g data-qt="${t.id}" style="cursor:pointer"><circle cx="${x}" cy="${y-4.5}" r="4.5" fill="${col}"/><text x="${x+8}" y="${y}" font-size="13.5" fill="#3A2A24">${tShort(t)}${t.after?`<tspan fill="#A0805A" font-size="11">・後</tspan>`:""}</text></g>`;});
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="font-family:PingFang TC,sans-serif;display:block">${g}</svg>`;}

// 性價比排名：美感提升×2－花費，越高越先做
function tRank(){const L=TECH.filter(t=>t.c).slice().sort((a,b)=>(b.v*2-b.c)-(a.v*2-a.c)||b.v-a.v||a.c-b.c);const R={};L.forEach((t,i)=>R[t.id]=i+1);return R;}

// ── 部位排名：氛圍感是由遠到近被看見的 ──
const PRANK=[
 ["pose","體態","十公尺外就看得到你怎麼站、怎麼走",[262,720]],
 ["hair","頭髮","整個人的輪廓，也是臉的畫框",[338,300]],
 ["skin","皮膚","有光澤整個人就亮，底妝也能變薄",[246,418]],
 ["shape","身材","穿搭就能修飾很多",[330,560]],
 ["face","臉","要很近才看得清楚，結構等正顎",[292,326]]
];
// 自然的項目（不花錢或花很少）：kind yn 自然・養 / xn 自然・修
const NAT=[
 {id:"n-braid",n:"編髮",part:"hair",kind:"xn",c:1,v:5,why:"幾乎不花錢，換造型很快。",tip:"運動流汗時編起來就不亂；不想天天洗頭，編髮能遮住髮根出油；蓬鬆一點的編法讓髮量看起來比較多。代價是要花時間練。"},
 {id:"n-cut",n:"剪對髮型",names:["髮型"],part:"hair",kind:"xn",c:2,v:5,why:"剪對了，每天不整理也好看。",tip:"找擅長細軟髮的設計師，剪層次讓頭頂蓬鬆。"},
 {id:"n-hfood",n:"營養、睡眠",names:["營養"],part:"hair",kind:"yn",c:1,v:2,why:"頭髮是從裡面長出來的。",tip:""},
 {id:"n-mk",n:"彩妝",part:"face",kind:"xn",c:1,v:4,why:"每天都能用，技術是自己的。",tip:"現在先練底妝，彩妝等正顎後。"},
 {id:"n-fsleep",n:"睡飽、吃好",names:["睡飽","吃好"],part:"face",kind:"yn",c:1,v:2,why:"",tip:""},
 {id:"n-base",n:"底妝",part:"skin",kind:"xn",c:1,v:3,why:"皮膚看起來乾淨，整個人就亮。",tip:"看底妝筆記・琳琳。"},
 {id:"n-scent",n:"香氛",part:"skin",kind:"xn",c:2,v:4,why:"靠近才聞得到的氛圍感。",tip:"Fuwei 500ml 訂購中，看香氛筆記。"},
 {id:"n-water",n:"喝水、睡眠",names:["喝水"],part:"skin",kind:"yn",c:1,v:2,why:"",tip:""},
 {id:"n-dress",n:"穿搭",part:"shape",kind:"xn",c:2,v:5,why:"不用動身體，就能修飾身形。",tip:"看衣櫥。"},
 {id:"n-train",n:"運動、飲食",names:["運動","飲食"],part:"shape",kind:"yn",c:1,v:4,why:"重訓讓線條出來。",tip:""},
 {id:"n-nail",n:"美甲",part:"shape",kind:"xn",c:2,v:2,why:"",tip:""},
 {id:"n-pila",n:"伸展、皮拉提斯",names:["伸展","皮拉提斯"],part:"pose",kind:"yn",c:2,v:5,why:"體態的根本，你最想堅持到底的事。",tip:"在家瑜伽，明年開始上皮拉提斯。"},
 {id:"n-heel",n:"高跟鞋",part:"pose",kind:"xn",c:2,v:4,why:"走路的樣子會變。",tip:"看 HH。"},
 {id:"n-shapew",n:"修身衣",part:"pose",kind:"xn",c:1,v:2,why:"",tip:""},
 {id:"n-spine",n:"整脊、矯正",names:["整脊","矯正"],part:"pose",kind:"yt",tech:1,c:3,v:3,why:"",tip:""},
 {id:"n-care",n:"護髮",part:"hair",kind:"yt",tech:1,c:2,v:2,why:"",tip:""}
];
const isNat=t=>!!t.kind&&t.kind[1]==="n";
const tScore=t=>t.v*2-t.c;
function partItems(k){return TECH.concat(NAT).filter(t=>t.c&&t.part===k).sort((a,b)=>tScore(b)-tScore(a)||b.v-a.v||a.c-b.c||(isNat(b)-isNat(a)));}
