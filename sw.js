if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let t={};const f=e=>s(e,o),l={module:{uri:o},exports:t,require:f};i[o]=Promise.all(n.map((e=>l[e]||f(e)))).then((e=>(r(...e),t)))}}define(["./workbox-958fa2bd"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index.834af366.css",revision:null},{url:"assets/index.9b0a47ff.js",revision:null},{url:"assets/workbox-window.prod.es5.d2780aeb.js",revision:null},{url:"index.html",revision:"6aef7e8c8e9f8758f9a29fbe3819ea11"},{url:"favicon.ico",revision:"2da5295533480b1a2a9f3aa3bc6f183f"},{url:"apple-touch-icon.png",revision:"d13838230ac06c92f23b88010665be3e"},{url:"pwa-192x192.png",revision:"933494c0fbbaaca6677562d76a1799d5"},{url:"pwa-512x512.png",revision:"41fa55ccc88d913f25276fd52a486f30"},{url:"manifest.webmanifest",revision:"2372becd88d82c79e52b306363db6b29"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
