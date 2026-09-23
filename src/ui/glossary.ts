/** One shared, keyboard-accessible glossary instead of permanent HUD paragraphs. */
export function installGlossary(){
 const popup=document.createElement('aside');popup.id='context-help';popup.hidden=true;popup.setAttribute('role','tooltip');document.body.append(popup);let pinned:HTMLElement|null=null;
 const show=(el:HTMLElement)=>{popup.textContent=el.dataset.help!;popup.hidden=false;const r=el.getBoundingClientRect();popup.style.left=Math.max(8,Math.min(innerWidth-popup.offsetWidth-8,r.left))+'px';popup.style.top=Math.max(8,Math.min(innerHeight-popup.offsetHeight-8,r.bottom+10))+'px';};
 document.addEventListener('pointerover',e=>{const el=(e.target as HTMLElement).closest<HTMLElement>('[data-help]');if(el&&!pinned)show(el);});
 document.addEventListener('pointerout',e=>{if((e.target as HTMLElement).closest('[data-help]')&&!pinned)popup.hidden=true;});
 document.addEventListener('focusin',e=>{const el=(e.target as HTMLElement).closest<HTMLElement>('[data-help]');if(el)show(el);});
 document.addEventListener('focusout',()=>{if(!pinned)popup.hidden=true;});
 document.addEventListener('click',e=>{const el=(e.target as HTMLElement).closest<HTMLElement>('[data-help]');if(el){if(pinned===el){pinned=null;popup.hidden=true;}else{pinned=el;show(el);}}else{pinned=null;popup.hidden=true;}});
 document.addEventListener('scroll',()=>{pinned=null;popup.hidden=true;},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!popup.hidden){popup.hidden=true;pinned=null;e.stopImmediatePropagation();e.preventDefault();}},true);
}
