if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/gif-study/sw.js', { scope: '/gif-study/' })})}