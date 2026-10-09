"""Deterministic original PBR masonry, paving, timber and slate; no external artwork."""
import bpy, numpy as np

def surface(root,name,kind):
 size=512;rng=np.random.default_rng(901+len(name));y,x=np.mgrid[0:size,0:size];noise=rng.random((size,size))
 if kind in ('stone','pave','roof'):
  rh,cw=(64,128) if kind=='stone' else (64,64) if kind=='pave' else (64,85)
  row=y//rh;xx=(x+(row%2)*(cw//2))%cw;yy=y%rh
  edge=np.minimum.reduce([xx,cw-1-xx,yy,rh-1-yy]);seam=edge<3
  cells=rng.random((9,10));variation=cells[row%9,((x+(row%2)*(cw//2))//cw)%10]
  h=np.clip((edge-2)/6,0,1)*(.72+.12*variation)+noise*.07
  value=.68+variation*.22+(noise-.5)*.09;value=np.where(seam,.28+noise*.045,value)
  base={'stone':(.75,.68,.54),'pave':(.49,.46,.39),'roof':(.19,.28,.31)}[kind]
 else:
  grain=np.sin(x*.35+np.sin(y*.021)*1.8)+np.sin(x*.94+y*.001)*.25
  h=.5+grain*.07+noise*.04;value=.7+grain*.12+noise*.08;base=(.34,.20,.10)
 rgba=np.ones((size,size,4),dtype=np.float32);rgba[:,:,:3]=value[:,:,None]*np.array(base)
 def image(label,pixels,noncolor=False):
  im=bpy.data.images.new(name+' '+label,width=size,height=size);im.pixels.foreach_set(pixels.ravel());im.filepath_raw=str(root/'public/assets/textures'/(name+'_'+label+'.png'));im.file_format='PNG';im.save();im.pack()
  if noncolor:im.colorspace_settings.name='Non-Color'
  return im
 albedo=image('albedo',rgba)
 dx=(np.roll(h,-1,axis=1)-np.roll(h,1,axis=1))*2;dy=(np.roll(h,-1,axis=0)-np.roll(h,1,axis=0))*2
 n=np.stack([-dx,-dy,np.ones_like(dx)],axis=2);n/=np.linalg.norm(n,axis=2)[:,:,None];rgba[:,:,:3]=n*.5+.5;normal=image('normal',rgba,True)
 return albedo,normal

def finish_town(root):
 cache={}
 for mat in bpy.data.materials:
  kind='stone' if mat.name in ['Warm limestone','Pale carved stone'] else 'pave' if mat.name=='Square paving' else 'wood' if mat.name=='Dark oak framing' else 'roof' if mat.name=='Blue slate' else None
  if not kind:continue
  if kind not in cache:cache[kind]=surface(root,'town_'+kind,kind)
  nodes=mat.node_tree.nodes;links=mat.node_tree.links;p=nodes.get('Principled BSDF');tex=nodes.new('ShaderNodeTexImage');tex.image=cache[kind][0];links.new(tex.outputs['Color'],p.inputs['Base Color'])
  tex=nodes.new('ShaderNodeTexImage');tex.image=cache[kind][1];n=nodes.new('ShaderNodeNormalMap');n.inputs['Strength'].default_value=.65;links.new(tex.outputs['Color'],n.inputs['Color']);links.new(n.outputs['Normal'],p.inputs['Normal']);p.inputs['Roughness'].default_value=.82
 for obj in bpy.context.scene.objects:
  if obj.type!='MESH':continue
  uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='Surface metres')
  for face in obj.data.polygons:
   normal=face.normal;axis=max(range(3),key=lambda i:abs(normal[i]));axes=[i for i in range(3) if i!=axis]
   for index in face.loop_indices:
    co=obj.matrix_world@obj.data.vertices[obj.data.loops[index].vertex_index].co;uv.data[index].uv=(co[axes[0]]*.55,co[axes[1]]*.55)
