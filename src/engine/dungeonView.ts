import {publicUrl} from '../publicUrl';
import {Color3,Color4,DynamicTexture,ImportMeshAsync,MeshBuilder,PointLight,StandardMaterial,TransformNode,Vector3,type Mesh} from '@babylonjs/core';
import type {LabScene} from './scene';
import {cavernAreas,chestAreas} from '../world/cavern';
export class DungeonView {
 root:TransformNode;hall:TransformNode[]=[];markers=new Map<string,Mesh>();chests=new Map<number,TransformNode>();npc!:TransformNode;gate!:Mesh;lights:PointLight[]=[];town!:TransformNode;
 constructor(private view:LabScene){this.root=new TransformNode('Connected cavern',view.scene);this.root.setEnabled(false);}
 setHallNodes(nodes:TransformNode[]){this.hall=nodes;}
 async init(){
  const asset=async(url:string)=>{const root=new TransformNode(url,this.view.scene);root.parent=this.root;const m=await ImportMeshAsync(publicUrl(url),this.view.scene);for(const n of m.meshes){if(!n.parent)n.parent=root;n.receiveShadows=true;}this.view.loadedAssets.push(url);return root;};
  await asset('/assets/environments/connected_cavern.glb');this.town=await asset('/assets/environments/beginnings_gate_square.glb');this.town.position.set(0,0,160);
  const chest=await asset('/assets/props/dungeon_chest.glb');chest.setEnabled(false);
  for(const i of chestAreas){const a=cavernAreas[i],copy=chest.clone('cavern-chest-'+i,this.root)!;copy.setEnabled(true);copy.position.set(a.x-5,0,a.z+3);this.chests.set(i,copy);}
  const crate=await asset('/assets/props/goblin_crate.glb');crate.setEnabled(false);
  for(const i of [1,3,4,6,7]){const a=cavernAreas[i];for(let k=0;k<2;k++){const c=crate.clone('Abandoned crate',this.root)!;c.setEnabled(true);c.position.set(a.x+a.radius-3,0,a.z+k*2);}}
  this.npc=await asset('/assets/characters/wayfarer_woman.glb');this.npc.position.set(0,0,161);this.npc.rotation.y=Math.PI;
  for(const [id,label,x,z] of [['rest-0','',4,-4],['rest-3','',-26,26],['rest-6','',-26,56],['supply','',-33,27],['mira','Mira Vale',0,161]] as const){
   const m=MeshBuilder.CreateCylinder(id,{diameter:.7,height:.8,tessellation:8},this.view.scene);m.parent=this.root;m.position.set(x,.4,z);m.material=this.view.material(id,id.startsWith('rest')?'#63b3ad':'#b29968',.25);this.markers.set(id,m);
   if(label){const sign=MeshBuilder.CreatePlane(id+' label',{width:2.6,height:.6},this.view.scene);sign.parent=m;sign.position.y=1.8;sign.billboardMode=7;const tex=new DynamicTexture('Mira name',{width:512,height:128},this.view.scene,false);tex.hasAlpha=true;tex.drawText(label,null,78,'34px sans-serif','#f6ebcf','transparent',true);const mat=this.view.material('Mira label','#ffffff',1);mat.diffuseTexture=tex;mat.useAlphaFromDiffuseTexture=true;mat.backFaceCulling=false;sign.material=mat;}
  }
  this.gate=MeshBuilder.CreateBox('Captain barred gate',{width:6.8,height:4,depth:.35},this.view.scene);this.gate.parent=this.root;this.gate.position.set(-30,2,104.6);this.gate.material=this.view.material('Gate timber','#34271b');
  for(let i=0;i<3;i++){const l=new PointLight('Cavern light '+i,new Vector3(0,3,0),this.view.scene);l.diffuse=Color3.FromHexString(i===0?'#ffd7a0':'#74bccc');l.intensity=i===0?2:2.5;l.range=i===0?15:24;l.setEnabled(false);this.lights.push(l);}
  for(const mat of this.view.scene.materials)if('maxSimultaneousLights' in mat)(mat as StandardMaterial).maxSimultaneousLights=6;
 }
 show(){this.root.setEnabled(true);for(const n of this.hall)n.setEnabled(false);for(const l of this.lights)l.setEnabled(true);}
 hide(){this.root.setEnabled(false);for(const n of this.hall)n.setEnabled(true);for(const l of this.lights)l.setEnabled(false);this.view.scene.clearColor=new Color4(.37,.57,.67,1);this.view.scene.fogColor=new Color3(.37,.57,.67);this.view.scene.fogDensity=.011;this.view.scene.getLightByName('sky')!.intensity=.8;this.view.scene.getLightByName('sun')!.intensity=1.65;}
 update(p:{x:number;z:number},room:number,looted:string[],boss:boolean){
  this.gate.setEnabled(!boss);for(const [i,c] of this.chests)c.rotation.x=looted.includes('chest-'+i)?.12:0;
  const town=room===9;this.view.scene.clearColor=town?new Color4(.47,.64,.73,1):new Color4(.018,.031,.039,1);this.view.scene.fogColor=town?new Color3(.47,.64,.73):new Color3(.018,.031,.039);this.view.scene.fogDensity=town?.011:.035;this.view.scene.getLightByName('sky')!.intensity=town?.8:.2;this.view.scene.getLightByName('sun')!.intensity=town?1.65:.1;this.view.scene.imageProcessingConfiguration.exposure=1.05;
  this.lights[0].position.set(p.x+.5,2.5,p.z-1);const near=[...cavernAreas].sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));for(let i=1;i<3;i++)this.lights[i].position.set(near[i-1].x,3.5,near[i-1].z+2);
 }
}
