(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function toast(m){var t=$('.toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('show')},3200)}
$$('[data-toast]').forEach(function(b){b.addEventListener('click',function(){toast(b.getAttribute('data-toast'))})});

/* header shrink + menu */
var hd=$('header.site');
function sc(){hd.classList.toggle('shrunk',window.scrollY>40)}sc();window.addEventListener('scroll',sc,{passive:true});
var bg=$('.burger'),nav=$('#nav');
bg.addEventListener('click',function(){var o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Close menu':'Open menu')});
$$('#nav a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');bg.setAttribute('aria-expanded','false')})});

/* reveal + count-up + process line */
function countUp(el){var to=parseFloat(el.dataset.count),d=parseInt(el.dataset.dec||0,10);if(reduce){el.textContent=to.toFixed(d);return}
 var t0=null;(function f(ts){t0=t0||ts;var p=Math.min((ts-t0)/1400,1),e=1-Math.pow(1-p,3);el.textContent=(to*e).toFixed(d);if(p<1)requestAnimationFrame(f)})(performance.now())}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;el.classList.add('in');$$('[data-count]',el).forEach(countUp);
 if(el.classList.contains('steps4'))el.classList.add('go');io.unobserve(el)})},{threshold:.15});
$$('.rv,.steps4').forEach(function(el,i){el.style.transitionDelay=(el.classList.contains('rv')?(i%3)*80:0)+'ms';io.observe(el)});
if(reduce)$$('.steps4').forEach(function(s){s.classList.add('go')});

/* open now */
function nowET(){var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',hour12:false}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=x.value});
 return {d:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday),h:parseInt(o.hour,10)%24}}
function hours(){var n=nowET(),open=n.d!==0&&n.h>=7&&n.h<21;
 $$('[data-open]').forEach(function(e){e.classList.toggle('on',open);e.classList.toggle('off',!open);$('span',e).textContent=open?'Open now until 9 PM':(n.d===0?'Closed Sundays. Back Monday 7 AM':'Closed now. Opens 7 AM')});
 $$('.hours li').forEach(function(li){li.classList.toggle('today',parseInt(li.dataset.d,10)===n.d)});
 $$('[data-afterhours]').forEach(function(a){a.hidden=open})}
hours();

/* expanding service cards + FAQ */
$$('.more').forEach(function(b){b.addEventListener('click',function(){var o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',!o);document.getElementById(b.getAttribute('aria-controls')).classList.toggle('open',!o)})});
$$('.q button').forEach(function(b){b.addEventListener('click',function(){var o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',!o);b.nextElementSibling.classList.toggle('open',!o)})});

/* before/after */
$$('.ba').forEach(function(ba){var r=$('input',ba),b=$('.ba-b',ba),k=$('.knob',ba);function u(){b.style.clipPath='inset(0 '+(100-r.value)+'% 0 0)';k.style.left=r.value+'%'}r.addEventListener('input',u);u()});

/* carousel */
var car=$('#car');if(car){var tr=$('.track',car);function step(d){tr.scrollBy({left:d*(tr.firstElementChild.offsetWidth+18),behavior:reduce?'auto':'smooth'})}
 $('[data-prev]',car).addEventListener('click',function(){step(-1)});$('[data-next]',car).addEventListener('click',function(){step(1)})}

/* review carousel */
var rc=$('#rcar');if(rc){var rt=$('.rtrack',rc),n=rt.children.length,i=0,dots=$('.dots',rc),tm;
 for(var j=0;j<n;j++){(function(j){var b=document.createElement('button');b.setAttribute('aria-label','Review '+(j+1));b.addEventListener('click',function(){go(j);auto()});dots.appendChild(b)})(j)}
 function go(k){i=(k+n)%n;rt.style.transform='translateX(-'+i*100+'%)';$$('button',dots).forEach(function(b,x){b.classList.toggle('on',x===i)})}
 function auto(){clearInterval(tm);if(!reduce)tm=setInterval(function(){go(i+1)},6500)}go(0);auto()}

/* estimate form (front end only) */
$$('.est').forEach(function(f){var s=1,panes=$$('.pane',f),dots=$$('.steps li',f),nx=$('[data-next]',f),bk=$('[data-back]',f);
 var q=new URLSearchParams(location.search).get('service');if(q){var c=$('input[value="'+q+'"]',f);if(c)c.checked=true}
 function show(){panes.forEach(function(p,x){p.classList.toggle('on',x===s-1)});dots.forEach(function(d,x){d.classList.toggle('on',x<s)});bk.hidden=s===1;nx.textContent=s===4?'Send request':'Next'}
 nx.addEventListener('click',function(){var p=panes[s-1],e=$('.err',p);
  if(s===1&&!$$('input[name=svc]:checked',f).length){e.hidden=false;return}
  if(s===4){var nm=$('[name=name]',f).value.trim(),ph=$('[name=phone]',f).value.trim();if(!nm||!ph){e.hidden=false;return}
   panes.forEach(function(p){p.classList.remove('on')});$('.nav2',f).hidden=true;$('.steps',f).hidden=true;$('.done',f).hidden=false;return}
  if(e)e.hidden=true;s++;show()});
 bk.addEventListener('click',function(){s--;show()});
 var up=$('input[type=file]',f),th=$('.thumbs',f);if(up)up.addEventListener('change',function(){th.innerHTML='';Array.prototype.forEach.call(up.files,function(file){if(!/^image\//.test(file.type))return;var im=new Image();im.alt='Photo you chose';im.src=URL.createObjectURL(file);th.appendChild(im)})});
 show()});

/* hero parallax */
var pe=$$('[data-par]');if(pe.length&&!reduce)window.addEventListener('scroll',function(){var y=window.scrollY;if(y>900)return;pe.forEach(function(e){e.style.translate='0 '+(y*parseFloat(e.dataset.par))+'px'})},{passive:true});

/* gallery filter + lightbox */
var grid=$('#grid');if(grid){var items=$$('.gi',grid);
 $$('.filters button').forEach(function(b){b.addEventListener('click',function(){$$('.filters button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');items.forEach(function(g){g.hidden=b.dataset.f!=='all'&&g.dataset.c!==b.dataset.f})})});
 var lb=$('#lb'),cur=0,last;function vis(){return items.filter(function(g){return !g.hidden})}
 function open(k){var v=vis();cur=(k+v.length)%v.length;$('.lbin',lb).innerHTML=$('.ph',v[cur]).outerHTML;$('.lbc',lb).textContent=v[cur].dataset.cap+' (sample photo)';lb.hidden=false;$('.x',lb).focus()}
 items.forEach(function(g){g.addEventListener('click',function(){last=g;open(vis().indexOf(g))})});
 function close(){lb.hidden=true;if(last)last.focus()}
 $('.x',lb).addEventListener('click',close);$('.lp',lb).addEventListener('click',function(){open(cur-1)});$('.ln',lb).addEventListener('click',function(){open(cur+1)});
 lb.addEventListener('click',function(e){if(e.target===lb)close()});
 document.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')open(cur-1);if(e.key==='ArrowRight')open(cur+1)})}
})();
