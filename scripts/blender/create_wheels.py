"""
FORESIGHT SUV — Phase 2: 足回り（タイヤ・ホイール）

SUV_step1.blend を開いて Wheel_FL/FR/RL/RR を追加し SUV_step2.blend を保存。冪等。

座標規約: Blender +X=右 / +Y=前方 / +Z=上 / ground=Z0（create_body.py と同じ）。
正本Pivot(three)→Blender:
  Wheel_FL three(-0.85,0.35,-1.55) → Blender(-0.85, 1.55, 0.35)
  Wheel_FR three( 0.85,0.35,-1.55) → Blender( 0.85, 1.55, 0.35)
  Wheel_RL three(-0.85,0.35, 1.55) → Blender(-0.85,-1.55, 0.35)
  Wheel_RR three( 0.85,0.35, 1.55) → Blender( 0.85,-1.55, 0.35)
各ホイールは axle=X軸周りに回転（three rotation.x）。原点=ホイール中心。
ホイールは Body の子にしない → ルート SUV(Empty) 直下。
"""
import bpy, bmesh, math
from mathutils import Vector, Matrix

STEP1 = "/Users/ryouta/AI-Company/projects/foresight-hp/assets-src/vehicle/SUV_step1.blend"
STEP2 = "/Users/ryouta/AI-Company/projects/foresight-hp/assets-src/vehicle/SUV_step2.blend"

R_OUT   = 0.36     # タイヤ外半径（接地: 中心0.36 → 底 0.0）
R_BEAD  = 0.245    # ビード/リム内半径
WIDTH   = 0.30     # タイヤ幅(X)
HALF_WD = WIDTH/2
SEG     = 28       # 円周分割
N_SPOKE = 5
N_LUG   = 20       # トレッドラグ数

# 位置(Blender)
WHEELS = {  # z=0.35 は正本Pivot(three y=0.35)に厳密一致
    "Wheel_FL": (-0.85,  1.55, 0.35, True),
    "Wheel_FR": ( 0.85,  1.55, 0.35, False),
    "Wheel_RL": (-0.85, -1.55, 0.35, True),
    "Wheel_RR": ( 0.85, -1.55, 0.35, False),
}

def get_mat(name):
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name)
        m.use_nodes = True
    return m

def add_ring(bm, profile_ur, seg, mat_index, closed=True):
    """(u,r)閉プロファイルをX軸周りに回転させた面群を bm に追加。"""
    n = len(profile_ur)
    rings = []
    for i in range(seg):
        t = 2*math.pi*i/seg
        c, s = math.cos(t), math.sin(t)
        rings.append([bm.verts.new((u, r*c, r*s)) for (u, r) in profile_ur])
    edges = n if closed else n-1
    for i in range(seg):
        a = rings[i]; b = rings[(i+1) % seg]
        for k in range(edges):
            k2 = (k+1) % n
            f = bm.faces.new([a[k], a[k2], b[k2], b[k]])
            f.material_index = mat_index
    return rings

def add_box_verts(bm, corners, mat_index, mat=None):
    v = [bm.verts.new(c) for c in corners]
    for f in [(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]:
        face = bm.faces.new([v[i] for i in f]); face.material_index = mat_index
    return v

def make_wheel(name, flip):
    bm = bmesh.new()
    # --- タイヤ（閉じた断面をX軸回転）--- mat 0
    tp = [
        (-HALF_WD+0.02, R_BEAD),      # 前ビード
        (-HALF_WD,      R_OUT-0.05),  # 前サイド
        (-HALF_WD+0.04, R_OUT),       # 前ショルダー
        (0.0,           R_OUT+0.004), # トレッドクラウン
        ( HALF_WD-0.04, R_OUT),       # 後ショルダー
        ( HALF_WD,      R_OUT-0.05),  # 後サイド
        ( HALF_WD-0.02, R_BEAD),      # 後ビード
        ( HALF_WD-0.08, R_BEAD-0.005),# 後内
        (-HALF_WD+0.08, R_BEAD-0.005),# 前内
    ]
    add_ring(bm, tp, SEG, 0, closed=True)
    # --- M/Tトレッドラグ（外周の角ブロック）--- mat 0
    lug_w = 0.075
    for i in range(N_LUG):
        t = 2*math.pi*(i+0.5)/N_LUG
        M = Matrix.Rotation(t, 4, 'X')
        stagger = 0.03 if i % 2 == 0 else -0.03   # 千鳥
        u0, u1 = -HALF_WD+0.02+stagger, HALF_WD-0.02+stagger
        r0, r1 = R_OUT-0.01, R_OUT+0.03
        hw = lug_w
        corners = [(u0,-hw,r0),(u1,-hw,r0),(u1,hw,r0),(u0,hw,r0),
                   (u0,-hw,r1),(u1,-hw,r1),(u1,hw,r1),(u0,hw,r1)]
        corners = [tuple(M @ Vector(c)) for c in corners]
        add_box_verts(bm, corners, 0)
    # --- リムリップ（外周リング）--- mat 1 (Chrome)
    rim_profile = [
        ( HALF_WD-0.03, R_BEAD),
        ( HALF_WD-0.05, R_BEAD-0.02),
        (-HALF_WD+0.05, R_BEAD-0.02),
        (-HALF_WD+0.03, R_BEAD),
    ]
    add_ring(bm, rim_profile, SEG, 1, closed=True)
    # --- リムバレル内側ディスク（背面）--- mat 2 dark
    add_ring(bm, [(0.02, R_BEAD-0.02),(0.02, 0.05)], SEG, 2, closed=False)
    # --- スポーク --- mat 1 (Chrome)
    face_u = HALF_WD-0.05    # 意匠面の横位置（外側）
    for k in range(N_SPOKE):
        ang = 2*math.pi*k/N_SPOKE
        M = Matrix.Rotation(ang, 4, 'X')
        # 半径方向の台形スポーク（内 r0 → 外 r1）
        r0, r1 = 0.055, R_BEAD-0.015
        w0, w1 = 0.05, 0.085   # 内幅/外幅
        d = 0.028              # 厚み(u方向)
        u0, u1 = face_u-d, face_u
        corners = [
            (u0,-w0, r0),(u0, w0, r0),(u0, w1, r1),(u0,-w1, r1),   # 背面
            (u1,-w0, r0),(u1, w0, r0),(u1, w1, r1),(u1,-w1, r1),   # 前面
        ]
        corners = [tuple(M @ Vector(c)) for c in corners]
        v = [bm.verts.new(c) for c in corners]
        for f in [(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]:
            face = bm.faces.new([v[i] for i in f]); face.material_index = 1
    # --- ハブ中心キャップ --- mat 2 dark
    add_ring(bm, [(face_u, 0.06),(face_u+0.012, 0.055),(face_u+0.012, 0.0)], SEG//2, 2, closed=False)
    # --- ラグナット5個 --- mat 1
    for k in range(5):
        ang = 2*math.pi*k/5
        pos = Vector((face_u, 0.10*math.cos(ang), 0.10*math.sin(ang)))
        s = 0.012
        corners = [(pos.x-0.006,pos.y-s,pos.z-s),(pos.x+0.02,pos.y-s,pos.z-s),
                   (pos.x+0.02,pos.y+s,pos.z-s),(pos.x-0.006,pos.y+s,pos.z-s),
                   (pos.x-0.006,pos.y-s,pos.z+s),(pos.x+0.02,pos.y-s,pos.z+s),
                   (pos.x+0.02,pos.y+s,pos.z+s),(pos.x-0.006,pos.y+s,pos.z+s)]
        add_box_verts(bm, corners, 1)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh); bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for slot_name in ("Tire", "Chrome", "WheelHub"):
        obj.data.materials.append(get_mat(slot_name))
    for p in obj.data.polygons:
        p.use_smooth = True   # 円筒はスムーズ
    if flip:
        obj.rotation_euler = (0, 0, math.pi)   # 左側は意匠面を外(-X)へ
    return obj


# ── 実行 ──
bpy.ops.wm.open_mainfile(filepath=STEP1)
root = bpy.data.objects.get("SUV")

# 既存のホイールがあれば削除（冪等）
for nm in WHEELS:
    o = bpy.data.objects.get(nm)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

for nm, (x, y, z, flip) in WHEELS.items():
    w = make_wheel(nm, flip)
    w.name = nm
    w.location = (x, y, z)       # 原点=ホイール中心=Pivot
    w.parent = root              # ルート直下（Bodyの子にしない）

bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=STEP2)

mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
tri = 0
for o in mesh_objs:
    o.data.calc_loop_triangles(); tri += len(o.data.loop_triangles)
result = {
    "objects": [o.name for o in bpy.data.objects],
    "wheel_parent": {nm: (bpy.data.objects[nm].parent.name if bpy.data.objects[nm].parent else None) for nm in WHEELS},
    "tri_total": tri,
    "saved": STEP2,
}
