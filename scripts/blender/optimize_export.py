"""
FORESIGHT SUV — Phase 5: Web最適化・GLB export

SUV_step4.blend を開き、以下を行って納品:
  - 左ホイールの反転(rotation z=pi)をメッシュにベイク（R3Fの rotation.x が綺麗に効くよう
    ノード回転を単位に戻す）
  - Bevel等モディファイアを適用
  - 受け入れチェック（20名/Wheelはルート直下/Pivot/単一マテリアル）
  - GLB書き出し（+Y Up・非圧縮＝R3F互換優先。数千triのため十分 ≤5MB）
      納品先: public/models/SUV.glb
  - マスター SUV.blend を保存
非圧縮にする理由: Draco/Meshoptは decoder 未設定のR3Fで読めないため。モデルが小さく
圧縮不要。将来 decoder を用意したら export_draco_mesh_compression_enable=True で圧縮可。
"""
import bpy

ROOT = "/Users/ryouta/AI-Company/projects/foresight-hp"
STEP4 = f"{ROOT}/assets-src/vehicle/SUV_step4.blend"
MASTER = f"{ROOT}/assets-src/vehicle/SUV.blend"
GLB = f"{ROOT}/public/models/SUV.glb"

REQUIRED = ["Body","FrontBumper","RearBumper","Grill","Headlight_L","Headlight_R","Glass",
 "Mirror_L","Mirror_R","Wheel_FL","Wheel_FR","Wheel_RL","Wheel_RR","RearGate",
 "Door_FL","Door_FR","Door_RL","Door_RR","RoofRail","Interior"]

# three空間での期待Pivot（Blender→three: (x, z, -y)）
EXPECT_THREE = {
 "Wheel_FL": (-0.85, 0.35, -1.55), "Wheel_FR": (0.85, 0.35, -1.55),
 "Wheel_RL": (-0.85, 0.35, 1.55),  "Wheel_RR": (0.85, 0.35, 1.55),
 "Headlight_L": (-0.62, 0.78, -2.46), "Headlight_R": (0.62, 0.78, -2.46),
 "RearGate": (0.0, 1.50, 2.40),
}

def sel(objs, active):
    for o in bpy.data.objects: o.select_set(False)
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = active
    bpy.context.view_layer.update()

def apply_rotscale(o):
    sel([o], o)
    with bpy.context.temp_override(active_object=o, selected_objects=[o],
                                   selected_editable_objects=[o], object=o):
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

def apply_modifiers(o):
    if not o.modifiers: return
    sel([o], o)
    for m in list(o.modifiers):
        with bpy.context.temp_override(active_object=o, selected_objects=[o],
                                       selected_editable_objects=[o], object=o):
            bpy.ops.object.modifier_apply(modifier=m.name)

# ── 実行 ──
bpy.ops.wm.open_mainfile(filepath=STEP4)

mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']

# 1) ノード回転/スケールをメッシュへベイク（左ホイールの z=pi 等）
for o in mesh_objs:
    apply_rotscale(o)

# 2) モディファイア適用
for o in mesh_objs:
    apply_modifiers(o)

# 3) 三角化して最終tri確認（エクスポータ非破壊のため一時評価）
def tri_count(o):
    o.data.calc_loop_triangles()
    return len(o.data.loop_triangles)
tri_total = sum(tri_count(o) for o in mesh_objs)

# 4) 受け入れ検証
present = set(o.name for o in bpy.data.objects)
missing = [n for n in REQUIRED if n not in present]
extra = sorted(present - set(REQUIRED) - {"SUV"})

def three_pivot(o):
    x, y, z = o.matrix_world.translation
    return (round(x, 3), round(z, 3), round(-y, 3))

pivot_check = {}
for nm, exp in EXPECT_THREE.items():
    got = three_pivot(bpy.data.objects[nm])
    ok = all(abs(got[i]-exp[i]) < 0.03 for i in range(3))
    pivot_check[nm] = {"got": got, "expect": exp, "ok": ok}

wheel_parent_ok = all(bpy.data.objects[f"Wheel_{s}"].parent and
                      bpy.data.objects[f"Wheel_{s}"].parent.name == "SUV"
                      for s in ("FL","FR","RL","RR"))
single_mat_ok = {nm: len(bpy.data.objects[nm].data.materials) == 1
                 for nm in ("Headlight_L","Headlight_R","Interior")}
rot_identity_ok = all(all(abs(a) < 1e-4 for a in bpy.data.objects[nm].rotation_euler)
                      for nm in ["Wheel_FL","Wheel_FR","Wheel_RL","Wheel_RR"])

# 5) マスター保存
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=MASTER)

# 6) GLB書き出し（+Y Up・非圧縮）— exporterは window/active_object を要求するため override
_active = bpy.data.objects["Body"]
sel([_active], _active)
_wm = bpy.context.window_manager
_win = _wm.windows[0] if _wm and _wm.windows else None
_ov = dict(active_object=_active, object=_active,
           selected_objects=[_active], selected_editable_objects=[_active])
if _win is not None:
    _ov.update(window=_win, screen=_win.screen)
with bpy.context.temp_override(**_ov):
    bpy.ops.export_scene.gltf(
        filepath=GLB,
        export_format='GLB',
        export_yup=True,
        export_apply=True,
        use_selection=False,
        export_cameras=False,
        export_lights=False,
        export_materials='EXPORT',
        export_extras=False,
    )

import os
glb_bytes = os.path.getsize(GLB) if os.path.exists(GLB) else None

result = {
    "tri_total": tri_total,
    "missing_required": missing,
    "extra_objects": extra,
    "wheel_parent_ok": wheel_parent_ok,
    "single_material_ok": single_mat_ok,
    "wheel_rotation_identity_ok": rot_identity_ok,
    "pivot_check": pivot_check,
    "glb_path": GLB,
    "glb_size_mb": round(glb_bytes/1024/1024, 3) if glb_bytes else None,
    "master": MASTER,
}
