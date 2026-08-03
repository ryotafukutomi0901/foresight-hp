"""
FORESIGHT SUV — Phase 3: ディテール

SUV_step2.blend を開き、以下8オブジェクトを追加して SUV_step3.blend を保存（冪等）:
  Grill / Headlight_L / Headlight_R / Mirror_L / Mirror_R / Glass / RearGate / Interior
併せてヘッドライト角型ハウジング・フロントスキッドプレート・テールランプを Body 等へ追加。

座標規約: Blender +X=右 / +Y=前方 / +Z=上 / ground=Z0。
正本Pivot(three→Blender):
  Headlight L(-0.62,0.78,-2.46)→(-0.62,2.46,0.78) / R→(0.62,2.46,0.78)
  RearGate hinge three(0,1.5,2.4)→Blender(0,-2.40,1.50)  ※X軸回転で跳ね上げ
単一マテリアル必須（R3Fが material を直接触る）: Headlight_L/R, Interior。
"""
import bpy, bmesh, math
from mathutils import Vector

STEP2 = "/Users/ryouta/AI-Company/projects/foresight-hp/assets-src/vehicle/SUV_step2.blend"
STEP3 = "/Users/ryouta/AI-Company/projects/foresight-hp/assets-src/vehicle/SUV_step3.blend"

# 車体寸法（create_body.py と一致させる）
HALF_W  = 0.95
ROCKER  = 0.40
HOOD_Z  = 1.06
BELT_Z  = 1.18
ROOF_Z  = 1.78
FRONT_Y = 2.40
REAR_Y  = -2.40
COWL_Y  = 1.15
ROOF_F_Y = 0.55
CAB_HW  = 0.93

def get_mat(name):
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name); m.use_nodes = True
    return m

def obj_from_bm(name, bm, mats):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    for mn in mats:
        o.data.materials.append(get_mat(mn))
    return o

def box_faces(bm, c, mi):
    v = [bm.verts.new(p) for p in c]
    for f in [(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]:
        fa = bm.faces.new([v[i] for i in f]); fa.material_index = mi
    return v

def box_corners(x0,x1,y0,y1,z0,z1):
    return [(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),
            (x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]

def one_box(name, x0,x1,y0,y1,z0,z1, mat):
    bm = bmesh.new(); box_faces(bm, box_corners(x0,x1,y0,y1,z0,z1), 0)
    return obj_from_bm(name, bm, [mat])

def _select(objs, active):
    for o in bpy.data.objects: o.select_set(False)
    for o in objs: o.select_set(True)
    vl = bpy.context.view_layer
    vl.objects.active = active
    vl.update()

def set_origin_world(o, x,y,z):
    _select([o], o)
    bpy.context.scene.cursor.location = Vector((x,y,z))
    with bpy.context.temp_override(active_object=o, selected_objects=[o],
                                   selected_editable_objects=[o], object=o):
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    bpy.context.scene.cursor.location = Vector((0,0,0))

def apply_transform(o):
    _select([o], o)
    with bpy.context.temp_override(active_object=o, selected_objects=[o],
                                   selected_editable_objects=[o], object=o):
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

def join_into(name, objs, dataname=None):
    _select(objs, objs[0])
    with bpy.context.temp_override(active_object=objs[0], selected_objects=objs,
                                   selected_editable_objects=objs, object=objs[0]):
        bpy.ops.object.join()
    o = objs[0]
    o.name = name; o.data.name = (dataname or name) + "_mesh"
    return o

def make_lens(name, cx, cy, cz, r, depth, seg=20):
    """+Y向きの円形発光レンズ（単一マテリアル Headlight）。"""
    bm = bmesh.new()
    tip = bm.verts.new((cx, cy+depth, cz))
    ring = []
    for i in range(seg):
        a = 2*math.pi*i/seg
        ring.append(bm.verts.new((cx+r*math.cos(a), cy, cz+r*math.sin(a))))
    for i in range(seg):
        f = bm.faces.new([tip, ring[i], ring[(i+1)%seg]]); f.material_index = 0
    return obj_from_bm(name, bm, ["Headlight"])

def tire_ring(bm, cx, r_out, r_bead, half_wd, seg, mi):
    prof = [(cx-half_wd+0.02, r_bead),(cx-half_wd, r_out-0.05),(cx-half_wd+0.04, r_out),
            (cx, r_out),(cx+half_wd-0.04, r_out),(cx+half_wd, r_out-0.05),
            (cx+half_wd-0.02, r_bead),(cx+half_wd-0.06, r_bead-0.01),(cx-half_wd+0.06, r_bead-0.01)]
    n=len(prof); rings=[]
    for i in range(seg):
        t=2*math.pi*i/seg; c,s=math.cos(t),math.sin(t)
        rings.append([bm.verts.new((u, r*c, r*s)) for (u,r) in prof])
    for i in range(seg):
        a=rings[i]; b=rings[(i+1)%seg]
        for k in range(n):
            k2=(k+1)%n; f=bm.faces.new([a[k],a[k2],b[k2],b[k]]); f.material_index=mi

# ── 実行 ──
bpy.ops.wm.open_mainfile(filepath=STEP2)
body = bpy.data.objects["Body"]

# 既存の追加オブジェクトを掃除（冪等）
for nm in ["Grill","Headlight_L","Headlight_R","Mirror_L","Mirror_R","Glass","RearGate","Interior"]:
    o = bpy.data.objects.get(nm)
    if o: bpy.data.objects.remove(o, do_unlink=True)

children = []
extra_body = []   # Bodyへ統合するディテール

# ═ フロントフェイス：グリル ═
FY0, FY1 = FRONT_Y-0.06, FRONT_Y+0.02
gr_parts = []
# フレーム（上下左右）
gr_parts.append(one_box("gf_t", -0.55,0.55, FY0,FY1, 1.00,1.05, "BodyPaint"))
gr_parts.append(one_box("gf_b", -0.55,0.55, FY0,FY1, 0.58,0.63, "BodyPaint"))
gr_parts.append(one_box("gf_l", -0.55,-0.50, FY0,FY1, 0.58,1.05, "BodyPaint"))
gr_parts.append(one_box("gf_r", 0.50,0.55, FY0,FY1, 0.58,1.05, "BodyPaint"))
# 縦スラット
n_slat = 13
for i in range(n_slat):
    x = -0.48 + i*(0.96/(n_slat-1))
    gr_parts.append(one_box(f"gs_{i}", x-0.012,x+0.012, FY0+0.005,FY1-0.01, 0.64,0.99, "Chrome"))
# FORESIGHT ワードマーク台座（中央横バー、法線/エミッシブは後工程）
gr_parts.append(one_box("gw", -0.42,0.42, FY0-0.01,FY1, 0.74,0.86, "Chrome"))
grill = join_into("Grill", gr_parts)
grill.parent = body; children.append(grill)

# ═ ヘッドライト（丸・発光）＋角型ハウジング ═
for sx, side in ((-1,"L"), (1,"R")):
    cx = sx*0.62
    # 角型ハウジング（暗色, Body統合）
    hb = one_box(f"hl_house_{side}", cx-0.20, cx+0.20, FRONT_Y-0.05, FRONT_Y+0.03, 0.56, 1.00, "BodyPaint")
    extra_body.append(hb)
    # 丸レンズ（発光, 単一マテリアル）
    lens = make_lens(f"Headlight_{side}", cx, FRONT_Y-0.01, 0.78, 0.17, 0.05)
    set_origin_world(lens, cx, FRONT_Y+0.06, 0.78)   # 正本Pivot ≈ (±0.62, 2.46, 0.78)
    lens.parent = body; children.append(lens)

# フロントスキッドプレート＆フォグ（Body統合・BodyPaint）
extra_body.append(one_box("skid", -0.55,0.55, FRONT_Y+0.02,FRONT_Y+0.16, ROCKER-0.14, 0.52, "BodyPaint"))
for sx in (-1,1):
    extra_body.append(one_box(f"fog_{sx}", sx*0.72-0.06, sx*0.72+0.06, FRONT_Y+0.02,FRONT_Y+0.10, 0.50,0.62, "Chrome"))

# ═ ミラー（左右・ドア前方） ═
for sx, side in ((-1,"L"), (1,"R")):
    xo = sx*(HALF_W)
    parts = []
    parts.append(one_box(f"mstalk_{side}", xo, sx*(HALF_W+0.10), 0.66,0.74, 1.12,1.20, "BodyPaint"))
    parts.append(one_box(f"mhead_{side}", sx*(HALF_W+0.08), sx*(HALF_W+0.22), 0.60,0.80, 1.14,1.30, "BodyPaint"))
    m = join_into(f"Mirror_{side}", parts)
    m.parent = body; children.append(m)

# ═ ガラス（フロント/サイド/リアを1オブジェクト・単一Glass） ═
gl = []
# フロントガラス（傾斜面：カウル→ルーフ前端）— 車体プロファイルに整合
# 車体windshield区間: (COWL_Y, HOOD_Z+0.04) → (ROOF_F_Y, ROOF_Z)。僅かに外側(proud)へ。
bm = bmesh.new()
gw = CAB_HW
zc = HOOD_Z + 0.04
v = [bm.verts.new((-gw, COWL_Y, zc)), bm.verts.new((gw, COWL_Y, zc)),
     bm.verts.new((gw, ROOF_F_Y, ROOF_Z)), bm.verts.new((-gw, ROOF_F_Y, ROOF_Z))]
bm.faces.new(v)
ws = obj_from_bm("glass_ws", bm, ["Glass"]); gl.append(ws)
# サイド窓（左右）
for sx in (-1,1):
    xg = sx*(CAB_HW-0.005)
    gl.append(one_box(f"glass_s{sx}", xg-0.01, xg+0.01, REAR_Y+0.20, 0.60, BELT_Z+0.02, ROOF_Z-0.08, "Glass"))
# リア窓
gl.append(one_box("glass_r", -gw+0.05, gw-0.05, REAR_Y+0.02, REAR_Y+0.06, BELT_Z+0.06, ROOF_Z-0.10, "Glass"))
glass = join_into("Glass", gl)
glass.parent = body; children.append(glass)

# ═ 内装（暗いシェル：フロア＋シート＋ダッシュ、単一Interior・荷室エミッシブ核） ═
inr = []
inr.append(one_box("in_floor", -0.80,0.80, REAR_Y+0.20,0.75, BELT_Z-0.30, BELT_Z-0.16, "Interior"))
for sx in (-1,1):  # 前席
    inr.append(one_box(f"seat_f{sx}", sx*0.42-0.20, sx*0.42+0.20, 0.10,0.55, BELT_Z-0.16, BELT_Z+0.18, "Interior"))
for sx in (-1,1):  # 後席
    inr.append(one_box(f"seat_r{sx}", sx*0.42-0.22, sx*0.42+0.22, -0.75,-0.30, BELT_Z-0.16, BELT_Z+0.20, "Interior"))
inr.append(one_box("dash", -0.82,0.82, 0.66,0.80, BELT_Z-0.14, BELT_Z+0.10, "Interior"))
interior = join_into("Interior", inr)
interior.parent = body; children.append(interior)

# ═ リアゲート（跳ね上げ）＋スペアタイヤ＋テールランプ ═
rg_parts = []
# ゲート本体パネル（ヒンジ z=1.50 の下）
rg_parts.append(one_box("rg_panel", -0.86,0.86, REAR_Y-0.04, REAR_Y+0.02, 0.52,1.48, "BodyPaint"))
# テールランプ（縦・左右, Chrome台座）
for sx in (-1,1):
    rg_parts.append(one_box(f"tail_{sx}", sx*0.78-0.07, sx*0.78+0.07, REAR_Y-0.06, REAR_Y-0.02, 0.62,1.18, "Chrome"))
# スペアタイヤ（簡易・ゲート中央、後方へ突出）
sp = bmesh.new()
tire_ring(sp, 0.0, 0.32, 0.20, 0.13, 22, 0)   # tire (mat0)
# スペアのリム面（簡易ディスク mat1 Chrome）
tipc = sp.verts.new((0.14, 0.0, 0.0)); rr=[]
for i in range(16):
    a=2*math.pi*i/16; rr.append(sp.verts.new((0.10, 0.18*math.cos(a), 0.18*math.sin(a))))
for i in range(16):
    f=sp.faces.new([tipc, rr[i], rr[(i+1)%16]]); f.material_index=1
spare = obj_from_bm("rg_spare", sp, ["Tire","Chrome"])
# スペアをゲート面(後方)へ配置：X軸周りに90°倒して面を後ろへ
spare.rotation_euler = (0, math.radians(90), 0)
spare.location = (0.0, REAR_Y-0.20, 0.98)
bpy.context.view_layer.update()
# 適用してから join
apply_transform(spare)
reargate = join_into("RearGate", rg_parts + [spare])
set_origin_world(reargate, 0.0, REAR_Y, 1.50)   # ヒンジ = 正本(0,-2.40,1.50)
reargate.parent = body; children.append(reargate)

# ═ Body へディテール統合 ═
if extra_body:
    body = join_into("Body", [body] + extra_body)

# スムーズ設定（丸物のみ）
for o in bpy.data.objects:
    if o.type != 'MESH': continue
    smooth = o.name in ("Headlight_L","Headlight_R","RearGate")
    for p in o.data.polygons: p.use_smooth = False
# ヘッドライトはスムーズ
for nm in ("Headlight_L","Headlight_R"):
    for p in bpy.data.objects[nm].data.polygons: p.use_smooth = True

bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=STEP3)

mesh_objs=[o for o in bpy.data.objects if o.type=='MESH']
tri=0
for o in mesh_objs:
    o.data.calc_loop_triangles(); tri+=len(o.data.loop_triangles)
present = set(o.name for o in bpy.data.objects)
REQUIRED = {"Body","FrontBumper","RearBumper","Grill","Headlight_L","Headlight_R","Glass",
 "Mirror_L","Mirror_R","Wheel_FL","Wheel_FR","Wheel_RL","Wheel_RR","RearGate",
 "Door_FL","Door_FR","Door_RL","Door_RR","RoofRail","Interior"}
result={"objects":sorted(o.name for o in bpy.data.objects),
        "missing_required": sorted(REQUIRED-present),
        "extra": sorted(present-REQUIRED-{"SUV"}),
        "tri_total":tri, "saved":STEP3}
