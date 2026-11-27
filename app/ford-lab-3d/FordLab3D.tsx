/* eslint-disable @next/next/no-img-element -- User-owned VANMOTION vehicle photos and bundled local rim thumbnails. */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LocalSoundStudio from "./LocalSoundStudio";
import { useLanguage } from "@/app/components/language/LanguageProvider";
import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";
import type { Build, CameraView, Fit, Language, ModelStatus, StudioTab, WheelChoice } from "./types";
import { DEFAULT_BUILD, DEFAULT_FIT, VANMOTION_FORD_IMAGES } from "./types";
import styles from "./ford-lab-3d.module.css";

const FordScene = dynamic(()=>import("./FordScene"),{ssr:false});
const STUDIO_TABS:StudioTab[]=["exterior","sound"]; // FORD_LAB_013_STRUCTURAL
// Local reference images: no third-party image requests or outgoing links.
const PARTS={
  ar172:{title:"American Racing AR172 Baja",sku:"AR1725885",image:"/ford-lab-3d/rims/ar172-mounted.png"},
  ar23:{title:"American Racing AR23",sku:"AR236885",image:"/ford-lab-3d/rims/ar23-mounted.png"},
  rack:{title:"Vantech H1 Ladder Rack",sku:"H1082B"},
  steps:{title:"Chrome tubular running boards",sku:"MODEL / FITMENT TO VERIFY"},
  filter:{title:"K&N High-Flow Air Filter",sku:"E-0945"},
  shocks:{title:"Bilstein B6 4600",sku:"24-184816 / 33-017204"},
  muffler:{title:"Walker SoundFX",sku:"18819"},
};
const PAINT_LABELS:Record<string,{es:string;en:string}>={
  "#172b4d":{es:"Azul Atlántico",en:"Atlantic Blue"},
  "#090b0e":{es:"Negro Obsidiana",en:"Obsidian Black"},
  "#f1ede7":{es:"Blanco Oxford",en:"Oxford White"},
  "#707677":{es:"Plata Grafito",en:"Graphite Silver"},
  "#5e201a":{es:"Rojo Burdeos",en:"Burgundy Red"},
};
function paintLabel(hex:string,language:Language):string {
  return PAINT_LABELS[hex]?.[language] ?? hex;
}
const PAINTS=[{hex:"#172b4d",title:"Atlantic Blue"},{hex:"#090b0e",title:"Obsidian Black"},{hex:"#f1ede7",title:"Oxford White"},{hex:"#707677",title:"Graphite Silver"},{hex:"#5e201a",title:"Burgundy Red"}] as const;

type Saved={build?:Partial<Build>;fit?:Partial<Fit>};
function isWheelChoice(value:unknown):value is WheelChoice{return value==="oem"||value==="ar172"||value==="ar23";}

export default function FordLab3D({ embedded = false }: { embedded?: boolean }) {


  const {language} = useLanguage();
  const {pausePlayback}=useMusicPlayer();
  const pausePlayerRef=useRef(pausePlayback);
  pausePlayerRef.current=pausePlayback;
  // This workshop has its own audio comparison, so suppress only the floating
  // VANMOTION music player while this page is mounted. Do not edit shared routes.
  useEffect(()=>{
    pausePlayerRef.current();
    const floating=document.querySelector<HTMLElement>("[data-music-player-mode]");
    const previous=floating?.style.display ?? "";
    if(floating)floating.style.display="none";
    return()=>{if(floating)floating.style.display=previous;};
  },[]);
  const lang:Language = language === "en"?"en":"es";
  const t=(es:string,en:string)=>lang==="es"?es:en;
  const [tab,setTab]=useState<StudioTab>("exterior");
  const [build,setBuild]=useState<Build>(DEFAULT_BUILD);
  const [fit,setFit]=useState<Fit>(DEFAULT_FIT);
  const [modelFile,setModelFile]=useState<File|null>(null);
  const [modelStatus,setModelStatus]=useState<ModelStatus>({kind:"loading",message:"Buscando modelo 3D..."});
  const [cameraView,setCameraView]=useState<CameraView>("threequarter");
  const [compare,setCompare]=useState(false);

  const [droppedError,setDroppedError]=useState("");
  const [fallbackPhoto,setFallbackPhoto]=useState(2);
  const uploadRef=useRef<HTMLInputElement>(null);


  useEffect(()=>{
    try {
      const previousV3=window.localStorage.getItem("vanmotion:ford-lab:3d:v3");
      const value=previousV3 || window.localStorage.getItem("vanmotion:ford-lab:3d:v2") || window.localStorage.getItem("vanmotion:ford-lab:3d:v1");
      if(!value)return;
      const parsed=JSON.parse(value) as Saved;
      if(parsed.build){
        setBuild(prev=>({
          ...prev,...parsed.build,
          rack: previousV3 ? (parsed.build?.rack ?? prev.rack) : true,
          wheels:isWheelChoice(parsed.build?.wheels)?parsed.build.wheels:prev.wheels,
        }));
      }
      if(parsed.fit)setFit(prev=>({...prev,...parsed.fit,invertDirection:false,orientation:"auto"}));
    }catch{ /* ignore invalid local preferences */ }
  },[]);
  useEffect(()=>{
    try {window.localStorage.setItem("vanmotion:ford-lab:3d:v3",JSON.stringify({build,fit}));}
    catch { /* private browser */ }
  },[build,fit]);

  const patch=<K extends keyof Build,>(key:K,value:Build[K])=>{setBuild(prev=>({...prev,[key]:value}));};

  const importModel=(file:File|undefined)=>{
    if(!file)return;
    const lower=file.name.toLowerCase();
    if(lower.endsWith(".rar")||lower.endsWith(".zip")||lower.endsWith(".blend")){
      setDroppedError(t("Extrae el archivo y selecciona el modelo .obj. El .rar o .blend no se abre directamente en la web.","Extract the archive and choose its .obj model. .rar and .blend cannot load directly in the browser."));
      return;
    }
    if(!lower.endsWith(".obj")&&!lower.endsWith(".glb")&&!lower.endsWith(".gltf")){
      setDroppedError(t("Formato incompatible. Selecciona un archivo .obj o .glb.","Unsupported format. Select an .obj or .glb file."));
      return;
    }
    setDroppedError("");setModelFile(file);setTab("exterior");
  };
  const Root = embedded ? "div" : "main";
  return <Root className={`${styles.page} ${embedded ? styles.embedded : ""}`}>
    <header className={styles.header}>
      <div className={styles.brand}><Link href="/">VANMOTION<span>.</span></Link><small>FORD LAB</small></div>
      <div className={styles.meta}><span>{t("TALLER 3D · VERSIÓN DE REVISIÓN","3D WORKSHOP · REVIEW BUILD")}</span><Link href="/coleccion/cmrm2i93y0001jq04awn01yv0">{t("FICHA DE LA FORD","FORD LISTING")} ↗</Link></div>
    </header>
    <section className={styles.heading}>
      <div><span className={styles.overline}>{t("VANMOTION · TALLER INTERACTIVO","VANMOTION · INTERACTIVE CUSTOM GARAGE")}</span><h1>{t("LA FORD","THE FORD")}<span>.</span><br/><em>{t("TALLER 3D","3D WORKSHOP")}</em></h1><p>{t("Personaliza el exterior de la Ford en 3D y escucha dos sonidos de referencia.","Customize this Ford in 3D and listen to two reference sounds.")}</p></div>
      <div className={styles.vehicleSpec}><strong>E-150</strong><span>{t("GENERACIÓN 1998–2000","1998–2000 GENERATION")}</span><small>ESSEX 4.2 V6 · RWD</small></div>
    </section>
    <nav className={styles.mobileNav} aria-label={t("Secciones del taller", "Workshop sections")}>
      {STUDIO_TABS.map((section)=><button type="button" key={section} aria-pressed={tab===section} className={tab===section?styles.mobileNavActive:""} onClick={()=>setTab(section)}>{({exterior:t("EXTERIOR 3D","3D EXTERIOR"),sound:t("SONIDO","SOUND")})[section]}</button>)}
    </nav>
    <div className={styles.workspace}>
      <section className={styles.display}>

        {tab==="exterior" ? <>
          <div className={styles.viewer} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();importModel(e.dataTransfer.files[0]);}}>
            <FordScene build={build} fit={fit} sourceFile={modelFile} cameraView={cameraView} compare={compare} onStatus={setModelStatus}/>
            {modelStatus.kind!=="ready"&&<div className={styles.missingModel}>
              <img src={VANMOTION_FORD_IMAGES[modelStatus.kind==="error"?fallbackPhoto:2]} alt={t("Fotografía de tu Ford E-150 azul","Photo of your blue Ford E-150")}/>
              <div className={styles.missingShade}/>
              <div className={styles.missingContent}>
                <small>{modelStatus.kind==="error"?t("ERROR DEL MODELO","MODEL ERROR"):modelStatus.kind==="loading"?t("CARGANDO","LOADING"):t("MODELO NECESARIO","MODEL REQUIRED")}</small>
                <strong>{modelStatus.kind==="error"?t("NO SE HA PODIDO CARGAR","COULD NOT LOAD"):t("IMPORTA TU FORD 3D","IMPORT YOUR 3D FORD")}</strong>
                <p>{modelStatus.kind==="error"?modelStatus.message:t("El modelo de la Ford está incluido. Si no carga, actualiza la página o prueba un navegador con WebGL; también puedes importar otro OBJ o GLB.","The Ford model is included. If it does not load, reload or try a browser with WebGL; you can also import another OBJ or GLB.")}</p>
                {modelStatus.kind==="error"&&<nav className={styles.fallbackGallery} aria-label={t("Fotografías de la Ford", "Ford photos")}>{VANMOTION_FORD_IMAGES.map((_,i)=><button key={i} type="button" aria-pressed={fallbackPhoto===i} className={fallbackPhoto===i?styles.fallbackSelected:""} onClick={()=>setFallbackPhoto(i)}>{String(i+1).padStart(2,"0")}</button>)}</nav>}
                {modelStatus.kind!=="error"&&<button type="button" className={styles.orangeButton} onClick={()=>uploadRef.current?.click()}>{t("IMPORTAR OBJ / GLB","IMPORT OBJ / GLB")} ↗</button>}
              </div>
            </div>}
            {modelStatus.kind==="ready"&&<div className={styles.readyMark}><span className={styles.liveDot}/> {t("MODELO 3D CARGADO · ARRASTRA PARA GIRAR","3D MODEL LOADED · DRAG TO ROTATE")}</div>}
          </div>
          <nav className={styles.views} aria-label={t("Elegir ángulo de la cámara", "Choose camera angle")}>{(["threequarter","side","front","rear","other","top"] as CameraView[]).map(v=><button type="button" key={v} aria-pressed={cameraView===v} className={cameraView===v?styles.active:""} onClick={()=>setCameraView(v)}>{({threequarter:t("DIAGONAL","DIAGONAL"),side:t("LATERAL","SIDE"),front:t("FRENTE","FRONT"),rear:t("TRASERA","REAR"),other:t("OTRO LADO","OTHER SIDE"),top:t("TECHO","ROOF")})[v]}</button>)}</nav>
          <div className={styles.viewerFooter}>

            <div className={styles.viewerActions}>
              <button type="button" disabled={modelStatus.kind!=="ready"} onClick={()=>window.dispatchEvent(new Event("vanmotion-ford-save-image"))} aria-label={t("Guardar imagen PNG de la Ford","Save PNG image of the Ford")}>{t("GUARDAR PNG","SAVE PNG")}</button>
              <button type="button" onPointerDown={()=>setCompare(true)} onPointerUp={()=>setCompare(false)} onPointerLeave={()=>setCompare(false)} onPointerCancel={()=>setCompare(false)}>{t("MANTENER: ORIGINAL","HOLD: ORIGINAL")}</button>
            </div>
          </div>
          {modelFile&&<p className={styles.modelFile}><span>{t("Modelo cargado:","Loaded model:")}</span> {modelFile.name}</p>}
          {droppedError&&<p className={styles.error}>{droppedError}</p>}
        </> : <>
          <LocalSoundStudio language={lang}/>
        </>}

      </section>
      <aside className={styles.controls}>
        <div className={styles.panelHead}><span className={styles.overline}>{t("CONFIGURADOR","CUSTOM BUILDER")}</span><h2>{t("PERSONALIZA","BUILD IT")}<span>.</span></h2><button type="button" onClick={()=>{setBuild(DEFAULT_BUILD);setFit(DEFAULT_FIT);}}>{t("REINICIAR","RESET")} ↺</button></div>
        <div className={styles.tabs}>{STUDIO_TABS.map((x)=><button key={x} className={tab===x?styles.activeTab:""} aria-pressed={tab===x} onClick={()=>setTab(x)}><strong>{({exterior:t("EXTERIOR 3D","3D EXTERIOR"),sound:t("SONIDO","SOUND")})[x]}</strong></button>)}</div>
        {tab==="exterior" ? <div className={styles.panelBody}>
          <div className={styles.group}><div className={styles.groupHeading}><strong>{t("PINTURA","PAINT")}</strong><small>{paintLabel(build.paint,lang)}</small></div><div className={styles.swatches}>{PAINTS.map(c=><button type="button" key={c.hex} title={paintLabel(c.hex,lang)} aria-label={paintLabel(c.hex,lang)} aria-pressed={build.paint===c.hex} onClick={()=>patch("paint",c.hex)} className={build.paint===c.hex?styles.selectedPaint:""} style={{background:c.hex}}/>)}</div></div>
          <div className={styles.group}><div className={styles.groupHeading}><strong>{t("LLANTAS","WHEELS")}</strong></div><div className={styles.partList}>
            <button type="button" className={build.wheels==="oem"?styles.selectedOption:""} onClick={()=>patch("wheels","oem")}><span className={styles.oemThumbnail}>OEM</span><span><strong>{t("Originales de la Ford","Factory wheels")}</strong><small>{t("Geometría del modelo base","Base-model geometry")}</small></span><i>{build.wheels==="oem"?"●":"○"}</i></button>
            {(["ar172","ar23"] as const).map(choice=><button type="button" key={choice} className={build.wheels===choice?styles.selectedOption:""} onClick={()=>patch("wheels",choice)}><img src={PARTS[choice].image} alt={PARTS[choice].title}/><span><strong>{PARTS[choice].title}</strong></span><i>{build.wheels===choice?"●":"○"}</i></button>)}
          </div><p>{t("Compatibilidad y homologación pendientes.","Fitment and approval pending.")}</p>
          <div className={styles.tireGroup}><strong>{t("NEUMÁTICOS","TIRES")}</strong><div className={styles.tireChooser}>
            <button type="button" className={build.tires==="road"?styles.tireSelected:""} onClick={()=>patch("tires","road")} aria-pressed={build.tires==="road"}><b>{t("CARRETERA","ROAD")}</b><small>{t("Banda original · firme","Original smooth tread")}</small></button>
            <button type="button" className={build.tires==="allterrain"?styles.tireSelected:""} onClick={()=>patch("tires","allterrain")} aria-pressed={build.tires==="allterrain"}><b>{t("TODOTERRENO A/T","ALL-TERRAIN A/T")}</b><small>{t("Tacos 3D · más agarre visual","Raised 3D tread blocks")}</small></button>
          </div></div>
          <p>{t("Neumáticos ilustrativos: verifica medidas y homologación.", "Tyre preview: verify size and approval.")}</p></div>
          <div className={styles.group}><strong className={styles.sectionTitle}>{t("ACCESORIOS","ACCESSORIES")}</strong><Toggle checked={build.rack} onChange={v=>patch("rack",v)} title={t("Baca Vantech H1","Vantech H1 Roof Rack")} subtitle={t("Baca de techo","Roof rack")} onLabel={t("SÍ","ON")} offLabel={t("NO","OFF")}/><Toggle checked={build.steps} onChange={v=>patch("steps",v)} title={t("Estriberas tubulares cromadas","Chrome tubular running boards")} subtitle={t("Cromadas y visibles junto al faldón lateral","Polished chrome, visible beside the lower sill")} onLabel={t("SÍ","ON")} offLabel={t("NO","OFF")}/><Toggle checked={build.exhaust==="chrome"} onChange={v=>patch("exhaust",v?"chrome":"original")} title={t("Salida de escape cromada corta","Short chrome exhaust tip")} subtitle={t("Salida trasera de referencia","Reference rear exhaust tip")} onLabel={t("SÍ","ON")} offLabel={t("NO","OFF")}/></div>

        </div> : <div className={styles.panelBody}>
          <span className={styles.panelLabel}>ESSEX 4.2 V6</span>
          <h3>{t("AUDIO PROPIO.","YOUR AUDIO.")}</h3>
          <p>{t("Utiliza el comparador de la izquierda con dos grabaciones reales. No hay vídeos, enlaces a terceros ni sonidos sintéticos presentados como auténticos.","Use the comparator on the left with two genuine recordings. No videos, third-party links or synthetic audio presented as authentic.")}</p>
          <div className={styles.sources}><strong>{t("PREPARACIÓN ACTUAL","CURRENT BUILD")}</strong>
            <p>{build.muffler==="walker"?"Walker SoundFX 18819":t("Escape original","Factory exhaust")}</p>
            <p>{build.exhaust==="chrome"?t("Salida corta cromada","Short chrome tip"):t("Salida de origen","Factory tip")}</p>
          </div>
          <p className={styles.notice}>{t("Para oír una diferencia real necesitaremos grabaciones comparables de ambas configuraciones.","To hear a genuine difference we need comparable recordings of both configurations.")}</p>
        </div>}

      </aside>
    </div>
    <section className={styles.modelHelp}>
      <div><span className={styles.overline}>{t("MODELO DIGITAL / 1998","THE DIGITAL BASE / 1998")}</span><h2>{t("MODELO 3D INSTALADO.","LOCAL 3D MODEL.")}</h2><p>{t("La Ford ya viene incluida en esta versión local. Puedes importar otra geometría si lo necesitas. Para publicación comercial hace falta autorización de uso del modelo 3D.","This local version includes the Ford. You may import another model if needed. Commercial publication requires model-use authorization.")}</p></div>
      <div className={styles.modelActions}><button type="button" onClick={()=>uploadRef.current?.click()}>{t("ABRIR OTRO OBJ / GLB","OPEN ANOTHER OBJ / GLB")}</button><small>{t("Todo se procesa en este navegador. Ningún enlace a terceros.","Everything runs in this browser. No third-party links.")}</small></div>
    </section>
    <input ref={uploadRef} type="file" accept=".obj,.glb,.gltf" onChange={e=>{importModel(e.target.files?.[0]);e.target.value="";}} hidden />

    <footer className={styles.footer}><span>VANMOTION / FORD LAB</span><span>{t("VERSIÓN DE REVISIÓN · NO PUBLICADA","REVIEW VERSION · NOT YET PUBLISHED")}</span><Link href="/coleccion/cmrm2i93y0001jq04awn01yv0">{t("VER FICHA DE LA FORD","VIEW FORD LISTING")} ↗</Link></footer>
  </Root>;
}

function Toggle({checked,onChange,title,subtitle,onLabel,offLabel}:{checked:boolean;onChange:(v:boolean)=>void;title:string;subtitle:string;onLabel:string;offLabel:string}){
  return <button type="button" className={`${styles.toggle} ${checked?styles.toggleOn:""}`} aria-pressed={checked} onClick={()=>onChange(!checked)}><span><strong>{title}</strong><small>{subtitle}</small></span><i>{checked?onLabel:offLabel}</i></button>;
}
