if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let c={};const t=e=>s(e,o),d={module:{uri:o},exports:c,require:t};i[o]=Promise.all(n.map((e=>d[e]||t(e)))).then((e=>(r(...e),c)))}}define(["./workbox-958fa2bd"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index.1488f784.js",revision:null},{url:"assets/index.2af7089d.css",revision:null},{url:"assets/workbox-window.prod.es5.d2780aeb.js",revision:null},{url:"index.html",revision:"69c5da8458fcd7aecb5c127024dc7a0f"},{url:"favicon.ico",revision:"bc29147989adbaecdc465a418e33404b"},{url:"apple-touch-icon.png",revision:"1b12e72899c9d385f385d42beef241b1"},{url:"pwa-192x192.png",revision:"31338e6d89771c936b5362f82f7f5cc8"},{url:"pwa-512x512.png",revision:"edf84b8ab703815511bf9bdac967ef05"},{url:"manifest.webmanifest",revision:"cca1df1991f8d085004327e4e42329f9"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
