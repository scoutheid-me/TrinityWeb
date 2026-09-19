import {Color3,Mesh,MeshBuilder,Scene,StandardMaterial,Vector3,VertexData} from '@babylonjs/core';
import {hitOutline,type HitShape} from '../combat/geometry';

/** Fixed-size footprint; anticipation changes opacity, never the advertised reach. */
export class HitIndicator {
  mesh:Mesh;edge:Mesh;material:StandardMaterial;shape:HitShape;
  constructor(scene:Scene,shape:HitShape,name:string){
    this.shape=shape;const outline=hitOutline(shape),positions=outline.flatMap(p=>[p.x,.055,p.z]),indices:number[]=[];
    for(let i=1;i<outline.length-1;i++)indices.push(0,i,i+1);
    const vertices=new VertexData();vertices.positions=positions;vertices.indices=indices;vertices.normals=positions.map((_,i)=>i%3===1?1:0);
    this.mesh=new Mesh(name,scene);vertices.applyToMesh(this.mesh);this.mesh.isPickable=false;
    this.material=new StandardMaterial(name+' material',scene);this.material.disableLighting=true;this.material.backFaceCulling=false;this.material.alpha=.12;this.mesh.material=this.material;
    this.edge=MeshBuilder.CreateLines(name+' boundary',{points:[...outline,outline[0]].map(p=>new Vector3(p.x,.06,p.z))},scene);this.edge.parent=this.mesh;this.edge.isPickable=false;
    this.mesh.metadata={hitShape:shape};
  }
  update(x:number,z:number,yaw:number,remaining:number,parryable:boolean){
    this.mesh.position.set(x,0,z);this.mesh.rotation.y=yaw;
    const color=Color3.FromHexString(parryable?'#ffdb83':'#ff686f');this.material.emissiveColor=color;
    this.material.alpha=remaining<=0?.32:remaining<180?.24:.13;
    (this.edge as import('@babylonjs/core').LinesMesh).color=color;
    this.mesh.setEnabled(true);
  }
  dispose(){this.mesh.dispose();this.material.dispose();}
}
