if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let d={};const t=e=>s(e,o),c={module:{uri:o},exports:d,require:t};i[o]=Promise.all(n.map((e=>c[e]||t(e)))).then((e=>(r(...e),d)))}}define(["./workbox-958fa2bd"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index.855ca147.js",revision:null},{url:"assets/index.c3f5ab71.css",revision:null},{url:"index.html",revision:"7f6fe200f8395c2ab917768843ae5fab"},{url:"registerSW.js",revision:"ec9a0f2d89fbb4bcfbb2ad0093ad258a"},{url:"favicon.ico",revision:"f4525e08b4c10072fee8d42dd201488e"},{url:"apple-touch-icon.png",revision:"24f298dbe7c382a0e5c1d53de13e3c3d"},{url:"pwa-192x192.png",revision:"d1e408030733a70fa2803416deddb224"},{url:"pwa-512x512.png",revision:"555d3d512733ed869b6a9632921a1bec"},{url:"manifest.webmanifest",revision:"8a2c0aef9636e980dce4d22b3766a36e"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));