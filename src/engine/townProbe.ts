import {Constants,RawCubeTexture,Texture,type Scene} from '@babylonjs/core';
/** Small original sky/ground light probe; no network dependency or HDR download. */
export function createTownProbe(scene:Scene){
 const size=64,faces:Uint8Array[]=[];
 for(let face=0;face<6;face++){
  const data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const u=(x+.5)/size*2-1,v=(y+.5)/size*2-1;
   const dir=[[1,-v,-u],[-1,-v,u],[u,1,v],[u,-1,-v],[u,-v,1],[-u,-v,-1]][face],length=Math.hypot(...dir),h=dir[1]/length;
   const horizon=[.72,.68,.53],zenith=[.28,.49,.66],ground=[.12,.105,.08];
   const t=Math.pow(Math.abs(h),.55),end=h>0?zenith:ground;
   const sun=Math.pow(Math.max(0,(dir[0]*.45+dir[1]*.8-dir[2]*.4)/length),80)*.6;
   for(let c=0;c<3;c++)data[(y*size+x)*4+c]=Math.round(Math.min(1,horizon[c]*(1-t)+end[c]*t+sun*[1,.82,.5][c])*255);
   data[(y*size+x)*4+3]=255;
  }faces.push(data);
 }
 const probe=new RawCubeTexture(scene,faces,size,Constants.TEXTUREFORMAT_RGBA,Constants.TEXTURETYPE_UNSIGNED_BYTE,true,false,Texture.TRILINEAR_SAMPLINGMODE);probe.name='Original warm courtyard light probe';probe.gammaSpace=false;return probe;
}
