export const defaultComfort={cueVolume:.8,effectsVolume:.7,cueOffsetMs:0,reducedMotion:false,reducedFlash:false};
export type Comfort=typeof defaultComfort;
export function validateComfort(raw:unknown):Comfort{
 const result={...defaultComfort};if(!raw||typeof raw!=='object')return result;
 const r=raw as Record<string,unknown>;
 for(const [key,min,max] of [['cueVolume',0,1],['effectsVolume',0,1],['cueOffsetMs',-200,200]] as const){if(typeof r[key]==='number'&&Number.isFinite(r[key]))result[key]=Math.max(min,Math.min(max,r[key]));}
 for(const key of ['reducedMotion','reducedFlash'] as const)if(typeof r[key]==='boolean')result[key]=r[key];return result;
}
