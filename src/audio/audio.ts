import type {CombatEvent,CombatSimulation} from '../combat/simulation';
import {timingPhrase,enemyTimingPhrases} from './timing';
export class CombatAudio {
  context:AudioContext|null=null; enabled=true;
  timingMusic=true;
  private phraseId='';private phraseVoices:OscillatorNode[]=[];
  scheduledCueTimes:number[]=[];
  stopTiming(){for(const voice of this.phraseVoices){try{voice.stop();}catch{/* Already finished. */}}this.phraseVoices=[];this.phraseId='';this.scheduledCueTimes=[];}
  syncTiming(sim:CombatSimulation,paused:boolean,rate=1){
    if(paused||!this.enabled||!this.timingMusic||!this.context){this.stopTiming();return;}
    const phrases=[timingPhrase(sim),...enemyTimingPhrases(sim)].filter(p=>p!==null);if(!phrases.length){this.stopTiming();return;}
    const id=`${phrases.map(p=>p.id).join('|')}:${rate}`;if(this.phraseId===id)return;this.stopTiming();this.phraseId=id;
    const ctx=this.context;
    for(const note of phrases.flatMap(p=>p.notes)){
      if(note.at<sim.now-40)continue;
      const when=ctx.currentTime+Math.max(0,(note.at-sim.now)/1000/rate);
      const duration=note.voice==='defense'?.075:note.accent?.20:.12;this.scheduledCueTimes.push(note.at);
      // An original rising musical phrase: soft preparation notes and a clear accented sweet spot.
      for(const harmonic of [1,2]){
        const voice=ctx.createOscillator(),gain=ctx.createGain();voice.type=note.voice==='defense'?'triangle':'sine';voice.frequency.value=note.frequency*harmonic;
        gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime((note.accent?.065:.027)/harmonic,when+.004);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
        voice.connect(gain);gain.connect(ctx.destination);voice.start(when);voice.stop(when+duration+.01);voice.onended=()=>{voice.disconnect();gain.disconnect();};this.phraseVoices.push(voice);
      }
    }
  }
  unlock(){if(!this.context)this.context=new AudioContext();void this.context.resume();}
  tone(frequency:number,duration:number,volume=.06,type:OscillatorType='sine'){
    if(!this.enabled||!this.context)return;
    const ctx=this.context,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(frequency*.6,ctx.currentTime+duration);
    gain.gain.setValueAtTime(volume,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration);
  }
  swish(){
    if(!this.enabled||!this.context)return;
    const ctx=this.context,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.14),ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='highpass';filter.frequency.value=1400;gain.gain.value=.07;
    source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start();
  }
  event(event:CombatEvent){if(event.type==='hit')this.tone(event.target==='player'?90:170,.12,.07,'triangle');if(event.type==='parry')this.tone(1100,.28,.07);if(event.type==='break')this.tone(240,.45,.09,'triangle');if(event.type==='dodge')this.swish();if(event.type==='slash')this.tone(event.target?125:290,.07,.018,'triangle');}
}
