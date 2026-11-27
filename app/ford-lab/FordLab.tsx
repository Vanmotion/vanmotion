/* eslint-disable @next/next/no-img-element -- private prototype showing user-owned images and manufacturer parts */
"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/components/language/LanguageProvider";
import styles from "./ford-lab.module.css";

type Lang = "es" | "en";
type Tab = "body" | "wheels" | "engine" | "sound";
type Category = "wheel" | "suspension" | "rack" | "steps" | "filter" | "muffler";
type Build = Record<Category, string>;
type Wheel = "front" | "rear";
type Mount = { x: number; y: number; diameter: number; tilt: number };
type Calibration = { front: Mount; rear: Mount; visible: boolean };
type Calibrations = Record<number, Calibration>;
type Part = { id: string; category: Category; brand: string; name: string; sku: string; image?: string; overlayImage?: string; href?: string; es: string; en: string; detailsEs: string; detailsEn: string };

const PHOTO_BASE = "https://ktv2mbiitjdceynn.public.blob.vercel-storage.com/vehicles/cmrm2i93y0001jq04awn01yv0/";
const PHOTOS = [
  { id: 0, src: PHOTO_BASE + "chatgpt-image-15-jul-2026-14_10_39-1--MaSZrW5OnrSj0ciKTGfYtpAVCmUOZS.png" },
  { id: 1, src: PHOTO_BASE + "chatgpt-image-15-jul-2026-14_10_39-2--3eYfgKHnce1obxQAixYVk66et5sknK.png" },
  { id: 2, src: PHOTO_BASE + "1784136429293-1-chatgpt-image-15-jul-2026-14_10_39-3--cnRsRB0192sJKMxq744bDUOHq1ro4b.png" },
  { id: 3, src: PHOTO_BASE + "1784136434946-2-chatgpt-image-15-jul-2026-14_10_40-4--jEzxlSwBawUDNbqAqiXF4OlIZaASRW.png" },
  { id: 4, src: PHOTO_BASE + "1784136437913-3-chatgpt-image-15-jul-2026-14_10_40-5--VS6KcrlwwRHzIDHtR8bgnLm34bh9Vx.png" },
  { id: 5, src: PHOTO_BASE + "1784136439963-4-chatgpt-image-15-jul-2026-14_10_41-6--h8nJ2cmUzNHxCdmFDXE8aJOZFBC15u.png" },
] as const;

const PARTS: Part[] = [
  { id: "stock-wheel", category: "wheel", brand: "FORD", name: "Factory wheels", sku: "OEM", es: "Llantas originales", en: "Factory wheels", detailsEs: "Fotografía original sin modificar. La rueda OEM visible no es reemplazada.", detailsEn: "Unaltered original photo. Factory wheels remain visible." },
  { id: "ar172", category: "wheel", brand: "AMERICAN RACING", name: "AR172 Baja · Polished", sku: "AR1725885", overlayImage: "/ford-lab/rims/ar172-mounted.png", image: "https://cdn11.bigcommerce.com/s-d0dn6p0/images/stencil/1280x1280/products/665646/1343788/american-racing-ar172-baja-polished_2__60042.1773519221.jpg?c=2", href: "https://www.summitracing.com/parts/are-ar1725885", es: "15×8 · 5×139,7 · ET −19 · 108 mm", en: "15×8 · 5×139.7 · −19 offset · 108 mm", detailsEs: "Fotografía del producto auténtico; confirmar tamaño, buje, carga y holguras para esta unidad antes de instalar.", detailsEn: "Authentic product image; confirm size, centre bore, load and clearance for this vehicle before fitting." },
  { id: "ar23", category: "wheel", brand: "AMERICAN RACING", name: "AR23 · Machined", sku: "AR236885", overlayImage: "/ford-lab/rims/ar23-mounted.png", image: "https://cdn11.bigcommerce.com/s-xrd6x4umqt/images/stencil/1280x1280/products/56137/415040/ar236885x4-94cad37e59b15aea0a57a7706eba8c697843453f-3__77032.1700584717.png?c=1", href: "https://a2iwheelandtire.com/set-4-16-american-racing-ar23-16x8-silver-machined-5x5-5-truck-wheels-0mm-rims/", es: "16×8 · 5×139,7 · ET 0 · 108 mm", en: "16×8 · 5×139.7 · 0 offset · 108 mm", detailsEs: "Fotografía real de llanta. Composición visual de prueba, no certificado de compatibilidad.", detailsEn: "Real wheel image. Visual trial composite, not a fitment guarantee." },
  { id: "stock-suspension", category: "suspension", brand: "FORD", name: "Factory suspension", sku: "OEM", es: "Suspensión de origen", en: "Factory suspension", detailsEs: "Altura original de la fotografía.", detailsEn: "Factory ride height in the source photo." },
  { id: "bilstein", category: "suspension", brand: "BILSTEIN", name: "B6 4600", sku: "24-184816 / 33-017204", image: "https://www.jackit.com/media/catalog/product/cache/54785edc67a0403aac2f6cf0b5ebf6bc/2/4/24-184816-main.jpg", href: "https://www.shocksurplus.com/products/bilstein-4600-monotube-gas-oem-shocks-set-for-1992-2002-ford-e-150-econoline-2wd-4wd", es: "Amortiguadores · altura de origen", en: "Dampers · factory ride height", detailsEs: "No se simula un rebaje: estos amortiguadores no cambian por sí mismos la altura.", detailsEn: "No fake lowering: these shocks alone do not change ride height." },
  { id: "stock-rack", category: "rack", brand: "FORD", name: "No roof rack", sku: "OEM", es: "Sin baca", en: "No roof rack", detailsEs: "Carrocería de referencia.", detailsEn: "Reference body configuration." },
  { id: "vantech", category: "rack", brand: "VANTECH", name: "H1 Ladder Rack", sku: "H1082B", image: "https://upfitsupply.com/cdn/shop/files/h1084b.jpg?v=1750731658&width=1946", href: "https://vantech.com/products/h1-ladder-rack-system-for-ford-econoline-1992-on", es: "Baca comercial con fijación a canaleta", en: "Commercial rack with gutter mounts", detailsEs: "Producto real, pero no se dibuja sobre la Ford hasta disponer de una toma fotográfica del montaje.", detailsEn: "Real product, but not painted onto the Ford until a suitable mounted view is available." },
  { id: "stock-steps", category: "steps", brand: "FORD", name: "No running boards", sku: "OEM", es: "Sin estribos", en: "No side steps", detailsEs: "Configuración original.", detailsEn: "Original configuration." },
  { id: "blackhorse", category: "steps", brand: "BLACK HORSE", name: "Transporter Running Boards", sku: "FITMENT TO VERIFY", image: "https://i.ebayimg.com/images/g/oY0AAeSwD3xnuLRa/s-l500.jpg", href: "https://www.ebay.com/itm/256329421773", es: "Estribos · anclajes a comprobar", en: "Running boards · mountings to confirm", detailsEs: "Producto real, aún no integrado en la fotografía.", detailsEn: "Real product, not yet composited into the photograph." },
  { id: "stock-filter", category: "filter", brand: "MOTORCRAFT", name: "Factory air filter", sku: "FA-1634", es: "Admisión original", en: "Factory air intake", detailsEs: "Recambio de referencia.", detailsEn: "Reference replacement part." },
  { id: "kn", category: "filter", brand: "K&N", name: "High-Flow Filter", sku: "E-0945", image: "https://www.slickcar.com/products/e-094509757044.jpg", href: "https://www.knfilters.com/e-0945-replacement-air-filter", es: "Filtro de sustitución · 4.2 V6", en: "Replacement filter · 4.2 V6", detailsEs: "Referencia comercial; sin potencia adicional inventada.", detailsEn: "Commercial reference; no invented horsepower gains." },
  { id: "stock-muffler", category: "muffler", brand: "FORD", name: "Factory exhaust", sku: "OEM", es: "Escape original", en: "Factory exhaust", detailsEs: "Sin grabación de sonido de esta unidad.", detailsEn: "No audio recording of this particular van." },
  { id: "walker", category: "muffler", brand: "WALKER", name: "SoundFX", sku: "18819", href: "https://www.oreillyauto.com/detail/c/soundfx/exhaust/muffler/muffler---performance/cfe5577a4b3f/walker-soundfx-exhaust-muffler/wal1/18819/v/a/5066/automotive-van-1999-ford-e-150-econoline", es: "Silenciador de recambio", en: "Replacement muffler", detailsEs: "Referencia comercial, no un escape de competición. Sonido específico no verificado.", detailsEn: "Commercial replacement part, not a racing exhaust. Specific sound unverified." },
];

const INITIAL: Build = { wheel: "stock-wheel", suspension: "stock-suspension", rack: "stock-rack", steps: "stock-steps", filter: "stock-filter", muffler: "stock-muffler" };
const GROUPS: Record<Exclude<Tab,"sound">,Category[]> = { body: ["rack","steps"], wheels: ["wheel","suspension"], engine: ["filter","muffler"] };
const TABS: { id: Tab; es: string; en: string; num: string }[] = [
  {id: "body",es: "CARROCERÍA",en: "BODY",num: "01"},
  {id: "wheels",es: "LLANTAS Y CHASIS",en: "WHEELS & CHASSIS",num: "02"},
  {id: "engine",es: "MOTOR Y ESCAPE",en: "ENGINE & EXHAUST",num: "03"},
  {id: "sound",es: "SONIDO REAL",en: "REAL SOUND",num: "04"},
];

function createCalibrations(): Calibrations {
  const result: Calibrations = {};
  // Visual starting guesses only; calibrated interactively on the user's own images.
  for (let i=0; i<PHOTOS.length; i++) {
    result[i] = {
      front: i === 2
        ? {x: 17.5, y: 65.3, diameter: 7.45, tilt: 0}
        : {x: 26, y: 73, diameter: 12, tilt: 0},
      rear: i === 2
        ? {x: 78.5, y: 64.45, diameter: 7.5, tilt: 0}
        : {x: 77, y: 73, diameter: 11, tilt: 0},
      visible: i === 2,
    };
  }
  return result;
}
const DEFAULT_CAL = createCalibrations();
function clamp(n: number, min: number, max: number) {return Math.max(min, Math.min(max, n));}
function validCalibration(candidate: unknown): candidate is Calibration {
  if (!candidate || typeof candidate !== "object") return false;
  const c = candidate as Calibration;
  return typeof c.visible === "boolean" && [c.front,c.rear].every(w=>w &&
    [w.x,w.y,w.diameter,w.tilt].every(n=>Number.isFinite(n)));
}

export default function FordLab(){
  const { language } = useLanguage();
  const lang: Lang = language === "en" ? "en" : "es";
  const t = (es:string,en:string) => lang === "es" ? es : en;
  const [tab,setTab] = useState<Tab>("wheels");
  const [photo,setPhoto] = useState(0);
  const [build,setBuild] = useState<Build>({...INITIAL});
  const [cal,setCal] = useState<Calibrations>(createCalibrations);
  const [adjust,setAdjust] = useState(false);
  const [selectedMount,setSelectedMount] = useState<Wheel>("front");
  const [compare,setCompare] = useState(false);
  const [photoLoaded,setPhotoLoaded] = useState(false);
  const [photoError,setPhotoError] = useState(false);
  const [saved,setSaved] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Wheel|null>(null);

  useEffect(()=>{
    try {
      const raw=window.localStorage.getItem("vanmotion:ford-lab:v4_4") || window.localStorage.getItem("vanmotion:ford-lab:v4_3") || window.localStorage.getItem("vanmotion:ford-lab:v4_2") || window.localStorage.getItem("vanmotion:ford-lab:v4_1") || window.localStorage.getItem("vanmotion:ford-lab:v4");
      if(!raw) return;
      const stored=JSON.parse(raw) as {build?:Partial<Build>;cal?:Record<string,unknown>;photo?:number};
      if(stored.build){
        const next={...INITIAL};
        for(const k of Object.keys(INITIAL) as Category[]){
          if(PARTS.some(p=>p.category===k && p.id===stored.build?.[k]))next[k]=stored.build[k]!;
        }
        setBuild(next);
      }
      if(stored.cal && window.localStorage.getItem("vanmotion:ford-lab:v4_4")){
        setCal(prev=>{
          const next={...prev};
          for(const entry of PHOTOS){
            const savedCal=stored.cal?.[String(entry.id)];
            if(validCalibration(savedCal))next[entry.id]=savedCal;
          }
          return next;
        });
      }
      if(typeof stored.photo==="number" && stored.photo>=0 && stored.photo<PHOTOS.length)setPhoto(stored.photo);
    }catch{/* malformed or missing data */}
  },[]);
  useEffect(()=>{
    try{window.localStorage.setItem("vanmotion:ford-lab:v4_4",JSON.stringify({build,cal,photo}));}catch{/* private browsing */}
  },[build,cal,photo]);

  const chosen=useMemo(()=>Object.values(build).map(id=>PARTS.find(p=>p.id===id)!).filter(Boolean),[build]);
  const changes=(Object.keys(INITIAL) as Category[]).filter(k=>INITIAL[k]!==build[k]).length;
  const wheel=PARTS.find(p=>p.id===(compare ? INITIAL.wheel : build.wheel));
  const activeCal=cal[photo] ?? DEFAULT_CAL[photo];
  const photoHasExteriorWheels = photo <= 2;
  const preview=Boolean(wheel?.image && !compare && activeCal.visible && photoHasExteriorWheels && photoLoaded && !photoError);

  const editMount=(target:Wheel, param:keyof Mount, value:number)=>{
    const clean=param==="diameter"?clamp(value,2,45):param==="tilt"?clamp(value,-90,90):clamp(value,0,100);
    setCal(prev=>({...prev,[photo]:{...prev[photo],[target]:{...prev[photo][target],[param]:clean}}}));
    setSaved(false);
  };
  const togglePreview=()=>setCal(prev=>({...prev,[photo]:{...prev[photo],visible:!prev[photo].visible}}));
  const resetCurrent=()=>setCal(prev=>({...prev,[photo]:structuredClone(DEFAULT_CAL[photo])}));
  const changePhoto=(id:number)=>{
    setPhoto(id);setPhotoLoaded(false);setPhotoError(false);setAdjust(false);setCompare(false);
  };
  const updatePart=(category:Category,id:string)=>{
    setBuild(prev=>({...prev,[category]:id}));
    setCompare(false);setSaved(false);
    // Al escoger una llanta, se abre la vista lateral calibrable y se muestra el montaje.
    if(category==="wheel" && id!=="stock-wheel"){
      if(photo!==2){changePhoto(2);}
      setCal(prev=>({...prev,[2]:{...prev[2],visible:true}}));
    }
  };
  const toggleAdjustment=()=>{
    if(photo>2){
      changePhoto(2);
      setCal(prev=>({...prev,[2]:{...prev[2],visible:true}}));
      setAdjust(true);
      return;
    }
    if(!adjust){
      setCal(prev=>({...prev,[photo]:{...prev[photo],visible:true}}));
    }
    setAdjust(v=>!v);
  };
  const pointerPosition=(e:PointerEvent<HTMLDivElement>, target:Wheel)=>{
    const rect=stageRef.current?.getBoundingClientRect();
    if(!rect)return;
    editMount(target,"x",((e.clientX-rect.left)/rect.width)*100);
    editMount(target,"y",((e.clientY-rect.top)/rect.height)*100);
  };
  const down=(e:PointerEvent<HTMLDivElement>, target:Wheel)=>{
    if(!adjust)return;
    e.preventDefault();
    dragRef.current=target;
    setSelectedMount(target);
    stageRef.current?.setPointerCapture(e.pointerId);
    pointerPosition(e,target);
  };
  const move=(e:PointerEvent<HTMLDivElement>)=>{if(dragRef.current)pointerPosition(e,dragRef.current);};
  const up=()=>{dragRef.current=null;};
  const download=()=>{
    const doc={project:"VANMOTION / FORD LAB 004.4",model:"Ford E-150 4.2 V6",photo:PHOTOS[photo].src,
      parts:chosen.map(p=>({type:p.category,brand:p.brand,name:p.name,sku:p.sku,url:p.href??null})),
      wheelCalibration:cal[photo],note:"Private photo-based prototype. Fitment not verified. Manufacturer photos require clearance before publication.",
      createdAt:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(doc,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="VANMOTION-FORD-LAB-004-4.json";a.click();URL.revokeObjectURL(url);setSaved(true);
  };
  const wheelStyle=(target:Wheel):CSSProperties=>{
    const mount=activeCal[target];
    return {left:`${mount.x}%`,top:`${mount.y}%`,width:`${mount.diameter}%`,transform:`translate(-50%,-50%) rotate(${mount.tilt}deg)`};
  };

  return <main className={styles.page}>
    <header className={styles.header}>
      <div className={styles.brand}><Link href="/">VANMOTION<span className={styles.dot}>.</span></Link><span>FORD LAB / 004.4</span></div>
      <div className={styles.headerRight}><span className={styles.pill}>{t("PROTOTIPO LOCAL","LOCAL PROTOTYPE")}</span><Link href="/coleccion" className={styles.close}>{t("SALIR","EXIT")} ↗</Link></div>
    </header>
    <section className={styles.intro}>
      <div><span className={styles.eyebrow}>VANMOTION · PRIVATE CUSTOM GARAGE</span><h1>{t("TU FORD.","YOUR FORD.")}<br/><em>{t("TU CREACIÓN.","YOUR BUILD.")}</em></h1>
      <p>{t("Las seis fotografías de VANMOTION son ahora la base del taller. Selecciona llantas reales y calibra su montaje sobre tu propia imagen; sin cambiar de furgoneta ni inventar fotografías.","All six VANMOTION photographs now form the garage. Choose real wheels and calibrate their fit directly over your own photo; no substitute vehicle or invented images.")}</p></div>
      <div className={styles.spec}><strong>E-150</strong><span>ESSEX 4.2 V6 · RWD</span><small>{t("GALERÍA ORIGINAL · VANMOTION","ORIGINAL GALLERY · VANMOTION")}</small></div>
    </section>
    <div className={styles.workspace}>
      <section className={styles.visualPane}>
        <div className={styles.stageTop}><span>01 / VANMOTION FORD</span><span>{t("TUS FOTOGRAFÍAS · GALERÍA DE LA FICHA","YOUR PHOTOGRAPHS · ORIGINAL VEHICLE GALLERY")}</span></div>
        <div className={styles.photoStage}>
          <div className={styles.realImageFrame} ref={stageRef} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            {!photoLoaded && !photoError && <div className={styles.photoLoading}>{t("CARGANDO FOTOGRAFÍA…","LOADING PHOTO…")}</div>}
            {photoError ? <div className={styles.photoLoading}>{t("La imagen de VANMOTION no ha cargado. Comprueba la conexión y vuelve a elegir la foto.","The VANMOTION photo did not load. Check the connection and select the image again.")}</div> : null}
            <img key={photo} className={styles.realMainPhoto} src={PHOTOS[photo].src} alt={t(`Ford E-150 de VANMOTION · fotografía ${photo+1}`,`VANMOTION Ford E-150 · photograph ${photo+1}`)} onLoad={()=>{setPhotoLoaded(true);setPhotoError(false);}} onError={()=>{setPhotoError(true);setPhotoLoaded(false);}} />
            {preview && (["front","rear"] as Wheel[]).map(target=><div
              key={target} className={`${styles.realMountedWheel} ${adjust?styles.wheelEditing:""} ${selectedMount===target && adjust?styles.wheelSelected:""}`}
              style={wheelStyle(target)} onPointerDown={e=>down(e,target)} aria-label={target === "front" ? t("Llanta delantera","Front wheel") : t("Llanta trasera","Rear wheel")}>
              <img src={wheel!.overlayImage || wheel!.image} alt="" draggable={false}/><span className={styles.wheelRimShadow}/>
              {adjust && <span className={styles.wheelHandle}>{target === "front" ? "F" : "R"}</span>}
            </div>)}
          </div>
        </div>
        <div className={styles.gallery} aria-label={t("Seleccionar foto de VANMOTION","Choose VANMOTION photo")}>
          {PHOTOS.map((p,i)=><button key={p.id} className={`${styles.galleryItem} ${photo===i?styles.galleryActive:""}`} type="button" onClick={()=>changePhoto(i)} aria-pressed={photo===i}><img src={p.src} alt={t(`Vista ${i+1}`,`View ${i+1}`)} loading="lazy"/><span>{String(i+1).padStart(2,"0")}</span></button>)}
        </div>
        <div className={styles.viewBar}>
          <div className={styles.switchView}>
            <button type="button" className={adjust?styles.selectedView:""} onClick={toggleAdjustment}>{adjust?t("TERMINAR AJUSTE","FINISH ADJUSTMENT"):t("AJUSTAR LLANTAS","POSITION WHEELS")}</button>
            <button type="button" className={!activeCal.visible?styles.selectedView:""} onClick={togglePreview}>{activeCal.visible?t("OCULTAR MONTAJE","HIDE FITTED PREVIEW"):t("MOSTRAR MONTAJE","SHOW FITTED PREVIEW")}</button>
          </div>
          <button type="button" className={`${styles.compare} ${compare?styles.selectedView:""}`} onPointerDown={()=>setCompare(true)} onPointerUp={()=>setCompare(false)} onPointerCancel={()=>setCompare(false)} onPointerLeave={()=>setCompare(false)}>{t("MANTENER: ORIGINAL","HOLD: ORIGINAL")}</button>
        </div>
        {adjust && <section className={styles.calibrationPanel}>
          <div className={styles.calibHead}><div><strong>{t("CALIBRACIÓN DE MONTAJE","FITMENT CALIBRATION")}</strong><p>{t("Arrastra cada llanta al buje original y ajusta su diámetro hasta que coincida con la llanta, no con todo el neumático.","Drag each wheel over the original hub and set diameter to fit the rim, not the whole tyre.")}</p></div><button type="button" onClick={resetCurrent}>{t("RESTAURAR FOTO","RESET PHOTO")}</button></div>
          <div className={styles.calibTabs}><button className={selectedMount==="front"?styles.calibSelected:""} onClick={()=>setSelectedMount("front")}>{t("DELANTERA","FRONT")}</button><button className={selectedMount==="rear"?styles.calibSelected:""} onClick={()=>setSelectedMount("rear")}>{t("TRASERA","REAR")}</button></div>
          {(["x","y","diameter","tilt"] as (keyof Mount)[]).map(key=><label className={styles.calibSlider} key={key}><span>{key==="x"?t("POSICIÓN HORIZONTAL","HORIZONTAL POSITION"):key==="y"?t("POSICIÓN VERTICAL","VERTICAL POSITION"):key==="diameter"?t("DIÁMETRO DE LLANTA","RIM DIAMETER"):t("ROTACIÓN","ROTATION")}</span><input type="range" min={key==="tilt"?-90:key==="diameter"?2:0} max={key==="tilt"?90:key==="diameter"?45:100} step={key==="diameter"?.2:.5} value={activeCal[selectedMount][key]} onChange={e=>editMount(selectedMount,key,Number(e.target.value))}/><output>{activeCal[selectedMount][key].toFixed(1)}{key==="tilt"?"°":"%"}</output></label>)}
        </section>}
        <p className={styles.honesty}>{t("Se utilizan las seis imágenes publicadas en tu ficha de VANMOTION. Las llantas son fotografías de productos reales; la superposición es una prueba visual ajustable y no verifica instalación, compatibilidad ni iluminación final.","All six images come from your VANMOTION vehicle listing. Wheels are real product photos; this adjustable overlay is a visual trial, not proof of physical fitment or final lighting.")}</p>
        <div className={styles.bottomPhoto}><div><small>{t("TU CONFIGURACIÓN","YOUR BUILD")}</small><strong>{changes===0?t("ORIGINAL","FACTORY STOCK"):t(`${changes} CAMBIOS`,`${changes} MODIFICATIONS`)}</strong></div><button onClick={download}>{saved?t("GUARDADO ✓","SAVED ✓"):t("GUARDAR CONFIGURACIÓN","SAVE BUILD")} ↗</button></div>
      </section>
      <aside className={styles.panel}>
        <div className={styles.panelTitle}><div><small>CONFIGURATOR / 004.4</small><h2>{t("PIEZAS REALES","REAL PARTS")}<span>.</span></h2></div><button onClick={()=>{setBuild({...INITIAL});setCompare(false);}}>{t("REINICIAR","RESET")} ↺</button></div>
        <nav className={styles.tabs} aria-label={t("Secciones","Sections")}>{TABS.map(entry=><button type="button" key={entry.id} className={tab===entry.id?styles.selectedTab:""} onClick={()=>setTab(entry.id)}><small>{entry.num}</small><strong>{lang==="es"?entry.es:entry.en}</strong></button>)}</nav>
        <div className={styles.panelContent}>
          <div className={styles.groupHead}><span>{TABS.find(entry=>entry.id===tab)?.num} / {lang==="es"?TABS.find(entry=>entry.id===tab)?.es:TABS.find(entry=>entry.id===tab)?.en}</span>
            <p>{tab==="wheels"?t("Selecciona una llanta: el montaje se muestra automáticamente. La fotografía 03 incluye un ajuste fino final: llanta delantera ligeramente más baja y ambas un poco más compactas.","Choose a wheel to preview a transparent cutout aligned with the hubs in image 03, with a final fine-tuned fit."):tab==="body"?t("Referencias comerciales para personalizar la carrocería.","Commercial bodywork customisation references."):tab==="engine"?t("Referencias verificables de admisión y escape.","Traceable intake and exhaust references."):t("Grabación real como referencia: no la confundimos con el sonido exacto de tu Ford.","Real recording for reference: not the exact sound of your Ford.")}</p>
          </div>
          {tab !== "sound" && GROUPS[tab].map(category=><section className={styles.partGroup} key={category}>
            <div className={styles.partLabel}>{({wheel:t("LLANTAS","WHEELS"),suspension:t("AMORTIGUACIÓN","SUSPENSION"),rack:t("BACA","ROOF RACK"),steps:t("ESTRIBOS","SIDE STEPS"),filter:t("ADMISIÓN","AIR INTAKE"),muffler:t("SILENCIADOR","MUFFLER")})[category]}</div>
            <div className={styles.productGrid}>{PARTS.filter(p=>p.category===category).map(p=><button type="button" key={p.id} className={`${styles.partCard} ${build[category]===p.id?styles.chosen:""}`} onClick={()=>updatePart(category,p.id)} aria-pressed={build[category]===p.id}>
              <div className={styles.productPhoto}>{p.image?<img src={p.image} alt={p.name} loading="lazy"/>:<div className={styles.stockThumb}><strong>OEM</strong></div>}</div><div className={styles.partInfo}><small>{p.brand}</small><strong>{p.name}</strong><span>{p.sku}</span></div><span className={styles.selection}>{build[category]===p.id?"●":"○"}</span></button>)}</div>
            {(()=>{const p=PARTS.find(part=>part.id===build[category])!;return <div className={styles.partDetails}><span className={styles.partSku}>{p.sku}</span><p>{lang==="es"?p.es:p.en}</p><p>{lang==="es"?p.detailsEs:p.detailsEn}</p>{p.href && <a href={p.href} rel="noopener noreferrer" target="_blank">{t("VER COMPONENTE REAL","VIEW REAL COMPONENT")} ↗</a>}</div>;})()}
          </section>)}
          {tab === "sound" && <div className={styles.realAudio}><h3>{t("REFERENCIA SONORA REAL","REAL AUDIO REFERENCE")}</h3><p>{t("Ford F-150 con motor de la familia Essex 4.2 V6 y escape MagnaFlow. No es tu E-150, ni una muestra del Walker 18819.","Ford F-150 with Essex-family 4.2 V6 and MagnaFlow exhaust. This is not your E-150 or a sample of Walker 18819.")}</p><iframe title="Ford 4.2 V6 exhaust sound reference" src="https://www.youtube-nocookie.com/embed/soHGcx0nf9s?rel=0" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen/><div className={styles.soundDisclaimer}>{t("No simulamos sonidos diferentes para piezas que no tengan grabaciones verificables.","We do not fabricate distinct sounds for parts without verifiable recordings.")}</div></div>}
        </div>
        <div className={styles.panelFooter}><span>FORD E-150 · 4.2 V6</span><span>{t("PRUEBA LOCAL · COMPATIBILIDAD A VERIFICAR","LOCAL TRIAL · FITMENT TO VERIFY")}</span></div>
      </aside>
    </div>
    <footer className={styles.footer}><span>VANMOTION FORD LAB / PRIVATE 004.4</span><Link href="/coleccion/cmrm2i93y0001jq04awn01yv0">{t("FICHA ORIGINAL DE LA FORD","ORIGINAL FORD LISTING")} ↗</Link><span>{t("SOLO LOCAL · NO PUBLICADO","LOCAL ONLY · NOT PUBLISHED")}</span></footer>
  </main>;
}
