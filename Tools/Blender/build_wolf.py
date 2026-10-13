"""Original articulated field wolf prototype; same metre/pivot contract as the boar."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
exec(Path(__file__).with_name('build_lab.py').read_text(encoding='utf-8').split('exec((ROOT/')[0])
clear()
fur=material('wolf slate fur',(.23,.27,.29),rough=.95)
pale=material('wolf pale underside',(.54,.55,.50),rough=.95)
dark=material('wolf nose paws',(.035,.04,.047),rough=.8)
eye=material('wolf amber eyes',(.7,.38,.08),emission=.15)
sphere('wolf torso',(0,.9,0),(.29,.33,.65),fur)
sphere('wolf chest',(0,.89,.42),(.31,.38,.31),pale)
sphere('wolf neck',(0,1.1,.55),(.24,.35,.26),fur)
sphere('wolf head',(0,1.25,.75),(.245,.26,.31),fur)
sphere('wolf muzzle',(0,1.16,1.03),(.135,.12,.26),pale)
sphere('wolf nose',(0,1.17,1.25),(.12,.085,.065),dark)
for x in [-.16,.16]:
 o=sphere('wolf pointed ear',(x,1.51,.7),(.09,.23,.07),fur);o.rotation_euler.y=x
 sphere('wolf eye',(x,1.3,.96),(.038,.03,.02),eye)
for x in [-.21,.21]:
 for z in [-.44,.42]:
  p=pivot(('left_' if x<0 else 'right_')+('leg' if z<0 else 'arm'),(x,.85,z))
  sphere('wolf upper leg',(x,.65,z),(.10,.26,.13),fur,parent=p)
  sphere('wolf lower leg',(x,.32,z+.025),(.063,.22,.07),pale,parent=p)
  sphere('wolf paw',(x,.085,z+.1),(.105,.085,.17),dark,parent=p)
tail=sphere('wolf brush',(0,.7,-.85),(.14,.17,.4),fur);tail.rotation_euler.x=-.45
export('grassland_wolf','enemies')
