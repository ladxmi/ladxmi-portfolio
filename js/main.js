(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('yr').textContent=new Date().getFullYear();

  var root=document.documentElement;

  // ciel étoilé : étoiles scintillantes + étoiles filantes
  var cv=document.getElementById('sky'),cx=cv.getContext('2d'),W=0,H=0,D=1,stars=[],shoot=null,col='#fff';
  function colr(){col=getComputedStyle(root).getPropertyValue('--star').trim()||'#fff'}
  function size(){D=devicePixelRatio||1;W=cv.width=innerWidth*D;H=cv.height=innerHeight*D;cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';stars=[];
    for(var i=0;i<Math.min(170,innerWidth/6);i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.3+.3)*D,p:Math.random()*6.28,s:Math.random()*.02+.005,z:Math.random()*.6+.2});if(reduce)frame(0)}
  function frame(t){
    cx.clearRect(0,0,W,H);cx.fillStyle=col;var off=reduce?0:scrollY*.25*D;
    stars.forEach(function(s){cx.globalAlpha=reduce?.7:.35+.65*Math.abs(Math.sin(s.p+t*s.s*.1));var y=((s.y-off*s.z)%H+H)%H;cx.beginPath();cx.arc(s.x,y,s.r,0,6.283);cx.fill()});
    if(reduce)return;
    if(!shoot&&Math.random()<.004)shoot={x:Math.random()*W*.7,y:Math.random()*H*.4,l:0};
    if(shoot){shoot.x+=14*D;shoot.y+=7*D;shoot.l++;cx.globalAlpha=Math.max(0,1-shoot.l/40);cx.strokeStyle=col;cx.lineWidth=1.5*D;cx.beginPath();cx.moveTo(shoot.x,shoot.y);cx.lineTo(shoot.x-90*D,shoot.y-45*D);cx.stroke();if(shoot.l>40)shoot=null}
    requestAnimationFrame(frame);
  }
  colr();size();if(!reduce)requestAnimationFrame(frame);addEventListener('resize',size);

  // galaxies spirales + voyage à travers les étoiles (saut hyperespace à l'ouverture, filets au défilement)
  var dc=document.getElementById('deep'),dx=dc.getContext('2d'),mx=.5,my=.5,last=scrollY,boost=0,t0=performance.now();
  var gal=[{x:.78,y:.28,s:.34,c:[255,205,150],a:[170,120,255],b:[255,110,200],k:1,rot:.00004},{x:.12,y:.82,s:.22,c:[200,230,255],a:[90,160,255],b:[130,230,255],k:.7,rot:-.00006}];
  gal.forEach(function(g){g.p=[];for(var i=0;i<650;i++){var r=Math.pow(Math.random(),.8);g.p.push([r,r*9+(i%2)*Math.PI+(Math.random()-.5)*.6*(1.2-r),Math.random()*1.4+.3,Math.random()])}});
  var rays=[];for(var i=0;i<160;i++)rays.push([Math.random()*6.283,Math.random()*.8+.1]);
  function dsize(){dc.width=innerWidth*D;dc.height=innerHeight*D;dc.style.width=innerWidth+'px';dc.style.height=innerHeight+'px'}
  function deep(now){
    var w=dc.width,h=dc.height,tt=now-t0;dx.clearRect(0,0,w,h);dx.globalCompositeOperation='lighter';
    gal.forEach(function(g){
      var R=Math.min(w,h)*g.s,x0=g.x*w-(mx-.5)*40*D*g.k,y0=g.y*h-scrollY*.12*D*g.k-(my-.5)*40*D*g.k,rot=tt*g.rot;
      var gr=dx.createRadialGradient(x0,y0,0,x0,y0,R*.35);gr.addColorStop(0,'rgba('+g.c+',.55)');gr.addColorStop(1,'rgba('+g.c+',0)');
      dx.globalAlpha=1;dx.fillStyle=gr;dx.beginPath();dx.arc(x0,y0,R*.35,0,6.283);dx.fill();
      g.p.forEach(function(q){var a=q[1]+rot*(1.4-q[0]),px=Math.cos(a)*q[0]*R,py=Math.sin(a)*q[0]*R*.45,m=q[3];
        dx.fillStyle='rgb('+(g.a[0]+(g.b[0]-g.a[0])*m|0)+','+(g.a[1]+(g.b[1]-g.a[1])*m|0)+','+(g.a[2]+(g.b[2]-g.a[2])*m|0)+')';
        dx.globalAlpha=.75-q[0]*.45;dx.beginPath();dx.arc(x0+px*.88-py*.48,y0+px*.48+py*.88,q[2]*D*(1.3-q[0]*.5),0,6.283);dx.fill()});
    });
    var v=Math.abs(scrollY-last);last=scrollY;boost+=(Math.min(1,v/40)-boost)*.15;
    var wv=Math.max(Math.max(0,1-tt/1800),boost*.6);
    if(wv>.02&&!reduce){dx.globalAlpha=Math.min(1,wv);dx.strokeStyle='#cdbdff';dx.lineWidth=1.2*D;var mr=Math.hypot(w,h)/2;
      rays.forEach(function(r){var d0=r[1]*mr*(1+(1-wv)*.5),d1=d0+mr*.55*wv*r[1],c=Math.cos(r[0]),s=Math.sin(r[0]);dx.beginPath();dx.moveTo(w/2+c*d0,h/2+s*d0);dx.lineTo(w/2+c*d1,h/2+s*d1);dx.stroke()})}
    dx.globalCompositeOperation='source-over';
    if(!reduce)requestAnimationFrame(deep);
  }
  dsize();if(reduce)deep(t0+4000);else requestAnimationFrame(deep);
  addEventListener('resize',function(){dsize();if(reduce)deep(t0+4000)});
  addEventListener('pointermove',function(e){mx=e.clientX/innerWidth;my=e.clientY/innerHeight},{passive:true});

  // apparition au défilement
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12});
    els.forEach(function(e){io.observe(e)});
  }else els.forEach(function(e){e.classList.add('in')});

  // texte qui s'écrit
  var roles=['Développeur web junior','Front-end · SvelteKit & React','API & bases de données · PostgreSQL','Du design Figma à la mise en ligne'];
  var t=document.getElementById('typed'),ri=0,ci=0,del=false;
  function tick(){
    var w=roles[ri];
    if(reduce){t.textContent=w;return}
    t.textContent=w.slice(0,ci);
    if(!del&&ci<w.length){ci++;setTimeout(tick,70)}
    else if(!del){del=true;setTimeout(tick,1500)}
    else if(ci>0){ci--;setTimeout(tick,35)}
    else{del=false;ri=(ri+1)%roles.length;setTimeout(tick,300)}
  }
  tick();

  // barre de progression + lien actif
  var bar=document.getElementById('bar'),links=[].slice.call(document.querySelectorAll('.links a'));
  var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))});
  function onScroll(){
    var h=document.documentElement.scrollHeight-innerHeight;
    bar.style.width=(h>0?scrollY/h*100:0)+'%';
    var cur=-1;secs.forEach(function(s,i){if(s.getBoundingClientRect().top<innerHeight*.4)cur=i});
    links.forEach(function(a,i){a.classList.toggle('on',i===cur)});
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // légère inclinaison des cartes de projet
  if(!reduce&&matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.proj .card').forEach(function(c){
      c.addEventListener('pointermove',function(e){
        var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        c.style.transform='perspective(900px) rotateY('+x*3+'deg) rotateX('+(-y*3)+'deg)';
      });
      c.addEventListener('pointerleave',function(){c.style.transform=''});
    });
  }
})();
