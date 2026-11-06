// 科技美的一份清單：維納斯的桌子（畫在身上）和科技美筆記（排順序）共用
// part：hair/face/skin/shape  kind：yt 科技・養 / xt 科技・修
// when：now 現在 / next 下一個 / ojaw 正顎 / after 正顎後
// pt：在桌子那張人物圖上的位置；names：表格裡對應到這一項的字
const WHEN=[["now","現在","每天、費用低"],["next","下一個","腹部抽脂"],["ojaw","正顎","骨架"],["after","正顎後","新臉型穩定再評估"]];
const STAT=["想做","研究中","預約","做完","回診"];
const TECH=[
 {id:"scalp",n:"頭皮治療",part:"hair",kind:"yt",when:"now",pt:[287,292],cost:"看醫師",
  why:"皮膚科說是基因雄性禿。停藥一段時間了，要先回診重新評估。",
  tip:"台北定方向，桃園顧日常。回診直接說：「我在意身體多毛，所以停了。有沒有外用或其他選擇？」不要自己拿以前的藥量重新開始吃。通常三到六個月才看得出效果。"},
 {id:"perm",n:"燙髮",part:"hair",kind:"xt",when:"now",pt:[334,394],cost:"一次幾千元",
  why:"燙大波浪加頭頂蓬鬆，髮量看起來多一倍，洗完吹乾就有型，不用每天捲。",
  tip:"找很多「細軟髮、髮量少、大波浪」作品的設計師。跟他說你在治療掉髮，藥劑用溫和一點的。第一次先小改。"},
 {id:"lash",n:"種睫毛",part:"face",kind:"xt",when:"now",pt:[272,321],cost:"幾週補一次",
  why:"每天不用夾、不用刷睫毛膏，眼睛直接有神。",tip:"不用動刀，幾週後會自然掉，要定期補。"},
 {id:"brow",n:"霧眉",part:"face",kind:"xt",when:"now",pt:[298,312],cost:"六千到一萬，補色另計",
  why:"每天省最多時間的一項，維持一兩年。",tip:"先看店、看作品，挑自然的霧感，不要太黑太方。"},
 {id:"lip",n:"霧唇",part:"face",kind:"xt",when:"now",pt:[291,340],cost:"",
  why:"唇色決定氣色，照片和影片裡最明顯。",tip:"正顎會改變嘴型。只做顏色、不改唇形也許可以提早做，先問正顎醫師。"},
 {id:"sun",n:"防曬、A醇",names:["防曬","A醇"],part:"skin",kind:"yt",when:"now",pt:[309,332],cost:"每月幾百元",
  why:"最便宜的基本功。膠原蛋白不是吃或擦進去的，要刺激皮膚自己長。",tip:"每天防曬；晚上擦 A醇，從低濃度開始。"},
 {id:"skin",n:"皮膚療程",names:["皮秒","飛梭","水光","電波"],part:"skin",kind:"xt",when:"now",pt:[266,338],cost:"依療程，大多要定期做",
  why:"皮膚好，底妝就可以越薄、越快。目標是水煮蛋肌：表面平滑、顏色均勻、有光澤。",
  tip:"先分清楚最在意哪一種：斑點→皮秒；毛孔、凹凸→飛梭；鬆、沒彈性→音波、電波；乾、暗沉→水光。不要一次買一堆療程。"},
 {id:"pit",n:"腋下除臭",part:"skin",kind:"xt",when:"now",pt:[236,424],cost:"",why:"",tip:"還沒細聊。"},
 {id:"hair-off",n:"除毛",part:"skin",kind:"xt",when:"now",pt:[288,770],cost:"",why:"已經在做。",tip:"如果之後吃治療掉髮的藥，身上多長的毛停藥後大多會退回去，除毛不會白做，只是期間可能要多補幾次。"},
 {id:"lipo",n:"抽脂",part:"shape",kind:"xt",when:"next",pt:[300,548],cost:"先找醫師評估",
  why:"下一個想做的：腹部。",tip:"改變的是脂肪的量，形狀還是要靠運動和體態雕。跟正顎的恢復期錯開。"},
 {id:"jaw",n:"正顎",part:"face",kind:"xt",when:"ojaw",pt:[308,352],cost:"",
  why:"骨架。臉的結構類的醫美都等它做完。",tip:"如果那時在吃治療掉髮的藥，記得告訴醫師，它會影響血壓。"},
 {id:"aegyo",n:"臥蠶",part:"face",kind:"xt",when:"after",pt:[297,326],cost:"",why:"",tip:"等新臉型穩定再評估。"},
 {id:"liner",n:"眼線",part:"face",kind:"xt",when:"after",pt:[276,318],cost:"",why:"",tip:"等新臉型穩定再評估。"},
 {id:"bags",n:"眼袋、黑眼圈",names:["眼袋"],part:"face",kind:"xt",when:"after",pt:[270,330],cost:"",why:"",tip:"等新臉型穩定再評估。"},
 {id:"lift",n:"拉皮",part:"face",kind:"xt",when:"after",pt:[314,342],cost:"",why:"",tip:"等新臉型穩定再評估。"},
 {id:"breast",n:"隆乳",part:"shape",kind:"xt",when:"after",pt:[322,438],cost:"",why:"",tip:"還沒細聊。"}
];
const TKEY="origina-tech-v1";
function tLoad(){try{return JSON.parse(localStorage.getItem(TKEY)||"{}")||{}}catch(e){return {}}}
function tSave(o){try{localStorage.setItem(TKEY,JSON.stringify(o))}catch(e){}}
function tByName(w){return TECH.find(t=>t.n===w||(t.names||[]).includes(w));}
