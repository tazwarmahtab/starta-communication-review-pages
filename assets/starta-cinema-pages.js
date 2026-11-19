/* Starta supporting-page motion: semantic content remains readable without JavaScript. */
(function(){
'use strict';
function mount(){
 if(document.body.classList.contains('page-index'))return;
 const query=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(query.matches||!('IntersectionObserver'in window))return;
 const targets=[...document.querySelectorAll('.hero-grid > div:first-child,.section-intro,.feature-card,.content-section h2,.content-section .split > div')];
 if(!targets.length)return;
 // Do not hide the above-the-fold hero: content remains useful before any effect starts.
 const visible=targets.filter(el=>el.getBoundingClientRect().top<window.innerHeight*.9);
 targets.forEach(el=>{el.dataset.cinemaEnter='';if(visible.includes(el))el.classList.add('is-visible');});
 document.body.classList.add('cinema-pages-ready');
 const io=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}})
 },{threshold:.08,rootMargin:'0px 0px -6% 0px'});
 targets.filter(el=>!visible.includes(el)).forEach(el=>io.observe(el));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
})();