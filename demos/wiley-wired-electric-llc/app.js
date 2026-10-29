(function(){
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
var hd=$('header.site');function sc(){hd.classList.toggle('small',window.scrollY>40);$$('[data-par]').forEach(function(e){if(!reduce)e.style.transform='translateY('+(window.scrollY*parseFloat(e.dataset.par))+'px)'})}
sc();window.addEventListener('scroll',sc,{passive:true});
var mb=$('.menu-btn');if(mb)mb.addEventListener('click',function(){var o=$('nav.main').classList.toggle('open');mb.setAttribute('aria-expanded',o)});
/* reveal + steps + countup */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');if(e.target.dataset.count)count(e.target);io.unobserve(e.target)}})},{threshold:.15});
$$('.reveal,.steps,[data-count]').forEach(function(e){io.observe(e)});
function count(el){var t=parseFloat(el.dataset.count),d=parseInt(el.dataset.dec||0,10),s=el.dataset.suffix||'';if(reduce){el.textContent=t.toFixed(d)+s;return}var st=null;function f(ts){st=st||ts;var p=Math.min((ts-st)/1400,1);el.textContent=(t*(1-Math.pow(1-p,3))).toFixed(d)+s;if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
/* open now (sample hours, America/New_York) */
var H={0:null,1:[7,18],2:[7,18],3:[7,18],4:[7,18],5:[7,18],6:[8,14]};
function now(){var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=x.value});var d={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[o.weekday];return{d:d,h:(parseInt(o.hour,10)%24)+parseInt(o.minute,10)/60}}
var n=now(),h=H[n.d],open=h&&n.h>=h[0]&&n.h<h[1];
$$('.open-pill').forEach(function(e){e.classList.toggle('open',!!open);e.querySelector('.t').textContent=open?'Open now (sample hours)':'Closed now (sample hours). Emergency line below'});
$$('.hours tr[data-d]').forEach(function(r){if(+r.dataset.d===n.d)r.classList.add('today')});
/* carousel */
$$('.car').forEach(function(c){var tr=$('.track',c),sl=$$('.slide',c),i=0,dots=$('.dots',c.parentNode),tm;
 if(dots){sl.forEach(function(_,k){var b=document.createElement('button');b.setAttribute('aria-label','Review '+(k+1));b.onclick=function(){go(k)};dots.appendChild(b)})}
 function go(k){i=(k+sl.length)%sl.length;tr.style.transform='translateX(-'+i*100+'%)';if(dots)$$('button',dots).forEach(function(b,j){b.setAttribute('aria-current',j===i)})}
 go(0);var p=c.parentNode;$$('[data-dir]',p).forEach(function(b){b.onclick=function(){go(i+parseInt(b.dataset.dir,10))}});
 if(!reduce)tm=setInterval(function(){go(i+1)},7000);c.addEventListener('focusin',function(){clearInterval(tm)});c.addEventListener('mouseenter',function(){clearInterval(tm)})});
/* lightbox */
var lb=$('.lb');if(lb){var lbx=$('.box',lb),lbp=$('p',lb),last;
 $$('[data-lb]').forEach(function(b){b.addEventListener('click',function(){last=b;lbx.innerHTML=b.querySelector('.photo').outerHTML;lbp.textContent=b.dataset.lb;lb.classList.add('open');$('.x',lb).focus()})});
 function cl(){lb.classList.remove('open');if(last)last.focus()}$('.x',lb).onclick=cl;lb.addEventListener('click',function(e){if(e.target===lb)cl()});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lb.classList.contains('open'))cl()})}
/* filters */
$$('.filters').forEach(function(f){$$('button',f).forEach(function(b){b.addEventListener('click',function(){$$('button',f).forEach(function(x){x.setAttribute('aria-pressed',x===b)});$$('.gal-grid > *').forEach(function(g){g.style.display=(b.dataset.f==='all'||g.dataset.cat===b.dataset.f)?'':'none'})})})});
/* before/after */
$$('.ba').forEach(function(b){var r=$('input',b),a=$('.after-l',b),hd2=$('.handle',b);function u(){a.style.clipPath='inset(0 0 0 '+r.value+'%)';hd2.style.left=r.value+'%'}r.addEventListener('input',u);u()});
/* tabs */
$$('[role=tablist]').forEach(function(tl){var bs=$$('[role=tab]',tl);function sel(b){bs.forEach(function(x){x.setAttribute('aria-selected',x===b);$('#'+x.getAttribute('aria-controls')).classList.toggle('on',x===b)})}bs.forEach(function(b){b.addEventListener('click',function(){sel(b)})});if(location.hash){var m=bs.filter(function(x){return '#'+x.getAttribute('aria-controls')===location.hash})[0];if(m)sel(m)}});
/* quote form */
var f=$('#quote');if(f){var st=$$('.fs',f),pr=$$('.prog i',f),k=0,files=[];
 function show(j){k=j;st.forEach(function(s,x){s.classList.toggle('on',x===j)});pr.forEach(function(p,x){p.classList.toggle('on',x<=j)});f.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}
 function ok(){var s=st[k],good=true;$$('[required]',s).forEach(function(e){var bad=!e.value.trim();var er=e.nextElementSibling;if(er&&!er.classList.contains('err'))er=null;if(er)er.style.display=bad?'block':'none';if(bad)good=false});if(k===0&&!$('input[name=svc]:checked',f)){$('#e-svc').style.display='block';good=false}else if(k===0)$('#e-svc').style.display='none';return good}
 $$('[data-next]',f).forEach(function(b){b.onclick=function(){if(ok()){if(k===st.length-2)sum();show(k+1)}}});$$('[data-prev]',f).forEach(function(b){b.onclick=function(){show(k-1)}});
 function sum(){var s=$('input[name=svc]:checked',f);$('#sum').innerHTML='<b>Job:</b> '+(s?s.value:'')+'<br><b>Town:</b> '+$('#town').value+'<br><b>Name:</b> '+$('#nm').value+'<br><b>Photos:</b> '+files.length}
 $('#ph').addEventListener('change',function(e){files=files.concat(Array.prototype.slice.call(e.target.files)).slice(0,6);var pv=$('.prev',f);pv.innerHTML='';files.forEach(function(fl){if(!/^image\//.test(fl.type))return;var im=document.createElement('img');im.alt='Preview of '+fl.name;im.src=URL.createObjectURL(fl);pv.appendChild(im)})});
 f.addEventListener('submit',function(e){e.preventDefault();if(!ok())return;st.forEach(function(s){s.classList.remove('on')});$('.thanks',f).style.display='block';$('.prog',f).style.display='none'})}
})();
