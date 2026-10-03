import {primers} from '../world/journey.ts';
import type {Progression} from '../progression/guild';
export interface BookNode {art:string;parents:string[];field:Partial<Progression['field']>;x:number;y:number;}
export interface SkillBook {id:string;name:string;theme:string;reward:string;nodes:BookNode[];}
/** Each introductory book grants one node; the next uses post-acquisition practice. */
export const skillBooks:SkillBook[]=primers.map(b=>({id:b.id,name:b.name,theme:b.theme,reward:'Complete the accepted Find an exit quest with Mira.',nodes:[{art:b.root,parents:[],field:{},x:50,y:25},{art:b.leaf,parents:[b.root],field:{hits:12,...b.id==='pathfinder'?{evades:2}:b.id==='steadfast'?{breaks:2}:{parries:2}},x:50,y:75}]}));
export function bookRequirements(node:BookNode,progress:Progression){return {
 parents:node.parents.map(id=>({id,met:!!progress.learned[id]})),
 practice:Object.entries(node.field).map(([key,required])=>({key,required:required!,current:progress.field[key as keyof Progression['field']],met:progress.field[key as keyof Progression['field']]>=required!})),
};}
