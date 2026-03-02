"""
SkillForge — Badge 3D Model Generator
======================================
Run from Blender:
  blender --background --python create_badge_blender.py

Or open in Blender's Scripting workspace and press Run Script.

Output:  roadmap-dashboard/models/badge_base.glb

The GLB contains named meshes so Three.js can find and re-material them:
  "Shield_Rim"    — outer metallic rim
  "Shield_Body"   — inner body panel (enamel/painted)
  "Emblem_Plane"  — flat plane for canvas texture
  "Glow_Ring"     — torus for emissive edge highlight
"""

import bpy
import math
import os

# ── Output path ────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
OUTPUT     = os.path.join(SCRIPT_DIR, "models", "badge_base.glb")

# ── Helpers ────────────────────────────────────────────────────────────────
def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for c in bpy.data.collections:
        bpy.data.collections.remove(c)

def link(obj):
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    return obj

def set_material(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)

# ── Materials ──────────────────────────────────────────────────────────────
def mat_metallic_gold(name="ShieldRimMat"):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value    = (0.52, 0.36, 0.05, 1.0)   # dark gold
    bsdf.inputs["Metallic"].default_value      = 1.0
    bsdf.inputs["Roughness"].default_value     = 0.18
    bsdf.inputs["Specular IOR Level"].default_value = 1.0
    return m

def mat_red_enamel(name="ShieldBodyMat"):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value    = (0.22, 0.03, 0.03, 1.0)   # deep red
    bsdf.inputs["Metallic"].default_value      = 0.1
    bsdf.inputs["Roughness"].default_value     = 0.28
    bsdf.inputs["Coat Weight"].default_value   = 0.6   # clearcoat
    bsdf.inputs["Coat Roughness"].default_value = 0.12
    return m

def mat_glow_gold(name="GlowRingMat"):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    # Remove bsdf, replace with emission
    output = nt.nodes["Material Output"]
    nt.nodes.remove(bsdf)
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value   = (1.0, 0.72, 0.05, 1.0)   # gold glow
    em.inputs["Strength"].default_value = 3.5
    nt.links.new(em.outputs["Emission"], output.inputs["Surface"])
    m.blend_method = 'BLEND'
    return m

def mat_emblem_plane(name="EmblemPlaneMat"):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Metallic"].default_value      = 0.4
    bsdf.inputs["Roughness"].default_value     = 0.3
    bsdf.inputs["Alpha"].default_value         = 1.0
    # leave Base Color white; Three.js will apply canvas texture at runtime
    m.blend_method = 'BLEND'
    return m

# ── Shield rim (outer, thick extrusion) ───────────────────────────────────
def create_shield_rim():
    # Build shield profile with a bezier curve
    bpy.ops.curve.primitive_nurbs_curve_add(radius=1, enter_editmode=False)
    bpy.ops.object.delete()   # delete placeholder

    bpy.ops.object.add(type='CURVE', location=(0, 0, 0))
    curve_obj = bpy.context.active_object
    curve_obj.name = "ShieldCurve_Rim"
    curve = curve_obj.data
    curve.dimensions = '2D'
    curve.fill_mode  = 'BOTH'
    curve.extrude    = 0.30
    curve.bevel_depth      = 0.045
    curve.bevel_resolution = 5
    curve.use_fill_caps = True

    spline = curve.splines.new('BEZIER')
    # Shield points (normalised to ~1 unit height)
    pts = [
        ( 0.00,  0.54),   # top centre
        ( 0.42,  0.38),   # top-right
        ( 0.42,  0.00),   # right-mid
        ( 0.42, -0.36),   # right-low (q-curve to bottom)
        ( 0.00, -0.55),   # bottom tip
        (-0.42, -0.36),   # left-low
        (-0.42,  0.00),   # left-mid
        (-0.42,  0.38),   # top-left
    ]
    spline.bezier_points.add(len(pts) - 1)
    for i, (x, y) in enumerate(pts):
        bp = spline.bezier_points[i]
        bp.co             = (x, y, 0)
        bp.handle_left_type  = 'AUTO'
        bp.handle_right_type = 'AUTO'
    spline.use_cyclic_u = True

    # Convert to mesh
    bpy.ops.object.convert(target='MESH')
    rim = bpy.context.active_object
    rim.name = "Shield_Rim"

    # Smooth shading
    bpy.ops.object.shade_smooth()

    # Add bevel modifier
    bevel = rim.modifiers.new("Bevel", 'BEVEL')
    bevel.width    = 0.025
    bevel.segments = 3
    bevel.limit_method = 'ANGLE'
    bevel.angle_limit  = math.radians(30)

    set_material(rim, mat_metallic_gold())
    return rim

# ── Shield body (inner panel, slightly inset, thinner) ───────────────────
def create_shield_body():
    bpy.ops.object.add(type='CURVE', location=(0, 0, 0.05))
    curve_obj = bpy.context.active_object
    curve_obj.name = "ShieldCurve_Body"
    curve = curve_obj.data
    curve.dimensions = '2D'
    curve.fill_mode  = 'BOTH'
    curve.extrude    = 0.06
    curve.bevel_depth      = 0.015
    curve.bevel_resolution = 4

    scale = 0.80
    spline = curve.splines.new('BEZIER')
    pts = [
        ( 0.00,  0.54 * scale),
        ( 0.42 * scale,  0.38 * scale),
        ( 0.42 * scale,  0.00),
        ( 0.42 * scale, -0.36 * scale),
        ( 0.00, -0.55 * scale),
        (-0.42 * scale, -0.36 * scale),
        (-0.42 * scale,  0.00),
        (-0.42 * scale,  0.38 * scale),
    ]
    spline.bezier_points.add(len(pts) - 1)
    for i, (x, y) in enumerate(pts):
        bp = spline.bezier_points[i]
        bp.co             = (x, y, 0)
        bp.handle_left_type  = 'AUTO'
        bp.handle_right_type = 'AUTO'
    spline.use_cyclic_u = True

    bpy.ops.object.convert(target='MESH')
    body = bpy.context.active_object
    body.name = "Shield_Body"
    bpy.ops.object.shade_smooth()

    set_material(body, mat_red_enamel())
    return body

# ── Glow ring (torus around shield perimeter) ────────────────────────────
def create_glow_ring():
    bpy.ops.mesh.primitive_torus_add(
        align='WORLD',
        location=(0, 0, 0.32),
        major_radius=0.50,
        minor_radius=0.018,
        major_segments=80,
        minor_segments=12,
    )
    ring = bpy.context.active_object
    ring.name = "Glow_Ring"
    ring.scale = (1.0, 1.22, 1.0)   # squash to oval matching shield proportions
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    set_material(ring, mat_glow_gold())
    return ring

# ── Emblem plane (front face canvas for SVG texture) ─────────────────────
def create_emblem_plane():
    bpy.ops.mesh.primitive_plane_add(
        size=0.66,
        location=(0, 0, 0.40),
        rotation=(0, 0, 0),
    )
    plane = bpy.context.active_object
    plane.name = "Emblem_Plane"
    # Slight upward scale to be non-square (portrait)
    plane.scale = (1.0, 1.1, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    set_material(plane, mat_emblem_plane())
    return plane

# ── HDRI World ───────────────────────────────────────────────────────────
def setup_hdri():
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    for node in nt.nodes:
        nt.nodes.remove(node)

    bg     = nt.nodes.new("ShaderNodeBackground")
    env    = nt.nodes.new("ShaderNodeTexEnvironment")
    output = nt.nodes.new("ShaderNodeOutputWorld")
    nt.links.new(env.outputs["Color"],      bg.inputs["Color"])
    nt.links.new(bg.outputs["Background"],  output.inputs["Surface"])
    bg.inputs["Strength"].default_value = 1.5

    # If hdri/studio.hdr exists relative to script, load it
    hdr_path = os.path.join(SCRIPT_DIR, "hdri", "studio.hdr")
    if os.path.exists(hdr_path):
        env.image = bpy.data.images.load(hdr_path)
        print(f"[badge] HDRI loaded from {hdr_path}")
    else:
        print(f"[badge] HDRI not found at {hdr_path}, skipping")

# ── Camera & lights ──────────────────────────────────────────────────────
def setup_camera_lights():
    # Camera
    bpy.ops.object.camera_add(location=(0, -2.4, 0.3), rotation=(math.radians(85), 0, 0))
    cam = bpy.context.active_object
    cam.data.lens = 50
    bpy.context.scene.camera = cam

    # Key light
    bpy.ops.object.light_add(type='AREA', location=( 1.5, -1.5, 2.0))
    key = bpy.context.active_object
    key.data.energy = 450
    key.data.size   = 2.0
    key.rotation_euler = (math.radians(45), math.radians(20), 0)

    # Fill light
    bpy.ops.object.light_add(type='AREA', location=(-2.0, -1.0, 1.0))
    fill = bpy.context.active_object
    fill.data.energy = 180
    fill.data.size   = 3.0

    # Rim light (back)
    bpy.ops.object.light_add(type='SPOT', location=(0, 2.0, 1.5))
    rim = bpy.context.active_object
    rim.data.energy = 300
    rim.data.spot_size = math.radians(45)
    rim.rotation_euler = (math.radians(-30), 0, 0)

# ── Render settings ──────────────────────────────────────────────────────
def setup_render():
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 128
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 512
    scene.render.resolution_y = 512

# ── GLB Export ──────────────────────────────────────────────────────────
def export_glb():
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

    # Select only the badge meshes
    bpy.ops.object.select_all(action='DESELECT')
    for name in ("Shield_Rim", "Shield_Body", "Glow_Ring", "Emblem_Plane"):
        obj = bpy.data.objects.get(name)
        if obj:
            obj.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath       = OUTPUT,
        use_selection  = True,
        export_format  = 'GLB',
        export_draco_mesh_compression_enable = False,
        export_materials = 'EXPORT',
        export_colors  = True,
        use_mesh_edges = False,
        export_yup     = True,
        export_texcoords = True,
        export_normals = True,
        export_apply   = True,          # apply all modifiers
    )
    print(f"\n✅  Badge exported → {OUTPUT}")

# ── Main ─────────────────────────────────────────────────────────────────
def main():
    clear_scene()
    setup_render()
    setup_hdri()

    rim   = create_shield_rim()
    body  = create_shield_body()
    ring  = create_glow_ring()
    plane = create_emblem_plane()

    setup_camera_lights()
    export_glb()
    print("Done.")

main()
