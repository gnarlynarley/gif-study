if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let t={};const l=e=>s(e,o),c={module:{uri:o},exports:t,require:l};i[o]=Promise.all(n.map((e=>c[e]||l(e)))).then((e=>(r(...e),t)))}}define(["./workbox-958fa2bd"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index.4082c52d.js",revision:null},{url:"assets/index.e6f7d863.css",revision:null},{url:"assets/workbox-window.prod.es5.d2780aeb.js",revision:null},{url:"index.html",revision:"9545869f6aad0025a81b899544af7efc"},{url:"favicon.ico",revision:"bc29147989adbaecdc465a418e33404b"},{url:"apple-touch-icon.png",revision:"1b12e72899c9d385f385d42beef241b1"},{url:"pwa-192x192.png",revision:"31338e6d89771c936b5362f82f7f5cc8"},{url:"pwa-512x512.png",revision:"edf84b8ab703815511bf9bdac967ef05"},{url:"manifest.webmanifest",revision:"cca1df1991f8d085004327e4e42329f9"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
