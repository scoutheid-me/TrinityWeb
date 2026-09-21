from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
exec(Path(__file__).with_name('build_lab.py').read_text().split('exec((ROOT/')[0])
clear()
fur=material('boar_brown',(.22,.105,.055),rough=.95)
dark=material('boar_dark',(.065,.04,.025),rough=.9)
ivory=material('boar_tusks',(.82,.76,.57))
eye=material('boar_eyes',(.8,.23,.03),emission=.5)
sphere('boar_body',(0,.78,0),(.48,.5,.73),fur)
sphere('boar_head',(0,.66,.68),(.39,.35,.4),fur)
sphere('boar_snout',(0,.52,1.02),(.27,.18,.2),dark)
for x in [-.29,.29]:
 sphere('ear',(x,1.02,.65),(.15,.23,.09),fur)
 sphere('eye',(x,.78,.94),(.055,.045,.035),eye)
 sphere('tusk',(x,.5,1.14),(.065,.21,.06),ivory)
 for z in [-.45,.42]:
  p=pivot(('left_' if x<0 else 'right_')+('leg' if z<0 else 'arm'),(x,.55,z))
  cube('boar_leg',(x,.31,z),(.17,.46,.18),fur,parent=p)
  cube('hoof',(x,.1,z+.025),(.2,.16,.23),dark,parent=p)
for z in [-.5,-.25,0,.25]:
 cube('bristle',(0,1.23,z),(.16,.14,.18),dark)
sphere('tail',(0,.82,-.77),(.08,.08,.25),dark)
export('woodland_boar','enemies')
