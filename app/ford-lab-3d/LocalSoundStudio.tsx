"use client";

import { useEffect, useRef, useState } from "react";
import type { Language } from "./types";
import styles from "./ford-lab-3d.module.css";

type AudioAsset = { name: string; url: string };
type Slot = "stock" | "custom";

/** Local-only A/B player: no external URLs, trackers or embedded videos. */
export default function LocalSoundStudio({ language }: { language: Language }) {
  const t=(es:string,en:string)=>language==="es"?es:en;
  const [stock,setStock]=useState<AudioAsset|null>(null);
  const [custom,setCustom]=useState<AudioAsset|null>(null);
  const stockRef=useRef<HTMLAudioElement|null>(null);
  const customRef=useRef<HTMLAudioElement|null>(null);
  const urls=useRef<string[]>([]);
  useEffect(()=>()=>{urls.current.forEach(url=>URL.revokeObjectURL(url));},[]);
  const load=(slot:Slot,file?:File)=>{
    if(!file)return;
    if(!(/\.(wav|mp3|m4a|ogg|aac)$/i.test(file.name)||file.type.startsWith("audio/")))return;
    stockRef.current?.pause();customRef.current?.pause();
    const url=URL.createObjectURL(file);
    urls.current.push(url);
    if(slot==="stock")setStock({name:file.name,url});
    else setCustom({name:file.name,url});
  };
  return <div className={styles.soundWorkspace}>
    <span className={styles.overline}>{t("COMPARADOR A/B SIN ENLACES EXTERNOS","A/B COMPARISON · NO EXTERNAL LINKS")}</span>
    <h2>{t("ESCUCHA LAS DIFERENCIAS.","HEAR THE DIFFERENCE.")}</h2>
    <p>{t("Importa dos grabaciones auténticas de tu vehículo o de preparaciones autorizadas. El audio se reproduce en tu navegador y no se envía a ningún servidor.","Load two authentic recordings of your vehicle or licensed builds. Audio plays in your browser and is never uploaded to a server.")}</p>
    <div className={styles.soundSlots}>
      {([
        {id:"stock" as Slot, title:t("01 / MOTOR ORIGINAL","01 / FACTORY ENGINE"),asset:stock,ref:stockRef},
        {id:"custom" as Slot,title:t("02 / ESCAPE PREPARADO","02 / MODIFIED EXHAUST"),asset:custom,ref:customRef},
      ]).map(({id,title,asset,ref})=><section className={styles.soundSlot} key={id}>
        <h3>{title}</h3>
        <label className={styles.soundUpload}>{asset ? t("SUSTITUIR GRABACIÓN","REPLACE RECORDING") : t("ELEGIR AUDIO PROPIO","SELECT YOUR RECORDING")}
          <input type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.aac" onChange={e=>{load(id,e.target.files?.[0]);e.target.value="";}} />
        </label>
        {asset ? <><span className={styles.soundFilename}>{asset.name}</span><audio ref={ref} controls preload="metadata" src={asset.url} onPlay={()=>{if(id==="stock")customRef.current?.pause();else stockRef.current?.pause();}} /></> : <p className={styles.noAudio}>{t("Aún no hay una grabación local cargada.","No local recording has been loaded yet.")}</p>}
      </section>)}
    </div>
    <p className={styles.soundDisclosure}>{t("No se simulan sonidos de motor ni se atribuyen grabaciones de otro vehículo a esta Ford. Las diferencias solo se escucharán cuando cargues archivos reales comparables.","No synthetic engine sound and no recordings from another car presented as this Ford. You can hear differences once you provide comparable real recordings.")}</p>
  </div>;
}
