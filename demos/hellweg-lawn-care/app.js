/* Hellweg Lawn Care demo - front-end only, no network calls */
(function(){
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement;

  /* season */
  var m=new Date().getMonth(),auto=(m>=2&&m<=4)?'spring':(m>=5&&m<=7)?'summer':'fall';
  var season=auto;try{season=localStorage.getItem('hlc-season')||auto}catch(e){}
  function setSeason(s){
    season=s;root.setAttribute('data-season',s);
    $$('.seasons button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.s===s))});
    try{localStorage.setItem('hlc-season',s)}catch(e){}
    particles();
  }
  function particles(){
    var box=$('.parts');if(!box||reduce)return;box.innerHTML='';
    var cols=['#d9632b','#e8a02c','#b5502e','#c98a1f'];
    for(var i=0;i<16;i++){
      var p=document.createElement('i');p.className='pt';
      p.style.setProperty('--x',(Math.random()*100)+'%');
      p.style.setProperty('--s',(10+Math.random()*14)+'px');
      p.style.setProperty('--dur',(9+Math.random()*9)+'s');
      p.style.setProperty('--del',(-Math.random()*14)+'s');
      p.style.setProperty('--c',cols[i%cols.length]);
      box.appendChild(p);
    }
  }
  root.setAttribute('data-season',season);
  $$('.seasons button').forEach(function(b){b.addEventListener('click',function(){setSeason(b.dataset.s)})});
  if($$('.seasons button').length)setSeason(season);

  /* grass blades */
  $$('.blades').forEach(function(el){
    var W=1200,n=el.classList.contains('few')?70:110,h=el.clientHeight||140,d='';
    for(var i=0;i<n;i++){
      var x=i*(W/n)+Math.random()*8,hh=40+Math.random()*(h-50),w=6+Math.random()*7,lean=(Math.random()-.5)*26;
      var p=document.createElementNS('http://www.w3.org/2000/svg','path');
      p.setAttribute('d','M'+x+' 150 Q'+(x+lean/2)+' '+(150-hh*.6)+' '+(x+lean)+' '+(150-hh)+' Q'+(x+w+lean/3)+' '+(150-hh*.5)+' '+(x+w)+' 150z');
      p.style.setProperty('--t',(2.6+Math.random()*3)+'s');p.style.setProperty('--d',(-Math.random()*4)+'s');
      d+=p.outerHTML;
    }
    el.innerHTML='<svg viewBox="0 0 '+W+' 150" preserveAspectRatio="none" role="img" aria-label="Decorative swaying grass">'+d+'</svg>';
  });

  /* hero headline words */
  $$('[data-words]').forEach(function(h){
    var i=0;h.innerHTML=h.innerHTML.split(/(<em>.*?<\/em>|\s+)/).map(function(t){
      if(!t||/^\s+$/.test(t))return t;
      if(t.indexOf('<em>')===0)return '<span class="w" style="animation-delay:'+(.15+(i++)*.12)+'s">'+t+'</span>';
      return '<span class="w" style="animation-delay:'+(.15+(i++)*.12)+'s">'+t+'</span>';
    }).join(' ');
  });

  /* header shrink + parallax */
  var hdr=$('.hdr'),sun=$('.sun'),hills=$('.hills');
  function onScroll(){
    var y=window.scrollY;
    if(hdr)hdr.classList.toggle('small',y>40);
    if(!reduce){
      if(sun)sun.style.transform='translateY('+(y*.25)+'px)';
      if(hills)hills.style.transform='translateY('+(y*.08)+'px)';
    }
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* mobile menu */
  var bg=$('.burger'),nav=$('.nav');
  if(bg){
    bg.addEventListener('click',function(){
      var o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',String(o));
      bg.querySelector('use').setAttribute('href',o?'#i-close':'#i-menu');
    });
    $$('.nav a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');bg.setAttribute('aria-expanded','false')})});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');bg.focus()}});
  }

  /* reveal + counters + process */
  function count(el){
    var to=parseFloat(el.dataset.to),dec=(el.dataset.to.split('.')[1]||'').length,t0=null,dur=1600;
    if(reduce||/[?&]shot/.test(location.search)){el.textContent=to.toFixed(dec);return}
    setTimeout(function(){el.textContent=to.toFixed(dec)},dur+300);
    function f(t){if(!t0)t0=t;var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,3);el.textContent=(to*e).toFixed(dec);if(p<1)requestAnimationFrame(f)}
    requestAnimationFrame(f);
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting)return;
      e.target.classList.add('in');
      $$('[data-to]',e.target).forEach(count);
      if(e.target.dataset.to)count(e.target);
      io.unobserve(e.target);
    });
  },{threshold:0,rootMargin:"0px 0px -6% 0px"});
  $$('.rv,.proc').forEach(function(el,i){io.observe(el)});
  $$('[data-to]').forEach(function(el){if(!el.closest('.rv'))io.observe(el)});

  /* service cards expand */
  $$('.more').forEach(function(b){
    b.addEventListener('click',function(){
      var x=b.nextElementSibling,o=x.classList.toggle('open');b.setAttribute('aria-expanded',String(o));
      b.firstChild.textContent=o?'Hide details':'What\u2019s involved';
    });
  });

  /* before / after */
  $$('.cmp').forEach(function(c){
    var r=$('input',c);
    function u(){c.style.setProperty('--pos',r.value+'%')}
    r.addEventListener('input',u);u();
    if(!reduce){
      var io2=new IntersectionObserver(function(es){if(es[0].isIntersecting){
        var v=50,dir=1,n=0;var id=setInterval(function(){v+=dir*1.6;if(v>72)dir=-1;if(v<28&&dir<0){dir=1}if(v>=50&&dir===1&&n++>1){clearInterval(id)}r.value=v;u()},16);
        io2.disconnect();}},{threshold:.6});
      io2.observe(c);
    }
  });

  /* carousels */
  $$('[data-carousel]').forEach(function(c){
    var tr=$('.track',c),kids=$$('.track>*',c),dots=$('.dots',c),prev=$('.prev',c),next=$('.next',c),auto=c.hasAttribute('data-auto'),paused=false;
    kids.forEach(function(k,i){
      var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Go to item '+(i+1));
      b.addEventListener('click',function(){tr.scrollTo({left:k.offsetLeft-tr.offsetLeft,behavior:reduce?'auto':'smooth'})});dots.appendChild(b);
    });
    function upd(){
      var best=0,bd=1e9;kids.forEach(function(k,i){var d=Math.abs(k.offsetLeft-tr.offsetLeft-tr.scrollLeft);if(d<bd){bd=d;best=i}});
      $$('button',dots).forEach(function(b,i){b.setAttribute('aria-current',String(i===best))});return best;
    }
    function go(dir){
      var i=upd()+dir;if(i>=kids.length)i=0;if(i<0)i=kids.length-1;
      tr.scrollTo({left:kids[i].offsetLeft-tr.offsetLeft,behavior:reduce?'auto':'smooth'});
    }
    tr.addEventListener('scroll',upd,{passive:true});upd();
    prev.addEventListener('click',function(){go(-1)});next.addEventListener('click',function(){go(1)});
    c.addEventListener('mouseenter',function(){paused=true});c.addEventListener('mouseleave',function(){paused=false});
    c.addEventListener('focusin',function(){paused=true});
    if(auto&&!reduce)setInterval(function(){if(!paused&&!document.hidden)go(1)},5200);
  });

  /* lightbox */
  var lb=$('dialog.lb');
  if(lb){
    var items=[],cur=0;
    function show(i){
      cur=(i+items.length)%items.length;var it=items[cur];
      $('.slot',lb).innerHTML=it.querySelector('svg').outerHTML+'<span class="tag">Sample photo</span>';
      $('.slot',lb).className='slot ph '+(it.dataset.v||'');
      $('.cap',lb).textContent=it.dataset.cap||'';
    }
    function open(list,i){items=list;show(i);if(!lb.open)lb.showModal()}
    $$('[data-lb]').forEach(function(b){
      b.addEventListener('click',function(){
        var group=$$('[data-lb]').filter(function(x){return !x.closest('.hide')});open(group,group.indexOf(b));
      });
    });
    $('.pv',lb).addEventListener('click',function(){show(cur-1)});
    $('.nx',lb).addEventListener('click',function(){show(cur+1)});
    $('.cl',lb).addEventListener('click',function(){lb.close()});
    lb.addEventListener('click',function(e){if(e.target===lb)lb.close()});
    lb.addEventListener('keydown',function(e){if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
  }

  /* gallery filter */
  $$('.filters button').forEach(function(b){
    b.addEventListener('click',function(){
      $$('.filters button').forEach(function(x){x.setAttribute('aria-pressed','false')});b.setAttribute('aria-pressed','true');
      $$('.grid .item').forEach(function(it){it.classList.toggle('hide',b.dataset.f!=='all'&&it.dataset.t!==b.dataset.f)});
    });
  });

  /* open now (hours are sample: Mon-Sat 7am-7pm Central, Sunday closed) */
  var HRS={0:null,1:[7,19],2:[7,19],3:[7,19],4:[7,19],5:[7,19],6:[7,19]},DN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function fmt(h){return (h%12||12)+(h<12?' AM':' PM')}
  function nowCT(){
    try{
      var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()),o={};
      p.forEach(function(x){o[x.type]=x.value});
      var d=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday);return {d:d,h:(parseInt(o.hour,10)%24)+parseInt(o.minute,10)/60};
    }catch(e){var n=new Date();return {d:n.getDay(),h:n.getHours()+n.getMinutes()/60}}
  }
  function hours(){
    var n=nowCT(),h=HRS[n.d],open=h&&n.h>=h[0]&&n.h<h[1],txt;
    if(open)txt='Open now \u00b7 until '+fmt(h[1]);
    else{var d=n.d,add=0;if(h&&n.h<h[0]){add=0}else{d=(d+1)%7;add=1;while(!HRS[d]){d=(d+1)%7;add++}}
      txt='Closed now \u00b7 opens '+(add===0?'today':add===1?'tomorrow':DN[d])+' '+fmt(HRS[d][0])}
    $$('[data-open]').forEach(function(e){e.classList.toggle('is-open',!!open);var t=$('.t',e);if(t)t.textContent=txt});
    $$('.afterhrs').forEach(function(a){a.classList.toggle('hide',!!open)});
    $$('.htable [data-d]').forEach(function(r){r.classList.toggle('today',+r.dataset.d===n.d)});
  }
  hours();setInterval(hours,60000);

  /* toast */
  var tt=$('.toast');
  function toast(m){if(!tt)return;tt.textContent=m;tt.classList.add('on');setTimeout(function(){tt.classList.remove('on')},3200)}
  $$('[data-toast]').forEach(function(b){b.addEventListener('click',function(){toast(b.dataset.toast)})});

  /* estimate wizard */
  var w=$('#wiz');
  if(w){
    var steps=$$('.fs',w),bar=$$('.wsteps li',w),i=0,err=$('.err',w),files=[];
    function render(){
      steps.forEach(function(s,k){s.classList.toggle('on',k===i)});
      bar.forEach(function(b,k){b.classList.toggle('on',k<=i)});
      $('.wlab',w).textContent='Step '+(i+1)+' of '+steps.length;
      $('.back',w).style.visibility=i?'visible':'hidden';
      $('.fwd',w).firstChild.textContent=i===steps.length-1?'Send my estimate request ':'Next ';
      err.textContent='';
    }
    function valid(){
      if(i===0&&!$$('input[name=job]:checked',w).length){err.textContent='Pick at least one job so we know what to look at.';return false}
      if(i===1&&!$('#town').value){err.textContent='Choose the town the work is in.';return false}
      if(i===3){
        if(!$('#nm').value.trim()){err.textContent='Please add your name.';return false}
        if($('#ph').value.replace(/\D/g,'').length<10){err.textContent='Add a phone number with area code so we can call you back.';return false}
      }
      return true;
    }
    $('.fwd',w).addEventListener('click',function(){
      if(!valid())return;
      if(i<steps.length-1){i++;render();w.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}
      else{
        $('form',w).style.display='none';$('.wsteps',w).style.display='none';$('.wlab',w).style.display='none';
        var d=$('.done',w);d.classList.add('on');
        $('.who',d).textContent=$('#nm').value.trim().split(' ')[0];
        $('.sum',d).textContent=$$('input[name=job]:checked',w).map(function(x){return x.value}).join(', ')+' in '+$('#town').selectedOptions[0].text+(files.length?' \u00b7 '+files.length+' photo'+(files.length>1?'s':''):'');
        d.setAttribute('tabindex','-1');d.focus();
      }
    });
    $('.back',w).addEventListener('click',function(){if(i>0){i--;render()}});
    $('form',w).addEventListener('submit',function(e){e.preventDefault()});
    var inp=$('#photos'),pv=$('.previews',w);
    function addFiles(list){
      Array.prototype.forEach.call(list,function(f){
        if(!/^image\//.test(f.type)||files.length>=8)return;files.push(f);
        var im=document.createElement('img');im.src=URL.createObjectURL(f);im.alt='Preview of your photo: '+f.name;pv.appendChild(im);
      });
    }
    inp.addEventListener('change',function(){addFiles(inp.files);inp.value=''});
    var dz=$('.drop',w);
    ['dragover','dragenter'].forEach(function(ev){dz.addEventListener(ev,function(e){e.preventDefault();dz.style.background='#e3efc4'})});
    ['dragleave','drop'].forEach(function(ev){dz.addEventListener(ev,function(e){e.preventDefault();dz.style.background=''})});
    dz.addEventListener('drop',function(e){addFiles(e.dataTransfer.files)});
    render();
  }
  var yr=$('#yr');if(yr)yr.textContent=new Date().getFullYear();
})();
/* ?shot: reveal everything for static captures */
if(/[?&]shot/.test(location.search)){document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.rv,.proc').forEach(function(e){e.classList.add('in')});document.querySelectorAll('[data-to]').forEach(function(e){e.textContent=e.dataset.to});var s=document.createElement('style');s.textContent='*{transition:none!important}.pt,.blades path,.sun,.marq div,.collage .stamp{animation:none!important}';document.head.appendChild(s)})}
