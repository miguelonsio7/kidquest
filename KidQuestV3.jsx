import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   KIDQUEST v4  —  Bilingual EN/ES · Past-Week Editing · Bug Fixes
   ═══════════════════════════════════════════════════════════════════
   Replace the three values below with your Firebase credentials.
   ═══════════════════════════════════════════════════════════════════ */

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBIsFxke5iu2xCSkwUw47XmfZ-B4upCr2Y",
  databaseURL:       "https://kidquest---chore-game-default-rtdb.firebaseio.com",
  projectId:         "kidquest---chore-game",
};
const FIREBASE_ENABLED = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  en: {
    // Nav
    tracker:"Tracker", pet:"Pet", report:"Report", settings:"Settings",
    signOut:"Sign out",
    // Roles
    admin:"Admin 👑", nanny:"Nanny 🌸",
    // Kid switcher
    pts:"pts", coins:"coins",
    // Tracker
    mission:"Mission", addMission:"+ Add custom mission",
    addBtn:"Add", cancel:"Cancel",
    missionPlaceholder:"Mission name…",
    // Progress
    next:"Next", toEvolve:"to evolve",
    // Pet
    petShop:"🛒 Pet Shop", equipped:"Equipped",
    growthJourney:"🌱 Growth Journey", maxLevel:"🔥 MAX LEVEL!",
    openShop:"Open Pet Shop",
    // Shop
    shopTitle:"🛒 Pet Shop", accessory:"Accessory", home:"Home",
    toy:"Toy", treat:"Treat", equip:"Equip", owned:"✅ Owned",
    // Report
    thisWeek:"📅 This Week", thisMonth:"📆 This Month",
    leaderboard:"🏆 Leaderboard", weeklyBreakdown:"📋 This Week",
    // Settings
    shareFamily:"👨‍👩‍👧‍👦 Share with Wife & Nanny",
    shareDesc:"Anyone with the Family Code + correct PIN can join on any device.",
    showCode:"🔑 Show Family Code",
    firebaseStatus:"🔥 Firebase Status",
    connected:"Connected — real-time sync active",
    notConnected:"Not connected — data is local to this device",
    celebrations:"🏆 Celebrations",
    weeklyPts:"weekly points → confetti + pop-up!",
    petEvolution:"🌱 Pet evolution also triggers a celebration at Baby (75pts), Teen (200pts), or Legendary (450pts) lifetime points!",
    resetFamily:"🗑️ Reset Family",
    // Family code modal
    yourFamilyCode:"Your Family Code",
    familyCodeDesc:"Share this code + the PIN to let others join on any device",
    adminPIN:"Admin PIN", nannyPIN:"Nanny PIN",
    youWife:"You + Wife", nannyLabel:"Nanny",
    familyCodeNote:"They'll open the app URL, tap \"Join family\", enter this code, then their PIN.",
    close:"Close",
    // Roles description
    fullAccess:"Full access", settingsAccess:"Settings", addRemoveKids:"Add/remove kids",
    allTasksReports:"All tasks & reports", checkTasks:"Check off tasks",
    addTasks:"Add new tasks", seeReports:"See reports", cannotEdit:"Cannot edit settings",
    // Setup
    howManyHeroes:"How many heroes? 🦸",
    chooseHeroCount:"Choose how many kids will use KidQuest",
    kid:"kid", kids:"kids",
    setupHeroes:"Set up your heroes ⚔️",
    nameEachKid:"Name each kid and choose their pet companion",
    hero:"Hero", heroName:"'s name…",
    petCompanion:"Pet companion", namePet:"Name your ",
    chooseMissions:"Choose starting missions ⚔️",
    missionsSelected:"missions selected",
    chooseMissionsBtn:"Choose Missions →",
    setPINs:"Set up PINs →",
    setAdminPIN:"Set Admin PIN",
    adminPINDesc:"You & your wife — full access to all settings",
    setNannyPIN:"Set Nanny PIN",
    nannyPINDesc:"Nanny can check tasks, add missions & see reports",
    pinSharingTitle:"💡 How PIN sharing works",
    pinSharingDesc:"After setup, you'll get a Family Code. Share it (plus the PIN) with your wife and nanny so they can log in on any device.",
    readyToLaunch:"Ready to launch!",
    yourFamilySetup:"Your family setup:",
    heroes:"Heroes", missions:"Missions", adminPINSet:"✓ set", nannyPINSet:"✓ set",
    firebaseWarning:"Firebase not yet configured — data saves locally. See Settings to connect.",
    creating:"Creating family…", launch:"🚀 LAUNCH KIDQUEST!",
    // Join
    joinFamily:"Join your family",
    joinDesc:"Enter the Family Code from the Settings screen",
    findFamily:"Find Family →", searching:"Searching…",
    codeNotFound:"Family code not found. Check and try again.",
    wrongPIN:"Wrong PIN — try again!",
    firstTime:"Setting up for the first time?",
    createNewFamily:"Create a new family",
    // PIN pad
    enterPIN:"Enter your PIN", adminOrNanny:"Admin or Nanny PIN",
    // Celebration
    petEvolved:"PET EVOLVED! 🔥", grewTo:"grew to",
    tapToContinue:"Tap to continue",
    hitPoints:"hit", weeklyPoints:"weekly points!",
    // Pet stage labels
    egg:"Egg 🥚", baby:"Baby 🐣", teen:"Teen ⚡", legendary:"LEGENDARY 🔥",
    // Milestone labels
    rookieHero:"Rookie Hero", questSeeker:"Quest Seeker",
    starChampion:"Star Champion", dragonSlayer:"Dragon Slayer", legend:"LEGEND",
    // Pet species
    dragon:"Dragon", wolfPup:"Wolf Pup", magicCat:"Magic Cat",
    dino:"Dino", robotPal:"Robot Pal", phoenix:"Phoenix",
    // Shop items
    coolHat:"Cool Hat", partyHat:"Party Hat", crown:"Crown",
    cape:"Cape", goldMedal:"Gold Medal", cozyDen:"Cozy Den",
    castle:"Castle", spaceStation:"Space Station", ball:"Ball",
    rocketShip:"Rocket Ship", treasureChest:"Treasure Chest",
    steakDinner:"Steak Dinner", birthdayCake:"Birthday Cake",
    // Task names
    makeBed:"Make Bed", brushTeeth:"Brush Teeth", putAwayToys:"Put Away Toys",
    setTable:"Set the Table", clearTable:"Clear the Table", feedPet:"Feed Pet",
    waterPlants:"Water Plants", read20:"Read 20 min", homeworkDone:"Homework Done",
    takeOutTrash:"Take Out Trash", sortLaundry:"Sort Laundry", washHands:"Wash Hands",
    practiceInstrument:"Practice Instrument", exerciseOutside:"Exercise Outside",
    tidyClothes:"Tidy Clothes", unloadDishwasher:"Unload Dishwasher",
    // Task categories
    catRoom:"Room", catHygiene:"Hygiene", catKitchen:"Kitchen",
    catChores:"Chores", catLearning:"Learning", catHealth:"Health", catCustom:"Custom",
    // Week days
    weekDays:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    // Week navigation
    currentWeek:"Current Week", prevWeek:"◀ Prev Week", nextWeek:"Next Week ▶",
    weekOf:"Week of",
    // Report
    total:"total",
    // Language toggle
    language:"ES",
  },
  es: {
    tracker:"Tareas", pet:"Mascota", report:"Reporte", settings:"Config",
    signOut:"Salir",
    admin:"Admin 👑", nanny:"Niñera 🌸",
    pts:"pts", coins:"monedas",
    mission:"Misión", addMission:"+ Agregar misión",
    addBtn:"Agregar", cancel:"Cancelar",
    missionPlaceholder:"Nombre de misión…",
    next:"Siguiente", toEvolve:"para evolucionar",
    petShop:"🛒 Tienda", equipped:"Equipado",
    growthJourney:"🌱 Crecimiento", maxLevel:"🔥 ¡NIVEL MÁX!",
    openShop:"Abrir Tienda",
    shopTitle:"🛒 Tienda de Mascotas", accessory:"Accesorio", home:"Casa",
    toy:"Juguete", treat:"Golosina", equip:"Equipar", owned:"✅ Tuyo",
    report:"Reporte",
    thisWeek:"📅 Esta Semana", thisMonth:"📆 Este Mes",
    leaderboard:"🏆 Tabla de Posiciones", weeklyBreakdown:"📋 Esta Semana",
    shareFamily:"👨‍👩‍👧‍👦 Compartir con Esposa y Niñera",
    shareDesc:"Cualquiera con el Código Familiar + PIN correcto puede unirse desde cualquier dispositivo.",
    showCode:"🔑 Mostrar Código Familiar",
    firebaseStatus:"🔥 Estado de Firebase",
    connected:"Conectado — sincronización en tiempo real activa",
    notConnected:"No conectado — datos guardados localmente",
    celebrations:"🏆 Celebraciones",
    weeklyPts:"puntos semanales → ¡confeti + mensaje!",
    petEvolution:"🌱 ¡La evolución de la mascota también activa una celebración en Bebé (75pts), Adolescente (200pts) o Legendario (450pts)!",
    resetFamily:"🗑️ Reiniciar Familia",
    yourFamilyCode:"Tu Código Familiar",
    familyCodeDesc:"Comparte este código + el PIN para que otros se unan desde cualquier dispositivo",
    adminPIN:"PIN Admin", nannyPIN:"PIN Niñera",
    youWife:"Tú + Esposa", nannyLabel:"Niñera",
    familyCodeNote:"Abrirán la URL de la app, tocarán \"Unirse a familia\", ingresarán este código y luego su PIN.",
    close:"Cerrar",
    fullAccess:"Acceso completo", settingsAccess:"Configuración", addRemoveKids:"Agregar/quitar niños",
    allTasksReports:"Todas las tareas y reportes", checkTasks:"Marcar tareas",
    addTasks:"Agregar misiones", seeReports:"Ver reportes", cannotEdit:"No puede editar configuración",
    howManyHeroes:"¿Cuántos héroes? 🦸",
    chooseHeroCount:"Elige cuántos niños usarán KidQuest",
    kid:"niño", kids:"niños",
    setupHeroes:"Configura tus héroes ⚔️",
    nameEachKid:"Nombra a cada niño y elige su mascota compañera",
    hero:"Héroe", heroName:" nombre…",
    petCompanion:"Mascota compañera", namePet:"Nombra tu ",
    chooseMissions:"Elige misiones iniciales ⚔️",
    missionsSelected:"misiones seleccionadas",
    chooseMissionsBtn:"Elegir Misiones →",
    setPINs:"Configurar PINs →",
    setAdminPIN:"Establecer PIN Admin",
    adminPINDesc:"Tú y tu esposa — acceso completo a la configuración",
    setNannyPIN:"Establecer PIN Niñera",
    nannyPINDesc:"La niñera puede marcar tareas, agregar misiones y ver reportes",
    pinSharingTitle:"💡 Cómo funciona el PIN",
    pinSharingDesc:"Después de la configuración, obtendrás un Código Familiar. Compártelo (más el PIN) con tu esposa y niñera para que puedan iniciar sesión en cualquier dispositivo.",
    readyToLaunch:"¡Listo para lanzar!",
    yourFamilySetup:"Configuración de tu familia:",
    heroes:"Héroes", missions:"Misiones", adminPINSet:"✓ listo", nannyPINSet:"✓ listo",
    firebaseWarning:"Firebase no configurado — datos guardados localmente. Ve a Configuración para conectar.",
    creating:"Creando familia…", launch:"🚀 ¡LANZAR KIDQUEST!",
    joinFamily:"Únete a tu familia",
    joinDesc:"Ingresa el Código Familiar desde la pantalla de Configuración",
    findFamily:"Buscar Familia →", searching:"Buscando…",
    codeNotFound:"Código familiar no encontrado. Verifica e intenta de nuevo.",
    wrongPIN:"PIN incorrecto — ¡intenta de nuevo!",
    firstTime:"¿Configurando por primera vez?",
    createNewFamily:"Crear nueva familia",
    enterPIN:"Ingresa tu PIN", adminOrNanny:"PIN de Admin o Niñera",
    petEvolved:"¡MASCOTA EVOLUCIONÓ! 🔥", grewTo:"creció a",
    tapToContinue:"Toca para continuar",
    hitPoints:"alcanzó", weeklyPoints:"¡puntos semanales!",
    egg:"Huevo 🥚", baby:"Bebé 🐣", teen:"Adolescente ⚡", legendary:"¡LEGENDARIO! 🔥",
    rookieHero:"Héroe Novato", questSeeker:"Buscador de Misiones",
    starChampion:"Campeón Estelar", dragonSlayer:"Cazador de Dragones", legend:"LEYENDA",
    dragon:"Dragón", wolfPup:"Cachorro Lobo", magicCat:"Gato Mágico",
    dino:"Dino", robotPal:"Robot Amigo", phoenix:"Fénix",
    coolHat:"Sombrero Cool", partyHat:"Gorro de Fiesta", crown:"Corona",
    cape:"Capa", goldMedal:"Medalla de Oro", cozyDen:"Guarida Acogedora",
    castle:"Castillo", spaceStation:"Estación Espacial", ball:"Pelota",
    rocketShip:"Cohete", treasureChest:"Cofre del Tesoro",
    steakDinner:"Cena de Carne", birthdayCake:"Pastel de Cumpleaños",
    makeBed:"Tender la Cama", brushTeeth:"Cepillarse los Dientes", putAwayToys:"Guardar Juguetes",
    setTable:"Poner la Mesa", clearTable:"Limpiar la Mesa", feedPet:"Alimentar Mascota",
    waterPlants:"Regar Plantas", read20:"Leer 20 min", homeworkDone:"Tarea Hecha",
    takeOutTrash:"Sacar la Basura", sortLaundry:"Ordenar Ropa", washHands:"Lavarse las Manos",
    practiceInstrument:"Practicar Instrumento", exerciseOutside:"Ejercicio Afuera",
    tidyClothes:"Ordenar Ropa", unloadDishwasher:"Vaciar Lavavajillas",
    catRoom:"Cuarto", catHygiene:"Higiene", catKitchen:"Cocina",
    catChores:"Quehaceres", catLearning:"Aprendizaje", catHealth:"Salud", catCustom:"Personalizado",
    weekDays:["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
    currentWeek:"Semana Actual", prevWeek:"◀ Sem. Anterior", nextWeek:"Sem. Siguiente ▶",
    weekOf:"Semana del",
    total:"total",
    language:"EN",
  }
};

// Task id → translation key map
const TASK_KEY = {
  t1:"makeBed",t2:"brushTeeth",t3:"putAwayToys",t4:"setTable",t5:"clearTable",
  t6:"feedPet",t7:"waterPlants",t8:"read20",t9:"homeworkDone",t10:"takeOutTrash",
  t11:"sortLaundry",t12:"washHands",t13:"practiceInstrument",t14:"exerciseOutside",
  t15:"tidyClothes",t16:"unloadDishwasher",
};
const CAT_KEY = { Room:"catRoom",Hygiene:"catHygiene",Kitchen:"catKitchen",Chores:"catChores",Learning:"catLearning",Health:"catHealth",Custom:"catCustom" };
const SHOP_KEY = { s1:"coolHat",s2:"partyHat",s3:"crown",s4:"cape",s5:"goldMedal",h1:"cozyDen",h2:"castle",h3:"spaceStation",a1:"ball",a2:"rocketShip",a3:"treasureChest",f1:"steakDinner",f2:"birthdayCake" };
const SPECIES_KEY = { dragon:"dragon",wolf:"wolfPup",cat:"magicCat",dino:"dino",robot:"robotPal",phoenix:"phoenix" };
const MILESTONE_KEY = { 50:"rookieHero",100:"questSeeker",200:"starChampion",500:"dragonSlayer",1000:"legend" };

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const TASK_LIBRARY = [
  { id:"t1",  emoji:"🛏️", points:5,  cat:"Room"     },
  { id:"t2",  emoji:"🦷", points:5,  cat:"Hygiene"  },
  { id:"t3",  emoji:"🧸", points:5,  cat:"Room"     },
  { id:"t4",  emoji:"🍽️", points:10, cat:"Kitchen"  },
  { id:"t5",  emoji:"🧹", points:10, cat:"Kitchen"  },
  { id:"t6",  emoji:"🐕", points:10, cat:"Chores"   },
  { id:"t7",  emoji:"🌱", points:10, cat:"Chores"   },
  { id:"t8",  emoji:"📚", points:15, cat:"Learning" },
  { id:"t9",  emoji:"✏️", points:20, cat:"Learning" },
  { id:"t10", emoji:"🗑️", points:15, cat:"Chores"   },
  { id:"t11", emoji:"👕", points:10, cat:"Chores"   },
  { id:"t12", emoji:"🧼", points:5,  cat:"Hygiene"  },
  { id:"t13", emoji:"🎵", points:20, cat:"Learning" },
  { id:"t14", emoji:"⚽", points:15, cat:"Health"   },
  { id:"t15", emoji:"🧺", points:5,  cat:"Room"     },
  { id:"t16", emoji:"🍴", points:15, cat:"Kitchen"  },
];

const PET_SPECIES = [
  { id:"dragon",  stageKey:"dragon",  stages:["🥚","🐣","🐲","🔥🐉🔥"], color:"#ef4444" },
  { id:"wolf",    stageKey:"wolfPup", stages:["🐾","🐶","🐺","⚡🐺⚡"], color:"#6366f1" },
  { id:"cat",     stageKey:"magicCat",stages:["✨","🐱","😺","🌟😸🌟"], color:"#8b5cf6" },
  { id:"dino",    stageKey:"dino",    stages:["🥚","🦕","🦖","💥🦖💥"], color:"#10b981" },
  { id:"robot",   stageKey:"robotPal",stages:["⚙️","🤖","🦾","🚀🤖🚀"], color:"#0ea5e9" },
  { id:"phoenix", stageKey:"phoenix", stages:["🪺","🐦","🦜","🔥🦅🔥"], color:"#f97316" },
];

const PET_THRESHOLDS = [0, 75, 200, 450];

const SHOP_ITEMS = [
  { id:"s1", emoji:"🎩", cost:30,  cat:"Accessory", slot:"hat"  },
  { id:"s2", emoji:"🥳", cost:20,  cat:"Accessory", slot:"hat"  },
  { id:"s3", emoji:"👑", cost:80,  cat:"Accessory", slot:"hat"  },
  { id:"s4", emoji:"🦸", cost:60,  cat:"Accessory", slot:"neck" },
  { id:"s5", emoji:"🏅", cost:100, cat:"Accessory", slot:"neck" },
  { id:"h1", emoji:"🏠", cost:50,  cat:"Home",      slot:"home" },
  { id:"h2", emoji:"🏰", cost:150, cat:"Home",      slot:"home" },
  { id:"h3", emoji:"🛸", cost:200, cat:"Home",      slot:"home" },
  { id:"a1", emoji:"⚽", cost:20,  cat:"Toy",       slot:"toy"  },
  { id:"a2", emoji:"🚀", cost:90,  cat:"Toy",       slot:"toy"  },
  { id:"a3", emoji:"💰", cost:120, cat:"Toy",       slot:"toy"  },
  { id:"f1", emoji:"🥩", cost:15,  cat:"Treat",     slot:null   },
  { id:"f2", emoji:"🎂", cost:25,  cat:"Treat",     slot:null   },
];

const MILESTONE_PTS = [50, 100, 200, 500, 1000];
const MILESTONE_EMOJI = { 50:"⭐", 100:"⚔️", 200:"🏆", 500:"🐲", 1000:"👑" };
const MILESTONE_COLOR = { 50:"#f59e0b", 100:"#10b981", 200:"#3b82f6", 500:"#8b5cf6", 1000:"#ef4444" };

const AVATARS = ["🦁","🐯","🦊","🐺","🦅","🐉","🤖","🦄","🐼","🦈","🦖","🧙"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getWeekKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset * 7);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split("T")[0];
}
function getTodayIdx() { const d = new Date().getDay(); return d===0?6:d-1; }
function getPetStage(pts) {
  let s=0; for(let i=PET_THRESHOLDS.length-1;i>=0;i--) if(pts>=PET_THRESHOLDS[i]){s=i;break;} return s;
}
function hexRgb(hex) { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`; }
function makeFamilyCode() { return Math.random().toString(36).slice(2,8).toUpperCase(); }
function taskName(task, lang) {
  if (task.cat === "Custom") return task.name;
  return T[lang][TASK_KEY[task.id]] || task.name || task.id;
}
function catName(cat, lang) { return T[lang][CAT_KEY[cat]] || cat; }
function shopName(item, lang) { return T[lang][SHOP_KEY[item.id]] || item.id; }
function shopCatName(cat, lang) {
  const map = { Accessory: lang==="es"?"Accesorio":"Accessory", Home: lang==="es"?"Casa":"Home", Toy: lang==="es"?"Juguete":"Toy", Treat: lang==="es"?"Golosina":"Treat" };
  return map[cat] || cat;
}
function speciesName(sp, lang) { return T[lang][SPECIES_KEY[sp.id]] || sp.id; }
function stageLabel(s, lang) { return [T[lang].egg, T[lang].baby, T[lang].teen, T[lang].legendary][s]; }
function milestoneLabel(pts, lang) { return T[lang][MILESTONE_KEY[pts]] || ""; }

// ─── FIREBASE BRIDGE ─────────────────────────────────────────────────────────
class DB {
  constructor() { this._listeners={}; this._local={}; }
  async init() {
    if (!FIREBASE_ENABLED) return;
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
      const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej;
      document.head.appendChild(s);
    });
  }
  async get(path) {
    if (this._db) { const snap=await this._db.ref(path).get(); return snap.exists()?snap.val():null; }
    return this._local[path]??null;
  }
  async set(path, value) {
    if (this._db) return this._db.ref(path).set(value);
    this._local[path]=value; this._notify(path,value);
  }
  subscribe(path, cb) {
    if (this._db) {
      const ref=this._db.ref(path);
      ref.on("value", snap=>cb(snap.exists()?snap.val():null));
      return ()=>ref.off("value");
    }
    if (!this._listeners[path]) this._listeners[path]=[];
    this._listeners[path].push(cb);
    cb(this._local[path]??null);
    return ()=>{ this._listeners[path]=this._listeners[path].filter(f=>f!==cb); };
  }
  _notify(path,val) {
    (this._listeners[path]||[]).forEach(f=>f(val));
    const parts=path.split("/");
    for(let i=parts.length-1;i>0;i--){
      const p=parts.slice(0,i).join("/");
      if(this._listeners[p]){ const v=this._local[p]??null; this._listeners[p].forEach(f=>f(v)); }
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
      id:i,x:Math.random()*100,
      color:["#fbbf24","#ef4444","#10b981","#3b82f6","#8b5cf6","#f97316","#ec4899"][i%7],
      size:6+Math.random()*10,delay:Math.random()*0.8,dur:1.5+Math.random(),rot:Math.random()*360,
    })));
    const t=setTimeout(()=>{ setP([]); onDone&&onDone(); },3000);
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
    const next=[...digits,d]; setDigits(next);
    if(next.length===4){ setTimeout(()=>{ onSubmit(next.join("")); setDigits([]); },200); }
  };
  const del = () => setDigits(d=>d.slice(0,-1));
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24,padding:"40px 20px"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:52}}>🔐</div>
        <h2 style={{fontFamily:"Fredoka One",fontSize:28,color:"#fff",margin:"8px 0 4px"}}>{title}</h2>
        <p style={{fontFamily:"Nunito",color:"#64748b",margin:0,fontSize:15}}>{subtitle}</p>
      </div>
      <div style={{display:"flex",gap:16}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:20,height:20,borderRadius:"50%",
            background:digits.length>i?"#fbbf24":"rgba(255,255,255,0.15)",
            border:"2px solid rgba(255,255,255,0.2)",transition:"background 0.15s"}}/>
        ))}
      </div>
      {error&&<p style={{fontFamily:"Nunito",color:"#ef4444",fontSize:14,margin:0}}>{error}</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:10}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
          <button key={i} onClick={()=>k==="⌫"?del():k!==""&&add(k.toString())} disabled={k===""}
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
function PetDisplay({ pet, equipped, totalPts, compact=false, lang="en" }) {
  const sp=PET_SPECIES.find(s=>s.id===pet?.species)||PET_SPECIES[0];
  const stage=getPetStage(totalPts||0);
  const petEmoji=sp.stages[stage];
  const nextT=PET_THRESHOLDS[stage+1];
  const pct=nextT?Math.min(100,(totalPts-PET_THRESHOLDS[stage])/(nextT-PET_THRESHOLDS[stage])*100):100;
  const hatItem=SHOP_ITEMS.find(i=>i.id===equipped?.hat);
  const neckItem=SHOP_ITEMS.find(i=>i.id===equipped?.neck);
  const toyItem=SHOP_ITEMS.find(i=>i.id===equipped?.toy);
  const homeItem=SHOP_ITEMS.find(i=>i.id===equipped?.home);
  if(compact) return (
    <div style={{textAlign:"center"}}>
      <div style={{position:"relative",display:"inline-block"}}>
        {hatItem&&<div style={{fontSize:16,position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)"}}>{hatItem.emoji}</div>}
        <div style={{fontSize:44,lineHeight:1,filter:`drop-shadow(0 0 10px ${sp.color}88)`,animation:"petbob 2s ease-in-out infinite"}}>{petEmoji}</div>
        {neckItem&&<div style={{fontSize:12,position:"absolute",bottom:-6,right:-8}}>{neckItem.emoji}</div>}
      </div>
      <div style={{fontFamily:"Nunito",fontSize:10,color:"#94a3b8",marginTop:4}}>{stageLabel(stage,lang)}</div>
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
        <div style={{fontFamily:"Nunito",fontSize:12,color:sp.color,marginTop:2}}>{speciesName(sp,lang)} · {stageLabel(stage,lang)}</div>
        {nextT?(
          <div style={{margin:"10px auto 0",maxWidth:180}}>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Nunito",fontSize:10,color:"#64748b",marginBottom:3}}>
              <span>{totalPts} pts</span><span>{nextT} {T[lang].toEvolve}</span>
            </div>
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:99,height:8,overflow:"hidden"}}>
              <div style={{background:`linear-gradient(90deg,${sp.color},${sp.color}bb)`,height:"100%",width:`${pct}%`,borderRadius:99,transition:"width 0.6s"}}/>
            </div>
          </div>
        ):<div style={{fontFamily:"Nunito",fontSize:12,color:"#fbbf24",marginTop:6}}>{T[lang].maxLevel}</div>}
      </div>
    </div>
  );
}

// ─── SHOP MODAL ───────────────────────────────────────────────────────────────
function ShopModal({ kid, onBuy, onEquip, onClose, lang }) {
  const t=T[lang];
  const [tab,setTab]=useState("Accessory");
  const owned=kid.owned||[], equipped=kid.equipped||{};
  const cats=["Accessory","Home","Toy","Treat"];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"linear-gradient(160deg,#1e1b4b,#0f172a)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:28,width:"100%",maxWidth:500,maxHeight:"88vh",overflowY:"auto",padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h2 style={{fontFamily:"Fredoka One",fontSize:24,color:"#fff",margin:0}}>{t.shopTitle}</h2>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"Nunito",color:"#fbbf24",fontWeight:800}}>🪙 {kid.coins||0}</span>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,width:28,height:28,color:"#fff",cursor:"pointer",fontSize:16}}>✕</button>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setTab(c)} style={{flex:1,background:tab===c?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${tab===c?"#fbbf24":"rgba(255,255,255,0.1)"}`,borderRadius:10,padding:"5px 2px",color:tab===c?"#fbbf24":"#64748b",fontFamily:"Nunito",fontSize:11,cursor:"pointer"}}>
              {shopCatName(c,lang)}
            </button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
          {SHOP_ITEMS.filter(i=>i.cat===tab).map(item=>{
            const isOwned=owned.includes(item.id);
            const isEquipped=item.slot&&equipped[item.slot]===item.id;
            const canAfford=(kid.coins||0)>=item.cost;
            return (
              <div key={item.id} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${isEquipped?"#fbbf24":isOwned?"#10b981":"rgba(255,255,255,0.1)"}`,borderRadius:14,padding:12,textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:4}}>{item.emoji}</div>
                <div style={{fontFamily:"Nunito",fontSize:13,fontWeight:700,color:"#fff"}}>{shopName(item,lang)}</div>
                <div style={{marginTop:8}}>
                  {isEquipped?<span style={{fontFamily:"Nunito",fontSize:11,color:"#fbbf24"}}>✨ {t.equipped}</span>
                  :isOwned&&item.slot?<button onClick={()=>onEquip(item)} style={{background:"rgba(16,185,129,.2)",border:"1px solid #10b981",borderRadius:8,padding:"4px 12px",color:"#10b981",fontFamily:"Nunito",fontSize:11,cursor:"pointer"}}>{t.equip}</button>
                  :isOwned?<span style={{fontFamily:"Nunito",fontSize:11,color:"#10b981"}}>{t.owned}</span>
                  :<button onClick={()=>canAfford&&onBuy(item)} disabled={!canAfford} style={{background:canAfford?"linear-gradient(135deg,#f59e0b,#f97316)":"rgba(255,255,255,0.05)",border:"none",borderRadius:8,padding:"4px 12px",color:canAfford?"#fff":"#475569",fontFamily:"Nunito",fontSize:11,cursor:canAfford?"pointer":"not-allowed"}}>🪙 {item.cost}</button>}
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
function SetupWizard({ onComplete, lang, setLang }) {
  const t=T[lang];
  const [step,setStep]=useState(0);
  const [kidDrafts,setKidDrafts]=useState([]);
  const [adminPIN,setAdminPIN]=useState("");
  const [nannyPIN,setNannyPIN]=useState("");
  const [pinStep,setPinStep]=useState("admin");
  const [selectedTasks,setSelectedTasks]=useState(new Set(["t1","t2","t3","t8","t9","t14"]));
  const [creating,setCreating]=useState(false);
  const updateKid=(i,f,v)=>{ const k=[...kidDrafts]; if(f.startsWith("pet.")) k[i].pet[f.slice(4)]=v; else k[i][f]=v; setKidDrafts(k); };
  const cats=[...new Set(TASK_LIBRARY.map(t=>t.cat))];
  const handlePIN=(pin)=>{
    if(pinStep==="admin"){ setAdminPIN(pin); setPinStep("nanny"); }
    else{ if(pin===adminPIN){ alert(lang==="es"?"El PIN de niñera no puede ser igual al de admin!":"Nanny PIN can't be the same as Admin PIN!"); return; } setNannyPIN(pin); setStep(3); }
  };
  const finish=async()=>{
    setCreating(true);
    const familyCode=makeFamilyCode();
    const tasks=TASK_LIBRARY.filter(t=>selectedTasks.has(t.id));
    const kids=kidDrafts.map((k,i)=>({ id:`kid_${i}`, name:k.name.trim()||`${t.hero} ${i+1}`, avatar:k.avatar, pet:{name:k.pet.name.trim()||`Pet ${i+1}`,species:k.pet.species}, coins:0,totalPts:0,equipped:{},owned:[] }));
    const familyData={ familyCode,adminPIN,nannyPIN, kids:Object.fromEntries(kids.map(k=>[k.id,k])), tasks:Object.fromEntries(tasks.map(t=>[t.id,t])), completions:{},createdAt:Date.now() };
    await db.set(`families/${familyCode}`,familyData);
    localStorage.setItem("kq4_session",JSON.stringify({familyCode,role:"admin"}));
    localStorage.setItem("kq4_lang",lang);
    onComplete({familyCode,role:"admin",data:familyData});
    setCreating(false);
  };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a,#1e1b4b,#0f172a)",color:"#fff",fontFamily:"'Fredoka One',cursive",padding:"24px 16px",overflowY:"auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');@keyframes petbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        {/* Lang toggle */}
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
          <button onClick={()=>setLang(l=>l==="en"?"es":"en")} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"5px 14px",color:"#fbbf24",fontFamily:"Nunito",fontSize:13,cursor:"pointer",fontWeight:700}}>{t.language}</button>
        </div>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:64,animation:"petbob 2s ease-in-out infinite"}}>🚀</div>
          <h1 style={{fontSize:44,margin:"6px 0 2px",background:"linear-gradient(90deg,#fbbf24,#f97316,#ef4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>KidQuest</h1>
          <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:10}}>
            {[t.heroes,t.missions,t.setPINs.replace(" →",""),t.launch.replace("🚀 ","")].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:step>=i?"#fbbf24":"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Nunito",fontSize:11,color:step>=i?"#000":"#475569",fontWeight:700,transition:"all 0.3s"}}>{i+1}</div>
                {i<3&&<span style={{color:"#334155"}}>›</span>}
              </div>
            ))}
          </div>
        </div>
        {step===0&&(
          <div style={{textAlign:"center",animation:"slideUp 0.3s ease"}}>
            <h2 style={{fontSize:26,marginBottom:8}}>{t.howManyHeroes}</h2>
            <p style={{fontFamily:"Nunito",color:"#94a3b8",marginBottom:28}}>{t.chooseHeroCount}</p>
            <div style={{display:"flex",justifyContent:"center",gap:14,flexWrap:"wrap"}}>
              {[1,2,3,4].map(n=>(
                <button key={n} onClick={()=>{ setKidDrafts(Array.from({length:n},(_,i)=>({name:"",avatar:AVATARS[i%AVATARS.length],pet:{name:"",species:PET_SPECIES[i%PET_SPECIES.length].id}}))); setStep(1); }}
                  style={{width:110,height:110,background:"rgba(255,255,255,0.06)",border:"2px solid rgba(255,255,255,0.15)",borderRadius:22,fontSize:38,cursor:"pointer",color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#fbbf24";e.currentTarget.style.background="rgba(251,191,36,0.1)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.background="rgba(255,255,255,0.06)"}}>
                  {["1️⃣","2️⃣","3️⃣","4️⃣"][n-1]}
                  <span style={{fontFamily:"Nunito",fontSize:13,color:"#94a3b8"}}>{n} {n===1?t.kid:t.kids}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {step===1&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <h2 style={{fontSize:26,textAlign:"center",marginBottom:4}}>{t.setupHeroes}</h2>
            <p style={{fontFamily:"Nunito",color:"#94a3b8",textAlign:"center",marginBottom:20}}>{t.nameEachKid}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14,marginBottom:20}}>
              {kidDrafts.map((k,i)=>{
                const sp=PET_SPECIES.find(s=>s.id===k.pet.species);
                return (
                  <div key={i} style={{background:"rgba(255,255,255,0.05)",borderRadius:22,padding:18,border:"1px solid rgba(255,255,255,0.08)"}}>
                    <p style={{fontFamily:"Nunito",color:"#64748b",fontSize:11,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>{t.hero} {i+1}</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                      {AVATARS.map(av=>(<button key={av} onClick={()=>updateKid(i,"avatar",av)} style={{background:k.avatar===av?"rgba(251,191,36,.2)":"rgba(255,255,255,.05)",border:`2px solid ${k.avatar===av?"#fbbf24":"transparent"}`,borderRadius:9,padding:"3px 5px",fontSize:18,cursor:"pointer"}}>{av}</button>))}
                    </div>
                    <input value={k.name} onChange={e=>updateKid(i,"name",e.target.value)} placeholder={`${t.hero} ${i+1}${t.heroName}`} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"9px 12px",color:"#fff",fontSize:17,fontFamily:"Fredoka One",boxSizing:"border-box",outline:"none",marginBottom:12}}/>
                    <p style={{fontFamily:"Nunito",color:"#64748b",fontSize:11,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>{t.petCompanion}</p>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
                      {PET_SPECIES.map(sp2=>(<button key={sp2.id} onClick={()=>updateKid(i,"pet.species",sp2.id)} style={{background:k.pet.species===sp2.id?`rgba(${hexRgb(sp2.color)},.2)`:"rgba(255,255,255,.04)",border:`2px solid ${k.pet.species===sp2.id?sp2.color:"transparent"}`,borderRadius:12,padding:"7px 4px",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:22}}>{sp2.stages[0]}</div><div style={{fontFamily:"Nunito",fontSize:9,color:k.pet.species===sp2.id?sp2.color:"#475569",marginTop:2}}>{speciesName(sp2,lang)}</div></button>))}
                    </div>
                    <input value={k.pet.name} onChange={e=>updateKid(i,"pet.name",e.target.value)} placeholder={`${t.namePet}${speciesName(sp,lang)}…`} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"7px 10px",color:"#fff",fontSize:14,fontFamily:"Nunito",boxSizing:"border-box",outline:"none"}}/>
                  </div>
                );
              })}
            </div>
            <button onClick={()=>setStep(2)} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:16,padding:14,fontSize:20,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer"}}>{t.chooseMissionsBtn}</button>
          </div>
        )}
        {step===2&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <h2 style={{fontSize:26,textAlign:"center",marginBottom:4}}>{t.chooseMissions}</h2>
            <p style={{fontFamily:"Nunito",color:"#94a3b8",textAlign:"center",marginBottom:18}}>{selectedTasks.size} {t.missionsSelected}</p>
            {cats.map(cat=>(
              <div key={cat} style={{marginBottom:14}}>
                <p style={{fontFamily:"Nunito",color:"#475569",fontSize:10,margin:"0 0 7px",textTransform:"uppercase",letterSpacing:1}}>{catName(cat,lang)}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {TASK_LIBRARY.filter(tk=>tk.cat===cat).map(task=>{
                    const on=selectedTasks.has(task.id);
                    return (<button key={task.id} onClick={()=>{ const s=new Set(selectedTasks); s.has(task.id)?s.delete(task.id):s.add(task.id); setSelectedTasks(s); }} style={{background:on?"rgba(251,191,36,.15)":"rgba(255,255,255,.05)",border:`2px solid ${on?"#fbbf24":"rgba(255,255,255,.1)"}`,borderRadius:12,padding:"7px 12px",color:on?"#fbbf24":"#94a3b8",fontSize:13,fontFamily:"Nunito",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>{task.emoji} {taskName(task,lang)} <span style={{opacity:.6}}>+{task.points}</span></button>);
                  })}
                </div>
              </div>
            ))}
            <button onClick={()=>setStep(2.5)} style={{width:"100%",marginTop:6,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:16,padding:14,fontSize:20,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer"}}>{t.setPINs}</button>
          </div>
        )}
        {step===2.5&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:24,border:"1px solid rgba(255,255,255,0.08)",marginBottom:16,padding:"8px 0"}}>
              {pinStep==="admin"?<PinPad title={t.setAdminPIN} subtitle={t.adminPINDesc} onSubmit={handlePIN}/>:<PinPad title={t.setNannyPIN} subtitle={t.nannyPINDesc} onSubmit={handlePIN}/>}
            </div>
            <div style={{background:"rgba(251,191,36,0.08)",borderRadius:14,padding:14,border:"1px solid rgba(251,191,36,0.2)"}}>
              <p style={{fontFamily:"Nunito",color:"#fbbf24",fontSize:13,margin:0,fontWeight:700}}>{t.pinSharingTitle}</p>
              <p style={{fontFamily:"Nunito",color:"#94a3b8",fontSize:12,margin:"6px 0 0"}}>{t.pinSharingDesc}</p>
            </div>
          </div>
        )}
        {step===3&&(
          <div style={{animation:"slideUp 0.3s ease",textAlign:"center"}}>
            <div style={{fontSize:72,animation:"petbob 2s ease-in-out infinite"}}>🎉</div>
            <h2 style={{fontSize:30,marginBottom:8}}>{t.readyToLaunch}</h2>
            <div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,padding:20,border:"1px solid rgba(255,255,255,0.08)",marginBottom:20,textAlign:"left"}}>
              <div style={{fontFamily:"Nunito",fontSize:14,color:"#94a3b8",marginBottom:12}}>{t.yourFamilySetup}</div>
              {[
                [t.heroes, kidDrafts.map(k=>k.name||"?").join(", ")],
                [t.missions, `${selectedTasks.size}`],
                [t.adminPIN, `${"●".repeat(4)} ✓`],
                [t.nannyPIN, `${"●".repeat(4)} ✓`],
              ].map(([label,val])=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",fontFamily:"Nunito",fontSize:14,marginBottom:6}}>
                  <span style={{color:"#64748b"}}>{label}</span><span style={{color:"#fff"}}>{val}</span>
                </div>
              ))}
              {!FIREBASE_ENABLED&&<div style={{marginTop:8,background:"rgba(251,191,36,0.1)",borderRadius:10,padding:"8px 12px",border:"1px solid rgba(251,191,36,0.2)"}}><span style={{fontFamily:"Nunito",fontSize:12,color:"#fbbf24"}}>⚠️ {t.firebaseWarning}</span></div>}
            </div>
            <button onClick={finish} disabled={creating} style={{width:"100%",background:"linear-gradient(135deg,#f59e0b,#f97316)",border:"none",borderRadius:18,padding:18,fontSize:24,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer",opacity:creating?0.7:1}}>
              {creating?t.creating:t.launch}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── JOIN FAMILY ──────────────────────────────────────────────────────────────
function JoinFamily({ onJoin, lang, setLang }) {
  const t=T[lang];
  const [code,setCode]=useState("");
  const [pinError,setPinError]=useState("");
  const [familyData,setFamilyData]=useState(null);
  const [looking,setLooking]=useState(false);
  const lookupCode=async()=>{
    setLooking(true); setPinError("");
    const data=await db.get(`families/${code.toUpperCase()}`);
    setLooking(false);
    if(!data){ setPinError(t.codeNotFound); return; }
    setFamilyData(data);
  };
  const handlePIN=(pin)=>{
    if(!familyData) return;
    if(pin===familyData.adminPIN){ localStorage.setItem("kq4_session",JSON.stringify({familyCode:familyData.familyCode,role:"admin"})); localStorage.setItem("kq4_lang",lang); onJoin({familyCode:familyData.familyCode,role:"admin",data:familyData}); }
    else if(pin===familyData.nannyPIN){ localStorage.setItem("kq4_session",JSON.stringify({familyCode:familyData.familyCode,role:"nanny"})); localStorage.setItem("kq4_lang",lang); onJoin({familyCode:familyData.familyCode,role:"nanny",data:familyData}); }
    else setPinError(t.wrongPIN);
  };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a,#1e1b4b,#0f172a)",color:"#fff",fontFamily:"'Fredoka One',cursive",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');@keyframes petbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
          <button onClick={()=>setLang(l=>l==="en"?"es":"en")} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"5px 14px",color:"#fbbf24",fontFamily:"Nunito",fontSize:13,cursor:"pointer",fontWeight:700}}>{t.language}</button>
        </div>
        {!familyData?(
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:60,animation:"petbob 2s ease-in-out infinite"}}>🔑</div>
            <h2 style={{fontSize:28,marginBottom:6}}>{t.joinFamily}</h2>
            <p style={{fontFamily:"Nunito",color:"#64748b",marginBottom:24}}>{t.joinDesc}</p>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="e.g.  AB12CD" maxLength={6} style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:16,padding:"16px",color:"#fff",fontSize:28,fontFamily:"Fredoka One",textAlign:"center",letterSpacing:6,boxSizing:"border-box",outline:"none",marginBottom:10}}/>
            {pinError&&<p style={{fontFamily:"Nunito",color:"#ef4444",fontSize:13}}>{pinError}</p>}
            <button onClick={lookupCode} disabled={code.length<4||looking} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:14,padding:14,fontSize:18,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer",marginBottom:20,opacity:code.length<4?0.5:1}}>
              {looking?t.searching:t.findFamily}
            </button>
            <p style={{fontFamily:"Nunito",color:"#475569",fontSize:13}}>{t.firstTime}<br/><button onClick={()=>onJoin("setup")} style={{background:"none",border:"none",color:"#6366f1",fontFamily:"Nunito",fontSize:13,cursor:"pointer",textDecoration:"underline"}}>{t.createNewFamily}</button></p>
          </div>
        ):(
          <div>
            <div style={{textAlign:"center",marginBottom:4}}>
              <div style={{fontSize:40}}>🏠</div>
              <h2 style={{fontSize:24}}>{familyData.familyCode}</h2>
            </div>
            <PinPad title={t.enterPIN} subtitle={t.adminOrNanny} onSubmit={handlePIN} error={pinError}/>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function KidQuestApp() {
  const [lang, setLang] = useState(()=>localStorage.getItem("kq4_lang")||"en");
  const [session, setSession] = useState(null);
  const [appData, setAppData] = useState(null);
  // FIX: use kid ID rather than index so switching kids is rock-solid
  const [activeKidId, setActiveKidId] = useState(null);
  const [view, setView] = useState("tracker");
  const [weekOffset, setWeekOffset] = useState(0); // 0=current, 1=last week, 2=two weeks ago
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebInfo, setCelebInfo] = useState(null);
  const [showShop, setShowShop] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({name:"",emoji:"⭐",points:10});
  const [reportPeriod, setReportPeriod] = useState("weekly");
  const [showFamilyCode, setShowFamilyCode] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const unsubRef = useRef(null);
  const t = T[lang];

  // Block Chrome/browser auto-translate
  useEffect(()=>{
    document.documentElement.setAttribute("translate","no");
    document.documentElement.setAttribute("lang","x-kidquest");
    let meta=document.querySelector('meta[name="google"]');
    if(!meta){ meta=document.createElement("meta"); meta.name="google"; document.head.appendChild(meta); }
    meta.content="notranslate";
  },[]);

  useEffect(()=>{
    db.init().then(()=>{
      setDbReady(true);
      const raw=localStorage.getItem("kq4_session");
      if(raw) setSession(JSON.parse(raw));
    });
  },[]);

  useEffect(()=>{
    if(!session||session==="setup"||!dbReady) return;
    if(unsubRef.current) unsubRef.current();
    unsubRef.current=db.subscribe(`families/${session.familyCode}`, data=>{
      if(data){ setAppData(data); }
    });
    return ()=>{ if(unsubRef.current) unsubRef.current(); };
  },[session,dbReady]);

  // When kids load, set active kid to first one (by ID)
  useEffect(()=>{
    if(appData&&!activeKidId){
      const kids=Object.values(appData.kids||{});
      if(kids.length) setActiveKidId(kids[0].id);
    }
  },[appData]);

  const handleSetupComplete=(info)=>{ setSession({familyCode:info.familyCode,role:info.role}); setAppData(info.data); };
  const handleJoin=(info)=>{ if(info==="setup"){ setSession("setup"); return; } setSession({familyCode:info.familyCode,role:info.role}); setAppData(info.data); };

  if(!dbReady) return (
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"Fredoka One",fontSize:24,flexDirection:"column",gap:12}}>
      <div style={{fontSize:60,animation:"petbob 2s ease-in-out infinite"}}>🚀</div>
      <p>Loading KidQuest…</p>
      <style>{`@keyframes petbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  );
  if(!session) return <JoinFamily onJoin={handleJoin} lang={lang} setLang={setLang}/>;
  if(session==="setup") return <SetupWizard onComplete={handleSetupComplete} lang={lang} setLang={setLang}/>;
  if(!appData) return <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"Fredoka One",fontSize:20,flexDirection:"column",gap:12}}><div style={{fontSize:50}}>⏳</div><p>Syncing…</p></div>;

  const isAdmin=session.role==="admin";
  const kids=Object.values(appData.kids||{});
  const tasks=Object.values(appData.tasks||{});
  const completions=appData.completions||{};

  // FIX: look up kid by ID, fall back to first kid safely
  const kid=kids.find(k=>k.id===activeKidId)||kids[0];
  if(!kid) return null;

  const weekKey=getWeekKey(weekOffset);
  const todayIdx=getTodayIdx();
  const isCurrentWeek=weekOffset===0;

  // Week label for display
  const weekLabel=(()=>{
    if(weekOffset===0) return t.currentWeek;
    const d=new Date(weekKey);
    return `${t.weekOf} ${d.toLocaleDateString(lang==="es"?"es-ES":"en-US",{month:"short",day:"numeric"})}`;
  })();

  // ── helpers ──
  const getWeekPts=(kidId,wk=weekKey)=>{
    const wc=completions[wk]?.[kidId]||{};
    return Object.entries(wc).reduce((s,[tid,days])=>{ const tk=tasks.find(t=>t.id===tid); return s+(tk?(days?.length||0)*tk.points:0); },0);
  };
  const getMonthPts=(kidId)=>{
    const now=new Date();
    return Object.keys(completions).reduce((s,wk)=>{ const d=new Date(wk); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()?s+getWeekPts(kidId,wk):s; },0);
  };

  const writeToDb=async(path,value)=>db.set(`families/${session.familyCode}/${path}`,value);

  const toggleCompletion=async(taskId,dayIdx)=>{
    // Only allow editing past weeks for admins
    if(!isCurrentWeek&&!isAdmin) return;
    const kidId=kid.id;
    const path=`completions/${weekKey}/${kidId}/${taskId}`;
    const current=completions[weekKey]?.[kidId]?.[taskId]||[];
    const pos=current.indexOf(dayIdx);
    let next;
    if(pos>=0){
      next=current.filter((_,i)=>i!==pos);
      const task=tasks.find(tk=>tk.id===taskId);
      if(task) await writeToDb(`kids/${kidId}`,{...kid,coins:Math.max(0,(kid.coins||0)-task.points),totalPts:Math.max(0,(kid.totalPts||0)-task.points)});
    } else {
      next=[...current,dayIdx];
      const task=tasks.find(tk=>tk.id===taskId);
      if(task){
        const prevPts=kid.totalPts||0, newTotalPts=prevPts+task.points;
        const prevStage=getPetStage(prevPts), newStage=getPetStage(newTotalPts);
        await writeToDb(`kids/${kidId}`,{...kid,coins:(kid.coins||0)+task.points,totalPts:newTotalPts});
        if(newStage>prevStage){ setCelebInfo({type:"evolve",kidName:kid.name,petName:kid.pet?.name,petSpecies:kid.pet?.species,newStage}); setShowConfetti(true); }
        else {
          const wkPts=getWeekPts(kidId)+task.points;
          const prevM=[...MILESTONE_PTS].reverse().find(m=>m<=getWeekPts(kidId));
          const newM=[...MILESTONE_PTS].reverse().find(m=>m<=wkPts);
          if(newM&&newM!==prevM){ setCelebInfo({type:"milestone",kidName:kid.name,milestonePts:newM}); setShowConfetti(true); }
        }
      }
    }
    await writeToDb(path, next.length>0?next:null);
  };

  const addTask=async()=>{
    if(!newTask.name.trim()) return;
    const tk={id:`c_${Date.now()}`,name:newTask.name.trim(),emoji:newTask.emoji,points:newTask.points,cat:"Custom"};
    await writeToDb(`tasks/${tk.id}`,tk);
    setNewTask({name:"",emoji:"⭐",points:10}); setShowAddTask(false);
  };
  const buyItem=async(item)=>{
    if((kid.coins||0)<item.cost) return;
    await writeToDb(`kids/${kid.id}`,{...kid,coins:kid.coins-item.cost,owned:[...(kid.owned||[]),item.id]});
  };
  const equipItem=async(item)=>{
    await writeToDb(`kids/${kid.id}`,{...kid,equipped:{...(kid.equipped||{}),[item.slot]:item.id}});
  };
  const logout=()=>{ localStorage.removeItem("kq4_session"); setSession(null); setAppData(null); setActiveKidId(null); };

  const weekPts=getWeekPts(kid.id);
  const nextM=MILESTONE_PTS.find(m=>m>weekPts);
  const ROLE_BADGE=isAdmin?{label:t.admin,color:"#f59e0b",bg:"rgba(245,158,11,0.15)"}:{label:t.nanny,color:"#a78bfa",bg:"rgba(167,139,250,0.15)"};

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

      {/* Celebration */}
      {celebInfo&&(
        <div onClick={()=>setCelebInfo(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"linear-gradient(160deg,#1e1b4b,#0f172a)",border:`3px solid ${celebInfo.type==="evolve"?(PET_SPECIES.find(s=>s.id===celebInfo.petSpecies)?.color||"#fbbf24"):(MILESTONE_COLOR[celebInfo.milestonePts]||"#fbbf24")}`,borderRadius:30,padding:"38px 28px",textAlign:"center",maxWidth:320,animation:"slideUp 0.4s ease"}}>
            {celebInfo.type==="evolve"?(
              <>
                <div style={{fontSize:76,animation:"petbob 1.5s ease-in-out infinite"}}>{PET_SPECIES.find(s=>s.id===celebInfo.petSpecies)?.stages[celebInfo.newStage]}</div>
                <h2 style={{fontSize:30,margin:"10px 0 6px",color:"#fbbf24"}}>{t.petEvolved}</h2>
                <p style={{fontFamily:"Nunito",color:"#94a3b8"}}>{celebInfo.petName} {t.grewTo} {stageLabel(celebInfo.newStage,lang)}!</p>
              </>
            ):(
              <>
                <div style={{fontSize:68}}>{MILESTONE_EMOJI[celebInfo.milestonePts]}</div>
                <h2 style={{fontSize:28,margin:"10px 0 6px",color:MILESTONE_COLOR[celebInfo.milestonePts]}}>{milestoneLabel(celebInfo.milestonePts,lang)}!</h2>
                <p style={{fontFamily:"Nunito",color:"#94a3b8"}}>{celebInfo.kidName} {t.hitPoints} {celebInfo.milestonePts} {t.weeklyPoints}</p>
              </>
            )}
            <p style={{fontFamily:"Nunito",color:"#475569",fontSize:12,marginTop:18}}>{t.tapToContinue}</p>
          </div>
        </div>
      )}

      {/* Family code modal */}
      {showFamilyCode&&(
        <div onClick={()=>setShowFamilyCode(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(160deg,#1e1b4b,#0f172a)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:28,padding:32,textAlign:"center",maxWidth:360,width:"100%",animation:"slideUp 0.3s ease"}}>
            <div style={{fontSize:48}}>🏠</div>
            <h2 style={{fontFamily:"Fredoka One",fontSize:26,color:"#fff",margin:"10px 0 4px"}}>{t.yourFamilyCode}</h2>
            <p style={{fontFamily:"Nunito",color:"#64748b",fontSize:14,margin:"0 0 20px"}}>{t.familyCodeDesc}</p>
            <div style={{background:"rgba(251,191,36,0.1)",border:"2px dashed #fbbf24",borderRadius:18,padding:"16px 24px",marginBottom:20}}>
              <div style={{fontFamily:"Fredoka One",fontSize:48,letterSpacing:8,color:"#fbbf24"}}>{appData.familyCode}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:14,padding:12}}>
                <div style={{fontFamily:"Nunito",fontSize:12,color:"#64748b"}}>{t.adminPIN}</div>
                <div style={{fontFamily:"Fredoka One",fontSize:22,color:"#10b981",letterSpacing:4}}>{"●".repeat(4)}</div>
                <div style={{fontFamily:"Nunito",fontSize:11,color:"#64748b"}}>{t.youWife}</div>
              </div>
              <div style={{background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:14,padding:12}}>
                <div style={{fontFamily:"Nunito",fontSize:12,color:"#64748b"}}>{t.nannyPIN}</div>
                <div style={{fontFamily:"Fredoka One",fontSize:22,color:"#a78bfa",letterSpacing:4}}>{"●".repeat(4)}</div>
                <div style={{fontFamily:"Nunito",fontSize:11,color:"#64748b"}}>{t.nannyLabel}</div>
              </div>
            </div>
            <p style={{fontFamily:"Nunito",color:"#475569",fontSize:12,margin:0}}>{t.familyCodeNote}</p>
            <button onClick={()=>setShowFamilyCode(false)} style={{marginTop:16,background:"rgba(255,255,255,0.08)",border:"none",borderRadius:12,padding:"8px 24px",color:"#94a3b8",fontFamily:"Nunito",cursor:"pointer",fontSize:14}}>{t.close}</button>
          </div>
        </div>
      )}

      {showShop&&<ShopModal kid={kid} onBuy={buyItem} onEquip={equipItem} onClose={()=>setShowShop(false)} lang={lang}/>}

      {/* ── HEADER ── */}
      <div style={{background:"rgba(0,0,0,0.5)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"12px 16px",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(10px)"}}>
        <div style={{maxWidth:800,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:22,background:"linear-gradient(90deg,#fbbf24,#f97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🚀 KidQuest</span>
            <span style={{fontFamily:"Nunito",fontSize:10,padding:"2px 7px",borderRadius:8,background:ROLE_BADGE.bg,color:ROLE_BADGE.color,fontWeight:700}}>{ROLE_BADGE.label}</span>
          </div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            {/* Language toggle */}
            <button onClick={()=>{ const nl=lang==="en"?"es":"en"; setLang(nl); localStorage.setItem("kq4_lang",nl); }} style={{background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",borderRadius:8,padding:"4px 10px",color:"#fbbf24",fontFamily:"Nunito",fontSize:11,cursor:"pointer",fontWeight:700,marginRight:4}}>{t.language}</button>
            {[{id:"tracker",icon:"🎯"},{id:"pet",icon:"🐾"},{id:"report",icon:"📊"},...(isAdmin?[{id:"settings",icon:"⚙️"}]:[])].map(({id,icon})=>(
              <button key={id} onClick={()=>setView(id)} style={{background:view===id?"rgba(251,191,36,0.15)":"transparent",border:`1px solid ${view===id?"#fbbf24":"rgba(255,255,255,0.08)"}`,borderRadius:9,padding:"5px 10px",color:view===id?"#fbbf24":"#64748b",fontFamily:"Fredoka One",fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>
                {icon}
              </button>
            ))}
            <button onClick={logout} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.08)",borderRadius:9,padding:"5px 8px",color:"#475569",fontFamily:"Nunito",fontSize:11,cursor:"pointer"}}>{t.signOut}</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:800,margin:"0 auto",padding:"14px"}}>

        {/* Kid switcher — keyed by kid.id, not index */}
        <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          {kids.map(k=>{
            const pts=getWeekPts(k.id), sp=PET_SPECIES.find(s=>s.id===k.pet?.species)||PET_SPECIES[0];
            const stage=getPetStage(k.totalPts||0);
            const isActive=activeKidId===k.id;
            return (
              <button key={k.id} onClick={()=>setActiveKidId(k.id)} style={{minWidth:110,flex:"0 0 auto",background:isActive?`rgba(${hexRgb(sp.color)},.15)`:"rgba(255,255,255,.05)",border:`2px solid ${isActive?sp.color:"rgba(255,255,255,.08)"}`,borderRadius:16,padding:"10px 14px",cursor:"pointer",color:"#fff",transition:"all 0.2s",animation:isActive?"glow 2.5s infinite":undefined}}>
                <div style={{fontSize:28}}>{k.avatar}</div>
                <div style={{fontFamily:"Fredoka One",fontSize:14,marginTop:3}}>{k.name}</div>
                <div style={{fontFamily:"Nunito",fontSize:10,color:sp.color,marginTop:1}}>{sp.stages[stage]} {k.pet?.name}</div>
                <div style={{fontFamily:"Nunito",color:"#fbbf24",fontSize:13,fontWeight:800,marginTop:3}}>⭐ {pts} {t.pts}</div>
                <div style={{fontFamily:"Nunito",color:"#94a3b8",fontSize:10}}>🪙 {k.coins||0}</div>
              </button>
            );
          })}
        </div>

        {/* ════ TRACKER ════ */}
        {view==="tracker"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>

            {/* Week navigation */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"10px 14px",border:"1px solid rgba(255,255,255,0.07)"}}>
              <button onClick={()=>setWeekOffset(w=>Math.min(w+1,4))} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"5px 12px",color:"#94a3b8",fontFamily:"Nunito",fontSize:12,cursor:"pointer"}}>
                {t.prevWeek}
              </button>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"Fredoka One",fontSize:16,color:isCurrentWeek?"#fbbf24":"#94a3b8"}}>{weekLabel}</div>
                {!isCurrentWeek&&isAdmin&&<div style={{fontFamily:"Nunito",fontSize:10,color:"#10b981",marginTop:2}}>✏️ {lang==="es"?"Modo edición":"Edit mode"}</div>}
                {!isCurrentWeek&&!isAdmin&&<div style={{fontFamily:"Nunito",fontSize:10,color:"#ef4444",marginTop:2}}>{lang==="es"?"Solo admins pueden editar":"Admins only can edit past weeks"}</div>}
              </div>
              <button onClick={()=>setWeekOffset(w=>Math.max(w-1,0))} disabled={weekOffset===0} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"5px 12px",color:weekOffset===0?"#334155":"#94a3b8",fontFamily:"Nunito",fontSize:12,cursor:weekOffset===0?"not-allowed":"pointer",opacity:weekOffset===0?0.4:1}}>
                {t.nextWeek}
              </button>
            </div>

            {/* Progress bar — only for current week */}
            {isCurrentWeek&&nextM&&(
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:13,padding:"10px 14px",marginBottom:12,border:"1px solid rgba(255,255,255,0.07)"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Nunito",fontSize:12,marginBottom:5}}>
                  <span style={{color:"#94a3b8"}}>{t.next}: {MILESTONE_EMOJI[nextM]} {milestoneLabel(nextM,lang)}</span>
                  <span style={{color:"#fbbf24"}}>{weekPts}/{nextM}</span>
                </div>
                <div style={{background:"rgba(255,255,255,0.08)",borderRadius:99,height:8,overflow:"hidden"}}>
                  <div style={{background:"linear-gradient(90deg,#fbbf24,#f97316)",height:"100%",width:`${Math.min(100,weekPts/nextM*100)}%`,borderRadius:99,transition:"width 0.5s"}}/>
                </div>
              </div>
            )}

            {/* Task grid */}
            <div style={{background:"rgba(255,255,255,0.03)",borderRadius:18,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr repeat(7,38px)",padding:"9px 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",gap:2}}>
                <div style={{fontFamily:"Nunito",fontSize:11,color:"#475569"}}>{t.mission}</div>
                {t.weekDays.map((d,i)=>(
                  <div key={i} style={{textAlign:"center",fontFamily:"Nunito",fontSize:10,color:isCurrentWeek&&i===todayIdx?"#fbbf24":"#475569",fontWeight:isCurrentWeek&&i===todayIdx?800:400}}>{d}</div>
                ))}
              </div>
              {tasks.map(task=>{
                const done=completions[weekKey]?.[kid.id]?.[task.id]||[];
                const canEdit=isCurrentWeek||isAdmin;
                return (
                  <div key={task.id} className="trow" style={{display:"grid",gridTemplateColumns:"1fr repeat(7,38px)",padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,0.04)",gap:2,alignItems:"center",transition:"background 0.15s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
                      <span style={{fontSize:18,flexShrink:0}}>{task.emoji}</span>
                      <div style={{overflow:"hidden"}}>
                        <div style={{fontFamily:"Nunito",fontSize:12,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{taskName(task,lang)}</div>
                        <div style={{fontFamily:"Nunito",fontSize:9,color:done.length?"#fbbf24":"#475569"}}>+{task.points}{done.length?` ×${done.length}`:""}</div>
                      </div>
                    </div>
                    {t.weekDays.map((_,di)=>{
                      const checked=done.includes(di);
                      return (
                        <div key={di} style={{display:"flex",justifyContent:"center"}}>
                          <button onClick={()=>canEdit&&toggleCompletion(task.id,di)} style={{width:30,height:30,borderRadius:8,border:`2px solid ${checked?"#10b981":"rgba(255,255,255,0.1)"}`,background:checked?"rgba(16,185,129,0.18)":"transparent",cursor:canEdit?"pointer":"not-allowed",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",opacity:canEdit?1:0.5}}>
                            {checked?"✅":""}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {/* Add task — both admin and nanny, current week only */}
              {isCurrentWeek&&!showAddTask&&(
                <button onClick={()=>setShowAddTask(true)} style={{width:"100%",background:"transparent",border:"none",padding:"11px 12px",color:"#475569",fontFamily:"Nunito",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color="#fbbf24"} onMouseLeave={e=>e.currentTarget.style.color="#475569"}>
                  {t.addMission}
                </button>
              )}
              {isCurrentWeek&&showAddTask&&(
                <div style={{padding:"10px 12px",display:"flex",gap:6,flexWrap:"wrap",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                  <input value={newTask.emoji} onChange={e=>setNewTask({...newTask,emoji:e.target.value})} style={{width:40,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,padding:5,color:"#fff",fontSize:16,textAlign:"center",outline:"none"}}/>
                  <input value={newTask.name} onChange={e=>setNewTask({...newTask,name:e.target.value})} placeholder={t.missionPlaceholder} style={{flex:1,minWidth:130,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,padding:"5px 9px",color:"#fff",fontFamily:"Nunito",fontSize:12,outline:"none"}}/>
                  <select value={newTask.points} onChange={e=>setNewTask({...newTask,points:+e.target.value})} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,padding:5,color:"#fff",fontFamily:"Nunito",fontSize:12,outline:"none"}}>
                    {[5,10,15,20,25,30].map(p=><option key={p} value={p} style={{background:"#0f172a"}}>+{p}pts</option>)}
                  </select>
                  <button onClick={addTask} style={{background:"#10b981",border:"none",borderRadius:9,padding:"5px 12px",color:"#fff",fontFamily:"Nunito",fontSize:12,cursor:"pointer",fontWeight:700}}>{t.addBtn}</button>
                  <button onClick={()=>setShowAddTask(false)} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:9,padding:"5px 10px",color:"#94a3b8",fontFamily:"Nunito",cursor:"pointer"}}>{t.cancel}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ PET ════ */}
        {view==="pet"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:22,border:"1px solid rgba(255,255,255,0.07)",padding:20,marginBottom:14,textAlign:"center"}}>
              <PetDisplay pet={kid.pet||{name:"Pet",species:"dragon"}} equipped={kid.equipped||{}} totalPts={kid.totalPts||0} lang={lang}/>
              <div style={{marginTop:16,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                <div style={{background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,padding:"7px 16px",fontFamily:"Nunito",fontSize:14,color:"#fbbf24"}}>🪙 {kid.coins||0} {t.coins}</div>
                <button onClick={()=>setShowShop(true)} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:12,padding:"7px 16px",fontSize:14,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer"}}>{t.openShop}</button>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:18,border:"1px solid rgba(255,255,255,0.07)",padding:18,marginBottom:14}}>
              <h3 style={{margin:"0 0 12px",fontSize:18}}>🎽 {t.equipped}</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {["hat","neck","home","toy"].map(slot=>{
                  const item=SHOP_ITEMS.find(i=>i.id===kid.equipped?.[slot]);
                  return (<div key={slot} style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:10,textAlign:"center",border:"1px dashed rgba(255,255,255,0.08)"}}><div style={{fontSize:24,minHeight:30}}>{item?item.emoji:"·"}</div><div style={{fontFamily:"Nunito",fontSize:10,color:item?"#fff":"#334155",marginTop:3}}>{item?shopName(item,lang):slot}</div></div>);
                })}
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:18,border:"1px solid rgba(255,255,255,0.07)",padding:18}}>
              <h3 style={{margin:"0 0 14px",fontSize:18}}>{t.growthJourney}</h3>
              <div style={{display:"flex",gap:6,justifyContent:"space-around",flexWrap:"wrap"}}>
                {PET_THRESHOLDS.map((thresh,i)=>{
                  const sp=PET_SPECIES.find(s=>s.id===(kid.pet?.species||"dragon"));
                  const current=getPetStage(kid.totalPts||0)===i, unlocked=(kid.totalPts||0)>=thresh;
                  return (<div key={i} style={{textAlign:"center",opacity:unlocked?1:0.35}}><div style={{fontSize:32,filter:current?`drop-shadow(0 0 10px ${sp?.color})`:undefined,animation:current?"petbob 2s ease-in-out infinite":undefined}}>{sp?.stages[i]}</div><div style={{fontFamily:"Nunito",fontSize:10,color:current?"#fbbf24":"#64748b",marginTop:3}}>{stageLabel(i,lang)}</div><div style={{fontFamily:"Nunito",fontSize:9,color:"#334155"}}>{thresh}pts</div></div>);
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ REPORT ════ */}
        {view==="report"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{display:"flex",gap:7,marginBottom:14}}>
              {["weekly","monthly"].map(p=>(
                <button key={p} onClick={()=>setReportPeriod(p)} style={{background:reportPeriod===p?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${reportPeriod===p?"#fbbf24":"rgba(255,255,255,0.08)"}`,borderRadius:11,padding:"7px 18px",color:reportPeriod===p?"#fbbf24":"#64748b",fontFamily:"Fredoka One",fontSize:14,cursor:"pointer"}}>
                  {p==="weekly"?t.thisWeek:t.thisMonth}
                </button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:14}}>
              {kids.map(k=>{
                const pts=reportPeriod==="weekly"?getWeekPts(k.id):getMonthPts(k.id);
                const m=[...MILESTONE_PTS].reverse().find(mm=>mm<=getWeekPts(k.id));
                return (
                  <div key={k.id} style={{background:"rgba(255,255,255,0.05)",borderRadius:18,padding:18,border:"1px solid rgba(255,255,255,0.07)",textAlign:"center"}}>
                    <PetDisplay pet={k.pet||{name:"Pet",species:"dragon"}} equipped={k.equipped||{}} totalPts={k.totalPts||0} compact lang={lang}/>
                    <div style={{fontSize:26,marginTop:6}}>{k.avatar}</div>
                    <div style={{fontSize:20,marginTop:3}}>{k.name}</div>
                    {m&&<div style={{fontFamily:"Nunito",color:MILESTONE_COLOR[m],fontSize:11,marginTop:2}}>{MILESTONE_EMOJI[m]} {milestoneLabel(m,lang)}</div>}
                    <div style={{fontFamily:"Nunito",color:"#fbbf24",fontSize:26,fontWeight:800,marginTop:8}}>⭐ {pts}</div>
                    <div style={{fontFamily:"Nunito",color:"#64748b",fontSize:10,marginTop:1}}>{reportPeriod==="weekly"?t.thisWeek:t.thisMonth}</div>
                    <div style={{fontFamily:"Nunito",color:"#10b981",fontSize:11,marginTop:3}}>🪙 {k.coins||0} · 🌱 {k.totalPts||0} {t.total}</div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:18,border:"1px solid rgba(255,255,255,0.07)",padding:18,marginBottom:14}}>
              <h3 style={{margin:"0 0 12px",fontSize:20}}>{t.leaderboard}</h3>
              {[...kids].sort((a,b)=>getWeekPts(b.id)-getWeekPts(a.id)).map((k,i)=>{
                const pts=getWeekPts(k.id),max=Math.max(...kids.map(kk=>getWeekPts(kk.id)),1);
                return (<div key={k.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontFamily:"Nunito",fontSize:14,marginBottom:4}}><span>{["🥇","🥈","🥉","4️⃣"][i]} {k.avatar} {k.name}</span><span style={{color:"#fbbf24",fontWeight:700}}>{pts}</span></div><div style={{background:"rgba(255,255,255,0.07)",borderRadius:99,height:12,overflow:"hidden"}}><div style={{background:i===0?"linear-gradient(90deg,#fbbf24,#f97316)":"linear-gradient(90deg,#6366f1,#8b5cf6)",height:"100%",width:`${(pts/max)*100}%`,borderRadius:99,transition:"width 0.5s"}}/></div></div>);
              })}
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:18,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><h3 style={{margin:0,fontSize:18}}>{t.weeklyBreakdown} — {kid.name}</h3></div>
              {tasks.map(task=>{
                const done=completions[getWeekKey(0)]?.[kid.id]?.[task.id]||[];
                return (<div key={task.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 16px",borderBottom:"1px solid rgba(255,255,255,0.03)"}}><div style={{display:"flex",alignItems:"center",gap:7,fontFamily:"Nunito",fontSize:13}}>{task.emoji} {taskName(task,lang)}</div><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{display:"flex",gap:3}}>{t.weekDays.map((_,di)=><div key={di} style={{width:8,height:8,borderRadius:"50%",background:done.includes(di)?"#10b981":"rgba(255,255,255,0.08)"}}/>)}</div><span style={{fontFamily:"Nunito",color:done.length?"#fbbf24":"#334155",fontSize:12,fontWeight:700,minWidth:28,textAlign:"right"}}>{done.length?`+${done.length*task.points}`:"—"}</span></div></div>);
              })}
            </div>
          </div>
        )}

        {/* ════ SETTINGS (Admin only) ════ */}
        {view==="settings"&&isAdmin&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,padding:20,border:"1px solid rgba(255,255,255,0.08)",marginBottom:12}}>
              <h3 style={{margin:"0 0 8px",fontSize:22}}>{t.shareFamily}</h3>
              <p style={{fontFamily:"Nunito",color:"#94a3b8",fontSize:13,margin:"0 0 14px"}}>{t.shareDesc}</p>
              <button onClick={()=>setShowFamilyCode(true)} style={{background:"linear-gradient(135deg,#f59e0b,#f97316)",border:"none",borderRadius:14,padding:"10px 22px",fontSize:16,color:"#fff",fontFamily:"Fredoka One",cursor:"pointer",marginBottom:14}}>{t.showCode}</button>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{role:t.admin,who:t.youWife,color:"#f59e0b",can:[t.fullAccess,t.settingsAccess,t.addRemoveKids,t.allTasksReports]},
                  {role:t.nanny,who:t.nannyLabel,color:"#a78bfa",can:[t.checkTasks,t.addTasks,t.seeReports,t.cannotEdit]}
                ].map(r=>(
                  <div key={r.role} style={{background:`rgba(255,255,255,0.04)`,border:`1px solid rgba(255,255,255,0.08)`,borderRadius:14,padding:14}}>
                    <div style={{fontFamily:"Fredoka One",fontSize:16,color:r.color,marginBottom:3}}>{r.role}</div>
                    <div style={{fontFamily:"Nunito",fontSize:11,color:"#64748b",marginBottom:8}}>{r.who}</div>
                    {r.can.map(c=><div key={c} style={{fontFamily:"Nunito",fontSize:11,color:"#94a3b8",marginBottom:2}}>• {c}</div>)}
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,padding:20,border:"1px solid rgba(255,255,255,0.08)",marginBottom:12}}>
              <h3 style={{margin:"0 0 8px",fontSize:22}}>{t.firebaseStatus}</h3>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:FIREBASE_ENABLED?"#10b981":"#f59e0b",boxShadow:FIREBASE_ENABLED?"0 0 8px #10b981":"0 0 8px #f59e0b"}}/>
                <span style={{fontFamily:"Nunito",fontSize:14,color:FIREBASE_ENABLED?"#10b981":"#f59e0b"}}>{FIREBASE_ENABLED?t.connected:t.notConnected}</span>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,padding:20,border:"1px solid rgba(255,255,255,0.08)",marginBottom:12}}>
              <h3 style={{margin:"0 0 12px",fontSize:22}}>{t.celebrations}</h3>
              {MILESTONE_PTS.map(m=>(
                <div key={m} style={{display:"flex",alignItems:"center",gap:12,marginBottom:9}}>
                  <span style={{fontSize:24}}>{MILESTONE_EMOJI[m]}</span>
                  <div><div style={{fontFamily:"Nunito",fontWeight:700,color:MILESTONE_COLOR[m]}}>{milestoneLabel(m,lang)}</div><div style={{fontFamily:"Nunito",fontSize:11,color:"#475569"}}>{m} {t.weeklyPts}</div></div>
                </div>
              ))}
              <div style={{marginTop:10,background:"rgba(99,102,241,.1)",borderRadius:12,padding:12,border:"1px solid rgba(99,102,241,.2)"}}><p style={{fontFamily:"Nunito",color:"#a78bfa",fontSize:12,margin:0}}>{t.petEvolution}</p></div>
            </div>
            <button onClick={()=>{ if(confirm(lang==="es"?"¿Cerrar sesión?":"Sign out?")) logout(); }} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"10px 22px",color:"#94a3b8",fontFamily:"Nunito",fontSize:14,cursor:"pointer",fontWeight:700,marginRight:10}}>{t.signOut}</button>
            <button onClick={()=>{ if(confirm(lang==="es"?"¿Reiniciar todos los datos? Esto no se puede deshacer.":"Reset ALL data? This cannot be undone.")){ db.set(`families/${session.familyCode}`,null); localStorage.removeItem("kq4_session"); window.location.reload(); }}} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:14,padding:"10px 22px",color:"#ef4444",fontFamily:"Nunito",fontSize:14,cursor:"pointer",fontWeight:700}}>{t.resetFamily}</button>
          </div>
        )}

      </div>
    </div>
  );
}
