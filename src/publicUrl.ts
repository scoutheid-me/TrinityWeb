/** Resolve public runtime assets under local hosting or a GitHub Pages project path. */
export function publicUrl(path:string){
 const url=import.meta.env.BASE_URL+path.replace(/^\//,'');
 const revision=import.meta.env.VITE_BUILD_REVISION;
 return revision?url+(url.includes('?')?'&':'?')+'v='+encodeURIComponent(revision):url;
}
