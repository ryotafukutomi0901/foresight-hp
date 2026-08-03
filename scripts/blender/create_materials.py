"""
FORESIGHT SUV — Phase 4: マテリアル（PBR・モノクロ基調）

SUV_step3.blend を開き、正本§5の5系統マテリアルを Principled BSDF で構成し
各オブジェクトへ割当、SUV_step4.blend を保存（冪等）。

正本§5:
  BodyPaint : PBR metalness0.6 / roughness0.35 / 黒〜ダークグレー
  Glass     : 透明 opacity0.25 / transmission0.9
  Headlight : Emissive（Bloom核）— R3Fが emissiveIntensity を実行時制御
  Chrome    : metalness0.9 / roughness0.15（Mirror/RoofRail/リム）
  Interior  : 暗めマット（＋荷室Emissive核。R3Fが emissiveIntensity 制御）
  ＋ Tire(ラバー) / WheelHub(ダーク金属) を補助的に追加（"5種類程度"の範囲）

単一マテリアル必須: Headlight_L/R, Interior（R3Fが material を直接参照）。
"""
import bpy

STEP3 = "/Users/ryouta/AI-Company/projects/foresight-hp/assets-src/vehicle/SUV_step3.blend"
STEP4 = "/Users/ryouta/AI-Company/projects/foresight-hp/assets-src/vehicle/SUV_step4.blend"

def get_mat(name):
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m

def bsdf(mat):
    for n in mat.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            return n
    # 無ければ生成して Output に接続
    nt = mat.node_tree
    p = nt.nodes.new("ShaderNodeBsdfPrincipled")
    out = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None) or nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(p.outputs[0], out.inputs[0])
    return p

def set_input(node, key, value):
    if key in node.inputs:
        node.inputs[key].default_value = value

def config(name, base, metallic=0.0, roughness=0.5, emission=None, emission_strength=0.0,
           transmission=0.0, alpha=1.0, blend='OPAQUE'):
    m = get_mat(name)
    p = bsdf(m)
    set_input(p, "Base Color", (*base, 1.0))
    set_input(p, "Metallic", metallic)
    set_input(p, "Roughness", roughness)
    set_input(p, "Transmission Weight", transmission)   # Blender 4+/5 名称
    set_input(p, "Transmission", transmission)          # 旧名フォールバック
    set_input(p, "IOR", 1.45)
    set_input(p, "Alpha", alpha)
    if emission is not None:
        set_input(p, "Emission Color", (*emission, 1.0))
        set_input(p, "Emission Strength", emission_strength)
    # EEVEEプレビュー用の透過設定（GLBはKHR_transmission/alpha_modeで別管理）
    try:
        m.blend_method = blend
    except Exception:
        pass
    if transmission > 0 or alpha < 1.0:
        try: m.use_backface_culling = False
        except Exception: pass
    return m

# ── 実行 ──
bpy.ops.wm.open_mainfile(filepath=STEP3)

# マテリアル構成
config("BodyPaint", (0.022, 0.022, 0.026), metallic=0.6, roughness=0.35)          # マット寄りの黒
config("Chrome",    (0.34, 0.35, 0.38),    metallic=0.9, roughness=0.28)           # ダーク・ガンメタル（リファレンス準拠）
config("Glass",     (0.02, 0.025, 0.03),   metallic=0.0, roughness=0.06,
       transmission=0.9, alpha=0.25, blend='BLEND')                                # ダーク透明
config("Headlight", (1.0, 0.98, 0.92),     metallic=0.0, roughness=0.1,
       emission=(1.0, 0.97, 0.9), emission_strength=1.0)                            # 発光（R3Fが強度制御）
config("Interior",  (0.03, 0.03, 0.035),   metallic=0.0, roughness=0.85,
       emission=(1.0, 0.85, 0.6), emission_strength=1.0)                            # 暗マット＋荷室発光核
# ※emission_strength=1.0 は emissiveFactor(暖色) をGLBへ書き出させるため。
#   実行時の発光量は R3F(useFrame)が emissiveIntensity=0.. で制御（初期0=消灯）。
config("Tire",      (0.018, 0.018, 0.02),  metallic=0.0, roughness=0.9)            # ラバー
config("WheelHub",  (0.05, 0.05, 0.055),   metallic=0.7, roughness=0.4)            # ダーク金属

# 材質スロットが無いオブジェクトへ BodyPaint を付与（バンパー/ドア/ルーフレール）
# 併せて空(None)スロットを BodyPaint で埋める（Body本体シェルが該当）
body_paint = get_mat("BodyPaint")
for o in bpy.data.objects:
    if o.type != 'MESH':
        continue
    if len(o.data.materials) == 0:
        o.data.materials.append(body_paint)
        for p in o.data.polygons:
            p.material_index = 0
    else:
        for i, m in enumerate(o.data.materials):
            if m is None:
                o.data.materials[i] = body_paint

# 単一マテリアル制約の検証（Headlight_L/R, Interior）
single_ok = {nm: len(bpy.data.objects[nm].data.materials) == 1
             for nm in ("Headlight_L", "Headlight_R", "Interior")}

bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=STEP4)

# オブジェクトごとの割当マテリアルを収集
assign = {}
for o in bpy.data.objects:
    if o.type == 'MESH':
        assign[o.name] = [m.name if m else None for m in o.data.materials]

result = {"single_material_ok": single_ok, "assignments": assign, "saved": STEP4}
