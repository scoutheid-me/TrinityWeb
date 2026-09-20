"""Shared shoulder/elbow/grip hierarchy, in the runtime axis convention."""
def articulated_arm(side, x, body, skin):
    arm = pivot(side + '_arm', (x,1.49,0))
    sphere(side + '_pauldron', (x,1.47,0), (.16,.15,.17), body, arm)
    cube(side + '_upper_arm', (x,1.33,0), (.15,.30,.16), body, .055, arm)
    elbow = pivot(side + '_elbow', (x,1.17,0))
    bpy.context.view_layer.update()
    matrix = elbow.matrix_world.copy(); elbow.parent=arm; elbow.matrix_world=matrix
    sphere(side + '_elbow_joint', (x,1.17,0), (.085,.09,.09), body, elbow)
    cube(side + '_forearm', (x,1.01,0), (.14,.29,.15), body, .045, elbow)
    sphere(side + '_hand', (x,.85,0), (.075,.085,.075), skin, elbow)
    return arm
