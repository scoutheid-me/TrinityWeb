/** Original vector motifs, not cropped artwork from the reference images. */
let emblemSerial=0;
export function artIcon(id:string){
 const gradient="art-light-"+(emblemSerial++);
 const motion=/step|linear|trail/.test(id),defense=/stone|anchor|iron/.test(id),heal=/breath/.test(id);
 const color=heal?'#527b48':defense?'#ac702e':motion?'#2c83b7':'#b68c2e';
 const path=heal?'M25 5 21 19 9 16 19 27 14 42 25 33 36 42 31 27 41 16 29 19Z':defense?'M25 6 40 13 37 31 25 43 13 31 10 13Z M25 12V35':motion?'M8 39 29 7 22 28 43 17 30 36Z':'M8 35Q25 0 42 13Q43 35 9 41 M9 41 37 7 M17 34 42 25';
 return `<svg class="art-emblem" viewBox="0 0 50 50" aria-hidden="true" style="--emblem-color:${color}"><defs><radialGradient id="${gradient}" cx="35%" cy="70%" r="85%"><stop stop-color="${color}"/><stop offset="1" stop-color="#18262e"/></radialGradient></defs><rect x="1" y="1" width="48" height="48" rx="1" fill="url(#${gradient})"/><path d="${path}" fill="none" stroke="${color}" stroke-width="7" opacity=".7"/><path d="M2 46 46 2M2 35 35 2" stroke="white" opacity=".14"/><path d="${path}" fill="none" stroke="#fff9dd" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="37" cy="11" r="2" fill="white"/></svg>`;
}
export function menuIcon(kind:string){const paths:Record<string,string>={items:'M17 9H33L30 18 38 34Q39 42 25 42Q11 42 12 34L20 18Z M19 18H31',arts:'M25 5 29 19 43 15 33 26 43 36 29 32 25 45 21 32 7 36 17 26 7 15 21 19Z',equipment:'M12 8 37 36M38 8 13 36M8 30 20 42M30 42 42 30',friends:'M20 26Q9 27 9 41H41Q41 27 30 26 M25 8A8 8 0 1 0 25 24A8 8 0 1 0 25 8',map:'M25 43Q7 24 14 13Q25 0 36 13Q43 24 25 43Z M25 13A6 6 0 1 0 25 25A6 6 0 1 0 25 13',manual:'M9 9H22L25 12 28 9H41V40H28L25 43 22 40H9Z M25 12V39'};return `<svg viewBox="0 0 50 50" aria-hidden="true"><path d="${paths[kind]}" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`;}
