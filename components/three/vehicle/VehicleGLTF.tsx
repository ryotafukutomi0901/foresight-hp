"use client";

import { useImperativeHandle, useMemo, type Ref } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  VEHICLE_OBJECT_NAMES,
  type VehicleHandle,
  type VehicleObjectName,
} from "@/lib/vehicleRig";

/*
 * Blender製GLBの読み込み。
 *
 * ═══════════════════════════════════════════════════════════════
 *  VehiclePlaceholder と**完全に同じ契約**を満たす:
 *    - 同じ props (handleRef)
 *    - 同じ VehicleHandle (parts: 名前 → Object3D)
 *
 *  したがって Vehicle.tsx の USE_GLB を true にするだけで差し替わり、
 *  useFrame の中身も、各セクションのScrollTriggerも一切変更しなくてよい。
 * ═══════════════════════════════════════════════════════════════
 *
 * ここで gltfjsx を使わないのは、生成されたコンポーネントが
 * GLBの構造をJSXにハードコードしてしまい、モデルを差し替えるたびに
 * 再生成が要る = 「GLB差し替え時にコード変更が必要になる構造」に
 * なるため。名前で引く方式なら、階層が変わっても名前さえ一致すれば動く。
 */

const MODEL_URL = "/models/SUV.glb";

/**
 * これが欠けると演出そのものが消えるパーツ。
 * 逆に言えば、ここに無い名前(バンパー・ドア等)はBody一体でも構わない。
 */
const MOTION_CRITICAL = [
  "Body",
  "RearGate",
  "Wheel_FL",
  "Wheel_FR",
  "Wheel_RL",
  "Wheel_RR",
  "Headlight_L",
  "Headlight_R",
  "Interior",
] as const;

type Props = {
  handleRef?: Ref<VehicleHandle>;
};

export default function VehicleGLTF({ handleRef }: Props) {
  const { scene } = useGLTF(MODEL_URL);

  /*
   * シーンを複製せず、そのまま使う。
   * 車両はページ全体で1インスタンスしか存在しないため
   * (禁止事項「車両をセクションごとに作り直さない」)、
   * clone によるメモリ増を避ける。
   */
  const parts = useMemo(() => {
    const found = {} as Record<VehicleObjectName, THREE.Object3D | null>;

    for (const name of VEHICLE_OBJECT_NAMES) {
      const obj = scene.getObjectByName(name) ?? null;
      found[name] = obj;

      /*
       * 欠けていると**演出が成立しない**パーツだけを警告する。
       *
       * バンパーやドアは分かれていなくてもBody一体で描画されるので
       * 見た目に影響しないが、ここに挙げた5つは rotation や
       * emissive を個別に動かす対象なので、無いと演出が消える。
       */
      if (
        process.env.NODE_ENV !== "production" &&
        !obj &&
        (MOTION_CRITICAL as readonly string[]).includes(name)
      ) {
        console.warn(
          `[VehicleGLTF] 可動パーツ "${name}" が GLB にありません。` +
            `この部位の演出は無効になります(docs/vehicle-rig-spec.md §3)。`,
        );
      }
    }

    /*
     * ボディを「製図調」に置き換える。
     *
     * ═══════════════════════════════════════════════════════════════
     *  参照資料 public/images/foresight/vehicle-parts/vehicle180.png は
     *  **純黒の車体に白い線だけ**で描かれた製図。写真テクスチャの
     *  質感が乗っていると、この線画のトーンにならない。
     *
     *  そこで写実PBRテクスチャを外し、フラットな黒に差し替える。
     *  車体の情報は EdgesEffect が描く白線だけが担う構成にすると、
     *  参照資料とほぼ同じ絵になる。
     *
     *  ジオメトリもノード構成も一切変えていない(CEO指示「基本パーツは
     *  いじらない」)。差し替えているのはマテリアルだけ。
     * ═══════════════════════════════════════════════════════════════
     */
    const body = found.Body;
    if (body) {
      body.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;

        const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mesh.material = list.map((m) => {
          const name = (m as THREE.Material).name;

          /*
           * FORESIGHT のワードマークだけは白く残す。
           * 参照資料でもここだけが明るく、ブランド名が読める。
           */
          if (name === "Badge") {
            return new THREE.MeshStandardMaterial({
              color: "#ffffff",
              emissive: new THREE.Color("#ffffff"),
              emissiveIntensity: 0.35,
              metalness: 0,
              roughness: 0.4,
              toneMapped: false,
            });
          }

          /*
           * 車体本体とバッジ台座。
           *
           * 完全な黒(#000)にはしない。真っ黒だと面の向きが一切
           * 読めなくなり、輪郭線だけが宙に浮いて紙の絵になる。
           * ごく僅かに明度を残すと、面の存在が感じられたまま
           * 線が主役の絵になる。
           */
          return new THREE.MeshStandardMaterial({
            color: "#0b0b0e",
            metalness: 0.15,
            roughness: 0.72,
          });
        });
        if (Array.isArray(mesh.material) && mesh.material.length === 1) {
          mesh.material = mesh.material[0];
        }
      });
    }

    /*
     * ヘッドライトのマテリアルを個体化する。
     *
     * Blenderは同じマテリアルを使う複数オブジェクトを、GLB上でも
     * 1インスタンスとして共有させる。そのままだと左右のライトが
     * 常に同じ明るさになり、片側だけ点けるといった制御ができない。
     * (今は左右同時に点けているが、Pivot同様「後で変えられない構造」を
     *  最初から作らないために分けておく)
     *
     * 併せて toneMapped を切る。ACESトーンマッピングは高輝度を
     * 押し戻すため、有効なままだと emissiveIntensity をいくら上げても
     * Bloomの閾値(0.62)を超えず、ライトが光らない。
     */
    for (const name of ["Headlight_L", "Headlight_R"] as const) {
      const lamp = found[name] as THREE.Mesh | null;
      if (!lamp) continue;
      const mat = lamp.material as THREE.MeshStandardMaterial;
      const solo = mat.clone();
      solo.toneMapped = false;
      solo.emissiveIntensity = 0;
      lamp.material = solo;
    }

    return found;
  }, [scene]);

  useImperativeHandle(handleRef, () => ({ parts }), [parts]);

  /*
   * GLBの前方向を、コード側の規約(-Zが前方)に揃える。
   *
   * 納品されたモデルは実測で +Z が前方だった(bboxではヘッドライトが
   * -Z側にあるが、造形の向きは逆になっている)。
   *
   * ここでπ回して吸収するのは、代わりに lib/tokens.ts の角度を
   * 全部書き換えると「GLB差し替えのたびに演出の数値が動く」構造に
   * なるため。向きの違いはモデル側の事情なので、モデル側で閉じる。
   */
  return (
    <group rotation={[0, Math.PI, 0]}>
      <primitive object={scene} />
    </group>
  );
}

/*
 * 先読み。Heroが始まる前にダウンロードを開始させる。
 * 車両はページの主役なので、表示の瞬間に間に合っていないと
 * 「何もない画面」から始まってしまう。
 */
useGLTF.preload(MODEL_URL);
