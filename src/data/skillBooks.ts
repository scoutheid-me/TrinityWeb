import type {Progression} from '../progression/guild';
export interface BookNode {art:string;parents:string[];field:Partial<Progression['field']>;x:number;y:number;}
export interface SkillBook {id:string;name:string;theme:string;reward:string;nodes:BookNode[];}
/** Book ownership/reward granting awaits the tutorial dungeon. Trees are inspectable previews. */
export const skillBooks:SkillBook[]=[{
 id:'lantern-road-forms',name:'Lantern Road Forms',theme:'Four connected forms for making an opening, advancing, recovering and repositioning.',
 reward:'Planned final reward of the future tutorial dungeon. Not awarded by the current induction or Guild Trial.',
 nodes:[
  {art:'focused-strike',parents:[],field:{},x:50,y:12},
  {art:'linear',parents:['focused-strike'],field:{hits:12,evades:2},x:24,y:48},
  {art:'stillwater-return',parents:['focused-strike'],field:{parries:6},x:76,y:48},
  {art:'aether-step',parents:['linear','stillwater-return'],field:{evades:6},x:50,y:84},
 ],
}];
export function bookRequirements(node:BookNode,progress:Progression){return {
 parents:node.parents.map(id=>({id,met:!!progress.learned[id]})),
 practice:Object.entries(node.field).map(([key,required])=>({key,required:required!,current:progress.field[key as keyof Progression['field']],met:progress.field[key as keyof Progression['field']]>=required!})),
};}
