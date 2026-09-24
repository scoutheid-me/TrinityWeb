import {it,expect} from 'vitest';
import {mkdirSync,writeFileSync} from 'node:fs';
import {benchmark} from '../src/combat/benchmark';
it('greatsword leads sustained damage and Break while rapier beats sword on one target',()=>{
 const results=['sword','rapier','greatsword'].flatMap(w=>[benchmark(w),benchmark(w,3),benchmark(w,1,'mixed'),benchmark(w,3,'mixed'),benchmark(w,1,'basic',true),benchmark(w,1,'counter',true),benchmark(w,1,'counter-art',true)]);
 for(const targets of [1,3])for(const policy of ['basic','mixed']){
  const rows=results.filter(r=>r.targets===targets&&r.policy===policy&&!r.live),great=rows.find(r=>r.weapon==='greatsword')!;
  for(const row of rows.filter(r=>r!==great)){expect(great.damage).toBeGreaterThan(row.damage);expect(great.breakApplied).toBeGreaterThan(row.breakApplied);}
 }
 expect(results.find(r=>r.weapon==='rapier'&&!r.live&&r.policy==='basic'&&r.targets===1)!.damage).toBeGreaterThan(results[0].damage);
 mkdirSync('docs/balance',{recursive:true});writeFileSync('docs/balance/weapon-benchmark.json',JSON.stringify({method:'30s, 10ms steps, starting attributes. Stationary targets reset Break without vulnerability; live Sentinel scenarios include actual AI/defenses. Perfect mixed policy uses Focused Strike as SP permits. Not a human skill benchmark.',results},null,2)+'\n');
});
