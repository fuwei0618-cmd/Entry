const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1180,height:820}});
await p.goto('file:///home/claude/entry/index.html');await p.waitForTimeout(2500);await p.click('#menuBtn');await p.waitForTimeout(600);
await p.screenshot({path:process.argv[2]+'/o.png'});
const r=await p.evaluate(()=>{const w=document.querySelector('#mapView .mwrap').cloneNode(true);w.querySelectorAll('.here,.inset h3 em').forEach(e=>e.remove());w.querySelector('.mnote')?.remove();return {html:w.innerHTML};});
require('fs').writeFileSync(process.argv[2]+'/mapdata.json',JSON.stringify(r));await b.close();})();
