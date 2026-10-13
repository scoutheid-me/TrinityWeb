import {GuideRoutine} from '../world/guide';
import {aimedOrb} from '../world/lootFocus';
import {lootRarities,itemRarity} from '../data/creatureLoot';
import {canPickUp,type GroundDrop} from '../world/loot';
import {createTownProbe} from './townProbe';
import {exitDoor} from '../world/regions';
import {publicUrl} from '../publicUrl';
import {Color3,Color4,DynamicTexture,ImportMeshAsync,MeshBuilder,PointLight,StandardMaterial,TransformNode,Vector3,type Mesh,type AnimationGroup} from '@babylonjs/core';
import type {LabScene} from './scene';
import {cavernAreas,chestAreas,cavernHeight} from '../world/cavern';
export class DungeonView {
 sentryGate!:TransformNode;door!:TransformNode;private doorLift=0;root:TransformNode;hall:TransformNode[]=[];markers=new Map<string,Mesh>();chests=new Map<number,TransformNode>();npc!:TransformNode;gate!:Mesh;lights:PointLight[]=[];exitLight!:PointLight;town!:TransformNode;
 private ambienceTime=0;private guideClips:AnimationGroup[]=[];private guide=new GuideRoutine();private cavernModel!:TransformNode;
 private lootOrbs=new Map<string,{mesh:Mesh;age:number;base:number}>();
 constructor(private view:LabScene){this.root=new TransformNode('Connected cavern',view.scene);this.root.setEnabled(false);}
 setHallNodes(nodes:TransformNode[]){this.hall=nodes;}
 async init(){
  const probe=createTownProbe(this.view.scene);this.view.scene.environmentTexture=probe;this.view.scene.environmentIntensity=.25;
  const asset=async(url:string)=>{const root=new TransformNode(url,this.view.scene);root.parent=this.root;const m=await ImportMeshAsync(publicUrl(url),this.view.scene);for(const n of m.meshes){if(!n.parent)n.parent=root;n.receiveShadows=true;}this.view.cast(root);this.view.loadedAssets.push(url);return root;};
  this.cavernModel=await asset('/assets/environments/connected_cavern.glb');await asset('/assets/environments/beginnings_outskirts.glb');this.town=await asset('/assets/environments/beginnings_gate_square.glb');this.town.position.set(0,0,160);
  const portal=await asset('/assets/environments/cavern_exit_portal.glb');portal.position.set(exitDoor.x,0,exitDoor.z);portal.rotation.y=exitDoor.yaw;this.door=await asset('/assets/environments/cavern_exit_door.glb');this.door.position.copyFrom(portal.position);this.door.rotation.y=portal.rotation.y;
  const sign=MeshBuilder.CreatePlane('Guild Hall sign',{width:4.7,height:.7},this.view.scene);sign.parent=this.root;sign.position.set(0,5.6,170.5);sign.rotation.y=Math.PI;const signTex=new DynamicTexture('Guild Hall lettering',{width:1024,height:160},this.view.scene,false);signTex.drawText('ADVENTURERS GUILD',null,105,'66px serif','#ead9a5','#392e25',true);const signMat=this.view.material('Guild lettering','#ffffff',.2);signMat.diffuseTexture=signTex;signMat.backFaceCulling=false;sign.material=signMat;
  const hallDoor=this.door.clone('Exit to Town Square',null)!;hallDoor.parent=null;hallDoor.setEnabled(true);hallDoor.position.set(0,0,-12.6);hallDoor.rotation.y=Math.PI;hallDoor.scaling.setAll(.7);this.hall.push(hallDoor);
  const exitSign=MeshBuilder.CreatePlane('Town Square exit label',{width:2.7,height:.5},this.view.scene);exitSign.parent=null;this.hall.push(exitSign);exitSign.position.set(0,1.9,-12.25);exitSign.rotation.y=Math.PI;const exitTex=new DynamicTexture('Town Square exit lettering',{width:512,height:96},this.view.scene,false);exitTex.drawText('TOWN SQUARE',null,64,'44px serif','#eee4bc','#253944',true);const exitMat=this.view.material('Exit lettering','#ffffff',.5);exitMat.diffuseTexture=exitTex;exitMat.backFaceCulling=false;exitSign.material=exitMat;
  const chest=await asset('/assets/props/dungeon_chest.glb');chest.setEnabled(false);
  for(const i of chestAreas){const a=cavernAreas[i],copy=chest.clone('cavern-chest-'+i,this.root)!;copy.setEnabled(true);copy.position.set(a.x-5,cavernHeight(a.z+3,a.x-5),a.z+3);this.chests.set(i,copy);}
  const crate=await asset('/assets/props/goblin_crate.glb');crate.setEnabled(false);
  for(const i of [1,3,4,6,7]){const a=cavernAreas[i];for(let k=0;k<2;k++){const c=crate.clone('Abandoned crate',this.root)!;c.setEnabled(true);c.position.set(a.x+a.radius-3,cavernHeight(a.z+k*2,a.x+a.radius-3),a.z+k*2);}}
  const guide=await ImportMeshAsync(publicUrl('/assets/characters/mina_guide.glb'),this.view.scene);this.npc=new TransformNode('Mira town guide',this.view.scene);this.npc.parent=this.root;for(const n of guide.meshes){if(!n.parent)n.parent=this.npc;n.receiveShadows=true;}this.view.cast(this.npc);this.view.loadedAssets.push('/assets/characters/mina_guide.glb');this.guideClips=guide.animationGroups;for(const clip of this.guideClips){clip.start(true);clip.pause();}this.poseGuide(0);this.npc.position.set(0,0,161);this.npc.rotation.y=Math.PI;
  for(const [id,label,x,z] of [['rest-0','',4,-4],['rest-3','',-26,26],['rest-6','',-26,56],['supply','',-33,27],['mira','Mira Vale',0,161]] as const){
   const m=MeshBuilder.CreateCylinder(id,{diameter:.7,height:.8,tessellation:8},this.view.scene);m.parent=this.root;m.position.set(x,cavernHeight(z,x)+.4,z);m.material=this.view.material(id,id.startsWith('rest')?'#63b3ad':'#b29968',.25);this.markers.set(id,m);if(id==='mira'){m.visibility=0;}
   if(label){const sign=MeshBuilder.CreatePlane(id+' label',{width:2.6,height:.6},this.view.scene);sign.parent=this.npc;sign.position.y=2.2;sign.billboardMode=7;const tex=new DynamicTexture('Mira name',{width:512,height:128},this.view.scene,false);tex.hasAlpha=true;tex.drawText(label,null,78,'34px sans-serif','#f6ebcf','transparent',true);const mat=this.view.material('Mira label','#ffffff',1);mat.diffuseTexture=tex;mat.useAlphaFromDiffuseTexture=true;mat.backFaceCulling=false;sign.material=mat;}
  }
  this.sentryGate=new TransformNode('Sentry portcullis',this.view.scene);this.sentryGate.parent=this.root;this.sentryGate.position.set(0,cavernHeight(44,0),44);
  const iron=this.view.material('Portcullis iron','#53636d');for(let x=-3;x<=3;x+=.6){const bar=MeshBuilder.CreateBox('Sentry iron bar',{width:.1,height:4,depth:.15},this.view.scene);bar.parent=this.sentryGate;bar.position.set(x,2,0);bar.material=iron;}for(const y of [1,3.5]){const rail=MeshBuilder.CreateBox('Sentry gate brace',{width:7,height:.14,depth:.18},this.view.scene);rail.parent=this.sentryGate;rail.position.y=y;rail.material=iron;}
  this.gate=MeshBuilder.CreateBox('Captain barred gate',{width:6.8,height:4,depth:.35},this.view.scene);this.gate.parent=this.root;this.gate.position.set(-30,-1,104.6);this.gate.material=this.view.material('Gate timber','#34271b');
  for(let i=0;i<3;i++){const l=new PointLight('Cavern light '+i,new Vector3(0,3,0),this.view.scene);l.diffuse=Color3.FromHexString(i===0?'#7eafff':'#588dff');l.intensity=i===0?2:2.5;l.range=i===0?15:24;l.setEnabled(false);this.lights.push(l);}
  this.exitLight=new PointLight('Warm daylight beyond the stairs',new Vector3(-11,4.8,145),this.view.scene);this.exitLight.diffuse=Color3.FromHexString('#ffe6b4');this.exitLight.intensity=3;this.exitLight.range=25;this.exitLight.setEnabled(false);
  for(const mat of this.view.scene.materials)if('maxSimultaneousLights' in mat)(mat as StandardMaterial).maxSimultaneousLights=6;
 }
 private poseGuide(dt:number,p={x:0,z:-6}){
  const pose=this.guide.update(p,dt),clip=this.guideClips.find(c=>c.name===pose.clip);
  if(clip)clip.goToFrame(clip.from+(clip.to-clip.from)*pose.phase);
  this.npc.position.set(this.guide.x,0,this.guide.z);this.npc.rotation.y=this.guide.yaw;
 }
 /** Only eligible, unclaimed items are represented in this player's scene. */
 focusLoot(eligible:string[]){
  const ray=this.view.scene.activeCamera!.getForwardRay(6),ids=new Set(eligible);
  const selected=aimedOrb(ray.origin,ray.direction,[...this.lootOrbs].filter(([id])=>ids.has(id)).map(([id,o])=>({id,position:o.mesh.getAbsolutePosition()})));
  for(const [id,o] of this.lootOrbs){o.mesh.renderOutline=id===selected;o.mesh.outlineColor=Color3.FromHexString('#ffe6a1');o.mesh.outlineWidth=.018;}
  return selected;
 }
 syncLoot(drops:GroundDrop[],actor:string){
  const visible=drops.filter(d=>canPickUp(d,actor)),ids=new Set(visible.map(d=>d.id));
  for(const [id,o] of this.lootOrbs)if(!ids.has(id)){o.mesh.dispose();this.lootOrbs.delete(id);}
  for(const drop of visible){if(this.lootOrbs.has(drop.id))continue;
   const rarity=lootRarities[drop.item==='col'?'common':itemRarity(drop.item)],name='Loot orb '+rarity.label;
   const orb=MeshBuilder.CreateSphere(name,{diameter:.23,segments:12},this.view.scene);orb.parent=this.root;orb.isPickable=false;orb.metadata={dropId:drop.id,item:drop.item};
   orb.position.set(drop.x,cavernHeight(drop.z,drop.x)+.38,drop.z);orb.material=this.view.scene.getMaterialByName(name)??this.view.material(name,rarity.color,.4);const mat=orb.material as StandardMaterial;mat.disableLighting=true;mat.emissiveColor=Color3.FromHexString(rarity.color);mat.specularColor=Color3.Black();
   const halo=MeshBuilder.CreateTorus(name+' halo',{diameter:.42,thickness:.014,tessellation:24},this.view.scene);halo.parent=orb;halo.material=orb.material;halo.isPickable=false;
   this.lootOrbs.set(drop.id,{mesh:orb,age:0,base:orb.position.y});
  }
 }
 show(){this.exitLight.setEnabled(true);this.root.setEnabled(true);for(const n of this.hall)n.setEnabled(false);for(const l of this.lights)l.setEnabled(true);}
 hide(){this.exitLight.setEnabled(false);this.view.scene.environmentIntensity=.35;this.root.setEnabled(false);for(const n of this.hall)n.setEnabled(true);for(const l of this.lights)l.setEnabled(false);this.view.scene.clearColor=new Color4(.37,.57,.67,1);this.view.scene.fogColor=new Color3(.37,.57,.67);this.view.scene.fogDensity=.011;this.view.scene.getLightByName('sky')!.intensity=.8;this.view.scene.getLightByName('sun')!.intensity=1.65;}
 update(p:{x:number;z:number},room:number,looted:string[],boss:boolean,doorOpen=false,dt=16,sentryDefeated=false){
  this.ambienceTime+=Math.max(0,Math.min(dt,100));this.poseGuide(dt,p);this.cavernModel.setEnabled(!(p.z>148||p.x>24&&p.z>130));
  for(const o of this.lootOrbs.values()){o.age+=dt;o.mesh.position.y=o.base+Math.sin(o.age*.003)*.055;o.mesh.rotation.y=o.age*.0006;}
  this.sentryGate.setEnabled(!sentryDefeated);
  this.doorLift=Math.min(4.5,Math.max(0,this.doorLift+(doorOpen?1:-1)*dt*.005));this.door.position.y=this.doorLift;
  this.gate.setEnabled(!boss);for(const [i,c] of this.chests)c.rotation.x=looted.includes('chest-'+i)?.12:0;
  const town=p.z>148||p.x>24&&p.z>130;this.view.scene.environmentIntensity=town?.7:.12;this.view.scene.clearColor=town?new Color4(.47,.64,.73,1):new Color4(.013,.022,.05,1);this.view.scene.fogColor=town?new Color3(.47,.64,.73):new Color3(.013,.022,.05);this.view.scene.fogDensity=town?.006:.018;this.view.scene.getLightByName('sky')!.intensity=town?.48:.2;this.view.scene.getLightByName('sun')!.intensity=town?2.1:.1;this.view.scene.imageProcessingConfiguration.exposure=1.05;
  for(let i=0;i<this.lights.length;i++){this.lights[i].intensity=town?(i===0?.35:0):(i===0?2:2.5*(1+.035*Math.sin(this.ambienceTime*.003+i)+.02*Math.sin(this.ambienceTime*.007+i*2)));this.lights[i].diffuse=Color3.FromHexString(town?'#ffe0ab':i===0?'#7eafff':'#588dff');}
  this.lights[0].position.set(p.x+.5,cavernHeight(p.z,p.x)+2.5,p.z-1);const near=[...cavernAreas].sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));for(let i=1;i<3;i++)this.lights[i].position.set(near[i-1].x,cavernHeight(near[i-1].z,near[i-1].x)+3.5,near[i-1].z+2);
 }
}
