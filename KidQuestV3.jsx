import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   KIDQUEST v3  —  Multi-User · Firebase · PIN Login · Pet Shop
   ═══════════════════════════════════════════════════════════════════

   FIREBASE SETUP (takes ~10 minutes):
   ─────────────────────────────────────
   1. Go to https://console.firebase.google.com
   2. Click "Add project" → name it "KidQuest" → create
   3. In the left sidebar: Build → Realtime Database → Create database
      → Start in TEST MODE (you can add security rules later)
      → Copy the database URL (looks like https://kidquest-xxxxx-default-rtdb.firebaseio.com)
   4. Go to Project Settings (gear icon) → General → Your apps → </> Web
      → Register app → copy the firebaseConfig object values below
   5. Replace the FIREBASE_CONFIG values below with your actual values
   ═══════════════════════════════════════════════════════════════════ */

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBIsFxke5iu2xCSkwUw47XmfZ-B4upCr2Y",
  databaseURL:       "https://kidquest---chore-game-default-rtdb.firebaseio.com",
  projectId:         "kidquest---chore-game",
};

// Set to true once you've filled in real Firebase config above
const FIREBASE_ENABLED = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const TASK_LIBRARY = [
  { id:"t1",  name:"Make Bed",            emoji:"🛏️", points:5,  cat:"Room"     },
  { id:"t2",  name:"Brush Teeth",         emoji:"🦷", points:5,  cat:"Hygiene"  },
  { id:"t3",  name:"Put Away Toys",       emoji:"🧸", points:5,  cat:"Room"     },
  { id:"t4",  name:"Set the Table",       emoji:"🍽️", points:10, cat:"Kitchen"  },
  { id:"t5",  name:"Clear the Table",     emoji:"🧹", points:10, cat:"Kitchen"  },
  { id:"t6",  name:"Feed Pet",            emoji:"🐕", points:10, cat:"Chores"   },
  { id:"t7",  name:"Water Plants",        emoji:"🌱", points:10, cat:"Chores"   },
  { id:"t8",  name:"Read 20 min",         emoji:"📚", points:15, cat:"Learning" },
  { id:"t9",  name:"Homework Done",       emoji:"✏️", points:20, cat:"Learning" },
  { id:"t10", name:"Take Out Trash",      emoji:"🗑️", points:15, cat:"Chores"   },
  { id:"t11", name:"Sort Laundry",        emoji:"👕", points:10, cat:"Chores"   },
  { id:"t12", name:"Wash Hands",          emoji:"🧼", points:5,  cat:"Hygiene"  },
  { id:"t13", name:"Practice Instrument", emoji:"🎵", points:20, cat:"Learning" },
  { id:"t14", name:"Exercise Outside",    emoji:"⚽", points:15, cat:"Health"   },
  { id:"t15", name:"Tidy Clothes",        emoji:"🧺", points:5,  cat:"Room"     },
  { id:"t16", name:"Unload Dishwasher",   emoji:"🍴", points:15, cat:"Kitchen"  },
];

const PET_SPECIES = [
  { id:"dragon",  name:"Dragon",    stages:["🥚","🐣","🐲","🔥🐉🔥"], color:"#ef4444" },
  { id:"wolf",    name:"Wolf Pup",  stages:["🐾","🐶","🐺","⚡🐺⚡"], color:"#6366f1" },
  { id:"cat",     name:"Magic Cat", stages:["✨","🐱","😺","🌟😸🌟"], color:"#8b5cf6" },
  { id:"dino",    name:"Dino",      stages:["🥚","🦕","🦖","💥🦖💥"], color:"#10b981" },
  { id:"robot",   name:"Robot Pal", stages:["⚙️","🤖","🦾","🚀🤖🚀"], color:"#0ea5e9" },
  { id:"phoenix", name:"Phoenix",   stages:["🪺","🐦","🦜","🔥🦅🔥"], color:"#f97316" },
];

const PET_THRESHOLDS = [0, 75, 200, 450];

const SHOP_ITEMS = [
  { id:"s1", name:"Cool Hat",      emoji:"🎩", cost:30,  cat:"Accessory", slot:"hat"  },
  { id:"s2", name:"Party Hat",     emoji:"🥳", cost:20,  cat:"Accessory", slot:"hat"  },
  { id:"s3", name:"Crown",         emoji:"👑", cost:80,  cat:"Accessory", slot:"hat"  },
  { id:"s4", name:"Cape",          emoji:"🦸", cost:60,  cat:"Accessory", slot:"neck" },
  { id:"s5", name:"Gold Medal",    emoji:"🏅", cost:100, cat:"Accessory", slot:"neck" },
  { id:"h1", name:"Cozy Den",      emoji:"🏠", cost:50,  cat:"Home",      slot:"home" },
  { id:"h2", name:"Castle",        emoji:"🏰", cost:150, cat:"Home",      slot:"home" },
  { id:"h3", name:"Space Station", emoji:"🛸", cost:200, cat:"Home",      slot:"home" },
  { id:"a1", name:"Ball",          emoji:"⚽", cost:20,  cat:"Toy",       slot:"toy"  },
  { id:"a2", name:"Rocket Ship",   emoji:"🚀", cost:90,  cat:"Toy",       slot:"toy"  },
  { id:"a3", name:"Treasure Chest",emoji:"💰", cost:120, cat:"Toy",       slot:"toy"  },
  { id:"f1", name:"Steak Dinner",  emoji:"🥩", cost:15,  cat:"Treat",     slot:null   },
  { id:"f2", name:"Birthday Cake", emoji:"🎂", cost:25,  cat:"Treat",     slot:null   },
];

const MILESTONES = [
  { pts:50,   label:"Rookie Hero",   emoji:"⭐", color:"#f59e0b" },
  { pts:100,  label:"Quest Seeker",  emoji:"⚔️", color:"#10b981" },
  { pts:200,  label:"Star Champion", emoji:"🏆", color:"#3b82f6" },
  { pts:500,  label:"Dragon Slayer", emoji:"🐲", color:"#8b5cf6" },
  { pts:1000, label:"LEGEND",        emoji:"👑", color:"#ef4444" },
];

const WEEK_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getWeekKey() {
  const d = new Date(), day = d.getDay();
  const diff = d.getDate() - day + (day===0 ? -6 : 1);
  return new Date(new Date().setDate(diff)).toISOString().split("T")[0];
}
function getTodayIdx() { const d = new Date().getDay(); return d===0?6:d-1; }
function getPetStage(pts) {
  let s=0; for(let i=PET_THRESHOLDS.length-1;i>=0;i--) if(pts>=PET_THRESHOLDS[i]){s=i;break;} return s;
}
function getPetStageLabel(s) { return ["Egg 🥚","Baby 🐣","Teen ⚡","LEGENDARY 🔥"][s]; }
function hexRgb(hex) { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`; }
function makeFamilyCode() { return Math.random().toString(36).slice(2,8).toUpperCase(); }
function makePIN() { return Math.floor(1000+Math.random()*9000).toString(); }

// ─── FIREBASE BRIDGE ─────────────────────────────────────────────────────────
// Thin wrapper — swaps between real Firebase and localStorage fallback
class DB {
  constructor() { this._listeners = {}; this._local = {}; }

  async init() {
    if (!FIREBASE_ENABLED) return;
    // Dynamically load Firebase SDK
    if (!window._firebaseApp) {
      await this._loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
      await this._loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js");
      window._firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    }
    this._db = firebase.database();
  }

  _loadScript(src) {
    return new Promise((res,rej)=>{
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej;
      document.head.appendChild(s);
    });
  }

  async get(path) {
    if (this._db) {
      const snap = await this._db.ref(path).get();
      return snap.exists() ? snap.val() : null;
    }
    return this._local[path] ?? null;
  }

  async set(path, value) {
    if (this._db) return this._db.ref(path).set(value);
    this._local[path] = value;
    this._notify(path, value);
  }

  async update(path, value) {
    if (this._db) return this._db.ref(path).update(value);
    this._local[path] = { ...(this._local[path]||{}), ...value };
    this._notify(path, this._local[path]);
  }

  subscribe(path, cb) {
    if (this._db) {
      const ref = this._db.ref(path);
      ref.on("value", snap => cb(snap.exists() ? snap.val() : null));
      return () => ref.off("value");
    }
    if (!this._listeners[path]) this._listeners[path]=[];
    this._listeners[path].push(cb);
    cb(this._local[path]??null);
    return () => { this._listeners[path]=this._listeners[path].filter(f=>f!==cb); };
  }

  _notify(path, val) {
    (this._listeners[path]||[]).forEach(f=>f(val));
    // also notify parent paths
    const parts = path.split("/");
    for(let i=parts.length-1;i>0;i--){
      const p = parts.slice(0,i).join("/");
      if(this._listeners[p]) {
        const v = this._local[p]??null;
        this._listeners[p].forEach(f=>f(v));
      }
    }
  }
}

const db = new DB();

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Confetti({ active, onDone }) {
  const [p, setP] = useState([]);
  useEffect(()=>{
    if(!active) return;
    setP(Array.from({length:60},(_,i)=>({
      id:i, x:Math.random()*100,
      color:["#fbbf24","#ef4444","#10b981","#3b82f6","#8b5cf6","#f97316","#ec4899"][i%7],
      size:6+Math.random()*10, delay:Math.random()*0.8, dur:1.5+Math.random(), rot:Math.random()*360,
    })));
    const t = setTimeout(()=>{ setP([]); onDone&&onDone(); }, 3000);
    return ()=>clearTimeout(t);
  },[active]);
  if(!p.length) return null;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {p.map(pp=>(
        <div key={pp.id} style={{position:"absolute",left:`${pp.x}%`,top:-20,width:pp.size,height:pp.size,
          backgroundColor:pp.color,borderRadius:pp.id%2?"50%":"3px",
          animation:`kqfall ${pp.dur}s ${pp.delay}s ease-in forwards`,transform:`rotate(${pp.rot}deg)`}}/>
      ))}
      <style>{`@keyframes kqfall{to{transform:translateY(105vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  );
}

// ─── PIN PAD ──────────────────────────────────────────────────────────────────
function PinPad({ title, subtitle, onSubmit, error }) {
  const [digits, setDigits] = useState([]);
  const add = (d) => {
    if(digits.length>=4) return;
    const next = [...digits,d];
    setDigits(next);
    if(next.length===4) { setTimeout(()=>{ onSubmit(next.join("")); setDigits([]); },200); }
  };
  const del = () => setDigits(d=>d.slice(0,-1));
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24,padding:"40px 20px"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:52}}>🔐</div>
        <h2 style={{fontFamily:"Fredoka One",fontSize:28,color:"#fff",margin:"8px 0 4px"}}>{title}</h2>
        <p style={{fontFamily:"Nunito",color:"#64748b",margin:0,fontSize:15}}>{subtitle}</p>
      </div>
      {/* dots */}
      <div style={{display:"flex",gap:16}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:20,height:20,borderRadius:"50%",
            background:digits.length>i?"#fbbf24":"rgba(255,255,255,0.15)",
            border:"2px solid rgba(255,255,255,0.2)",transition:"background 0.15s"}}/>
        ))}
      </div>
      {error && <p style={{fontFamily:"Nunito",color:"#ef4444",fontSize:14,margin:0}}>{error}</p>}
      {/* keypad */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:10}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
          <button key={i} onClick={()=>k==="⌫"?del():k!==""&&add(k.toString())}
            disabled={k===""}
            style={{width:72,height:72,borderRadius:18,
              background:k==="⌫"?"rgba(239,68,68,0.15)":k===""?"transparent":"rgba(255,255,255,0.07)",
              border:`1px solid ${k==="⌫"?"rgba(239,68,68,0.3)":k===""?"transparent":"rgba(255,255,255,0.1)"}`,
              color:k==="⌫"?"#ef4444":"#fff",fontSize:k==="⌫"?20:26,fontFamily:"Fredoka One",
              cursor:k===""?"default":"pointer",transition:"all 0.1s"}}
            onMouseDown={e=>e.currentTarget.style.transform="scale(0.92)"}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PET DISPLAY ──────────────────────────────────────────────────────────────
function PetDisplay({ pet, equipped, totalPts, compact=false }) {
  const sp = PET_SPECIES.find(s=>s.id===pet?.species)||PET_SPECIES[0];
  const stage = getPetStage(totalPts||0);
  const petEmoji = sp.stages[stage];
  const nextT = PET_THRESHOLDS[stage+1];
  const pct = nextT ? Math.min(100,(totalPts-PET_THRESHOLDS[stage])/(nextT-PET_THRESHOLDS[stage])*100) : 100;
  const hatItem  = SHOP_ITEMS.find(i=>i.id===equipped?.hat);
  const neckItem = SHOP_ITEMS.find(i=>i.id===equipped?.neck);
  const toyItem  = SHOP_ITEMS.find(i=>i.id===equipped?.toy);
  const homeItem = SHOP_ITEMS.find(i=>i.id===equipped?.home);
  if(compact) return (
    <div style={{textAlign:"center"}}>
      <div style={{position:"relative",display:"inline-block"}}>
        {hatItem&&<div style={{fontSize:16,position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)"}}>{hatItem.emoji}</div>}
        <div style={{fontSize:44,lineHeight:1,filter:`drop-shadow(0 0 10px ${sp.color}88)`,animation:"petbob 2s ease-in-out infinite"}}>{petEmoji}</div>
        {neckItem&&<div style={{fontSize:12,position:"absolute",bottom:-6,right:-8}}>{neckItem.emoji}</div>}
      </div>
      <div style={{fontFamily:"Nunito",fontSize:10,color:"#94a3b8",marginTop:4}}>{getPetStageLabel(stage)}</div>
    </div>
  );
  return (
    <div style={{textAlign:"center",padding:"16px 0"}}>
      <div style={{position:"relative",display:"inline-block",margin:"0 auto"}}>
        {homeItem&&<div style={{fontSize:56,position:"absolute",top:-4,left:"50%",transform:"translateX(-75%)",opacity:.35,zIndex:0}}>{homeItem.emoji}</div>}
        {hatItem&&<div style={{fontSize:26,position:"absolute",top:-26,left:"50%",transform:"translateX(-50%)",zIndex:2}}>{hatItem.emoji}</div>}
        <div style={{fontSize:86,lineHeight:1,position:"relative",zIndex:1,filter:`drop-shadow(0 0 20px ${sp.color}99)`,animation:"petbob 2.5s ease-in-out infinite"}}>{petEmoji}</div>
        {neckItem&&<div style={{fontSize:20,position:"absolute",bottom:-6,right:-12,zIndex:2}}>{neckItem.emoji}</div>}
        {toyItem&&<div style={{fontSize:20,position:"absolute",bottom:-6,left:-12,zIndex:2}}>{toyItem.emoji}</div>}
      </div>
      <div style={{marginTop:14}}>
        <div style={{fontFamily:"Fredoka One",fontSize:22,color:"#fff"}}>{pet?.name||"Pet"}</div>
        <div style={{fontFamily:"Nunito",fontSize:12,color:sp.color,marginTop:2}}>{sp.name} · {getPetStageLabel(stage)}</div>
        {nextT ? (
          <div style={{margin:"10px auto 0",maxWidth:180}}>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Nunito",fontSize:10,color:"#64748b",marginBottom:3}}>
              <span>{totalPts} pts</span><span>{nextT} to evolve</span>
            </div>
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:99,height:8,overflow:"hidden"}}>
              <div style={{background:`linear-gradient(90deg,${sp.color},${sp.color}bb)`,height:"100%",width:`${pct}%`,borderRadius:99,transition:"width 0.6s"}}/>
            </div>
          </div>
        ) : <div style={{fontFamily:"Nunito",fontSize:12,color:"#fbbf24",marginTop:6}}>🔥 MAX LEVEL!</div>}
      </div>
    </div>
  );
}

// ─── SHOP MODAL ───────────────────────────────────────────────────────────────
function ShopModal({ kid, onBuy, onEquip, onClose }) {
  const [tab, setTab] = useState("Accessory");
  const owned = kid.owned||[], equipped = kid.equipped||{};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"linear-gradient(160deg,#1e1b4b,#0f172a)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:28,width:"100%",maxWidth:500,maxHeight:"88vh",overflowY:"auto",padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h2 style={{fontFamily:"Fredoka One",fontSize:24,color:"#fff",margin:0}}>🛒 Pet Shop</h2>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"Nunito",color:"#fbbf24",fontWeight:800}}>🪙 {kid.coins||0}</span>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,width:28,height:28,color:"#fff",cursor:"pointer",fontSize:16}}>✕</button>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {["Accessory","Home","Toy","Treat"].map(c=>(
            <button key={c} onClick={()=>setTab(c)} style={{flex:1,background:tab===c?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${tab===c?"#fbbf24":"rgba(255,255,255,0.1)"}`,borderRadius:10,padding:"5px 2px",color:tab===c?"#fbbf24":"#64748b",fontFamily:"Nunito",fontSize:11,cursor:"pointer"}}>
              {c}
            </button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
          {SHOP_ITEMS.filter(i=>i.cat===tab).map(item=>{
            const isOwned = owned.includes(item.id);
            const isEquipped = item.slot && equipped[item.slot]===item.id;
            const canAfford = (kid.coins||0)>=item.cost;
            return (
              <div key={item.id} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${isEquipped?"#fbbf24":isOwned?"#10b981":"rgba(255,255,255,0.1)"}`,borderRadius:14,padding:12,textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:4}}>{item.emoji}</div>
                <div style={{fontFamily:"Nunito",fontSize:13,fontWeight:700,color:"#fff"}}>{item.name}</div>
                <div style={{marginTop:8}}>
                  {isEquipped ? <span style={{fontFamily:"Nunito",fontSize:11,color:"#fbbf24"}}>✨ Equipped</span>
                  : isOwned && item.slot ? <button onClick={()=>onEquip(item)} style={{background:"rgba(16,185,129,.2)",border:"1px solid #10b981",borderRadius:8,padding:"4px 12px",color:"#10b981",fontFamily:"Nunito",fontSize:11,cursor:"pointer"}}>Equip</button>
                  : isOwned ? <span style={{fontFamily:"Nunito",fontSize:11,color:"#10b981"}}>✅ Owned</span>
                  : <button onClick={()=>canAfford&&onBuy(item)} disabled={!canAfford} style={{background:canAfford?"linear-gradient(135deg,#f59e0b,#f97316)":"rgba(255,255,255,0.05)",border:"none",borderRadius:8,padding:"4px 12px",color:canAfford?"#fff":"#475569",fontFamily:"Nunito",fontSize:11,cursor:canAfford?"pointer":"not-allowed"}}>🪙 {item.cost}</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SETUP WIZARD ─────────────────────────────────────────────────────────────
const AVATARS = ["🦁","🐯","🦊","🐺","🦅","🐉","🤖","🦄","🐼","🦈","🦖","🧙"];

function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(2);
  const [kidDrafts, setKidDrafts] = useState([]);
  const [adminPIN, setAdminPIN] = useState("");
  const [nannyPIN, setNannyPIN] = useState("");
  const [pinStep, setPinStep] = useState("admin"); // admin | nanny
  const [selectedTasks, setSelectedTasks] = useState(new Set(["t1","t2","t3","t8","t9","t14"]));
  const [creating, setCreating] = useState(false);

  const updateKid = (i,f,v) => {
    const k=[...kidDrafts];
    if(f.startsWith("pet.")) k[i].pet[f.slice(4)]=v; else k[i][f]=v;
    setKidDrafts(k);
  };
  const cats = [...new Set(TASK_LIBRARY.map(t=>t.cat))];

  const handlePIN = (pin) => {
    if(pinStep==="admin") { setAdminPIN(pin); setPinStep("nanny"); }
    else {
      if(pin===adminPIN) { alert("Nanny PIN can't be the same as Admin PIN!"); return; }
      setNannyPIN(pin); setStep(3);
    }
  };

  const finish = async () => {
    setCreating(true);
    const familyCode = makeFamilyCode();
    const tasks = TASK_LIBRARY.filter(t=>selectedTasks.has(t.id));
    const kids = kidDrafts.map((k,i)=>({
      id:`kid_${i}`, name:k.name.trim()||`Hero ${i+1}`,
      avatar:k.avatar, pet:{name:k.pet.name.trim()||`Pet ${i+1}`, species:k.pet.species},
      coins:0, totalPts:0, equipped:{}, owned:[],
    }));
    const familyData = {
      familyCode, adminPIN, nannyPIN,
      kids: Object.fromEntries(kids.map(k=>[k.id,k])),
      tasks: Object.fromEntries(tasks.map(t=>[t.id,t])),
      completions:{}, createdAt: Date.now(),
    };
    await db.set(`families/${familyCode}`, familyData);
    localStorage.setItem("kq3_session", JSON.stringify({ familyCode, role:"admin" }));
    onComplete({ familyCode, role:"admin", data: familyData });
    setCreating(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a,#1e1b4b,#0f172a)",color:"#fff",fontFamily:"'Fredoka One',cursive",padding:"24px 16px",overflowY:"auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes petbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:64,animation:"petbob 2s ease-in-out infinite"}}>🚀</div>
          <h1 style={{fontSize:44,margin:"6px 0 2px",background:"linear-gradient(90deg,#fbbf24,#f97316,#ef4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>KidQuest</h1>
          <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:10}}>
            {["Heroes","Missions","PINs","Launch"].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:step>=i?"#fbbf24":"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Nunito",fontSize:11,color:step>=i?"#000":"#475569",fontWeight:700,transition:"all 0.3s"}}>{i+1}</div>
                <span style={{fontFamily:"Nunito",fontSize:11,color:step===i?"#fbbf24":"#475569"}}>{s}</span>
                {i<3&&<span style={{color:"#334155"}}>›</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 0 — Hero count */}
        {step===0 && (
          <div style={{textAlign:"center",animation:"slideUp 0.3s ease"}}>
            <h2 style={{fontSize:26,marginBottom:8}}>How many heroes? 🦸</h2>
            <p style={{fontFamily:"Nunito",color:"#94a3b8",marginBottom:28}}>Choose how many kids will use KidQuest</p>
            <div style={{display:"flex",justifyContent:"center",gap:14,flexWrap:"wrap"}}>
              {[1,2,3,4].map(n=>(
                <button key={n} onClick={()=>{
                  setCount(n);
                  setKidDrafts(Array.from({length:n},(_,i)=>({name:"",avatar:AVATARS[i%AVATARS.length],pet:{name:"",species:PET_SPECIES[i%PET_SPECIES.length].id}})));
                  setStep(1);
                }} style={{width:110,height:110,background:"rgba(255,255,255,0.06)",border:"2px solid rgba(255,255,255,0.15)",borderRadius:22,fontSize:38,cursor:"pointer",color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#fbbf24";e.currentTarget.style.background="rgba(251,191,36,0.1)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.background="rgba(255,255,255,0.06)"}}>
                  {["1️⃣","2️⃣","3️⃣","4️⃣"][n-1]}
                  <span style={{fontFamily:"Nunito",fontSize:13,color:"#94a3b8"}}>{n} kid{n>1?"s":""}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Configure kids */}
        {step===1 && (
          <div style={{animation:"slideUp 0.3s ease"}}>
            <h2 style={{fontSize:26,textAlign:"center",marginBottom:4}}>Set up your heroes ⚔️</h2>
            <p style={{fontFamily:"Nunito",color:"#94a3b8",textAlign:"center",marginBottom:20}}>Name each kid and choose their pet companion</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14,marginBottom:20}}>
              {kidDrafts.map((k,i)=>{
                const sp=PET_SPECIES.find(s=>s.id===k.pet.species);
                return (
                  <div key={i} style={{background:"rgba(255,255,255,0.05)",borderRadius:22,padding:18,border:"1px solid rgba(255,255,255,0.08)"}}>
                    <p style={{fontFamily:"Nunito",color:"#64748b",fontSize:11,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>Hero {i+1}</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                      {AVATARS.map(av=>(
                        <button key={av} onClick={()=>updateKid(i,"avatar",av)} style={{background:k.avatar===av?"rgba(251,191,36,.2)":"rgba(255,255,255,.05)",border:`2px solid ${k.avatar===av?"#fbbf24":"transparent"}`,borderRadius:9,padding:"3px 5px",fontSize:18,cursor:"pointer"}}>{av}</button>
                      ))}
                    </div>
                    <input value={k.name} onChange={e=>updateKid(i,"name",e.target.value)} placeholder={`Hero ${i+1}'s name…`} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"9px 12px",color:"#fff",fontSize:17,fontFamily:"Fredoka One",boxSizing:"border-box",outline:"none",marginBottom:12}}/>
                    <p style={{fontFamily:"Nunito",color:"#64748b",fontSize:11,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>Pet companion</p>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
                      {PET_SPECIES.map(sp2=>(
                        <button key={sp2.id} onClick={()=>updateKid(i,"pet.species",sp2.id)} style={{background:k.pet.species===sp2.id?`rgba(${hexRgb(sp2.color)},.2)`:"rgba(255,255,255,.04)",border:`2px solid ${k.pet.species===sp2.id?sp2.color:"transparent"}`,borderRadius:12,padding:"7px 4px",cursor:"pointer",textAlign:"center"}}>
                          <div style={{fontSize:22}}>{sp2.stages[0]}</div>
                          <div style={{fontFamily:"Nunito",fontSize:9,color:k.pet.species===sp2.id?sp2.color:"#475569",marginTop:2}}>{sp2.name}</div>
                        </button>
                      ))}
                    </div>
                    <input value={k.pet.name} onChange={e=>updateKid(i,"pet.name",e.target.value)} placeholder={`Name your ${sp?.name}…`} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"7px 10px",color:"#fff",fontSize:14,fontFamily:"Nunito",boxSizing:"border-box",outline:"none"}}/>
                  </div>
                );
              })}
            </div>
            <button onClick={()=>setStep(2)} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:16,padding:14,fontSize:20,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer",boxShadow:"0 6px 24px rgba(99,102,241,.4)"}}>
              Choose Missions →
            </button>
          </div>
        )}

        {/* Step 2 — Tasks */}
        {step===2 && (
          <div style={{animation:"slideUp 0.3s ease"}}>
            <h2 style={{fontSize:26,textAlign:"center",marginBottom:4}}>Choose starting missions ⚔️</h2>
            <p style={{fontFamily:"Nunito",color:"#94a3b8",textAlign:"center",marginBottom:18}}>{selectedTasks.size} selected</p>
            {cats.map(cat=>(
              <div key={cat} style={{marginBottom:14}}>
                <p style={{fontFamily:"Nunito",color:"#475569",fontSize:10,margin:"0 0 7px",textTransform:"uppercase",letterSpacing:1}}>{cat}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {TASK_LIBRARY.filter(t=>t.cat===cat).map(task=>{
                    const on=selectedTasks.has(task.id);
                    return (
                      <button key={task.id} onClick={()=>{const s=new Set(selectedTasks);s.has(task.id)?s.delete(task.id):s.add(task.id);setSelectedTasks(s);}} style={{background:on?"rgba(251,191,36,.15)":"rgba(255,255,255,.05)",border:`2px solid ${on?"#fbbf24":"rgba(255,255,255,.1)"}`,borderRadius:12,padding:"7px 12px",color:on?"#fbbf24":"#94a3b8",fontSize:13,fontFamily:"Nunito",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                        {task.emoji} {task.name} <span style={{opacity:.6}}>+{task.points}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <button onClick={()=>setStep(2.5)} style={{width:"100%",marginTop:6,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:16,padding:14,fontSize:20,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer"}}>
              Set up PINs →
            </button>
          </div>
        )}

        {/* Step 2.5 — PIN setup */}
        {step===2.5 && (
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:24,border:"1px solid rgba(255,255,255,0.08)",marginBottom:16,padding:"8px 0"}}>
              {pinStep==="admin" ? (
                <PinPad
                  title="Set Admin PIN"
                  subtitle="You & your wife — full access to all settings"
                  onSubmit={handlePIN}
                />
              ) : (
                <PinPad
                  title="Set Nanny PIN"
                  subtitle="Nanny can check tasks, add missions & see reports"
                  onSubmit={handlePIN}
                />
              )}
            </div>
            <div style={{background:"rgba(251,191,36,0.08)",borderRadius:14,padding:14,border:"1px solid rgba(251,191,36,0.2)"}}>
              <p style={{fontFamily:"Nunito",color:"#fbbf24",fontSize:13,margin:0,fontWeight:700}}>💡 How PIN sharing works</p>
              <p style={{fontFamily:"Nunito",color:"#94a3b8",fontSize:12,margin:"6px 0 0"}}>After setup, you'll get a <strong style={{color:"#fff"}}>Family Code</strong>. Share it (plus the PIN) with your wife and nanny so they can log in on any device — phone, tablet, or computer.</p>
            </div>
          </div>
        )}

        {/* Step 3 — Confirm & launch */}
        {step===3 && (
          <div style={{animation:"slideUp 0.3s ease",textAlign:"center"}}>
            <div style={{fontSize:72,animation:"petbob 2s ease-in-out infinite"}}>🎉</div>
            <h2 style={{fontSize:30,marginBottom:8}}>Ready to launch!</h2>
            <div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,padding:20,border:"1px solid rgba(255,255,255,0.08)",marginBottom:20,textAlign:"left"}}>
              <div style={{fontFamily:"Nunito",fontSize:14,color:"#94a3b8",marginBottom:12}}>Your family setup:</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Nunito",fontSize:14}}>
                  <span style={{color:"#64748b"}}>Heroes</span>
                  <span style={{color:"#fff"}}>{kidDrafts.map(k=>k.name||"?").join(", ")}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Nunito",fontSize:14}}>
                  <span style={{color:"#64748b"}}>Missions</span>
                  <span style={{color:"#fff"}}>{selectedTasks.size} tasks</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Nunito",fontSize:14}}>
                  <span style={{color:"#64748b"}}>Admin PIN</span>
                  <span style={{color:"#10b981"}}>{'●'.repeat(4)} ✓ set</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Nunito",fontSize:14}}>
                  <span style={{color:"#64748b"}}>Nanny PIN</span>
                  <span style={{color:"#10b981"}}>{'●'.repeat(4)} ✓ set</span>
                </div>
                {!FIREBASE_ENABLED && (
                  <div style={{marginTop:8,background:"rgba(251,191,36,0.1)",borderRadius:10,padding:"8px 12px",border:"1px solid rgba(251,191,36,0.2)"}}>
                    <span style={{fontFamily:"Nunito",fontSize:12,color:"#fbbf24"}}>⚠️ Firebase not yet configured — data saves locally on this device. See Settings to connect Firebase for multi-device sync.</span>
                  </div>
                )}
              </div>
            </div>
            <button onClick={finish} disabled={creating} style={{width:"100%",background:"linear-gradient(135deg,#f59e0b,#f97316)",border:"none",borderRadius:18,padding:18,fontSize:24,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer",boxShadow:"0 8px 32px rgba(245,158,11,.4)",opacity:creating?0.7:1}}>
              {creating?"Creating family…":"🚀 LAUNCH KIDQUEST!"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── JOIN FAMILY SCREEN ───────────────────────────────────────────────────────
function JoinFamily({ onJoin }) {
  const [code, setCode] = useState("");
  const [pinError, setPinError] = useState("");
  const [familyData, setFamilyData] = useState(null);
  const [looking, setLooking] = useState(false);

  const lookupCode = async () => {
    setLooking(true); setPinError("");
    const data = await db.get(`families/${code.toUpperCase()}`);
    setLooking(false);
    if (!data) { setPinError("Family code not found. Check and try again."); return; }
    setFamilyData(data);
  };

  const handlePIN = (pin) => {
    if (!familyData) return;
    if (pin === familyData.adminPIN) {
      localStorage.setItem("kq3_session", JSON.stringify({ familyCode: familyData.familyCode, role:"admin" }));
      onJoin({ familyCode: familyData.familyCode, role:"admin", data: familyData });
    } else if (pin === familyData.nannyPIN) {
      localStorage.setItem("kq3_session", JSON.stringify({ familyCode: familyData.familyCode, role:"nanny" }));
      onJoin({ familyCode: familyData.familyCode, role:"nanny", data: familyData });
    } else {
      setPinError("Wrong PIN — try again!");
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a,#1e1b4b,#0f172a)",color:"#fff",fontFamily:"'Fredoka One',cursive",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes petbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      <div style={{width:"100%",maxWidth:400}}>
        {!familyData ? (
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:60,animation:"petbob 2s ease-in-out infinite"}}>🔑</div>
            <h2 style={{fontSize:28,marginBottom:6}}>Join your family</h2>
            <p style={{fontFamily:"Nunito",color:"#64748b",marginBottom:24}}>Enter the Family Code from the Settings screen</p>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="e.g.  AB12CD" maxLength={6} style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:16,padding:"16px",color:"#fff",fontSize:28,fontFamily:"Fredoka One",textAlign:"center",letterSpacing:6,boxSizing:"border-box",outline:"none",marginBottom:10}}/>
            {pinError && <p style={{fontFamily:"Nunito",color:"#ef4444",fontSize:13}}>{pinError}</p>}
            <button onClick={lookupCode} disabled={code.length<4||looking} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:14,padding:14,fontSize:18,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer",marginBottom:20,opacity:code.length<4?0.5:1}}>
              {looking?"Searching…":"Find Family →"}
            </button>
            <p style={{fontFamily:"Nunito",color:"#475569",fontSize:13}}>Setting up for the first time? <br/><button onClick={()=>onJoin("setup")} style={{background:"none",border:"none",color:"#6366f1",fontFamily:"Nunito",fontSize:13,cursor:"pointer",textDecoration:"underline"}}>Create a new family</button></p>
          </div>
        ) : (
          <div>
            <div style={{textAlign:"center",marginBottom:4}}>
              <div style={{fontSize:40}}>🏠</div>
              <h2 style={{fontSize:24}}>Welcome to {familyData.familyCode}</h2>
              <p style={{fontFamily:"Nunito",color:"#64748b",fontSize:14}}>{Object.keys(familyData.kids||{}).length} heroes · {Object.keys(familyData.tasks||{}).length} missions</p>
            </div>
            <PinPad title="Enter your PIN" subtitle="Admin or Nanny PIN" onSubmit={handlePIN} error={pinError}/>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function KidQuestApp() {
  const [session, setSession] = useState(null);   // { familyCode, role }
  const [appData, setAppData] = useState(null);   // live family data from DB
  const [activeKid, setActiveKid] = useState(0);
  const [view, setView] = useState("tracker");
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebInfo, setCelebInfo] = useState(null);
  const [showShop, setShowShop] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({name:"",emoji:"⭐",points:10});
  const [reportPeriod, setReportPeriod] = useState("weekly");
  const [showFamilyCode, setShowFamilyCode] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const unsubRef = useRef(null);

  const weekKey = getWeekKey();
  const todayIdx = getTodayIdx();

  // Init DB on mount
  useEffect(()=>{
    db.init().then(()=>{
      setDbReady(true);
      const raw = localStorage.getItem("kq3_session");
      if(raw) {
        const s = JSON.parse(raw);
        setSession(s);
      }
    });
  },[]);

  // Subscribe to family data when session is set
  useEffect(()=>{
    if(!session || session==="setup" || !dbReady) return;
    if(unsubRef.current) unsubRef.current();
    unsubRef.current = db.subscribe(`families/${session.familyCode}`, data => {
      if(data) setAppData(data);
    });
    return ()=>{ if(unsubRef.current) unsubRef.current(); };
  },[session, dbReady]);

  const handleSetupComplete = (info) => {
    setSession({ familyCode: info.familyCode, role: info.role });
    setAppData(info.data);
  };
  const handleJoin = (info) => {
    if(info==="setup") { setSession("setup"); return; }
    setSession({ familyCode: info.familyCode, role: info.role });
    setAppData(info.data);
  };

  // Loading
  if(!dbReady) return (
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"Fredoka One",fontSize:24}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:60,animation:"petbob 2s ease-in-out infinite"}}>🚀</div>
        <p>Loading KidQuest…</p>
      </div>
      <style>{`@keyframes petbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  );
  if(!session) return <JoinFamily onJoin={handleJoin}/>;
  if(session==="setup") return <SetupWizard onComplete={handleSetupComplete}/>;
  if(!appData) return (
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"Fredoka One",fontSize:20}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:50}}>⏳</div><p>Syncing with Firebase…</p></div>
    </div>
  );

  const isAdmin = session.role==="admin";
  const kids = Object.values(appData.kids||{});
  const tasks = Object.values(appData.tasks||{});
  const completions = appData.completions||{};
  const kid = kids[activeKid]||kids[0];
  if(!kid) return null;

  // ─ helpers ─
  const getWeekPts = (kidId, wk=weekKey) => {
    const wc = completions[wk]?.[kidId]||{};
    return Object.entries(wc).reduce((s,[tid,days])=>{
      const t=tasks.find(t=>t.id===tid); return s+(t?(days?.length||0)*t.points:0);
    },0);
  };
  const getMonthPts = (kidId) => {
    const now=new Date();
    return Object.keys(completions).reduce((s,wk)=>{
      const d=new Date(wk);
      return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()?s+getWeekPts(kidId,wk):s;
    },0);
  };

  const writeToDb = async (path, value) => {
    await db.set(`families/${session.familyCode}/${path}`, value);
  };
  const updateDb = async (path, value) => {
    await db.update(`families/${session.familyCode}/${path}`, value);
  };

  const toggleCompletion = async (taskId, dayIdx) => {
    const kidId = kid.id;
    const path = `completions/${weekKey}/${kidId}/${taskId}`;
    const current = completions[weekKey]?.[kidId]?.[taskId]||[];
    const pos = current.indexOf(dayIdx);
    let next;
    if(pos>=0) {
      next = current.filter((_,i)=>i!==pos);
    } else {
      next = [...current, dayIdx];
      const task = tasks.find(t=>t.id===taskId);
      if(task) {
        const prevPts = kid.totalPts||0;
        const newTotalPts = prevPts + task.points;
        const prevStage = getPetStage(prevPts);
        const newStage = getPetStage(newTotalPts);
        const newKid = { ...kid, coins:(kid.coins||0)+task.points, totalPts:newTotalPts };
        await writeToDb(`kids/${kidId}`, newKid);
        if(newStage > prevStage) {
          setCelebInfo({type:"evolve",kid:newKid,stage:newStage,species:PET_SPECIES.find(s=>s.id===kid.pet?.species)});
          setShowConfetti(true);
        } else {
          const wkPts = getWeekPts(kidId) + task.points;
          const prevM = [...MILESTONES].reverse().find(m=>m.pts<=getWeekPts(kidId));
          const newM = [...MILESTONES].reverse().find(m=>m.pts<=wkPts);
          if(newM&&newM!==prevM) { setCelebInfo({type:"milestone",kid,milestone:newM}); setShowConfetti(true); }
        }
      }
    }
    if(pos>=0) {
      // removing — also decrement kid pts
      const task=tasks.find(t=>t.id===taskId);
      if(task) await writeToDb(`kids/${kidId}`, {...kid, coins:Math.max(0,(kid.coins||0)-task.points), totalPts:Math.max(0,(kid.totalPts||0)-task.points)});
    }
    await writeToDb(path.replace(/\//g,"/").split("").join(""), null); // clear then re-set
    if(next.length>0) await db.set(`families/${session.familyCode}/${path}`, next);
    else await db.set(`families/${session.familyCode}/${path}`, null);
  };

  const addTask = async () => {
    if(!newTask.name.trim()) return;
    const t = {id:`c_${Date.now()}`,name:newTask.name.trim(),emoji:newTask.emoji,points:newTask.points,cat:"Custom"};
    await writeToDb(`tasks/${t.id}`, t);
    setNewTask({name:"",emoji:"⭐",points:10}); setShowAddTask(false);
  };

  const buyItem = async (item) => {
    if((kid.coins||0)<item.cost) return;
    const newKid = {...kid, coins:kid.coins-item.cost, owned:[...(kid.owned||[]),item.id]};
    await writeToDb(`kids/${kid.id}`, newKid);
  };

  const equipItem = async (item) => {
    const newKid = {...kid, equipped:{...(kid.equipped||{}), [item.slot]:item.id}};
    await writeToDb(`kids/${kid.id}`, newKid);
  };

  const logout = () => {
    localStorage.removeItem("kq3_session");
    setSession(null); setAppData(null);
  };

  const weekPts = getWeekPts(kid.id);
  const nextM = MILESTONES.find(m=>m.pts>weekPts);

  const ROLE_BADGE = isAdmin
    ? {label:"Admin 👑", color:"#f59e0b", bg:"rgba(245,158,11,0.15)"}
    : {label:"Nanny 🌸", color:"#a78bfa", bg:"rgba(167,139,250,0.15)"};

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0a0a1a,#0f0c29,#1a0f2e)",color:"#fff",fontFamily:"'Fredoka One',cursive"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes petbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 18px rgba(251,191,36,.3)}50%{box-shadow:0 0 36px rgba(251,191,36,.6)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .trow:hover{background:rgba(255,255,255,0.055)!important}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18);border-radius:3px}
      `}</style>

      <Confetti active={showConfetti} onDone={()=>setShowConfetti(false)}/>

      {/* Celebration modal */}
      {celebInfo && (
        <div onClick={()=>setCelebInfo(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"linear-gradient(160deg,#1e1b4b,#0f172a)",border:`3px solid ${celebInfo.type==="evolve"?(celebInfo.species?.color||"#fbbf24"):(celebInfo.milestone?.color||"#fbbf24")}`,borderRadius:30,padding:"38px 28px",textAlign:"center",maxWidth:320,animation:"slideUp 0.4s ease"}}>
            {celebInfo.type==="evolve" ? (
              <>
                <div style={{fontSize:76,animation:"petbob 1.5s ease-in-out infinite"}}>{celebInfo.species?.stages[celebInfo.stage]}</div>
                <h2 style={{fontSize:30,margin:"10px 0 6px",color:"#fbbf24"}}>PET EVOLVED! 🔥</h2>
                <p style={{fontFamily:"Nunito",color:"#94a3b8"}}>{celebInfo.kid?.pet?.name} grew to {getPetStageLabel(celebInfo.stage)}!</p>
              </>
            ) : (
              <>
                <div style={{fontSize:68}}>{celebInfo.milestone?.emoji}</div>
                <h2 style={{fontSize:28,margin:"10px 0 6px",color:celebInfo.milestone?.color}}>{celebInfo.milestone?.label}!</h2>
                <p style={{fontFamily:"Nunito",color:"#94a3b8"}}>{celebInfo.kid?.name} hit {celebInfo.milestone?.pts} weekly points!</p>
              </>
            )}
            <p style={{fontFamily:"Nunito",color:"#475569",fontSize:12,marginTop:18}}>Tap to continue</p>
          </div>
        </div>
      )}

      {showShop && <ShopModal kid={kid} onBuy={buyItem} onEquip={equipItem} onClose={()=>setShowShop(false)}/>}

      {/* Family code reveal */}
      {showFamilyCode && (
        <div onClick={()=>setShowFamilyCode(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(160deg,#1e1b4b,#0f172a)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:28,padding:32,textAlign:"center",maxWidth:360,width:"100%",animation:"slideUp 0.3s ease"}}>
            <div style={{fontSize:48}}>🏠</div>
            <h2 style={{fontFamily:"Fredoka One",fontSize:26,color:"#fff",margin:"10px 0 4px"}}>Your Family Code</h2>
            <p style={{fontFamily:"Nunito",color:"#64748b",fontSize:14,margin:"0 0 20px"}}>Share this code + the PIN to let others join on any device</p>
            <div style={{background:"rgba(251,191,36,0.1)",border:"2px dashed #fbbf24",borderRadius:18,padding:"16px 24px",marginBottom:20}}>
              <div style={{fontFamily:"Fredoka One",fontSize:48,letterSpacing:8,color:"#fbbf24"}}>{appData.familyCode}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:14,padding:12}}>
                <div style={{fontFamily:"Nunito",fontSize:12,color:"#64748b"}}>Admin PIN</div>
                <div style={{fontFamily:"Fredoka One",fontSize:22,color:"#10b981",letterSpacing:4}}>{"●".repeat(4)}</div>
                <div style={{fontFamily:"Nunito",fontSize:11,color:"#64748b"}}>You + Wife</div>
              </div>
              <div style={{background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:14,padding:12}}>
                <div style={{fontFamily:"Nunito",fontSize:12,color:"#64748b"}}>Nanny PIN</div>
                <div style={{fontFamily:"Fredoka One",fontSize:22,color:"#a78bfa",letterSpacing:4}}>{"●".repeat(4)}</div>
                <div style={{fontFamily:"Nunito",fontSize:11,color:"#64748b"}}>Nanny</div>
              </div>
            </div>
            <p style={{fontFamily:"Nunito",color:"#475569",fontSize:12,margin:0}}>They'll go to the app URL, tap "Join family", enter this code, then their PIN.</p>
            <button onClick={()=>setShowFamilyCode(false)} style={{marginTop:16,background:"rgba(255,255,255,0.08)",border:"none",borderRadius:12,padding:"8px 24px",color:"#94a3b8",fontFamily:"Nunito",cursor:"pointer",fontSize:14}}>Close</button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{background:"rgba(0,0,0,0.5)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"12px 16px",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(10px)"}}>
        <div style={{maxWidth:800,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:26,background:"linear-gradient(90deg,#fbbf24,#f97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🚀 KidQuest</span>
            <span style={{fontFamily:"Nunito",fontSize:11,padding:"3px 8px",borderRadius:8,background:ROLE_BADGE.bg,color:ROLE_BADGE.color,fontWeight:700}}>{ROLE_BADGE.label}</span>
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            {[{id:"tracker",icon:"🎯"},{id:"pet",icon:"🐾"},{id:"report",icon:"📊"},...(isAdmin?[{id:"settings",icon:"⚙️"}]:[])].map(({id,icon})=>(
              <button key={id} onClick={()=>setView(id)} style={{background:view===id?"rgba(251,191,36,0.15)":"transparent",border:`1px solid ${view===id?"#fbbf24":"rgba(255,255,255,0.08)"}`,borderRadius:9,padding:"5px 10px",color:view===id?"#fbbf24":"#64748b",fontFamily:"Fredoka One",fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>
                {icon}
              </button>
            ))}
            <button onClick={logout} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.08)",borderRadius:9,padding:"5px 10px",color:"#475569",fontFamily:"Nunito",fontSize:12,cursor:"pointer"}}>Sign out</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:800,margin:"0 auto",padding:"14px 14px"}}>

        {/* Kid switcher */}
        <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          {kids.map((k,i)=>{
            const pts=getWeekPts(k.id), sp=PET_SPECIES.find(s=>s.id===k.pet?.species)||PET_SPECIES[0];
            const stage=getPetStage(k.totalPts||0);
            return (
              <button key={k.id} onClick={()=>setActiveKid(i)} style={{minWidth:110,flex:"0 0 auto",background:activeKid===i?`rgba(${hexRgb(sp.color)},.15)`:"rgba(255,255,255,.05)",border:`2px solid ${activeKid===i?sp.color:"rgba(255,255,255,.08)"}`,borderRadius:16,padding:"10px 14px",cursor:"pointer",color:"#fff",transition:"all 0.2s",animation:activeKid===i?"glow 2.5s infinite":undefined}}>
                <div style={{fontSize:28}}>{k.avatar}</div>
                <div style={{fontFamily:"Fredoka One",fontSize:14,marginTop:3}}>{k.name}</div>
                <div style={{fontFamily:"Nunito",fontSize:10,color:sp.color,marginTop:1}}>{sp.stages[stage]} {k.pet?.name}</div>
                <div style={{fontFamily:"Nunito",color:"#fbbf24",fontSize:13,fontWeight:800,marginTop:3}}>⭐ {pts} pts</div>
                <div style={{fontFamily:"Nunito",color:"#94a3b8",fontSize:10}}>🪙 {k.coins||0}</div>
              </button>
            );
          })}
        </div>

        {/* ════ TRACKER ════ */}
        {view==="tracker" && (
          <div style={{animation:"slideUp 0.3s ease"}}>
            {nextM && (
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:13,padding:"10px 14px",marginBottom:12,border:"1px solid rgba(255,255,255,0.07)"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Nunito",fontSize:12,marginBottom:5}}>
                  <span style={{color:"#94a3b8"}}>Next: {nextM.emoji} {nextM.label}</span>
                  <span style={{color:"#fbbf24"}}>{weekPts}/{nextM.pts}</span>
                </div>
                <div style={{background:"rgba(255,255,255,0.08)",borderRadius:99,height:8,overflow:"hidden"}}>
                  <div style={{background:"linear-gradient(90deg,#fbbf24,#f97316)",height:"100%",width:`${Math.min(100,weekPts/nextM.pts*100)}%`,borderRadius:99,transition:"width 0.5s"}}/>
                </div>
              </div>
            )}
            <div style={{background:"rgba(255,255,255,0.03)",borderRadius:18,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr repeat(7,38px)",padding:"9px 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",gap:2}}>
                <div style={{fontFamily:"Nunito",fontSize:11,color:"#475569"}}>Mission</div>
                {WEEK_DAYS.map((d,i)=>(
                  <div key={d} style={{textAlign:"center",fontFamily:"Nunito",fontSize:10,color:i===todayIdx?"#fbbf24":"#475569",fontWeight:i===todayIdx?800:400}}>{d}</div>
                ))}
              </div>
              {tasks.map(task=>{
                const done=completions[weekKey]?.[kid.id]?.[task.id]||[];
                return (
                  <div key={task.id} className="trow" style={{display:"grid",gridTemplateColumns:"1fr repeat(7,38px)",padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,0.04)",gap:2,alignItems:"center",transition:"background 0.15s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
                      <span style={{fontSize:18,flexShrink:0}}>{task.emoji}</span>
                      <div style={{overflow:"hidden"}}>
                        <div style={{fontFamily:"Nunito",fontSize:12,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{task.name}</div>
                        <div style={{fontFamily:"Nunito",fontSize:9,color:done.length?"#fbbf24":"#475569"}}>+{task.points}pts{done.length?` ×${done.length}`:""}</div>
                      </div>
                    </div>
                    {WEEK_DAYS.map((_,di)=>{
                      const checked=done.includes(di);
                      return (
                        <div key={di} style={{display:"flex",justifyContent:"center"}}>
                          <button onClick={()=>toggleCompletion(task.id,di)} style={{width:30,height:30,borderRadius:8,border:`2px solid ${checked?"#10b981":"rgba(255,255,255,0.1)"}`,background:checked?"rgba(16,185,129,0.18)":"transparent",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                            {checked?"✅":""}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {/* add task — available to admin AND nanny */}
              {!showAddTask ? (
                <button onClick={()=>setShowAddTask(true)} style={{width:"100%",background:"transparent",border:"none",padding:"11px 12px",color:"#475569",fontFamily:"Nunito",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color="#fbbf24"} onMouseLeave={e=>e.currentTarget.style.color="#475569"}>
                  ➕ Add custom mission
                </button>
              ) : (
                <div style={{padding:"10px 12px",display:"flex",gap:6,flexWrap:"wrap",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                  <input value={newTask.emoji} onChange={e=>setNewTask({...newTask,emoji:e.target.value})} style={{width:40,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,padding:5,color:"#fff",fontSize:16,textAlign:"center",outline:"none"}}/>
                  <input value={newTask.name} onChange={e=>setNewTask({...newTask,name:e.target.value})} placeholder="Mission name…" style={{flex:1,minWidth:130,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,padding:"5px 9px",color:"#fff",fontFamily:"Nunito",fontSize:12,outline:"none"}}/>
                  <select value={newTask.points} onChange={e=>setNewTask({...newTask,points:+e.target.value})} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,padding:5,color:"#fff",fontFamily:"Nunito",fontSize:12,outline:"none"}}>
                    {[5,10,15,20,25,30].map(p=><option key={p} value={p} style={{background:"#0f172a"}}>+{p}pts</option>)}
                  </select>
                  <button onClick={addTask} style={{background:"#10b981",border:"none",borderRadius:9,padding:"5px 12px",color:"#fff",fontFamily:"Nunito",fontSize:12,cursor:"pointer",fontWeight:700}}>Add</button>
                  <button onClick={()=>setShowAddTask(false)} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:9,padding:"5px 10px",color:"#94a3b8",fontFamily:"Nunito",cursor:"pointer"}}>✕</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ PET ════ */}
        {view==="pet" && (
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:22,border:"1px solid rgba(255,255,255,0.07)",padding:20,marginBottom:14,textAlign:"center"}}>
              <PetDisplay pet={kid.pet||{name:"Pet",species:"dragon"}} equipped={kid.equipped||{}} totalPts={kid.totalPts||0}/>
              <div style={{marginTop:16,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                <div style={{background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,padding:"7px 16px",fontFamily:"Nunito",fontSize:14,color:"#fbbf24"}}>🪙 {kid.coins||0} coins</div>
                <button onClick={()=>setShowShop(true)} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:12,padding:"7px 16px",fontSize:14,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer"}}>🛒 Pet Shop</button>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:18,border:"1px solid rgba(255,255,255,0.07)",padding:18,marginBottom:14}}>
              <h3 style={{margin:"0 0 12px",fontSize:18}}>🎽 Equipped</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {["hat","neck","home","toy"].map(slot=>{
                  const item=SHOP_ITEMS.find(i=>i.id===kid.equipped?.[slot]);
                  return (
                    <div key={slot} style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:10,textAlign:"center",border:"1px dashed rgba(255,255,255,0.08)"}}>
                      <div style={{fontSize:24,minHeight:30}}>{item?item.emoji:"·"}</div>
                      <div style={{fontFamily:"Nunito",fontSize:10,color:item?"#fff":"#334155",marginTop:3}}>{item?item.name:slot}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:18,border:"1px solid rgba(255,255,255,0.07)",padding:18}}>
              <h3 style={{margin:"0 0 14px",fontSize:18}}>🌱 Growth Journey</h3>
              <div style={{display:"flex",gap:6,justifyContent:"space-around",flexWrap:"wrap"}}>
                {PET_THRESHOLDS.map((thresh,i)=>{
                  const sp=PET_SPECIES.find(s=>s.id===(kid.pet?.species||"dragon"));
                  const current=getPetStage(kid.totalPts||0)===i, unlocked=(kid.totalPts||0)>=thresh;
                  return (
                    <div key={i} style={{textAlign:"center",opacity:unlocked?1:0.35}}>
                      <div style={{fontSize:32,filter:current?`drop-shadow(0 0 10px ${sp?.color})`:undefined,animation:current?"petbob 2s ease-in-out infinite":undefined}}>{sp?.stages[i]}</div>
                      <div style={{fontFamily:"Nunito",fontSize:10,color:current?"#fbbf24":"#64748b",marginTop:3}}>{getPetStageLabel(i)}</div>
                      <div style={{fontFamily:"Nunito",fontSize:9,color:"#334155"}}>{thresh}pts</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ REPORT ════ */}
        {view==="report" && (
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{display:"flex",gap:7,marginBottom:14}}>
              {["weekly","monthly"].map(p=>(
                <button key={p} onClick={()=>setReportPeriod(p)} style={{background:reportPeriod===p?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${reportPeriod===p?"#fbbf24":"rgba(255,255,255,0.08)"}`,borderRadius:11,padding:"7px 18px",color:reportPeriod===p?"#fbbf24":"#64748b",fontFamily:"Fredoka One",fontSize:14,cursor:"pointer"}}>
                  {p==="weekly"?"📅 Week":"📆 Month"}
                </button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:14}}>
              {kids.map(k=>{
                const pts=reportPeriod==="weekly"?getWeekPts(k.id):getMonthPts(k.id);
                const m=[...MILESTONES].reverse().find(mm=>mm.pts<=getWeekPts(k.id));
                return (
                  <div key={k.id} style={{background:"rgba(255,255,255,0.05)",borderRadius:18,padding:18,border:"1px solid rgba(255,255,255,0.07)",textAlign:"center"}}>
                    <PetDisplay pet={k.pet||{name:"Pet",species:"dragon"}} equipped={k.equipped||{}} totalPts={k.totalPts||0} compact/>
                    <div style={{fontSize:26,marginTop:6}}>{k.avatar}</div>
                    <div style={{fontSize:20,marginTop:3}}>{k.name}</div>
                    {m&&<div style={{fontFamily:"Nunito",color:m.color,fontSize:11,marginTop:2}}>{m.emoji} {m.label}</div>}
                    <div style={{fontFamily:"Nunito",color:"#fbbf24",fontSize:26,fontWeight:800,marginTop:8}}>⭐ {pts}</div>
                    <div style={{fontFamily:"Nunito",color:"#64748b",fontSize:10,marginTop:1}}>{reportPeriod==="weekly"?"this week":"this month"}</div>
                    <div style={{fontFamily:"Nunito",color:"#10b981",fontSize:11,marginTop:3}}>🪙 {k.coins||0} coins · 🌱 {k.totalPts||0} total</div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:18,border:"1px solid rgba(255,255,255,0.07)",padding:18,marginBottom:14}}>
              <h3 style={{margin:"0 0 12px",fontSize:20}}>🏆 Leaderboard</h3>
              {[...kids].sort((a,b)=>getWeekPts(b.id)-getWeekPts(a.id)).map((k,i)=>{
                const pts=getWeekPts(k.id), max=Math.max(...kids.map(kk=>getWeekPts(kk.id)),1);
                return (
                  <div key={k.id} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Nunito",fontSize:14,marginBottom:4}}>
                      <span>{["🥇","🥈","🥉","4️⃣"][i]} {k.avatar} {k.name}</span>
                      <span style={{color:"#fbbf24",fontWeight:700}}>{pts}</span>
                    </div>
                    <div style={{background:"rgba(255,255,255,0.07)",borderRadius:99,height:12,overflow:"hidden"}}>
                      <div style={{background:i===0?"linear-gradient(90deg,#fbbf24,#f97316)":"linear-gradient(90deg,#6366f1,#8b5cf6)",height:"100%",width:`${(pts/max)*100}%`,borderRadius:99,transition:"width 0.5s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:18,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <h3 style={{margin:0,fontSize:18}}>📋 This Week — {kid.name}</h3>
              </div>
              {tasks.map(task=>{
                const done=completions[weekKey]?.[kid.id]?.[task.id]||[];
                return (
                  <div key={task.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 16px",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,fontFamily:"Nunito",fontSize:13}}>{task.emoji} {task.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{display:"flex",gap:3}}>{WEEK_DAYS.map((_,di)=><div key={di} style={{width:8,height:8,borderRadius:"50%",background:done.includes(di)?"#10b981":"rgba(255,255,255,0.08)"}}/>)}</div>
                      <span style={{fontFamily:"Nunito",color:done.length?"#fbbf24":"#334155",fontSize:12,fontWeight:700,minWidth:28,textAlign:"right"}}>{done.length?`+${done.length*task.points}`:"—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ SETTINGS (Admin only) ════ */}
        {view==="settings" && isAdmin && (
          <div style={{animation:"slideUp 0.3s ease"}}>
            {/* Sharing */}
            <div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,padding:20,border:"1px solid rgba(255,255,255,0.08)",marginBottom:12}}>
              <h3 style={{margin:"0 0 8px",fontSize:22}}>👨‍👩‍👧‍👦 Share with Wife & Nanny</h3>
              <p style={{fontFamily:"Nunito",color:"#94a3b8",fontSize:13,margin:"0 0 14px"}}>Anyone with the Family Code + correct PIN can join on any device.</p>
              <button onClick={()=>setShowFamilyCode(true)} style={{background:"linear-gradient(135deg,#f59e0b,#f97316)",border:"none",borderRadius:14,padding:"10px 22px",fontSize:16,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer",boxShadow:"0 4px 20px rgba(245,158,11,.35)",marginBottom:14}}>
                🔑 Show Family Code
              </button>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{role:"Admin 👑",who:"You + Wife",color:"#f59e0b",can:["Full access","Settings","Add/remove kids","All tasks & reports"]},
                  {role:"Nanny 🌸",who:"Your nanny",color:"#a78bfa",can:["Check off tasks","Add new tasks","See reports","Cannot edit settings"]}
                ].map(r=>(
                  <div key={r.role} style={{background:`rgba(${r.color==="f59e0b"?"245,158,11":"167,139,250"},.08)`,border:`1px solid rgba(${r.color==="f59e0b"?"245,158,11":"167,139,250"},.2)`,borderRadius:14,padding:14}}>
                    <div style={{fontFamily:"Fredoka One",fontSize:16,color:r.color,marginBottom:3}}>{r.role}</div>
                    <div style={{fontFamily:"Nunito",fontSize:11,color:"#64748b",marginBottom:8}}>{r.who}</div>
                    {r.can.map(c=><div key={c} style={{fontFamily:"Nunito",fontSize:11,color:"#94a3b8",marginBottom:2}}>• {c}</div>)}
                  </div>
                ))}
              </div>
            </div>

            {/* Firebase status */}
            <div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,padding:20,border:"1px solid rgba(255,255,255,0.08)",marginBottom:12}}>
              <h3 style={{margin:"0 0 8px",fontSize:22}}>🔥 Firebase Status</h3>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:FIREBASE_ENABLED?"#10b981":"#f59e0b",boxShadow:FIREBASE_ENABLED?"0 0 8px #10b981":"0 0 8px #f59e0b"}}/>
                <span style={{fontFamily:"Nunito",fontSize:14,color:FIREBASE_ENABLED?"#10b981":"#f59e0b"}}>{FIREBASE_ENABLED?"Connected — real-time sync active":"Not connected — data is local to this device"}</span>
              </div>
              {!FIREBASE_ENABLED && (
                <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:14}}>
                  <p style={{fontFamily:"Nunito",color:"#fbbf24",fontSize:13,margin:"0 0 10px",fontWeight:700}}>To enable multi-device sync:</p>
                  {["1. Go to console.firebase.google.com",
                    "2. Create project → Build → Realtime Database",
                    "3. Start in Test Mode → copy the database URL",
                    "4. Project Settings → Your Apps → Web App → copy config",
                    "5. Paste values into FIREBASE_CONFIG at top of KidQuestV3.jsx",
                    "6. Set FIREBASE_ENABLED = true (it auto-sets when config is filled)",
                  ].map((s,i)=><p key={i} style={{fontFamily:"Nunito",color:"#94a3b8",fontSize:12,margin:"0 0 5px"}}>{s}</p>)}
                </div>
              )}
            </div>

            {/* Milestones */}
            <div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,padding:20,border:"1px solid rgba(255,255,255,0.08)",marginBottom:12}}>
              <h3 style={{margin:"0 0 12px",fontSize:22}}>🏆 Celebrations</h3>
              {MILESTONES.map(m=>(
                <div key={m.pts} style={{display:"flex",alignItems:"center",gap:12,marginBottom:9}}>
                  <span style={{fontSize:24}}>{m.emoji}</span>
                  <div><div style={{fontFamily:"Nunito",fontWeight:700,color:m.color}}>{m.label}</div>
                  <div style={{fontFamily:"Nunito",fontSize:11,color:"#475569"}}>{m.pts} weekly points → confetti + pop-up!</div></div>
                </div>
              ))}
              <div style={{marginTop:10,background:"rgba(99,102,241,.1)",borderRadius:12,padding:12,border:"1px solid rgba(99,102,241,.2)"}}>
                <p style={{fontFamily:"Nunito",color:"#a78bfa",fontSize:12,margin:0}}>🌱 Pet evolution also triggers a celebration when it reaches Baby (75pts), Teen (200pts), or Legendary (450pts) lifetime points!</p>
              </div>
            </div>

            <button onClick={()=>{ if(confirm("Sign out?")) logout(); }} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"10px 22px",color:"#94a3b8",fontFamily:"Nunito",fontSize:14,cursor:"pointer",fontWeight:700,marginRight:10}}>
              Sign Out
            </button>
            <button onClick={()=>{ if(confirm("Reset ALL data? This cannot be undone.")){ db.set(`families/${session.familyCode}`,null); localStorage.removeItem("kq3_session"); window.location.reload(); }}} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:14,padding:"10px 22px",color:"#ef4444",fontFamily:"Nunito",fontSize:14,cursor:"pointer",fontWeight:700}}>
              🗑️ Reset Family
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

