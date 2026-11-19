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


/* ---------- Shared Memories: Cloudinary via the Cloudflare Worker ---------- */
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
{id:"adiyogi-standing",src:"assets/adiyogi-standing.jpg",caption:"Standing together at Adiyogi ♡"}
];

const gallery=document.getElementById('gallery');
const countText=document.getElementById('countText');
const restoreBtn=document.getElementById('restoreBtn');
const input=document.getElementById('photoInput');
const picked=document.getElementById('picked');
const addBtn=document.getElementById('addBtn');
const capInput=document.getElementById('captionInput');
const adminPassword=document.getElementById('adminPassword');
const form=document.getElementById('addForm');
let cloudMemories=[];
let pending=[];

/* Keep hiding of the original bundled photos local to this browser only.
   Newly uploaded Cloudinary photos are shared with every visitor. */
const HIDDEN_KEY='padmapriya-hidden-default-memories';
function hiddenDefaults(){
  try { return JSON.parse(localStorage.getItem(HIDDEN_KEY)||'[]'); }
  catch { return []; }
}
function saveHiddenDefaults(list){
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(list));
}
function visibleList(){
  const hidden=hiddenDefaults();
  const defaults=DEFAULTS.filter(m=>!hidden.includes(m.id));
  return cloudMemories.slice().reverse().concat(defaults);
}
function render(){
  const list=visibleList();
  gallery.textContent='';
  if(!list.length){
    const e=document.createElement('p');
    e.className='empty';
    e.textContent='No memories here yet. Add your first photo above ♡';
    gallery.appendChild(e);
  }
  list.forEach(m=>gallery.appendChild(card(m)));
  countText.textContent=list.length+(list.length===1?' memory':' memories');
  const hiddenCount=hiddenDefaults().length;
  restoreBtn.hidden=hiddenCount===0;
  restoreBtn.textContent='Bring back '+hiddenCount+' removed '+(hiddenCount===1?'photo':'photos');
}
function card(m){
  const fig=document.createElement('figure');
  const frame=document.createElement('div');
  frame.className='frame';
  const img=document.createElement('img');
  img.src=m.src;
  img.alt=m.caption||'A memory together';
  img.loading='lazy';
  const del=document.createElement('button');
  del.type='button'; del.className='del';
  del.textContent='×';
  del.setAttribute('aria-label','Delete memory: '+(m.caption||'photo'));
  del.addEventListener('click', async ()=>{
    if(m.cloud){
      if(!confirm('Delete this shared memory for everyone?')) return;
      const password=window.prompt('Enter the gallery administrator password to delete this photo:');
      if(!password) return;
      del.disabled=true;
      try{
        const response=await fetch('/api/memories/'+encodeURIComponent(m.id),{
          method:'DELETE',headers:{'Authorization':'Bearer '+password}
        });
        const data=await response.json().catch(()=>({}));
        if(!response.ok) throw new Error(data.error||'Delete failed');
        await loadCloudMemories();
        toast('Shared memory deleted');
      }catch(err){toast(err.message||'Could not delete photo');del.disabled=false}
    } else {
      if(!confirm('Hide this original bundled photo on this browser?')) return;
      const hidden=hiddenDefaults();
      if(!hidden.includes(m.id)) hidden.push(m.id);
      saveHiddenDefaults(hidden);
      render();
      toast('Photo hidden on this browser');
    }
  });
  frame.append(img,del);
  const cap=document.createElement('figcaption');
  cap.textContent=m.caption||'';
  fig.append(frame,cap);
  return fig;
}
async function loadCloudMemories(){
  try{
    const response=await fetch('/api/memories',{headers:{'Accept':'application/json'}});
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||'Could not load shared memories');
    cloudMemories=Array.isArray(data.memories)?data.memories:[];
    render();
  }catch(err){
    console.error(err);
    toast('Could not load shared photos. Please refresh the page.');
  }
}
restoreBtn.addEventListener('click',()=>{
  localStorage.removeItem(HIDDEN_KEY);
  render();
  toast('Original photos restored on this browser ♡');
});

/* Prepare small previews before upload; the Worker enforces its own size limit too. */
function loadImage(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file);
    const image=new Image();
    image.onload=()=>{URL.revokeObjectURL(url);resolve(image)};
    image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Invalid image'))};
    image.src=url;
  });
}
async function shrink(file){
  const image=await loadImage(file);
  const max=1600;
  const scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');
  canvas.width=Math.round(image.naturalWidth*scale);
  canvas.height=Math.round(image.naturalHeight*scale);
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  return await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.84));
}
input.addEventListener('change',()=>{
  pending=Array.from(input.files||[]).slice(0,8);
  picked.textContent='';
  pending.forEach(file=>{
    const li=document.createElement('li');
    const image=document.createElement('img');
    image.alt='';
    image.src=URL.createObjectURL(file);
    image.onload=()=>URL.revokeObjectURL(image.src);
    li.appendChild(image); picked.appendChild(li);
  });
  addBtn.disabled=pending.length===0;
  addBtn.textContent=pending.length>1?'Upload '+pending.length+' memories ♥':'Upload to shared memories ♥';
});
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!pending.length) return;
  const password=adminPassword.value;
  if(!password){toast('Enter the gallery administrator password first.');adminPassword.focus();return;}
  addBtn.disabled=true; addBtn.textContent='Uploading…';
  const caption=capInput.value.trim();
  let uploaded=0;
  try{
    for(const file of pending){
      const blob=await shrink(file);
      const formData=new FormData();
      formData.append('photo',blob, file.name.replace(/\.[^.]+$/,'')+'.jpg');
      formData.append('caption',caption || file.name.replace(/\.[^.]+$/,''));
      const response=await fetch('/api/memories/upload',{
        method:'POST',
        headers:{'Authorization':'Bearer '+password},
        body:formData
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error||'Upload failed');
      uploaded++;
    }
    pending=[]; input.value=''; capInput.value=''; adminPassword.value=''; picked.textContent='';
    await loadCloudMemories();
    toast(uploaded===1?'Memory shared with everyone ♡':uploaded+' memories shared with everyone ♡');
  }catch(err){
    toast(err.message||'Upload failed. Check your connection and try again.');
  }finally{
    addBtn.textContent='Add to memories ♥';
    addBtn.disabled=pending.length===0;
  }
});
loadCloudMemories();

/* ---------- Soundtrack and final question ---------- */

const file=document.getElementById('audioFile'),player=document.getElementById('audioPlayer');let audioUrl;
file.addEventListener('change',()=>{if(audioUrl)URL.revokeObjectURL(audioUrl);const f=file.files[0];if(f){audioUrl=URL.createObjectURL(f);player.src=audioUrl;player.load()}});
const response=document.getElementById('response');
document.getElementById('yesBtn').addEventListener('click',()=>{response.textContent="You just made my heart smile. Here's to us, today and always! ♡"});
document.getElementById('againBtn').addEventListener('click',()=>{response.textContent="Padmapriya, will you keep making beautiful memories with me? ♡"});

render();
loadState().then(render);
