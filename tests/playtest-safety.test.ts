import {it,expect} from 'vitest';
import {backupText,parseBackup} from '../src/save/backup';
import {defaultSave,migrateSave} from '../src/save/save';
import {validateComfort} from '../src/settings';
import {bodyPose,bodyPhase} from '../src/engine/bodyMotion';
it('backup preserves progress and bindings while rejecting corrupt imports',()=>{
 const s=defaultSave();s.profile.name='Tester';s.settings.bindings.parry=['KeyK',null];s.progression.tutorialCompleted=true;s.progression.learned.linear='induction';
 expect(parseBackup(backupText(s))).toEqual(migrateSave(s));
 for(const bad of ['{}','broken',JSON.stringify({format:'trinity-backup',version:1,save:{...s,version:999}}),backupText({...s,loadout:['missing',null,null,null]})])expect(()=>parseBackup(bad)).toThrow();
 expect(s.profile.name).toBe('Tester');
});
it('old saves receive comfort defaults and imported calibration is bounded',()=>{
 const old=defaultSave() as any;delete old.settings.comfort;expect(migrateSave(old).settings.comfort.cueOffsetMs).toBe(0);
 expect(validateComfort({cueOffsetMs:999,cueVolume:-1,effectsVolume:NaN,reducedMotion:true})).toMatchObject({cueOffsetMs:200,cueVolume:0,effectsVolume:.7,reducedMotion:true});
});
it('authored body clips hit their marker without discontinuity and settle at recovery end',()=>{
 for(const clip of ['sentinel','boar_jab','boar_sweep'] as const){const a=bodyPose(clip,bodyPhase(999.99,0,1000,800)),b=bodyPose(clip,bodyPhase(1000,0,1000,800));expect(Math.abs(a.pitch-b.pitch)).toBeLessThan(.001);expect(bodyPose(clip,bodyPhase(1800,0,1000,800))).toEqual({pitch:0,roll:0,height:0});}
});
