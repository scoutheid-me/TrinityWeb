import {publicUrl} from '../publicUrl';
import {playtestBuild} from '../release';
/** Existing tabs keep old JS until reloaded. Offer a save-first refresh in the system menu. */
export function installUpdateNotice(persist:()=>Promise<void>){
 if(!playtestBuild)return;
 const current=import.meta.env.VITE_BUILD_REVISION??'local';
 const notice=document.createElement('section');notice.id='game-update';notice.hidden=true;
 notice.innerHTML='<p>A newer Trinity version is available.</p><button>Save & update game</button>';
 document.getElementById('begin')!.before(notice);
 notice.querySelector('button')!.onclick=async()=>{await persist();location.reload();};
 let checking=false;
 const check=async()=>{if(checking||document.hidden)return;checking=true;try{const r=await fetch(publicUrl('/version.json')+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const latest=await r.json();notice.hidden=typeof latest.revision!=='string'||latest.revision===current;}catch{/* Offline play remains available. */}finally{checking=false;}};
 void check();window.addEventListener('focus',()=>void check());setInterval(()=>void check(),60000);
}
