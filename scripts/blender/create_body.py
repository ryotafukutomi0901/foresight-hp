"""
FORESIGHT SUV — Phase 1: 車体プロポーション（プロファイル押し出し方式）

正本: projects/foresight-hp/lib/vehicleRig.ts / docs/vehicle-rig-spec.md
リファレンス: public/images/foresight/vehicle-parts/ の線画（Defender系角張SUV）

座標規約（全 create_*.py 共通）:
  Blender Z-up。glTF「+Y Up」export で three=(x, z, -y) へ変換される。
  → Blender: +X=右 / +Y=前方 / +Z=上 / -Y=後方 / ground=Z0。
  原点(0,0,0)=4輪接地面の中央。

方針: 車体側面シルエットを (Y,Z) プロファイルで定義し X方向へ押し出す。
これで「直立フロント→高く平らなボンネット→傾斜フロントガラス→平ルーフ→
垂直リア」というDefender系シルエットを正確に出す。角形ホイールアーチ・
サイドステップ・バンパー・ドア・ルーフレールを重ねる。冪等。
"""
import bpy
import bmesh
from mathutils import Vector

# ── 寸法(m) ──
HALF_W    = 0.95
GROUND    = 0.0
ROCKER_Z  = 0.40          # ボディ下端（ロッカー）— 0.70m径ホイールに合わせ低め
HOOD_Z    = 1.06          # ボンネット上面
BELT_Z    = 1.18          # ベルトライン（窓下端）
ROOF_Z    = 1.78          # ルーフ上面
FRONT_Y   = 2.40          # 車体前端（ヘッドライトPivot y=2.46 の直後）— 全長4.8m級
REAR_Y    = -2.40         # 車体後端（RearGateヒンジ y=-2.40）
ROOF_R_Y  = -2.02         # ルーフ後端
WB        = 1.55          # 車軸Y(±)
WHEEL_X   = 0.85
ARCH_R    = 0.60          # ホイールアーチ半幅(Y)
FLARE_OUT = 1.06          # フェンダー外端X
COWL_Y    = 1.15          # フロントガラス下端(カウル) — ボンネット短縮
ROOF_F_Y  = 0.55          # ルーフ前端(フロントガラス上端) — より直立に


def clean_scene():
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for m in list(bpy.data.meshes):
        if m.users == 0:
            bpy.data.meshes.remove(m)


def setup_units():
    s = bpy.context.scene
    s.unit_settings.system = 'METRIC'
    s.unit_settings.scale_length = 1.0


def new_obj(name, bm):
    mesh = bpy.data.meshes.new(name)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def make_prism(name, profile, x0, x1):
    """(Y,Z)プロファイルを X[x0,x1] に押し出した角柱を作る。"""
    bm = bmesh.new()
    left = [bm.verts.new((x0, y, z)) for (y, z) in profile]
    right = [bm.verts.new((x1, y, z)) for (y, z) in profile]
    bm.faces.new(left)
    bm.faces.new(list(reversed(right)))
    n = len(profile)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new([left[i], left[j], right[j], right[i]])
    return new_obj(name, bm)


def make_box(name, x0, x1, y0, y1, z0, z1):
    bm = bmesh.new()
    v = [bm.verts.new(p) for p in [
        (x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),
        (x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]]
    for f in [(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]:
        bm.faces.new([v[i] for i in f])
    return new_obj(name, bm)


def join_into(name, objs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active
    o.name = name
    o.data.name = name + "_mesh"
    return o


def set_origin_world(obj, x, y, z):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.context.scene.cursor.location = Vector((x, y, z))
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    bpy.context.scene.cursor.location = Vector((0, 0, 0))


def add_bevel(obj, width=0.02, segments=1, angle_deg=35.0):
    m = obj.modifiers.new("Bevel", 'BEVEL')
    m.width = width; m.segments = segments
    m.limit_method = 'ANGLE'; m.angle_limit = angle_deg * 3.14159265 / 180.0


def square_arch(name, cy, sx):
    """角形ホイールアーチ(eyebrow+前後ポスト)を1オブジェクトで作る。sx=±1"""
    x_in = 0.90 * sx
    x_out = FLARE_OUT * sx
    xa, xb = sorted((x_in, x_out))
    top = make_box(f"{name}_top", xa, xb, cy-ARCH_R, cy+ARCH_R, HOOD_Z-0.28, HOOD_Z-0.12)
    fpost = make_box(f"{name}_fp", xa, xb, cy+ARCH_R-0.14, cy+ARCH_R, ROCKER_Z, HOOD_Z-0.12)
    rpost = make_box(f"{name}_rp", xa, xb, cy-ARCH_R, cy-ARCH_R+0.14, ROCKER_Z, HOOD_Z-0.12)
    return join_into(name, [top, fpost, rpost])


# ── 構築 ──
clean_scene()
setup_units()

root = bpy.data.objects.new("SUV", None)
root.empty_display_type = 'PLAIN_AXES'; root.empty_display_size = 0.6
bpy.context.collection.objects.link(root)

# 側面プロファイル(Y,Z) — Defender系シルエット（front-bottomから時計回り）
profile = [
    (FRONT_Y, ROCKER_Z),     # 前端・下
    (FRONT_Y, HOOD_Z),       # 直立フロント → ボンネット高
    (COWL_Y,  HOOD_Z+0.04),  # 平らなボンネット（僅かに後上がり）→ カウル
    (ROOF_F_Y, ROOF_Z),      # 傾斜フロントガラス → ルーフ前端
    (ROOF_R_Y, ROOF_Z),      # 平ルーフ
    (REAR_Y,  BELT_Z+0.02),  # リア上端（僅かなルーフ後端下がり）
    (REAR_Y,  ROCKER_Z),     # 垂直リア → 下端
]
body_main = make_prism("body_main", profile, -HALF_W, HALF_W)

parts = [body_main]
# 角形フェンダーフレア ×4
for cy in (WB, -WB):
    for sx in (-1, 1):
        parts.append(square_arch(f"fender_{'F' if cy>0 else 'R'}{'L' if sx<0 else 'R'}", cy, sx))
# サイドステップ（ロッカー下・左右）
for sx in (-1, 1):
    xa, xb = sorted((sx*(HALF_W-0.02), sx*(HALF_W+0.05)))
    parts.append(make_box(f"step_{sx}", xa, xb, -1.30, 1.20, ROCKER_Z-0.12, ROCKER_Z+0.06))

body = join_into("Body", parts)
set_origin_world(body, 0.0, 0.0, 0.0)
add_bevel(body, width=0.02, angle_deg=33)
# ボディ側面のドア開口の"筋"としてローポリを保つためスムーズOFF
for p in body.data.polygons:
    p.use_smooth = False

children = []

# バンパー（前後・頑丈）
fb = make_box("FrontBumper", -HALF_W-0.01, HALF_W+0.01, FRONT_Y, FRONT_Y+0.18, ROCKER_Z-0.16, HOOD_Z-0.34)
set_origin_world(fb, 0, FRONT_Y+0.09, 0.6); add_bevel(fb, 0.02, angle_deg=40); children.append(fb)
rb = make_box("RearBumper", -HALF_W-0.01, HALF_W+0.01, REAR_Y-0.18, REAR_Y, ROCKER_Z-0.16, HOOD_Z-0.34)
set_origin_world(rb, 0, REAR_Y-0.09, 0.6); add_bevel(rb, 0.02, angle_deg=40); children.append(rb)

# ドア×4（サイドにわずかに突出する薄パネル。ヒンジ側を原点に）
DZ0, DZ1 = ROCKER_Z+0.04, BELT_Z+0.02
for sx, side in ((-1,"L"), (1,"R")):
    xf = sx*HALF_W
    xa, xb = sorted((xf, sx*(HALF_W+0.012)))
    df = make_box(f"Door_F{side}", xa, xb, 0.06, COWL_Y-0.02, DZ0, DZ1)
    set_origin_world(df, xf, COWL_Y-0.02, (DZ0+DZ1)/2); children.append(df)
    dr = make_box(f"Door_R{side}", xa, xb, -1.02, 0.02, DZ0, DZ1)
    set_origin_world(dr, xf, 0.02, (DZ0+DZ1)/2); children.append(dr)

# ルーフレール（左右2本を1オブジェクトに）
rails = []
for sx in (-1, 1):
    xa, xb = sorted((sx*0.82, sx*0.60))
    rails.append(make_box(f"rail_{sx}", xa, xb, ROOF_R_Y+0.05, ROOF_F_Y-0.05, ROOF_Z, ROOF_Z+0.07))
roofrail = join_into("RoofRail", rails)
set_origin_world(roofrail, 0, 0, ROOF_Z+0.035); add_bevel(roofrail, 0.01, angle_deg=40)
children.append(roofrail)

# 親子付け
bpy.ops.object.select_all(action='DESELECT')
body.parent = root
for c in children:
    c.parent = body
    c.matrix_parent_inverse = body.matrix_world.inverted()
    for p in c.data.polygons:
        p.use_smooth = False

# 保存
bpy.ops.object.select_all(action='DESELECT')
save_path = "/Users/ryouta/AI-Company/projects/foresight-hp/assets-src/vehicle/SUV_step1.blend"
bpy.ops.wm.save_as_mainfile(filepath=save_path)

mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
tri = 0
for o in mesh_objs:
    o.data.calc_loop_triangles(); tri += len(o.data.loop_triangles)
result = {"objects": [o.name for o in bpy.data.objects],
          "tri_total_no_modifiers": tri, "saved": save_path}
