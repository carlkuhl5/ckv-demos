(function(){
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* header shrink + menu */
var hd=$('header.nav');
function onS(){hd.classList.toggle('small',scrollY>40);$$('[data-par]').forEach(function(e){if(!reduce)e.style.transform='translateY('+(scrollY*parseFloat(e.dataset.par))+'px)'})}
addEventListener('scroll',onS,{passive:true});onS();
var bg=$('.burger'),mn=$('nav.menu');
bg.addEventListener('click',function(){var o=mn.classList.toggle('open');bg.setAttribute('aria-expanded',o)});
/* reveal + counters */
function count(el){var t=+el.dataset.to,d=1400,s=performance.now();if(reduce){el.textContent=t;return}
(function f(n){var p=Math.min(1,(n-s)/d);el.textContent=Math.round(t*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(s)}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');$$('[data-to]',e.target).forEach(count);if(e.target.dataset.to)count(e.target);io.unobserve(e.target)}})},{threshold:.15});
$$('.reveal,.steps,[data-to]').forEach(function(e){io.observe(e)});
/* expandable service cards */
$$('.card button.tog').forEach(function(b){b.addEventListener('click',function(){var c=b.closest('.card'),o=c.classList.toggle('open');b.setAttribute('aria-expanded',o);b.textContent=o?'Show less −':'What this covers +'})});
/* carousels */
$$('.car').forEach(function(c){var t=$('.track',c);$$('[data-dir]',c).forEach(function(b){b.addEventListener('click',function(){t.scrollBy({left:b.dataset.dir*(t.firstElementChild.offsetWidth+20),behavior:'smooth'})})})});
var rv=$('#reviews .track');if(rv&&!reduce){setInterval(function(){if(document.hidden||rv.matches(':hover')||rv.contains(document.activeElement))return;var m=rv.scrollWidth-rv.clientWidth;rv.scrollTo({left:rv.scrollLeft>=m-4?0:rv.scrollLeft+rv.firstElementChild.offsetWidth+20,behavior:'smooth'})},4500)}
/* before/after */
$$('.ba').forEach(function(b){var r=$('input',b),bb=$('.b',b),h=$('.handle',b);function u(){bb.style.clipPath='inset(0 0 0 '+r.value+'%)';h.style.left=r.value+'%'}r.addEventListener('input',u);u()});
/* gallery filter + lightbox */
var fb=$$('.filters button');fb.forEach(function(b){b.addEventListener('click',function(){fb.forEach(function(x){x.setAttribute('aria-pressed',x===b)});$$('.gal>*').forEach(function(g){g.hidden=!(b.dataset.f==='all'||g.dataset.k===b.dataset.f)})})});
var lb=$('.lb');if(lb){var last;function close(){lb.classList.remove('open');last&&last.focus()}
$$('.gal button').forEach(function(g){g.addEventListener('click',function(){last=g;$('.slot',lb).innerHTML=$('.photo',g).outerHTML;$('.lt',lb).textContent=g.dataset.t;lb.classList.add('open');$('button',lb).focus()})});
$('button',lb).addEventListener('click',close);lb.addEventListener('click',function(e){if(e.target===lb)close()});addEventListener('keydown',function(e){if(e.key==='Escape'&&lb.classList.contains('open'))close()})}
/* hours / open now (Sample hours, Eastern time) */
var H={1:[8,17],2:[8,17],3:[8,17],4:[8,17],5:[8,17],6:[9,13]};
function nowET(){var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=x.value});var d={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[o.weekday];return{d:d,t:(+o.hour%24)+(+o.minute)/60}}
var n=nowET(),h=H[n.d],open=h&&n.t>=h[0]&&n.t<h[1];
$$('.status').forEach(function(s){s.classList.toggle('closed',!open);s.textContent=open?'Open now (sample hours)':'Closed now (sample hours)'});
$$('.afterhrs').forEach(function(a){a.classList.toggle('show',!open)});
$$('.hours tr[data-d]').forEach(function(r){if(+r.dataset.d===n.d)r.classList.add('today')});
/* towns */
$$('.towns li').forEach(function(l){l.tabIndex=0;function on(){$$('.towns li').forEach(function(x){x.classList.remove('on')});l.classList.add('on');var p=$('#pin-'+l.dataset.p);$$('.map .pin').forEach(function(x){x.style.opacity=.35});if(p)p.style.opacity=1}l.addEventListener('mouseenter',on);l.addEventListener('focus',on)});
/* estimate form */
var f=$('form.est');if(f){var fs=$$('fieldset',f),pg=$$('.prog i',f),i=0,files=[];
function show(k){i=k;fs.forEach(function(x,j){x.classList.toggle('on',j===k)});pg.forEach(function(x,j){x.classList.toggle('on',j<=k)});f.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}
function ok(){var e=$('.err',fs[i]);if(!e)return true;var bad=false;$$('[required]',fs[i]).forEach(function(x){if(!x.value.trim())bad=true});if($$('input[type=radio]',fs[i]).length&&!$('input[type=radio]:checked',fs[i]))bad=true;e.classList.toggle('show',bad);return!bad}
$$('[data-next]',f).forEach(function(b){b.addEventListener('click',function(){if(ok())show(i+1)})});
$$('[data-prev]',f).forEach(function(b){b.addEventListener('click',function(){show(i-1)})});
var fi=$('#photos'),th=$('.thumbs',f);fi.addEventListener('change',function(){th.innerHTML='';Array.prototype.slice.call(fi.files,0,8).forEach(function(file){if(!/^image\//.test(file.type))return;var r=new FileReader();r.onload=function(){var im=new Image();im.alt='Preview of '+file.name;im.src=r.result;th.appendChild(im)};r.readAsDataURL(file)})});
f.addEventListener('submit',function(e){e.preventDefault();if(!ok())return;fs.forEach(function(x){x.classList.remove('on')});$('.prog',f).style.display='none';$('.thanks',f).classList.add('show');f.scrollIntoView({block:'start'})})}
/* copy */
$$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){var t=$(b.dataset.copy).textContent.trim();(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(function(){}).then(function(){b.textContent='Copied ✓';setTimeout(function(){b.textContent='Copy message'},2000)})})});
$$('.mini').forEach(function(m){m.addEventListener('submit',function(e){e.preventDefault();m.innerHTML='<p><b>Thanks! This is a demo, so nothing was sent.</b> The full form is on the <a href="contact.html">estimate page</a>.</p>'})});
})();
