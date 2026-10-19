// Demo behavior. Nothing here submits data anywhere.
const $=s=>document.querySelector(s);
// mobile menu
const mb=$('.menu-btn button'),ul=$('.nav ul');
mb?.addEventListener('click',()=>{const o=ul.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
// one shared service-area list drives hero + (later) quote step 2 + area page
const SERVICE_ZIPS=['40202','40203','40204','40205','40206','40207','40208','40209','40210','40211','40212','40213','40214','40215','40216','40217','40218','40219','40220','40222','40223','40241','40243','40245','40291','40299','47130','47129','47150','47172','47111'];
$('#zipForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  const z=$('#zip').value.trim(),m=$('#zipMsg');
  if(!/^\d{5}$/.test(z)){m.textContent='Enter a 5-digit ZIP code.';return}
  m.textContent=SERVICE_ZIPS.includes(z)
   ?'Good news: we cover '+z+'. (The quote form opens here.)'
   :'We may not reach '+z+' yet, but leave your info and we\'ll tell you. ';
});
// mobile action bar after hero scrolls away
const bar=$('.mbar'),hero=$('.hero');
if('IntersectionObserver' in window&&hero){new IntersectionObserver(([e])=>bar.classList.toggle('show',!e.isIntersecting)).observe(hero)}
// hours awareness (demo hours are placeholders)
const h=new Date().getHours();
if(h<7||h>=20)document.querySelectorAll('[data-cta]').forEach(a=>a.textContent="We'll text you first thing");


// scroll reveal + header shadow
document.documentElement.classList.add('js');
const rv=document.querySelectorAll('[data-stagger],section .wrap>.eyebrow,section .wrap>h2,section .wrap>.lead,.dark .row');
rv.forEach(e=>{if(!e.hasAttribute('data-stagger'))e.setAttribute('data-r','')});
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 document.querySelectorAll('[data-r],[data-stagger]').forEach(e=>io.observe(e))}else document.querySelectorAll('[data-r],[data-stagger]').forEach(e=>e.classList.add('in'));
const hd=document.querySelector('header.site');addEventListener('scroll',()=>hd.classList.toggle('scrolled',scrollY>10),{passive:true});
