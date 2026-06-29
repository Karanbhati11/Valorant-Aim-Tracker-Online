"use strict";(()=>{var e={};e.id=9060,e.ids=[9060],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},29327:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>u,patchFetch:()=>m,requestAsyncStorage:()=>d,routeModule:()=>p,serverHooks:()=>y,staticGenerationAsyncStorage:()=>h});var a={};r.r(a),r.d(a,{GET:()=>g});var o=r(49303),i=r(88716),n=r(60670),s=r(87070);let l=require("sharp");var c=r.n(l);let f={bgDark:"#0f1217",bgPanel:"#141923",primary:"#ff4655",accent:"#00f3ff",textMain:"#ffffff",textMuted:"#8b9bb4"};function x(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}async function g(e){try{let t;let r=new URL(e.url),a=r.searchParams.get("score"),o=r.searchParams.get("accuracy"),i=r.searchParams.get("exerciseName"),n=r.searchParams.get("playerName"),l=r.searchParams.get("leaderboardPosition");if(!a||!o||!i||!n)return s.NextResponse.json({error:"Missing required parameters: score, accuracy, exerciseName, playerName"},{status:400});let g=Number(a),p=Number(o);if(isNaN(g)||isNaN(p))return s.NextResponse.json({error:"score and accuracy must be valid numbers"},{status:400});if(l){let e=Number(l);!isNaN(e)&&e>=1&&e<=10&&(t=e)}let d=Math.round(g).toString(),h=Math.min(100,Math.max(0,p)).toFixed(1),y=function(e){let{score:t,accuracy:r,exerciseName:a,playerName:o,leaderboardPosition:i}=e,n=null!=i&&i>=1&&i<=10?`
    <g>
      <rect x="830" y="360" width="280" height="100" rx="8" fill="${f.bgPanel}" stroke="${f.accent}" stroke-width="2"/>
      <text x="970" y="400" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="14" font-weight="700" fill="${f.accent}" letter-spacing="2">#${i} ON LEADERBOARD</text>
      <text x="970" y="440" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="28" font-weight="800" fill="${f.textMain}">TOP ${i}</text>
    </g>`:"";return`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${f.bgDark};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#1a1f2e;stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${f.primary};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${f.accent};stop-opacity:0.6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Top accent line -->
  <rect x="0" y="0" width="1200" height="4" fill="url(#accentLine)"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="6" height="630" fill="${f.primary}" opacity="0.8"/>

  <!-- Subtle grid pattern for depth -->
  <g opacity="0.03">
    ${Array.from({length:20},(e,t)=>`<line x1="${60*t}" y1="0" x2="${60*t}" y2="630" stroke="${f.textMain}" stroke-width="1"/>`).join("")}
    ${Array.from({length:11},(e,t)=>`<line x1="0" y1="${63*t}" x2="1200" y2="${63*t}" stroke="${f.textMain}" stroke-width="1"/>`).join("")}
  </g>

  <!-- Brand header -->
  <text x="80" y="80" font-family="Segoe UI, Roboto, sans-serif" font-size="28" font-weight="800" fill="${f.textMain}" letter-spacing="3">AIMTRAINER<tspan fill="${f.primary}">PRO</tspan></text>
  <text x="80" y="108" font-family="Segoe UI, Roboto, sans-serif" font-size="12" font-weight="600" fill="${f.textMuted}" letter-spacing="2">TRAINING RESULTS</text>

  <!-- Exercise name -->
  <text x="80" y="175" font-family="Segoe UI, Roboto, sans-serif" font-size="20" font-weight="600" fill="${f.textMuted}" letter-spacing="1">${x(a.toUpperCase())}</text>

  <!-- Player name -->
  <text x="80" y="220" font-family="Segoe UI, Roboto, sans-serif" font-size="36" font-weight="800" fill="${f.textMain}">${x(o)}</text>

  <!-- Divider line -->
  <line x1="80" y1="250" x2="500" y2="250" stroke="${f.primary}" stroke-width="2" opacity="0.6"/>

  <!-- Score card -->
  <g>
    <rect x="80" y="280" width="320" height="140" rx="8" fill="${f.bgPanel}" stroke="${f.primary}" stroke-width="2"/>
    <text x="240" y="320" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="14" font-weight="700" fill="${f.textMuted}" letter-spacing="2">SCORE</text>
    <text x="240" y="390" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="64" font-weight="900" fill="${f.primary}">${x(t)}</text>
  </g>

  <!-- Accuracy card -->
  <g>
    <rect x="440" y="280" width="320" height="140" rx="8" fill="${f.bgPanel}" stroke="${f.accent}" stroke-width="1"/>
    <text x="600" y="320" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="14" font-weight="700" fill="${f.textMuted}" letter-spacing="2">ACCURACY</text>
    <text x="600" y="390" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="64" font-weight="900" fill="${f.accent}">${x(r)}%</text>
  </g>

  ${n}

  <!-- Footer -->
  <line x1="80" y1="530" x2="1120" y2="530" stroke="${f.textMuted}" stroke-width="1" opacity="0.2"/>
  <text x="80" y="575" font-family="Segoe UI, Roboto, sans-serif" font-size="14" font-weight="600" fill="${f.textMuted}" letter-spacing="1">aimtrainerpro.online</text>
  <text x="1120" y="575" text-anchor="end" font-family="Segoe UI, Roboto, sans-serif" font-size="14" font-weight="600" fill="${f.textMuted}" letter-spacing="1">CAN YOU BEAT THIS SCORE?</text>

  <!-- Bottom accent line -->
  <rect x="0" y="626" width="1200" height="4" fill="url(#accentLine)"/>
</svg>`}({score:d,accuracy:h,exerciseName:i,playerName:n,leaderboardPosition:t}),u=await c()({create:{width:1200,height:630,channels:4,background:{r:15,g:18,b:23,alpha:1}}}).composite([{input:Buffer.from(y),top:0,left:0}]).png({quality:90}).toBuffer();return new s.NextResponse(new Uint8Array(u),{status:200,headers:{"Content-Type":"image/png","Cache-Control":"public, max-age=3600, s-maxage=3600","Content-Length":u.length.toString()}})}catch(t){let e=t instanceof Error?t.message:"Internal server error";return s.NextResponse.json({error:`Failed to generate share card: ${e}`},{status:500})}}let p=new o.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/share/card/route",pathname:"/api/share/card",filename:"route",bundlePath:"app/api/share/card/route"},resolvedPagePath:"C:\\Live Projects\\Valorant-Aim-Tracker-Online\\src\\app\\api\\share\\card\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:d,staticGenerationAsyncStorage:h,serverHooks:y}=p,u="/api/share/card/route";function m(){return(0,n.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:h})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[8948,5972],()=>r(29327));module.exports=a})();