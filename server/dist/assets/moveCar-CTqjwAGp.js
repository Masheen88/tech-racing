import{r as c,P as t,j as v,u as de}from"./index-BJ5GaQx0.js";const fe=(i,e)=>{const n=c.useRef(),r=c.useRef([]),u=c.useRef(null),a=c.useRef(null),d=.01,h=7,y=Array.from({length:h},(p,o)=>{const b=o/h*i,l=(o+1)/h*i*1.5,m=10+o*20,k=50+o*30;return{minSpeed:b,maxSpeed:l,minFrequency:m,maxFrequency:k}}),f={minVolume:.008,maxVolume:.009,minSpeed:0,maxSpeed:40};return c.useEffect(()=>{n.current=new(window.AudioContext||window.AudioContext);const p=l=>{const m=n.current.createOscillator(),k=n.current.createGain();return k.gain.value=d,m.type=l,m.connect(k),k.connect(n.current.destination),m.start(),m.gainNode=k,m};r.current=[p("sawtooth"),p("square")];const o=n.current.createConvolver(),b=n.current.createGain();return b.gain.value=0,fetch("/reverb/ncVerb.wav").then(l=>{if(!l.ok)throw new Error("Network response was not ok "+l.statusText);return l.arrayBuffer()}).then(l=>n.current.decodeAudioData(l)).then(l=>{o.buffer=l}).catch(l=>{console.error("Failed to fetch and decode reverb impulse response:",l)}),r.current.forEach(l=>{l.gainNode.connect(o),o.connect(b),b.connect(n.current.destination)}),u.current=o,a.current=b,()=>{r.current.forEach(l=>{l.stop(),l.disconnect(),l.gainNode.disconnect()}),u.current&&u.current.disconnect(),a.current&&a.current.disconnect()}},[]),c.useEffect(()=>{if(a.current){const p=e?1:0;a.current.gain.setTargetAtTime(p,n.current.currentTime,.5)}},[e]),{updateEngineSound:p=>{const o=y.find(m=>p>=m.minSpeed&&p<m.maxSpeed)||y[y.length-1],b=(p-o.minSpeed)/(o.maxSpeed-o.minSpeed),l=o.minFrequency+(o.maxFrequency-o.minFrequency)*b;r.current.forEach((m,k)=>{m.frequency.setValueAtTime(l*(k+1),n.current.currentTime);const s=f.minVolume+(f.maxVolume-f.minVolume)*(p-f.minSpeed)/(f.maxSpeed-f.minSpeed);m.gainNode.gain.setValueAtTime(s,n.current.currentTime)})}}};function pe({isCurrentUserCar:i,carPosition:e,carRotation:n,carSpeed:r,containerWidth:u,containerHeight:a,carHeight:d,carWidth:h,max_speed:y,updateEngineSound:f,triggerJump:g,jumpDuration:p,checkCollision:o,socket:b,carId:l,defaultSpawnLocation:m}){const[k,s]=c.useState({top:m.y,left:m.x}),[q,U]=c.useState(m.rotation),w=c.useRef({x:0,y:0}),S=c.useRef(0),G=c.useRef(q),O=c.useRef(),x=c.useRef(performance.now()),H=c.useRef(0),P=.994,J=.01,X=L=>{const B={x:L.x*P,y:L.y*P};return Math.abs(B.x)<J&&(B.x=0),Math.abs(B.y)<J&&(B.y=0),B},z=c.useCallback(()=>{if(!i){s(e),U(n),f(r);return}const L=performance.now(),B=(L-x.current)/1e3;x.current=L,w.current=X(w.current),Math.abs(w.current.x)<.01&&(w.current.x=0),Math.abs(w.current.y)<.01&&(w.current.y=0);const W=Math.sqrt(w.current.x**2+w.current.y**2);if(W>y){const $=y/W;w.current.x*=$,w.current.y*=$}s($=>{let C=$.top+w.current.y*B*60,A=$.left+w.current.x*B*60;const R=o(C,A);if(R){if(R==="obstacle")return w.current.x=0,w.current.y=0,S.current=0,f(0),$;if(R==="wall")S.current-=.1,S.current<0&&(S.current=1);else if(R==="ramp"){let T=S.current;S.current=Math.min(T*1.01,y),g(),setTimeout(()=>{S.current=Math.min(S.current/1.001,y)},p)}}return C=Math.max(Math.min(C,a-d),0),A=Math.max(Math.min(A,u-h),0),b.emit("updateCarPosition",l,{top:C,left:A},G.current,S.current),{top:C,left:A}});const Q=Math.sqrt(w.current.x**2+w.current.y**2);f(Q),O.current=requestAnimationFrame(z)},[b,l,a,u,i,d,h,e,n,r,y,f,p,g,o]);return c.useEffect(()=>(O.current=requestAnimationFrame(z),()=>cancelAnimationFrame(O.current)),[z]),{position:k,setPosition:s,rotation:q,setRotation:U,velocity:w,speed:S,currentRotationRef:G,driftAngle:H,lastUpdateTime:x}}const me=(i,e)=>{const[n,r]=c.useState({scale:1,shadowOpacity:.5}),u=c.useCallback(()=>{let a=performance.now();const d=h=>{const y=h-a,f=Math.min(y/i,1),g=1+Math.sin(f*Math.PI)*(e-1),p=.5-Math.sin(f*Math.PI)*.5;r({scale:g,shadowOpacity:p}),f<1?requestAnimationFrame(d):r({scale:1,shadowOpacity:.5})};requestAnimationFrame(d)},[i,e]);return{jumpEffect:n,triggerJump:u}},he=(i,e,n,r,u,a,d,h,y,f)=>{const g=c.useCallback((p,o)=>{const l={top:p+10,left:o+10,bottom:p+i-10,right:o+e-10},m=s=>!(l.right<s.left||l.left>s.right||l.bottom<s.top||l.top>s.bottom);for(const s of n){const q={top:s.position.y,left:s.position.x,bottom:s.position.y+s.size.height,right:s.position.x+s.size.width};if(m(q))return f.scale>1?null:"obstacle"}for(const s of r){const q={top:s.position.y,left:s.position.x,bottom:s.position.y+s.size.height,right:s.position.x+s.size.width};if(m(q))return"wall"}for(const s of u){const q={top:s.position.y,left:s.position.x,bottom:s.position.y+s.size.height,right:s.position.x+s.size.width};if(m(q))return"ramp"}let k=!1;for(const s of a){const q={top:s.position.y,left:s.position.x,bottom:s.position.y+s.size.height,right:s.position.x+s.size.width};if(m(q)){k=!0;break}}return k?(h||y(!0),"tunnel"):(h&&y(!1),null)},[i,e,n,r,u,a,y,h,f]);return c.useEffect(()=>{h||d(!1)},[h,d]),{checkCollision:g}},te=i=>{c.useEffect(()=>{const e=document.getElementById(`throttle-${i}`);if(!e)return;const n=()=>{e.style.backgroundColor="green";const u=new KeyboardEvent("keydown",{key:"w"});window.dispatchEvent(u)},r=()=>{e.style.backgroundColor="";const u=new KeyboardEvent("keyup",{key:"w"});window.dispatchEvent(u)};return e.addEventListener("touchstart",n),e.addEventListener("touchend",r),()=>{e.removeEventListener("touchstart",n),e.removeEventListener("touchend",r)}},[i])};te.propTypes={carId:t.string};const ne=i=>{c.useEffect(()=>{const e=document.getElementById(`left-${i}`);if(!e)return;const n=()=>{e.style.backgroundColor="blue";const u=new KeyboardEvent("keydown",{key:"a"});window.dispatchEvent(u)},r=()=>{e.style.backgroundColor="";const u=new KeyboardEvent("keyup",{key:"a"});window.dispatchEvent(u)};return e.addEventListener("touchstart",n),e.addEventListener("touchend",r),()=>{e.removeEventListener("touchstart",n),e.removeEventListener("touchend",r)}},[i])};ne.propTypes={carId:t.string};const re=i=>{c.useEffect(()=>{const e=document.getElementById(`right-${i}`);if(!e)return;const n=()=>{e.style.backgroundColor="blue";const u=new KeyboardEvent("keydown",{key:"d"});window.dispatchEvent(u)},r=()=>{e.style.backgroundColor="";const u=new KeyboardEvent("keyup",{key:"d"});window.dispatchEvent(u)};return e.addEventListener("touchstart",n),e.addEventListener("touchend",r),()=>{e.removeEventListener("touchstart",n),e.removeEventListener("touchend",r)}},[i])};re.propTypes={carId:t.string};const oe=({currentSocketId:i,carId:e,speed:n,position:r})=>{(()=>{e&&(te(e),ne(e),re(e))})();let a=!1;const d={position:"absolute",top:`${r.top-25}px`,left:`${r.left-100}px`,fontSize:"2.5rem",fontWeight:"bold"},h={display:a?"none":"block",zIndex:1e3,position:"absolute",top:`${r.top-100}px`,left:`${r.left- -100}px`,fontSize:"2.5rem",fontWeight:"bold"},y={zIndex:1e3,position:"absolute",top:`${r.top-100}px`,left:`${r.left-100}px`,fontSize:"2.5rem",fontWeight:"bold"},f={zIndex:1e3,position:"absolute",top:`${r.top- -50}px`,left:`${r.left-100}px`,fontSize:"2.5rem",fontWeight:"bold"};return c.useEffect(()=>{const g=o=>{o.preventDefault()},p=document.querySelectorAll(`#throttle-${e}, #brake-${e}, #left-${e}, #right-${e}`);return p.forEach(o=>{o.addEventListener("contextmenu",g),o.addEventListener("touchstart",g),o.addEventListener("touchmove",g),o.addEventListener("touchend",g)}),()=>{p.forEach(o=>{o.removeEventListener("contextmenu",g),o.removeEventListener("touchstart",g),o.removeEventListener("touchmove",g),o.removeEventListener("touchend",g)})}},[e]),i===e&&v.jsxs(v.Fragment,{children:[(a=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))&&v.jsxs(v.Fragment,{children:[v.jsx("button",{id:`throttle-${e}`,style:h,children:"Go"}),v.jsx("button",{id:`brake-${e}`,style:y,children:"Stop"}),v.jsx("button",{id:`left-${e}`,style:{...f,left:`${r.left-60}px`},children:"L"}),v.jsx("button",{id:`right-${e}`,style:{...f,left:`${r.left- -120}px`},children:"R"})]}),v.jsxs("div",{style:d,children:[Math.round(n.current*16.23694/2)," mph"]})]})};oe.propTypes={currentSocketId:t.string.isRequired,carId:t.string.isRequired,speed:t.object.isRequired,position:t.shape({top:t.number,left:t.number}).isRequired};const ye="/assets/racecar-BoSl31fg.png",ge=i=>{const e=c.useRef();return c.useEffect(()=>{e.current=i}),e.current},se=({carId:i,position:e,rotation:n,jumpEffect:r,isCurrentUserCar:u})=>{const a=ge(n),d=50,h=100,[y,f]=c.useState(n);c.useEffect(()=>{if(a!==void 0){let b=n-a;b>180?b-=360:b<-180&&(b+=360),f(a+b)}else f(n)},[n,a]);const g=(y+360)%360;let p={zIndex:u?1:0,border:"1px solid black",height:`${d}px`,width:`${h}px`,textAlign:"center",position:"absolute",top:`${e.top}px`,left:`${e.left}px`,transform:`rotate(${g}deg) scale(${r.scale})`,transition:"transform 0.1s ease-out",animation:u?"shake 0.1s linear infinite":"none"},o={position:"absolute",top:"5px",left:"5px",right:"5px",bottom:"5px",borderRadius:"50%",backgroundColor:"rgba(0, 0, 0, 0.5)",opacity:r.shadowOpacity,transition:"opacity 0.3s ease-out"};return v.jsx(v.Fragment,{children:v.jsxs("div",{className:"car",id:`car-id-${i}`,style:p,children:[v.jsx("div",{style:o}),v.jsx("img",{alt:"race car",src:ye,style:{position:"absolute",width:"50px",top:"-21px",left:"18px",transform:"rotate(90deg)"}})]})})};se.propTypes={carId:t.string.isRequired,position:t.shape({top:t.number,left:t.number}).isRequired,rotation:t.number.isRequired,jumpEffect:t.shape({scale:t.number,shadowOpacity:t.number}).isRequired,isCurrentUserCar:t.bool.isRequired,defaultSpawnPosition:t.shape({top:t.number,left:t.number}).isRequired};const be=(i,e)=>{const n=c.useRef({w:!1,a:!1,s:!1,d:!1}),r=c.useCallback((u,a)=>{if(i!==e)return;const d=u.key.toLowerCase(),h=u.key;let y=document.getElementById(`throttle-${i}`),f=document.getElementById(`left-${i}`),g=document.getElementById(`right-${i}`),p=document.getElementById(`brake-${i}`);y&&d==="w"&&(y.style.backgroundColor=a?"green":""),f&&d==="a"&&(f.style.backgroundColor=a?"blue":""),g&&d==="d"&&(g.style.backgroundColor=a?"blue":""),p&&d==="s"&&(p.style.backgroundColor=a?"red":""),["w","a","s","d"].includes(d)&&(n.current[d]=a),["ArrowUp","ArrowLeft","ArrowDown","ArrowRight"].includes(h)&&(n.current[h]=a)},[i,e]);return c.useEffect(()=>{const u=d=>r(d,!0),a=d=>r(d,!1);return window.addEventListener("keydown",u),window.addEventListener("keyup",a),()=>{window.removeEventListener("keydown",u),window.removeEventListener("keyup",a)}},[r]),n};function we({carId:i,currentSocketId:e,containerWidth:n,containerHeight:r,carPosition:u,carRotation:a,carSpeed:d,isCurrentUserCar:h,obstacles:y,walls:f,ramps:g,tunnels:p,inTunnel:o,setInTunnel:b,IsReverbEnabled:l,setIsReverbEnabled:m,defaultSpawnLocation:k}){const s=de(),q={top:100,left:100},U=100,w=50,S=20,G=250,O=2.8;document.getElementById(`throttle-${i}`);const x=be(i,e),H=c.useRef(),{updateEngineSound:P}=fe(S,!l),{jumpEffect:J,triggerJump:X}=me(G,O),[z,L]=c.useState(!1),{checkCollision:B}=he(w,U,y,f,g,p,m,o,b,J);c.useEffect(()=>{o?(m(!0),b(!0)):(m(!1),b(!1))},[o,b,m]);const{position:W,setPosition:Q,rotation:$,setRotation:C,velocity:A,speed:R,currentRotationRef:T,driftAngle:Y}=pe({isCurrentUserCar:h,carPosition:u,carRotation:a,carSpeed:d,containerWidth:n,containerHeight:r,carHeight:w,carWidth:U,max_speed:S,updateEngineSound:P,triggerJump:X,jumpDuration:G,checkCollision:B,socket:s,carId:i,defaultSpawnLocation:k}),V=E=>(E=E%360,E>180?E-=360:E<=-180&&(E+=360),E),I=c.useCallback((E,j)=>{E=V(E),j=V(j);let F=j-E;return F>180?F-=360:F<-180&&(F+=360),V(E+F)},[]),_=c.useCallback(()=>{if(!h){Q(u),C(E=>I(E,V(a))),P(d);return}},[u,a,d,h,Q,C,P,I]);return c.useEffect(()=>{const E=()=>{j(),F(),ie(),ue()},j=()=>{(x.current.a||x.current.ArrowLeft)&&C(M=>{const N=M+(z?1.5:-1.5);return I(M,V(N))}),(x.current.d||x.current.ArrowRight)&&C(M=>{const N=M+(z?-1.5:1.5);return I(M,V(N))}),!(x.current.a||x.current.ArrowLeft)&&!(x.current.d||x.current.ArrowRight)&&(Y.current=0)},F=()=>{(x.current.w||x.current.ArrowUp)&&(D=S,L(!1))},ie=()=>{x.current.s||x.current.ArrowDown?R.current>0?(D=R.current-ee,D<0&&(L(!0),D=0)):D=Math.max(R.current-Z,-S/4):L(!1)},ce=()=>{let K=T.current*Math.PI/180,M=Y.current*Math.PI/180,N=K+M;A.current.x=Math.cos(N)*R.current,A.current.y=Math.sin(N)*R.current},ue=()=>{let K=D-R.current,M=K>0?Math.min(K,ae):Math.max(K,-Z);!x.current.w&&!x.current.ArrowUp&&R.current>0&&(M=-Z),x.current.s&&R.current>0&&(M=-ee),R.current+=M,ce()},ae=.02,Z=.01,ee=.04;let D=0;const le=setInterval(E,15);return()=>clearInterval(le)},[T,Y,C,R,A,x,I,z,L]),c.useEffect(()=>{T.current=$,(()=>{const j=Math.sqrt(A.current.x**2+A.current.y**2),F=$*Math.PI/180;A.current.x=Math.cos(F)*j,A.current.y=Math.sin(F)*j})()},[T,$,A]),c.useEffect(()=>(H.current=requestAnimationFrame(_),()=>cancelAnimationFrame(H.current)),[_]),v.jsxs(v.Fragment,{children:[v.jsx(oe,{currentSocketId:e,carId:i,speed:R,position:W}),v.jsx("div",{children:v.jsx(se,{carId:i,position:W,rotation:$,jumpEffect:J,isCurrentUserCar:h,defaultSpawnPosition:q})})]})}we.propTypes={carId:t.string.isRequired,currentSocketId:t.string.isRequired,containerWidth:t.number.isRequired,containerHeight:t.number.isRequired,carPosition:t.shape({top:t.number,left:t.number}).isRequired,carRotation:t.number,carSpeed:t.number,isCurrentUserCar:t.bool.isRequired,obstacles:t.array,walls:t.array,ramps:t.array,IsReverbEnabled:t.bool,setIsReverbEnabled:t.func,tunnels:t.array,defaultSpawnLocation:t.shape({top:t.number,left:t.number,rotation:t.number}),inTunnel:t.bool,setInTunnel:t.func};export{we as default};