import { arts } from '../data/arts';
import { defaultAttributes, type Attributes, clamp } from '../data/balance';
import { equipArts } from '../combat/rules';
import {defaultBindings,validateBindings,type Bindings} from '../input/bindings';
export interface SaveData { version: 2; attributes: Attributes; loadout: (string|null)[]; settings: { quality: 'low'|'medium'|'high'; sensitivity: number; sound: boolean; timingMusic:boolean; bindings:Bindings }; counters: { kills: number; parries: number; breaks: number; perfects: number; arts: number }; }
export function defaultSave(): SaveData { return {version:2,attributes:{...defaultAttributes},loadout:['crescent-break',null,null,null],settings:{quality:'medium',sensitivity:1,sound:true,timingMusic:true,bindings:defaultBindings()},counters:{kills:0,parries:0,breaks:0,perfects:0,arts:0}}; }
export function migrateSave(raw: unknown): SaveData {
  const fallback=defaultSave();
  if (!raw||typeof raw!=='object') return fallback;
  const data=raw as Omit<Partial<SaveData>,'version'> & {version?:number};
  if(data.version!==1&&data.version!==2) return fallback;
  for(const key of Object.keys(fallback.attributes) as (keyof Attributes)[]) {const value=data.attributes?.[key]; if(typeof value==='number'&&Number.isFinite(value)) fallback.attributes[key]=clamp(value,0,999);}
  try {if(Array.isArray(data.loadout)&&data.loadout.every(id=>id===null||(typeof id==='string'&&!!arts[id]))) fallback.loadout=equipArts(data.loadout);} catch { /* Invalid loadouts recover to the starter Art. */ }
  if(data.settings){if(['low','medium','high'].includes(data.settings.quality)) fallback.settings.quality=data.settings.quality; if(Number.isFinite(data.settings.sensitivity)) fallback.settings.sensitivity=clamp(data.settings.sensitivity,.25,3); if(typeof data.settings.sound==='boolean') fallback.settings.sound=data.settings.sound;}
  if(data.version===2&&data.settings){fallback.settings.bindings=validateBindings(data.settings.bindings);if(typeof data.settings.timingMusic==='boolean')fallback.settings.timingMusic=data.settings.timingMusic;}
  for(const key of Object.keys(fallback.counters) as (keyof SaveData['counters'])[]) { const n=data.counters?.[key]; if(typeof n==='number'&&Number.isFinite(n)) fallback.counters[key]=Math.max(0,Math.floor(n)); }
  return fallback;
}
async function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open('trinity',1);request.onupgradeneeded=()=>request.result.createObjectStore('saves');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function loadSave():Promise<SaveData>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('saves','readonly');const request=tx.objectStore('saves').get('combat-lab');request.onsuccess=()=>resolve(migrateSave(request.result));request.onerror=()=>reject(request.error);tx.oncomplete=()=>db.close();});}
export async function saveGame(data:SaveData):Promise<void>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(migrateSave(data),'combat-lab');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});}
