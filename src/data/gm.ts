import {weapons} from './weapons';
import {arts} from './arts';
import {supplies} from './items';
export const gmCatalog={weapons,arts,supplies};
export const originalCatalog=structuredClone(gmCatalog);
export type GMCatalog=typeof gmCatalog;
/** Accept only the existing item schema: no executable fields, missing data or nonfinite stats. */
export function validateCatalog(raw:unknown):GMCatalog{
 function check(value:any,base:any,path:string):any{
  if(typeof base==='number'){if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>100000)throw new Error(path+': use a finite number from 0 to 100000');return value;}
  if(typeof base==='boolean'){if(typeof value!=='boolean')throw new Error(path+': expected checkbox value');return value;}
  if(typeof base==='string'){if(typeof value!=='string'||value.length>500||/[<>"&]/.test(value))throw new Error(path+': invalid text');if(/\.(id|model|weapon|kind|motion|input|practiceArt)$/.test(path)&&value!==base)throw new Error(path+': identity/type must stay unchanged');return value;}
  if(!value||typeof value!=='object'||Array.isArray(value)!==Array.isArray(base)||Object.keys(value).length!==Object.keys(base).length)throw new Error(path+': keep all existing fields');
  const out:any=Array.isArray(base)?[]:{};for(const key of Object.keys(base))out[key]=check(value[key],base[key],path+'.'+key);return out;
 }
 const data=check(raw,originalCatalog,'items') as GMCatalog;
 for(const w of Object.values(data.weapons)){if(w.startup<1||w.recovery<1||w.shape.range<=0||w.shape.range>12||w.guard>1||('halfArc' in w.shape&&w.shape.halfArc>Math.PI)||('halfWidth' in w.shape&&w.shape.halfWidth>6)||w.maxTargets!==undefined&&(!Number.isInteger(w.maxTargets)||w.maxTargets<1))throw new Error(w.name+': invalid timing, reach, target count, guard or hit area');}
 for(const a of Object.values(data.arts)){if(a.startup<1||a.recovery<1||a.arc>Math.PI||a.nodes.some((n,i)=>n.at<=(a.nodes[i-1]?.at??a.startup)||n.range<=0||n.range>12)||a.shape&&(a.shape.range<=0||a.shape.range>12||a.shape.kind==='sector'&&a.shape.halfArc>Math.PI)||a.maxTargets!==undefined&&(!Number.isInteger(a.maxTargets)||a.maxTargets<1))throw new Error(a.name+': timing events must be ordered after startup; check range and target count');}
 return data;
}
export function applyCatalog(data:GMCatalog){for(const group of ['weapons','arts','supplies'] as const)for(const id of Object.keys(gmCatalog[group]))Object.assign((gmCatalog[group] as any)[id],structuredClone((data[group] as any)[id]));}
