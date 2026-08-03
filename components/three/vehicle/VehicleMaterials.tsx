"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { MATERIAL_POLICY } from "@/lib/vehicleRig";

/*
 * 車両のマテリアルを一元管理する。
 *
 * VehiclePlaceholder と VehicleGLTF の**両方**がここから受け取ることで、
 * GLBに差し替えたときに質感が変わらないようにする。
 * (禁止事項「GLB差し替え時にコード変更が必要になる構造を作らない」)
 *
 * マテリアル数は最小限に保つ。パーツごとに個別のマテリアルを作ると
 * Draw Callが増え、性能予算(docs/performance-budget.md)を圧迫する。
 */

export type VehicleMaterialSet = {
  body: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  chrome: THREE.MeshStandardMaterial;
  interior: THREE.MeshStandardMaterial;
  /** ヘッドライトのレンズ。emissiveIntensityを毎フレーム書き換える */
  headlight: THREE.MeshStandardMaterial;
  /** 荷室から漏れる光 */
  cargoLight: THREE.MeshStandardMaterial;
  /** タイヤのゴム。ボディより暗くマットに落とす */
  tire: THREE.MeshStandardMaterial;
};

/**
 * マテリアル一式を1度だけ生成する。
 * useMemoで保持しないと毎レンダーでシェーダが再コンパイルされ、
 * スクロール中に確実にコマ落ちする(既存 NarrativeCorridor と同じ理由)。
 */
export function useVehicleMaterials(): VehicleMaterialSet {
  return useMemo(() => {
    const p = MATERIAL_POLICY;

    return {
      /*
       * ボディ。ブランドはモノクロ基調だが、純黒に近づけすぎると
       * 暗い地の中で完全な黒い塊になり、造形が一切読めない(実測)。
       * ダークグレーに置き、ハイライトで面の向きを見せる。
       */
      body: new THREE.MeshStandardMaterial({
        color: "#33363c",
        metalness: p.body.metalness,
        roughness: p.body.roughness,
      }),

      /*
       * ガラスは MeshPhysicalMaterial の transmission を使う。
       * 単純な opacity だけだと「半透明の板」になり、
       * ガラス越しに背後が歪む質感が出ない。
       */
      glass: new THREE.MeshPhysicalMaterial({
        color: "#0a0a0c",
        metalness: 0,
        roughness: 0.08,
        transmission: p.glass.transmission,
        transparent: true,
        opacity: p.glass.opacity,
        ior: 1.45,
        thickness: 0.02,
      }),

      chrome: new THREE.MeshStandardMaterial({
        color: "#c8c8cc",
        metalness: p.chrome.metalness,
        roughness: p.chrome.roughness,
      }),

      interior: new THREE.MeshStandardMaterial({
        color: "#0a0a0c",
        metalness: 0.1,
        roughness: 0.9,
      }),

      /*
       * ヘッドライト。emissiveIntensity は viewProgress.headlightIntensity
       * から毎フレーム書き換えるため、初期値は0(消灯)にしておく。
       * Bloomが拾うのは luminanceThreshold(0.62) を超える明度なので、
       * emissive色は純白に近くする。
       */
      headlight: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: 0,
        metalness: 0,
        roughness: 0.2,
        toneMapped: false,
      }),

      cargoLight: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        emissive: new THREE.Color("#f4f4f6"),
        emissiveIntensity: 0,
        metalness: 0,
        roughness: 0.4,
        toneMapped: false,
      }),

      tire: new THREE.MeshStandardMaterial({
        color: "#050506",
        metalness: 0,
        roughness: 0.95,
      }),
    };
  }, []);
}
