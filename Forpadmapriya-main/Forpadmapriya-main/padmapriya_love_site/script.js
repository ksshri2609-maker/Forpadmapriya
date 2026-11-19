const reasons=[
"Your smile can make an ordinary day feel beautiful.","You make even simple moments feel special.","You listen to me with patience.","Your kindness inspires me.","You make me laugh when I need it most.","You are my favourite person to talk to.","Your presence makes everything feel calmer.","You make little memories unforgettable.","You encourage me to become better.","You are beautiful in your own way.",
"Your laugh is one of my favourite sounds.","You understand the little things about me.","You make ordinary days brighter.","You stand beside me through ups and downs.","You make me feel appreciated.","You have a heart full of warmth.","You make every journey more meaningful.","You are someone I can be myself with.","You turn small plans into lovely memories.","You make me look forward to tomorrow.",
"I love the way your eyes light up.","You bring comfort without even trying.","You make me smile at my phone.","You are thoughtful in countless ways.","You make distance feel smaller.","You make every celebration sweeter.","You are my favourite hello.","You make silence comfortable.","You remind me to keep dreaming.","You make life feel like an adventure.",
"Your hugs feel like home.","You notice details others miss.","You make me proud.","You are strong even on difficult days.","You bring joy into my routine.","You make me believe in us.","You make every photo meaningful.","You are my favourite teammate.","You make the future exciting.","You are wonderfully you.",
"I love sharing stories with you.","You make me feel understood.","You bring out my playful side.","You make time pass too quickly.","You are worth every effort.","You make rainy days feel cosy.","You have a lovely way of caring.","You make new places feel familiar.","You make our memories priceless.","You are the person I want beside me.",
"You make me believe in little miracles.","You inspire me with your courage.","You make even a short call special.","You are my favourite notification.","You make me grateful for today.","You bring peace to my heart.","You make every milestone sweeter.","You are patient with my silly jokes.","You make me want to plan more adventures.","You make our story uniquely ours.",
"I love your honest opinions.","You make me feel lucky.","You turn mistakes into lessons with me.","You make me feel at home.","You are full of surprises.","You make every reunion special.","You make me cherish the present.","You make my world softer.","You make me want to be more thoughtful.","You are my favourite memory in the making.",
"You care in ways that matter.","You make the little things count.","You make me laugh until my cheeks hurt.","You are a beautiful part of my life.","You make hard days easier.","You remind me what matters.","You make every shared meal better.","You make plans worth waiting for.","You are my favourite adventure.","You make my heart smile.",
"I love how we keep learning together.","You make the simplest photographs precious.","You are my partner in silly moments.","You make every achievement worth celebrating.","You bring hope to my plans.","You make me feel seen.","You are special beyond words.","You make me excited for all our tomorrows.","You are the reason behind so many smiles.","You make our little universe beautiful.",
"I love the memories we have made.","I love the dreams we are building.","I love growing alongside you.","I love choosing you every day.","Most of all, I love you for being Padmapriya."
];
let current=0;
const count=document.getElementById('reasonCount'),reason=document.getElementById('reasonText');
function showReason(i){current=i;count.textContent='REASON '+(i+1)+' OF 100';reason.textContent=reasons[i]}
document.getElementById('nextReason').addEventListener('click',()=>showReason((current+1)%100));
document.getElementById('randomReason').addEventListener('click',()=>{let n=Math.floor(Math.random()*100);if(n===current)n=(n+1)%100;showReason(n)});

const toggle=document.getElementById('menuToggle'),nav=document.getElementById('nav');
toggle.addEventListener('click',()=>{const o=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(o))});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));

const toastEl=document.getElementById('toast');let toastTimer;
function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2600)}

/* ---------- Memories: add and delete ---------- */
const DEFAULTS=[
{id:"memory-selfie",src:"assets/memory-selfie.jpg",caption:"A memory made with love"},
{id:"favourite-person",src:"assets/favourite-person.jpg",caption:"My favourite person ♡"},
{id:"matching-tattoos",src:"assets/matching-tattoos.jpg",caption:"A tiny symbol of our forever"},
{id:"couple-collage",src:"assets/couple-collage.jpg",caption:"Same dreams, bigger goals — together"},
{id:"waterpark-memory",src:"assets/waterpark-memory.jpg",caption:"One of my favourite moments"},
{id:"beach-memory-1",src:"assets/beach-memory-1.jpg",caption:"Our little seaside moment ♡"},
{id:"closeup-memory-1",src:"assets/closeup-memory-1.jpg",caption:"Close to you, always"},
{id:"beach-memory-2",src:"assets/beach-memory-2.jpg",caption:"Your smile makes every moment brighter"},
{id:"closeup-memory-2",src:"assets/closeup-memory-2.jpg",caption:"Just us, and a thousand little memories"},
{id:"adiyogi-together-1",src:"assets/adiyogi-together-1.jpg",caption:"A beautiful day together at Adiyogi ♡"},
{id:"adiyogi-together-2",src:"assets/adiyogi-together-2.jpg",caption:"Standing together, making memories"},
{id:"adiyogi-selfie",src:"assets/adiyogi-selfie.jpg",caption:"A little selfie from our special day"},
{id:"movie-date-memory",src:"assets/movie-date-memory.jpg",caption:"Another lovely moment with you ♡"},
{id:"bougainvillea-together",src:"assets/bougainvillea-together.jpg",caption:"Among the flowers, right beside you ♡"},
{id:"window-selfie",src:"assets/window-selfie.jpg",caption:"Close together, wherever we are"},
{id:"beach-smile",src:"assets/beach-smile.jpg",caption:"Your smile, the sea and me ♡"},
{id:"adiyogi-poster-selfie",src:"assets/adiyogi-poster-selfie.jpg",caption:"Another selfie, another happy day"},
{id:"movie-seat-selfie",src:"assets/movie-seat-selfie.jpg",caption:"Movie date with my favourite person"},
{id:"adiyogi-standing",src:"assets/adiyogi-standing.jpg",caption:"Standing together at Adiyogi ♡"},
];
const DB_NAME='padmapriya-memories',STORE='kv',KEY='state';
let state={added:[],removed:[]};
let dbPromise=null;
function openDb(){
  if(!dbPromise)dbPromise=new Promise((res,rej)=>{
    try{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}
  });
  return dbPromise;
}
async function loadState(){
  try{
    const db=await openDb();
    const v=await new Promise((res,rej)=>{const q=db.transaction(STORE).objectStore(STORE).get(KEY);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
    if(v&&Array.isArray(v.added)&&Array.isArray(v.removed))state=v;
  }catch(e){}
}
async function saveState(){
  try{
    const db=await openDb();
    await new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(state,KEY);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)});
    return true;
  }catch(e){toast('Could not save on this device, so changes may be lost when you leave.');return false}
}

const gallery=document.getElementById('gallery'),countText=document.getElementById('countText'),restoreBtn=document.getElementById('restoreBtn');
function visibleList(){
  const defs=DEFAULTS.filter(d=>!state.removed.includes(d.id));
  return state.added.slice().reverse().concat(defs);
}
function render(){
  const list=visibleList();
  gallery.textContent='';
  if(!list.length){
    const e=document.createElement('p');e.className='empty';e.textContent='No memories here yet. Add your first photo above ♡';gallery.appendChild(e);
  }
  list.forEach(m=>gallery.appendChild(card(m)));
  countText.textContent=list.length+(list.length===1?' memory':' memories');
  const n=state.removed.length;
  restoreBtn.hidden=n===0;
  restoreBtn.textContent='Bring back '+n+' removed '+(n===1?'photo':'photos');
}
function card(m){
  const fig=document.createElement('figure');
  const frame=document.createElement('div');frame.className='frame';
  const img=document.createElement('img');img.src=m.src;img.alt=m.caption||'A memory together';img.loading='lazy';
  const del=document.createElement('button');del.type='button';del.className='del';del.textContent='×';del.setAttribute('aria-label','Delete memory: '+(m.caption||'photo'));
  del.addEventListener('click',()=>{
    if(frame.querySelector('.confirm'))return;
    const c=document.createElement('div');c.className='confirm';
    const p=document.createElement('p');p.textContent='Delete this memory?';
    const row=document.createElement('div');row.className='row';
    const yes=document.createElement('button');yes.type='button';yes.className='button yes';yes.textContent='Delete';
    const no=document.createElement('button');no.type='button';no.className='button no';no.textContent='Keep it';
    no.addEventListener('click',()=>{c.remove();del.focus()});
    yes.addEventListener('click',()=>removeMemory(m));
    row.append(yes,no);c.append(p,row);frame.appendChild(c);no.focus();
  });
  frame.append(img,del);
  const cap=document.createElement('figcaption');cap.textContent=m.caption||'';
  fig.append(frame,cap);
  return fig;
}
async function removeMemory(m){
  if(m.custom)state.added=state.added.filter(a=>a.id!==m.id);
  else if(!state.removed.includes(m.id))state.removed.push(m.id);
  render();
  const ok=await saveState();
  if(ok)toast('Memory deleted');
}
restoreBtn.addEventListener('click',async()=>{state.removed=[];render();if(await saveState())toast('Photos brought back ♡')});

/* Add: resize on the phone so saved photos stay small */
const input=document.getElementById('photoInput'),picked=document.getElementById('picked'),addBtn=document.getElementById('addBtn'),capInput=document.getElementById('captionInput'),form=document.getElementById('addForm');
let pending=[];
function loadImage(file){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file);const im=new Image();
    im.onload=()=>{URL.revokeObjectURL(url);res(im)};
    im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('bad image'))};
    im.src=url;
  });
}
async function shrink(file){
  const im=await loadImage(file);
  const max=1280,s=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight));
  const w=Math.round(im.naturalWidth*s),h=Math.round(im.naturalHeight*s);
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;
  cv.getContext('2d').drawImage(im,0,0,w,h);
  return cv.toDataURL('image/jpeg',0.82);
}
input.addEventListener('change',()=>{
  pending=Array.from(input.files||[]);
  picked.textContent='';
  pending.slice(0,8).forEach(f=>{const li=document.createElement('li');const im=document.createElement('img');im.alt='';im.src=URL.createObjectURL(f);im.onload=()=>URL.revokeObjectURL(im.src);li.appendChild(im);picked.appendChild(li)});
  addBtn.disabled=pending.length===0;
  addBtn.textContent=pending.length>1?'Add '+pending.length+' memories ♥':'Add to memories ♥';
});
form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!pending.length)return;
  addBtn.disabled=true;addBtn.textContent='Adding…';
  const caption=capInput.value.trim()||'A new memory ♡';
  let added=0;
  for(const f of pending){
    try{state.added.push({id:'u'+Date.now()+'-'+Math.random().toString(36).slice(2,7),src:await shrink(f),caption:caption,custom:true});added++}catch(err){}
  }
  pending=[];input.value='';capInput.value='';picked.textContent='';
  addBtn.textContent='Add to memories ♥';addBtn.disabled=true;
  render();
  if(!added){toast('That file could not be read as a photo. Try a JPG or PNG.');return}
  if(await saveState())toast(added===1?'Memory added ♡':added+' memories added ♡');
});

/* ---------- Soundtrack and final question ---------- */
const file=document.getElementById('audioFile'),player=document.getElementById('audioPlayer');let audioUrl;
file.addEventListener('change',()=>{if(audioUrl)URL.revokeObjectURL(audioUrl);const f=file.files[0];if(f){audioUrl=URL.createObjectURL(f);player.src=audioUrl;player.load()}});
const response=document.getElementById('response');
document.getElementById('yesBtn').addEventListener('click',()=>{response.textContent="You just made my heart smile. Here's to us, today and always! ♡"});
document.getElementById('againBtn').addEventListener('click',()=>{response.textContent="Padmapriya, will you keep making beautiful memories with me? ♡"});

render();
loadState().then(render);
