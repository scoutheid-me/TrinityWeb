import {greatswordPose} from './greatswordMotion';
import {holdGrip} from './twoHandGrip';
import {weaponRack} from '../data/room';
import {weapons} from '../data/weapons';
import {artShape,chargeDuration} from '../data/arts';
import {duelPose} from './duelMotion';
import {HitIndicator} from './hitIndicator';
import {enemyPhase} from '../combat/timeline';
import { Quaternion, AbstractEngine, ArcRotateCamera, FreeCamera, Color3, Color4, DefaultRenderingPipeline, DirectionalLight, Engine, GlowLayer, HemisphericLight, ImportMeshAsync, Mesh, MeshBuilder, PBRMaterial, Scene, SceneInstrumentation, ShadowGenerator, StandardMaterial, TransformNode, Vector3, WebGPUEngine } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import glslangJs from '@babylonjs/core/assets/glslang/glslang.js?url';
import glslangWasm from '@babylonjs/core/assets/glslang/glslang.wasm?url';
import twgslJs from '@babylonjs/core/assets/twgsl/twgsl.js?url';
import twgslWasm from '@babylonjs/core/assets/twgsl/twgsl.wasm?url';
import { balance, chargeTime } from '../data/balance';
import type { CombatSimulation, Enemy, CombatEvent } from '../combat/simulation';

export type Quality = 'low' | 'medium' | 'high';
type Actor = { root: TransformNode; leftArm?: TransformNode; rightArm?: TransformNode; leftLeg?: TransformNode; rightLeg?: TransformNode; sword: TransformNode; phase: number; slashUntil: number; };
export class LabScene {
  engine!: AbstractEngine;
  scene!: Scene;
  camera!: ArcRotateCamera;
  firstCamera!:FreeCamera;firstPerson=false;
  togglePerspective(){this.firstPerson=!this.firstPerson;this.scene.activeCamera=this.firstPerson?this.firstCamera:this.camera;this.player.root.setEnabled(!this.firstPerson);this.firstWeapon?.setEnabled(this.firstPerson);this.camera.beta=this.firstPerson?Math.PI/2:1.1;return this.firstPerson;}
  shadow!: ShadowGenerator;
  pipeline!: DefaultRenderingPipeline;
  instrumentation!: SceneInstrumentation;
  player!: Actor;
  actors = new Map<string, Actor>();
  enemyTemplate!: TransformNode;
  swordTemplate!: TransformNode;
  weaponTemplates=new Map<string,Promise<TransformNode>>();weaponRequested='';equippedWeapon='';firstWeapon:TransformNode|null=null;firstArms:TransformNode[]=[];
  private async syncWeapon(id:string){
    if(this.weaponRequested===id)return;this.weaponRequested=id;
    let promise=this.weaponTemplates.get(id);if(!promise){promise=this.asset(weapons[id].model).then(model=>{model.setEnabled(false);return model;});this.weaponTemplates.set(id,promise);}
    const model=await promise;if(this.weaponRequested!==id)return;
    if(this.timingFlash)this.timingFlash.parent=null;this.player.sword.dispose();this.player.sword=model.clone('equipped '+id,this.player.rightArm??this.player.root)!;this.player.sword.setEnabled(true);this.player.sword.position.set(0,-.64,.06);this.player.sword.rotation.x=-.55;this.cast(this.player.sword);if(this.timingFlash)this.timingFlash.parent=this.player.sword;if(id==='greatsword'){this.player.sword.parent=this.player.root;this.player.sword.position.set(0,1.28,.20);}
    this.firstWeapon?.dispose();this.firstWeapon=model.clone('first-person '+id,this.firstCamera)!;this.firstWeapon.position.set(id==='greatsword'?.16:.32,-.38,id==='greatsword'?-.52:-.6);this.firstWeapon.rotation.y=Math.PI;this.firstWeapon.setEnabled(this.firstPerson);this.equippedWeapon=id;
  }
  ring!: Mesh;
  hitIndicators = new Map<string, HitIndicator>();
  debugVolume:HitIndicator|null=null;
  timingFlash!: Mesh;
  glow!: GlowLayer;
  backend = 'WebGL';
  quality: Quality = 'medium';
  effects = 1;
  cameraDistance = 7.5;
  showHitboxes = false;
  showTraces = false;
  shake = 0;
  pendingEffects: { mesh: Mesh; life: number; max: number; velocity?: Vector3 }[] = [];
  assetErrors: string[] = [];
  loadedAssets: string[] = [];
  constructor(public canvas: HTMLCanvasElement) {}
  async init(character:'man'|'woman'='man') {
    const forceWebgl = new URLSearchParams(location.search).has('webgl');
    if (!forceWebgl && await WebGPUEngine.IsSupportedAsync) {
      let gpu: WebGPUEngine | null = null;
      try { gpu = new WebGPUEngine(this.canvas, { antialias: true }); await gpu.initAsync({jsPath:glslangJs,wasmPath:glslangWasm},{jsPath:twgslJs,wasmPath:twgslWasm}); this.engine = gpu; this.backend = 'WebGPU'; }
      catch (error) { gpu?.dispose(); console.warn('WebGPU initialization failed; using WebGL.', error); }
    }
    if (!this.engine) this.engine = new Engine(this.canvas, true, { stencil: true, preserveDrawingBuffer: true });
    this.scene = new Scene(this.engine); this.scene.useRightHandedSystem = true;
    this.scene.clearColor = new Color4(.37,.57,.67,1);
    this.scene.fogMode = Scene.FOGMODE_EXP2; this.scene.fogDensity = .011; this.scene.fogColor = new Color3(.37,.57,.67);
    this.scene.ambientColor = new Color3(.25,.3,.35);
    this.scene.imageProcessingConfiguration.toneMappingEnabled = true;
    this.scene.imageProcessingConfiguration.exposure = 1.05;
    this.scene.imageProcessingConfiguration.contrast = 1.13;
    this.camera = new ArcRotateCamera('camera', -Math.PI / 2, 1.10, 7.5, new Vector3(0,1,-4), this.scene);
    this.firstCamera=new FreeCamera('first person',new Vector3(0,1.65,-4),this.scene);this.firstCamera.minZ=.05;this.firstCamera.maxZ=220;this.scene.activeCamera=this.camera;
    this.camera.minZ = .1; this.camera.maxZ = 220;
    this.camera.lowerBetaLimit = .4; this.camera.upperBetaLimit = 1.40; this.camera.lowerRadiusLimit = 3.5; this.camera.upperRadiusLimit = 11;
    const sky = new HemisphericLight('sky', new Vector3(0,1,0), this.scene); sky.intensity = .8; sky.groundColor = new Color3(.20,.27,.32);
    const sun = new DirectionalLight('sun', new Vector3(-.45,-1,.55), this.scene); sun.position = new Vector3(12,22,-16); sun.intensity = 1.65; sun.diffuse = new Color3(1,.87,.68);
    this.shadow = new ShadowGenerator(1024, sun); this.shadow.useBlurExponentialShadowMap = true; this.shadow.blurKernel = 16; this.shadow.darkness = .30; this.shadow.bias = .002;
    this.glow = new GlowLayer('aether glow', this.scene, { mainTextureRatio: .35 }); this.glow.intensity = .35;
    this.pipeline = new DefaultRenderingPipeline('presentation', false, this.scene, [this.camera,this.firstCamera]); this.pipeline.fxaaEnabled = true;
    this.instrumentation = new SceneInstrumentation(this.scene); this.instrumentation.captureFrameTime = true;
    this.environment();
    const hero = await this.asset(character==='woman'?'/assets/characters/wayfarer_woman.glb':'/assets/characters/wayfarer.glb');
    this.swordTemplate = await this.asset('/assets/weapons/aether_sword.glb'); this.swordTemplate.setEnabled(false);
    this.enemyTemplate = await this.asset('/assets/enemies/aether_sentinel.glb'); this.enemyTemplate.setEnabled(false);
    this.player = this.actor(hero, 'wayfarer', false);
    for(const [i,arm] of [this.player.leftArm,this.player.rightArm].entries()){if(arm){const copy=arm.clone('view '+arm.name,this.firstCamera)!;copy.position.set(i===0?-.22:.22,-.12,-.25);for(const mesh of copy.getChildMeshes())if(/pauldron|upper_arm/.test(mesh.name))mesh.setEnabled(false);copy.setEnabled(false);this.firstArms.push(copy);}}
    this.timingFlash = MeshBuilder.CreateSphere('blade timing cue',{diameter:.16,segments:8},this.scene);this.timingFlash.parent=this.player.sword;this.timingFlash.position.set(0,0,1.25);this.timingFlash.material=this.material('timing light','#ceffff',2);
    const column = await this.asset('/assets/environments/guild_column.glb'); column.setEnabled(false);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; const copy = column.clone(`column-${i}`, null)!; copy.setEnabled(true); copy.position.set(Math.sin(a)*13.4,0,Math.cos(a)*13.4); this.cast(copy); }
    const rack = await this.asset('/assets/props/weapon_rack.glb'); rack.position.set(weaponRack.x,0,weaponRack.z); rack.rotation.y = weaponRack.yaw; this.cast(rack);
    this.ring = MeshBuilder.CreateTorus('lock indicator', { diameter: 1.8, thickness: .035, tessellation: 48 }, this.scene); this.ring.material = this.material('lock', '#72e6ef', 1); this.ring.position.y = .07;
    this.setQuality('medium');
    window.addEventListener('resize', () => this.engine.resize());
    await this.scene.whenReadyAsync();
  }
  material(name: string, hex: string, emission = 0) {
    const mat = new StandardMaterial(name, this.scene); mat.diffuseColor = Color3.FromHexString(hex); mat.specularColor = new Color3(.12,.15,.18); mat.emissiveColor = mat.diffuseColor.scale(emission); return mat;
  }
  private environment() {
    const stone = this.material('silver limestone', '#758d98'), rim = this.material('deep basalt', '#293e4b'), gold = this.material('brass inlay', '#b7995c');
    const floor = MeshBuilder.CreateCylinder('training dais', { diameter: 26, height: .55, tessellation: 96 }, this.scene); floor.position.y = -.28; floor.material = this.material('arena slate','#3b5666'); floor.receiveShadows = true;
    const foundation = MeshBuilder.CreateCylinder('foundation', { diameter: 27.2, height: 1, tessellation: 96 }, this.scene); foundation.position.y = -.95; foundation.material = rim;
    const inlay=this.material('quiet floor inlay','#516874');
    for (const diameter of [6.3, 13, 21.9, 24.6]) { const ring = MeshBuilder.CreateTorus('floor inlay', { diameter, thickness: .018, tessellation: 96 }, this.scene); ring.position.y = .015; ring.material = inlay; }
    for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; const line = MeshBuilder.CreateBox('radial joint', { width: .024, height: .008, depth: 12.8 }, this.scene); line.position.set(Math.sin(a)*6.4,.01,Math.cos(a)*6.4); line.rotation.y = a; line.material = rim; }
    const glowMat = this.material('aether filament', '#76e3ea', 1.2);
    for (let i = 0; i < 12; i++) {
      const a = (i + .5) * Math.PI / 6;
      const parapet = MeshBuilder.CreateBox('parapet', { width: 5.8, height: .75, depth: .38 }, this.scene); parapet.position.set(Math.sin(a)*13.2,.35,Math.cos(a)*13.2); parapet.rotation.y = a; parapet.material = rim; parapet.receiveShadows = true;
      const cornice = MeshBuilder.CreateBox('upper lintel', { width: 6.3, height: .35, depth: .7 }, this.scene); cornice.position.set(Math.sin(a)*13.4,4.65,Math.cos(a)*13.4); cornice.rotation.y = a; cornice.material = stone;
      const light = MeshBuilder.CreateSphere('aether lantern', { diameter: .15, segments: 8 }, this.scene); light.position.set(Math.sin(a)*12.8,1.3,Math.cos(a)*12.8); light.material = glowMat;
      if (i % 3 === 0) {
        const banner = MeshBuilder.CreateBox('guild banner', { width: 1.5, height: 2.4, depth: .06 }, this.scene); banner.position.set(Math.sin(a)*13.1,3.05,Math.cos(a)*13.1); banner.rotation.y = a; banner.material = this.material(`banner ${i}`, '#183e51');
        const crest = MeshBuilder.CreateBox('banner crest', { width: .48, height: .48, depth: .08 }, this.scene); crest.position.copyFrom(banner.position); crest.position.x -= Math.sin(a)*.08; crest.position.z -= Math.cos(a)*.08; crest.rotation.set(0,a,Math.PI/4); crest.material = gold;
      }
    }
    // Distant conceptual scenery, intentionally procedural greybox environment.
    const distant = this.material('distant blue stone', '#4b7183');
    for (let i = 0; i < 18; i++) {
      const a = i*2.399, r = 60 + (i%4)*15;
      const island = MeshBuilder.CreateCylinder('floating spire', { diameterTop: 5+i%3, diameterBottom: .5, height: 11+i%4*4, tessellation: 6 }, this.scene);
      island.position.set(Math.sin(a)*r, -9+i%5*6, Math.cos(a)*r); island.material = distant;
      const tower = MeshBuilder.CreateCylinder('distant tower', { diameterTop: .3, diameterBottom: 2, height: 7, tessellation: 8 }, this.scene); tower.position.copyFrom(island.position); tower.position.y += 10; tower.material = stone;
    }
    const motes = this.material('mote', '#c5eef1', 1);
    for (let i = 0; i < 35; i++) { const mote = MeshBuilder.CreateSphere('ambient mote', { diameter: .025, segments: 4 }, this.scene); mote.position.set(Math.sin(i*2.4)*11, 1+(i%8)*.55,Math.cos(i*1.7)*11); mote.material = motes; }
  }
  private async asset(url: string): Promise<TransformNode> {
    const container = new TransformNode(url, this.scene);
    try {
      const imported = await ImportMeshAsync(url, this.scene);
      for (const node of imported.meshes) { if (!node.parent) node.parent = container; node.receiveShadows = true; }
      for (const material of this.scene.materials) if (material instanceof PBRMaterial) { material.environmentIntensity = .8; material.directIntensity = 1.3; }
      this.loadedAssets.push(url);
    } catch (error) {
      console.error(`Unable to load ${url}; using a temporary placeholder.`, error); this.assetErrors.push(url);
      const fallback = MeshBuilder.CreateCapsule('TEMPORARY missing asset', { height: 1.8, radius: .35 }, this.scene); fallback.position.y = .9; fallback.parent = container; fallback.material = this.material('fallback', '#d89c74');
    }
    return container;
  }
  private cast(node: TransformNode) { for (const mesh of node.getChildMeshes()) this.shadow.addShadowCaster(mesh); }
  private actor(model: TransformNode, name: string, enemy: boolean): Actor {
    const root = new TransformNode(name, this.scene); model.parent = root; model.setEnabled(true);
    const nodes = model.getDescendants().filter(n => n instanceof TransformNode) as TransformNode[];
    const find = (suffix: string) => nodes.find(n => n.name.endsWith(suffix));
    const rightArm = find('right_arm');
    const sword = this.swordTemplate.clone(`${name}-sword`, rightArm ?? root)!; sword.setEnabled(true);
    sword.position.set(0,-.64,.06); sword.rotation.x = -.55; if (enemy) sword.scaling.setAll(1.2);
    this.cast(root);
    return { root, leftArm: find('left_arm'), rightArm, leftLeg: find('left_leg'), rightLeg: find('right_leg'), sword, phase: 0, slashUntil: 0 };
  }
  setQuality(quality: Quality) {
    this.quality = quality; const scale = quality === 'low' ? 1.6 : quality === 'medium' ? 1.2 : 1;
    this.engine.setHardwareScalingLevel(scale); this.scene.shadowsEnabled = quality !== 'low'; this.glow.isEnabled = quality !== 'low'; this.pipeline.fxaaEnabled = quality !== 'low'; this.effects = quality === 'high' ? 1 : quality === 'medium' ? .65 : .3;
  }
  animate(actor: Actor, x: number, z: number, yaw: number, moving: number, attacking: number, guard: boolean, dead: boolean, stagger: boolean, dt: number) {
    actor.root.position.set(x,0,z); actor.root.rotation.y = yaw;
    actor.phase += dt * moving * 2.5;
    const stride = Math.sin(actor.phase) * Math.min(.8, moving*.16);
    const blend = Math.min(1,dt*20);
    const pose = (node: TransformNode | undefined, angle: number) => { if (node) { node.rotationQuaternion = null; node.rotation.x += (angle-node.rotation.x)*blend; } };
    pose(actor.leftLeg,stride); pose(actor.rightLeg,-stride);
    pose(actor.leftArm,guard ? -1.2 : -stride*.6);
    pose(actor.rightArm,attacking || (guard ? -1.45 : stride*.6-.18));
    actor.root.rotation.z += ((dead ? 1.5 : stagger ? .3 : 0)-actor.root.rotation.z)*blend;
    actor.root.position.y = dead ? .25 : Math.abs(stride)*.035;
  }
  update(sim: CombatSimulation, dt: number) {
    void this.syncWeapon(sim.weapon);
    const poseDt=sim.now<sim.hitStopUntil?0:dt;
    for (const [id, actor] of this.actors) if (!sim.enemies.some(e => e.id === id)) { actor.root.dispose(); this.actors.delete(id); }
    for (const enemy of sim.enemies) {
      let actor = this.actors.get(enemy.id);
      if (!actor) { actor = this.actor(this.enemyTemplate.clone(enemy.id,null)!,enemy.id,true); this.actors.set(enemy.id,actor); }
      this.animate(actor,enemy.x,enemy.z,enemy.yaw,enemy.state==='Chase'?2.5:0,0,false,enemy.hp<=0,enemy.state==='Broken',poseDt);
      const phase=enemyPhase(enemy,sim.now,300);
      if(phase&&enemy.pattern&&actor.rightArm){const pose=duelPose(enemy.pattern.motion,sim.now,phase.startAt,phase.contactAt,phase.index%2===0?1:-1);actor.rightArm.rotation.x=pose.pitch;actor.rightArm.rotation.y=pose.yaw;}
      else if(actor.rightArm)actor.rightArm.rotation.y=0;
      if (enemy.flashUntil>sim.now) actor.root.position.y += .04*Math.sin(sim.now*.1);
    }
    const state = sim.state.state;
    let swing = 0;
    this.animate(this.player,sim.player.x,sim.player.z,sim.player.yaw,Math.hypot(sim.player.vx,sim.player.vz),swing,state==='Guard'||state==='Parry',state==='Dead',state==='HitReaction',poseDt);
    let pose:ReturnType<typeof duelPose>|null=null;
    if(state==='BasicAttackStartup')pose=duelPose('basic',sim.now,sim.actionStart,sim.actionEnd);
    else if(['BasicAttackActive','BasicAttackRecovery'].includes(state)&&sim.lastContact)pose=duelPose('basic',sim.now<sim.hitStopUntil?sim.lastContact.at:sim.now,sim.lastContact.at-chargeTime(sim.attributes.dexterity)*sim.weaponDefinition.startup/87,sim.lastContact.at);
    else if(sim.art){
      const art=sim.art;
      if(art.grades[art.stage]===null)pose=duelPose(art.definition.motion,art.start+art.definition.startup*.35,art.start,art.start+art.definition.startup);
      else if(art.releasedAt!==null){const contact=art.releasedAt+art.definition.startup;pose=duelPose(art.definition.motion,sim.now<sim.hitStopUntil&&art.resolved.has(0)?contact:sim.now,art.releasedAt,contact);}
    }
    if(this.player.rightArm){this.player.rightArm.rotation.y=pose?.yaw??0;if(pose)this.player.rightArm.rotation.x=pose.pitch;}
    if(this.firstWeapon){this.firstWeapon.setEnabled(this.firstPerson);this.firstWeapon.rotation.x=-.2+(pose?.pitch??0)*.45;this.firstWeapon.rotation.z=(pose?.yaw??0)*.25;}
    for(const arm of [this.player.leftArm,this.player.rightArm]){if(!arm)continue;const elbow=arm.getDescendants().find(n=>n.name.endsWith('_elbow')) as TransformNode|undefined;if(elbow)elbow.rotationQuaternion=null;}
      if(this.equippedWeapon==='greatsword'){
        let heavy={pitch:-.95,lift:0};
        if(state==='BasicAttackStartup')heavy=greatswordPose(sim.now,sim.actionStart,sim.actionEnd);
        else if(['BasicAttackActive','BasicAttackRecovery'].includes(state)&&sim.lastContact){const at=sim.lastContact.at;heavy=greatswordPose(sim.now<sim.hitStopUntil?at:sim.now,at-chargeTime(sim.attributes.dexterity)*sim.weaponDefinition.startup/87,at);}
        else if(pose)heavy={pitch:-.95+pose.pitch*.55,lift:0};
        // The authored edge is local X; roll 90 degrees so the edge, not the flat,
        // leads the vertical Y/Z cutting plane. Keep the grip sockets on local Z.
        const orientation=Quaternion.RotationAxis(Vector3.Right(),heavy.pitch).multiply(Quaternion.RotationAxis(Vector3.Forward(),Math.PI/2));
        const sword=this.player.sword;sword.position.set(0,1.28+heavy.lift,.20);sword.rotationQuaternion=orientation;
        for(const side of ['left','right'] as const){const arm=side==='left'?this.player.leftArm:this.player.rightArm;if(arm)holdGrip(arm,sword,side);}
        if(this.firstWeapon){this.firstWeapon.position.set(.14,-.30+heavy.lift*.65,-.48);this.firstWeapon.rotationQuaternion=Quaternion.RotationAxis(Vector3.Up(),Math.PI).multiply(orientation);}
      }
    for(const [i,arm] of this.firstArms.entries()){arm.setEnabled(this.firstPerson&&this.equippedWeapon==='greatsword');if(this.firstWeapon&&this.equippedWeapon==='greatsword')holdGrip(arm,this.firstWeapon,i===0?'left':'right');}
    const artCue=!!sim.art&&sim.art.grades[sim.art.stage]===null&&Math.abs(sim.now-sim.art.start-chargeDuration(sim.art.definition,sim.art.stage))<=balance.timing.perfect;
    this.timingFlash.setEnabled(artCue);
    if (state==='Dodge') this.player.root.position.y = -.22;
    const target = sim.target;
    this.ring.setEnabled(!!target); if (target) this.ring.position.set(target.x,.07,target.z);
    const visible=new Set<string>();
    for(const enemy of sim.enemies){const phase=enemyPhase(enemy,sim.now);if(!phase||!enemy.pattern)continue;
      visible.add(enemy.id);let indicator=this.hitIndicators.get(enemy.id);
      if(indicator&&indicator.shape!==enemy.pattern.shape){indicator.dispose();this.hitIndicators.delete(enemy.id);indicator=undefined;}
      if(!indicator){indicator=new HitIndicator(this.scene,enemy.pattern.shape,'attack footprint '+enemy.id);this.hitIndicators.set(enemy.id,indicator);}
      indicator.update(enemy.x,enemy.z,enemy.yaw,phase.remaining,enemy.pattern.parryable);
    }
    for(const [id,indicator] of this.hitIndicators)if(!visible.has(id)){indicator.dispose();this.hitIndicators.delete(id);}
    const preview=sim.art&&sim.art.grades[sim.art.stage]!=='Miss'&&sim.state.state!=='ArtRecovery'?sim.art:undefined;
    if(this.showHitboxes||preview){
      const shape=preview?artShape(preview.definition,preview.stage):sim.weaponDefinition.shape;
      if(JSON.stringify(this.debugVolume?.shape)!==JSON.stringify(shape)){this.debugVolume?.dispose();this.debugVolume=new HitIndicator(this.scene,shape,'player hit footprint');}
      this.debugVolume!.update(sim.player.x,sim.player.z,sim.player.yaw,preview?preview.start+chargeDuration(preview.definition,preview.stage)-sim.now:100,true,'#80e9ff');
    }else this.debugVolume?.mesh.setEnabled(false);
    if(this.firstPerson){
      if(target&&sim.autoFaceTarget){const desiredAlpha=Math.atan2(target.z-sim.player.z,target.x-sim.player.x)+Math.PI;this.camera.alpha+=Math.atan2(Math.sin(desiredAlpha-this.camera.alpha),Math.cos(desiredAlpha-this.camera.alpha))*Math.min(1,dt*14);const distance=Math.hypot(target.x-sim.player.x,target.z-sim.player.z);const beta=Math.atan2(distance,.35);this.camera.beta+=(beta-this.camera.beta)*Math.min(1,dt*14);}
      this.firstCamera.position.set(sim.player.x,1.65+(state==='Dodge'?-.12:0),sim.player.z);
      const look=new Vector3(-Math.cos(this.camera.alpha)*Math.sin(this.camera.beta),-Math.cos(this.camera.beta),-Math.sin(this.camera.alpha)*Math.sin(this.camera.beta));
      this.firstCamera.setTarget(this.firstCamera.position.add(look));
      if((!sim.target||!sim.autoFaceTarget)&&sim.free)sim.player.yaw=Math.atan2(look.x,look.z);
    }
    const desired = new Vector3(sim.player.x,1.2,sim.player.z);
    if (target&&sim.autoFaceTarget&&!this.firstPerson) { desired.x += (target.x-sim.player.x)*.18; desired.z += (target.z-sim.player.z)*.18;
      const yaw = Math.atan2(target.z-sim.player.z,target.x-sim.player.x)+Math.PI;
      const diff = Math.atan2(Math.sin(yaw-this.camera.alpha),Math.cos(yaw-this.camera.alpha)); this.camera.alpha += diff*Math.min(1,dt*4);
    }
    this.camera.setTarget(Vector3.Lerp(this.camera.target,desired,Math.min(1,dt*10)),false,true,true);
    // Keep the camera inside the colonnade rather than passing through walls/columns.
    const dirX=Math.cos(this.camera.alpha)*Math.sin(this.camera.beta), dirZ=Math.sin(this.camera.alpha)*Math.sin(this.camera.beta);
    const b = this.camera.target.x*dirX+this.camera.target.z*dirZ;
    const a=dirX*dirX+dirZ*dirZ, c=this.camera.target.x**2+this.camera.target.z**2-12.4**2;
    const maxRadius=(-b+Math.sqrt(Math.max(0,b*b-a*c)))/Math.max(.01,a);
    const desiredRadius=Math.min(this.cameraDistance,Math.max(2,maxRadius));
    this.camera.radius += (desiredRadius-this.camera.radius)*Math.min(1,dt*16);
    this.shake *= Math.exp(-dt*18); this.camera.target.y += Math.sin(sim.now*.12)*this.shake;
    for (let i=this.pendingEffects.length-1;i>=0;i--) {
      const effect=this.pendingEffects[i]; effect.life-=dt; effect.mesh.visibility=Math.max(0,effect.life/effect.max);
      if (effect.velocity) effect.mesh.position.addInPlace(effect.velocity.scale(dt));
      else effect.mesh.scaling.scaleInPlace(1+dt*2);
      if (effect.life<=0) { effect.mesh.dispose(); this.pendingEffects.splice(i,1); }
    }
  }
  effect(event: CombatEvent, sim: CombatSimulation) {
    if (event.type==='hit'||event.type==='parry'||event.type==='break') {
      this.shake=event.strong?.09:balance.shake;
      const color = event.target==='player'?'#ff7c79':event.type==='parry'?'#fff0ba':'#83f3ff';
      const mat = this.material(`spark-${sim.now}`,color,1.2);
      for(let i=0;i<Math.ceil(10*this.effects);i++) {
        const spark=MeshBuilder.CreateSphere('impact',{diameter:.045,segments:4},this.scene); spark.position.set(event.x,1.1,event.z); spark.material=mat;
        this.pendingEffects.push({mesh:spark,life:.32,max:.32,velocity:new Vector3(Math.sin(i*2.4)*3,1+i%3,Math.cos(i*2.4)*3)});
      }
      setTimeout(()=>mat.dispose(),500);
    }
    if(event.type==='dodge') {
      const trail=MeshBuilder.CreateTorus('dodge wake',{diameter:1,thickness:.025,tessellation:24},this.scene);
      trail.position.set(event.x,.09,event.z);trail.scaling.z=.45;trail.material=this.material('dodge mist','#a9c4d0',.5);
      const material=trail.material;this.pendingEffects.push({mesh:trail,life:.25,max:.25});setTimeout(()=>material?.dispose(),400);
    }
    if(event.type==='slash') {
      const yaw=event.target?sim.enemies.find(e=>e.id===event.target)?.yaw??0:sim.player.yaw;
      const points: Vector3[]=[],shape=event.shape??{kind:'sector' as const,range:balance.basic.range,halfArc:balance.basic.arc};
      if(shape.kind==='box'){
        for(let i=0;i<=18;i++){const t=i/18;points.push(new Vector3(event.x+Math.sin(yaw)*shape.range*t,2.4*(1-t)+.08,event.z+Math.cos(yaw)*shape.range*t));}
      }else{
        const arc=shape.kind==='circle'?Math.PI:shape.halfArc;
        for(let i=0;i<=48;i++){const a=yaw-arc+i/48*arc*2;points.push(new Vector3(event.x+Math.sin(a)*shape.range,shape.kind==='circle'?.14:.95,event.z+Math.cos(a)*shape.range));}
      }
      const trail=MeshBuilder.CreateTube('sword sweep',{path:points,radius:event.strong?.065:.035,tessellation:4},this.scene);
      trail.material=this.material('slash light',event.target?'#edb276':'#b5f7ff',1.2);
      this.pendingEffects.push({mesh:trail,life:.19,max:.19,velocity:Vector3.Zero()});
      const material=trail.material; setTimeout(()=>material?.dispose(),350);
      if(this.showTraces){const trace=MeshBuilder.CreateLines('debug trace',{points},this.scene);this.pendingEffects.push({mesh:trace,life:.8,max:.8});}
    }
  }
  stats(){return {fps:Math.round(this.engine.getFps()),frameMs:this.engine.getDeltaTime(),backend:this.backend,meshes:this.scene.getActiveMeshes().length,vertices:this.scene.getTotalVertices(),drawCalls:this.engine._drawCalls.current};}
}
