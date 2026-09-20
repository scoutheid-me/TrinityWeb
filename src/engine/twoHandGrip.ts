import {Quaternion,TransformNode,Vector3} from '@babylonjs/core';
const down=new Vector3(0,-1,0);
function aim(node:TransformNode,direction:Vector3){
 const d=direction.normalize(),dot=Math.max(-1,Math.min(1,Vector3.Dot(down,d))),axis=Vector3.Cross(down,d);
 node.rotationQuaternion=axis.lengthSquared()<1e-10?(dot>0?Quaternion.Identity():Quaternion.RotationAxis(Vector3.Right(),Math.PI)):Quaternion.RotationAxis(axis.normalize(),Math.acos(dot));
 node.computeWorldMatrix(true);
}
/** Analytic two-bone solve. Hand centers remain on the authored weapon grip sockets. */
export function holdGrip(arm:TransformNode,sword:TransformNode,side:'left'|'right'){
 const elbow=arm.getDescendants().find(n=>n.name.endsWith(side+'_elbow')) as TransformNode|undefined;if(!elbow)return;
 sword.computeWorldMatrix(true);const world=Vector3.TransformCoordinates(new Vector3(0,0,side==='right'?.08:-.15),sword.getWorldMatrix());
 const parent=arm.parent as TransformNode;parent.computeWorldMatrix(true);const local=Vector3.TransformCoordinates(world,parent.getWorldMatrix().clone().invert());
 const delta=local.subtract(arm.position),distance=Math.min(.639,Math.max(.001,delta.length())),direction=delta.normalize();
 const pole=new Vector3(side==='left'?-1:1,-.45,-.1);const bend=pole.subtract(direction.scale(Vector3.Dot(pole,direction))).normalize();
 const offset=direction.scale(distance/2).add(bend.scale(Math.sqrt(.32**2-(distance/2)**2)));
 aim(arm,offset);const endLocal=Vector3.TransformCoordinates(world,arm.getWorldMatrix().clone().invert());aim(elbow,endLocal.subtract(elbow.position));
}
