import {migrateSave,type SaveData} from './save';
export function backupText(save:SaveData){return JSON.stringify({format:'trinity-backup',version:1,save},null,2);}
export function parseBackup(text:string):SaveData{
 if(text.length>1_000_000)throw Error('Backup is too large.');
 const envelope=JSON.parse(text),s=envelope?.save;
 if(envelope?.format!=='trinity-backup'||envelope.version!==1||!s||![1,2,3].includes(s.version)||!s.profile||typeof s.profile.name!=='string'||!s.progression||!s.settings||!s.attributes||!Array.isArray(s.loadout)||s.loadout.length!==4||!s.counters)throw Error('This is not a supported Trinity backup.');
 for(const k of ['strength','dexterity','vitality','endurance'])if(typeof s.attributes[k]!=='number'||!Number.isFinite(s.attributes[k])||s.attributes[k]<0||s.attributes[k]>999)throw Error('Backup attributes are invalid.');
 const valid=migrateSave(s);
 if(JSON.stringify(valid.loadout)!==JSON.stringify(s.loadout)||valid.weapon!==s.weapon)throw Error('Backup contains an invalid weapon or Art loadout.');
 return valid;
}
export function downloadText(name:string,text:string){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
/** Backup and replacement share one transaction, so a failed import preserves the current save. */
export async function replaceWithBackup(save:SaveData){
 const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('trinity',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 return new Promise<void>((resolve,reject)=>{const tx=db.transaction('saves','readwrite'),store=tx.objectStore('saves'),old=store.get('combat-lab');old.onsuccess=()=>{if(old.result)store.put(old.result,'pre-import');store.put(save,'combat-lab');};tx.oncomplete=()=>{db.close();resolve();};tx.onabort=tx.onerror=()=>{db.close();reject(tx.error??Error('Import failed'));};});
}
export async function previousBackup(){
 const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('trinity',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 return new Promise<SaveData|undefined>((resolve,reject)=>{const tx=db.transaction('saves','readonly'),r=tx.objectStore('saves').get('pre-import');r.onsuccess=()=>resolve(r.result?migrateSave(r.result):undefined);r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close();});
}
