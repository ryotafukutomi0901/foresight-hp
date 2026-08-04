"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { viewProgress, vehicleSection, type VehicleSection } from "@/lib/viewProgress";
import { vehicle as V, scroll as SCROLL } from "@/lib/tokens";

/*
 * 車両制御ScrollTriggerの唯一の生成点。
 *
 * ═══════════════════════════════════════════════════════════════
 *  なぜセクションごとに書かず1箇所に集約するのか
 *
 *  「1つの状態を書くScrollTriggerは区間ごとに1つだけ」という制約は、
 *  各セクションが自分でtriggerを作る構造だと守れているか誰も検証できない。
 *  区間定義をこのファイルの SEGMENTS 一箇所に置き、生成を1関数に閉じることで、
 *  責務の重複が構造的に起こらないようにしている。
 *
 *  各セクションは useVehicleSegment("sell") と呼ぶだけでよく、
 *  車両がどう動くかを知らない(装飾アニメだけに集中できる)。
 * ═══════════════════════════════════════════════════════════════
 *
 * 全区間 scrub:true。once は使わない。
 * viewProgress への書き込みは全て progress の単調関数として設計してあるので、
 * 逆スクロールでは同じ値を逆順に辿るだけで正確に巻き戻る。
 *
 * Hero は例外(サイト唯一の自動再生)なのでここには含まれない。Hero.tsx が持つ。
 */

/**
 * 各区間の到達目標。**前区間の終了値がそのまま開始値**になるため、
 * ここでは「その区間の終わりにどうなっているか」だけを書く。
 * 開始値をハードコードしない = 突然の位置変更が原理的に起きない。
 */
type SegmentConfig = {
  /** scrubの遅延。大きいほど滑らかだが、スクロールとの一体感が薄れる */
  scrub: number;
  /** この区間の終端で車両とカメラがどうなっているか */
  apply: (p: number) => void;
};

/** 区間内の部分進行度を 0〜1 に切り出す。範囲外は 0 / 1 に張り付く */
function slice(p: number, start: number, end: number) {
  return gsap.utils.clamp(0, 1, (p - start) / (end - start));
}

/** 開始値→終了値の線形補間。progressの単調関数を作るための基本形 */
function mix(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

/*
 * 区間ごとの「開始値」。前区間の終端値と一致させてある。
 * 実行時に viewProgress から読むのではなく定数で持つ理由は、
 * 逆スクロールでどの順に区間へ入っても同じ結果になる必要があるため
 * (読み取り式にすると、飛ばしスクロール時に開始値が汚染される)。
 */
const START = {
  philosophy: {
    rotationY: V.hero.toRotationY,
    x: V.hero.toX,
    z: V.hero.toZ,
  },
  sell: {
    rotationY: V.philosophy.toRotationY,
    x: V.hero.toX,
    z: V.hero.toZ,
  },
  buy: {
    rotationY: V.sell.toRotationY,
    x: V.hero.toX,
    z: V.hero.toZ + V.sell.advanceZ,
  },
  find: {
    rotationY: V.sell.toRotationY,
    x: V.hero.toX,
    z: V.hero.toZ + V.sell.advanceZ,
  },
  contact: {
    rotationY: V.find.toRotationY,
    x: V.hero.toX,
    z: V.hero.toZ + V.sell.advanceZ + V.find.travelZ,
  },
} as const;

/** タイヤ半径(m)。走行距離を回転角に変換するのに使う */
const WHEEL_RADIUS = 0.35;

/*
 * タイヤの累積回転角。
 *
 * ═══════════════════════════════════════════════════════════════
 *  区間をまたぐ唯一の累積量なので、繋ぎを明示的に定義する。
 *
 *  各区間が独立に「0から」始めると、境界で角度が飛ぶ。
 *  実測では Sell終了(-1.71rad)から Find開始(0)へ約98度ジャンプしていた。
 *  停止中の車のタイヤが突然回るのは、静止画で見ても分かる破綻。
 * ═══════════════════════════════════════════════════════════════
 */
const WHEEL = {
  /*
   * 停止時の基準角。
   * Heroは 4π まで回して終わるが、4π ≡ 0 (mod 2π) なので
   * 見た目は同一。ここを0にしておくと以降の計算が素直になる。
   */
  atRest: 0,
  /** Sellで advanceZ だけ前進した分 */
  sellEnd: V.sell.advanceZ / WHEEL_RADIUS,
  /** Findで走った分を足した終端 */
  findEnd: V.sell.advanceZ / WHEEL_RADIUS + V.find.wheelSpin,
  /** Contactで惰性が抜けるまでに余分に回る角度 */
  coast: Math.PI * 1.2,
} as const;

/*
 * Buy区間の周回が終わった時点のカメラ位置。
 * Find区間の開始値として使い、区間の継ぎ目でカメラが飛ばないようにする。
 * 周回式(極座標)と同じ計算をここで一度だけ解いておく。
 */
const BUY_END_CAMERA = {
  x: Math.sin(V.buy.orbitSweep) * V.buy.orbitRadius,
  y: V.buy.orbitHeightTo,
  z: Math.cos(V.buy.orbitSweep) * V.buy.orbitRadius,
  lookY: V.camera.buy.lookY,
} as const;

/** カメラを目標区間の値へ p の割合で寄せる。全区間で必ず補間される */
function camera(
  from: { x: number; y: number; z: number; lookY: number },
  to: { x: number; y: number; z: number; lookY: number },
  p: number,
) {
  viewProgress.cameraX = mix(from.x, to.x, p);
  viewProgress.cameraY = mix(from.y, to.y, p);
  viewProgress.cameraZ = mix(from.z, to.z, p);
  viewProgress.lookAtY = mix(from.lookY, to.lookY, p);

  /*
   * 注視点の奥行きは既定で原点に戻す。
   * Find/Contact はこの後に lookAtZ を車体へ上書きするが、
   * ここで毎回0に戻しておかないと、逆スクロールで前の区間へ
   * 帰ったときに車を追う視線が残り続ける。
   */
  viewProgress.lookAtZ = 0;
}

const SEGMENTS: Record<Exclude<VehicleSection, "hero">, SegmentConfig> = {
  /*
   * PHILOSOPHY — 時計回りに回してリアを見せ、ハッチが開き、荷室から光が漏れる。
   * 「文字は画面中央に突然表示せず、車両内部から価値が生まれるように見せる」ため、
   * cargoLightIntensity がコピー出現の駆動源になる(セクション側がこの値を読む)。
   */
  philosophy: {
    scrub: 1,
    apply(p) {
      viewProgress.bodyRotationY = mix(
        START.philosophy.rotationY,
        V.philosophy.toRotationY,
        p,
      );

      /*
       * この区間で車は回るだけで動かない。位置とタイヤを明示的に
       * 押さえておくと、Sellから逆スクロールで戻ってきたときに
       * 前区間が書いた値が残らない。
       */
      viewProgress.bodyX = START.philosophy.x;
      viewProgress.bodyZ = START.philosophy.z;
      viewProgress.wheelAngle = WHEEL.atRest;

      /*
       * 光はリアが見えてから灯る。回転より遅らせるのが要。
       *
       * 当初は「リアハッチが開いて荷室から光が漏れる」だったが、
       * 写実GLBに RearGate / Interior が存在しないため
       * (docs/vehicle-glb-handoff.md §2)、車の後方が光る表現に
       * 置き換えた。rearGateOpen は将来モデルに可動部が
       * 加わったときのために書き続けている(無ければ無視される)。
       */
      const gate = slice(p, V.philosophy.gateOpenStart, V.philosophy.gateOpenEnd);
      viewProgress.rearGateOpen = gate;
      /* 二乗して立ち上がりを遅らせる。じわりと満ちる感じにする */
      viewProgress.cargoLightIntensity = gate * gate;

      camera(V.camera.hero, V.camera.philosophy, p);
    },
  },

  /*
   * SELL — ハッチを閉じ、僅かに前進し、側面へ回り込み、スキャンラインが走る。
   * 「査定」ではなく「可能性の発見」。スキャンは車体全体を舐めるように通す。
   */
  sell: {
    scrub: 1,
    apply(p) {
      /* 先にハッチを閉じきってから、車が動き出す */
      const close = slice(p, 0, V.sell.gateCloseEnd);
      viewProgress.rearGateOpen = 1 - close;
      viewProgress.cargoLightIntensity = (1 - close) * (1 - close);

      /* 閉じ終えてから側面へ回り込む */
      const turn = slice(p, V.sell.gateCloseEnd, 1);
      viewProgress.bodyRotationY = mix(
        START.sell.rotationY,
        V.sell.toRotationY,
        turn,
      );
      viewProgress.bodyZ = mix(START.sell.z, START.sell.z + V.sell.advanceZ, turn);

      /* 前進した分だけタイヤも回る。距離と回転を一致させる */
      viewProgress.wheelAngle =
        WHEEL.atRest + (viewProgress.bodyZ - START.sell.z) / WHEEL_RADIUS;

      viewProgress.scanProgress = slice(p, V.sell.scanStart, V.sell.scanEnd);

      camera(V.camera.philosophy, V.camera.sell, p);
    },
  },

  /*
   * BUY — カメラが車両を周回する。車体は動かさない。
   * 「車が回る」のではなく「見る側が回り込む」ことで、
   * 展示された一台を鑑賞している感覚になる。
   */
  buy: {
    scrub: 1,
    apply(p) {
      /*
       * この区間は**カメラだけが動く**。車体は静止したまま。
       * 静止しているからこそ、位置・角度・タイヤ・ハッチを
       * すべて明示的に押さえる必要がある。書かずに放置すると、
       * 逆スクロールで戻ったとき次区間(Find)が書いた値が残り、
       * 止まっているはずの車のタイヤが回った状態になる(実測)。
       */
      viewProgress.bodyX = START.buy.x;
      viewProgress.bodyZ = START.buy.z;
      viewProgress.bodyRotationY = START.buy.rotationY;
      viewProgress.wheelAngle = WHEEL.sellEnd;
      viewProgress.rearGateOpen = 0;
      viewProgress.routeLineProgress = 0;

      /*
       * カメラを円弧上で動かす。camera() を使わないのは、
       * ここだけ直線補間ではなく極座標で動かす必要があるため
       * (直線で結ぶと車体を突き抜ける)。
       */
      /*
       * 前区間(Sell)のカメラ位置に対応する角度から始める。
       * 0 から始めると、Sellの終端カメラ(x=0,z=7.8)から
       * 一気に横へ飛び、車体を突き抜けたように見える。
       */
      const angle = p * V.buy.orbitSweep;
      viewProgress.cameraX = Math.sin(angle) * V.buy.orbitRadius;
      viewProgress.cameraZ = Math.cos(angle) * V.buy.orbitRadius;
      viewProgress.cameraY = mix(V.buy.orbitHeightFrom, V.buy.orbitHeightTo, p);
      viewProgress.lookAtY = V.camera.buy.lookY;
      /* camera() を経由しないので、注視点の奥行きは自分で戻す */
      viewProgress.lookAtZ = 0;
    },
  },

  /*
   * FIND — 再び走行姿勢へ。タイヤが回り、光のラインが分岐する。
   * 「オークション代行」を、行き先を探して道が枝分かれしていく絵にする。
   */
  find: {
    scrub: 1,
    apply(p) {
      viewProgress.bodyRotationY = mix(
        START.find.rotationY,
        V.find.toRotationY,
        p,
      );
      viewProgress.bodyZ = mix(START.find.z, START.find.z + V.find.travelZ, p);

      /*
       * 角度そのものを progress から与える。ここで delta を積分すると
       * スクロールを止めてもタイヤが回り続けてしまう(禁止事項)。
       */
      viewProgress.wheelAngle = WHEEL.sellEnd + p * V.find.wheelSpin;

      viewProgress.routeLineProgress = p;

      /*
       * Buyの終端カメラ位置から始める。V.camera.buy を起点にすると、
       * 周回の終わり(斜め後ろ)から正面へワープしたように見える。
       */
      /*
       * 車が奥(-Z)へ走る分、カメラと注視点を丸ごと一緒に送る。
       *
       * カメラを据え置きにすると車はただ小さくなって消えるだけで、
       * 「走っている」感じが出ない。並走させることで、
       * 車の速度が背景(霧・塵)との相対運動として伝わる。
       *
       * 並走の基準は「常に車の後方 V.camera.find.z の距離」。
       * Buyの周回終端(車の斜め後ろ)から、この定位置へ寄せていく。
       */
      camera(BUY_END_CAMERA, V.camera.find, p);
      viewProgress.cameraZ = mix(
        BUY_END_CAMERA.z,
        viewProgress.bodyZ + V.camera.find.z,
        p,
      );
      viewProgress.lookAtZ = viewProgress.bodyZ;
    },
  },

  /*
   * CONTACT — 減速し、タイヤが止まり、ライトが落ち、暗闇に輪郭だけが残る。
   * 問い合わせへの誘導ではなく、体験の余韻として終わらせる。
   */
  contact: {
    scrub: 1,
    apply(p) {
      viewProgress.bodyX = mix(START.contact.x, V.contact.toX, p);
      viewProgress.bodyRotationY = mix(
        START.contact.rotationY,
        V.contact.toRotationY,
        p,
      );

      /*
       * タイヤは車体が停まりきる手前で止まる。惰性が抜ける感じ。
       * Find終端の角度から**さらに足す**方向にしないと、
       * 区間の入口で角度が巻き戻って逆回転して見える。
       */
      viewProgress.wheelAngle =
        WHEEL.findEnd + slice(p, 0, V.contact.wheelStopAt) * WHEEL.coast;

      /* ライトは最後に落ちる。消えきると輪郭だけが残る */
      viewProgress.headlightIntensity = 1 - slice(p, 0.35, V.contact.lightOutAt);

      viewProgress.routeLineProgress = 1 - p;

      /* Findと同じ並走の定位置を保ったまま、静かに停止まで持っていく */
      camera(V.camera.find, V.camera.contact, p);
      viewProgress.cameraZ = viewProgress.bodyZ + mix(
        V.camera.find.z,
        V.camera.contact.z,
        p,
      );
      viewProgress.lookAtZ = viewProgress.bodyZ;
    },
  },
};

/*
 * 区間ごとのスクロール範囲。
 *
 * ═══════════════════════════════════════════════════════════════
 *  pin する区間としない区間
 *
 *  車両が大きく動く4区間はセクションごと画面に固定し、
 *  その間のスクロールを車両アニメーションに充てる。
 *  固定しないと、セクションの縦を伸ばした分だけコピーが
 *  上に流れ去り、車だけが動く画面になる(実測で確認)。
 *
 *  Contactだけは固定しない。フォームを画面に貼り付けると
 *  送信するまでページが先に進めなくなる。
 * ═══════════════════════════════════════════════════════════════
 */
const SEGMENT_SCROLL: Record<
  Exclude<VehicleSection, "hero">,
  { start: string; end: string; pin: boolean }
> = {
  philosophy: { start: "top top", end: SCROLL.vehiclePin.philosophy, pin: true },
  sell: { start: "top top", end: SCROLL.vehiclePin.sell, pin: true },
  buy: { start: "top top", end: SCROLL.vehiclePin.buy, pin: true },
  find: { start: "top top", end: SCROLL.vehiclePin.find, pin: true },
  /* 固定しないので、セクションが画面を通過する間を範囲にする */
  contact: { start: "top bottom", end: "bottom bottom", pin: false },
};

/**
 * セクションのルート要素に、その区間の車両制御を紐づける。
 *
 * pin もこのフックが行う。セクションごとにScrollTriggerを1つに
 * 保つことで、「同じ状態を別のトリガーが書く」状況を作らない。
 *
 * @param ref     セクションのルート(ScrollTriggerのtriggerになる)
 * @param section どの区間か
 */
export function useVehicleSegment(
  ref: React.RefObject<HTMLElement | null>,
  section: Exclude<VehicleSection, "hero">,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /*
     * reduced-motion では車両アニメーション自体を動かさない。
     * 3Dシーンもマウントされないため、値を書いても意味がない。
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const config = SEGMENTS[section];
    const range = SEGMENT_SCROLL[section];

    const st = ScrollTrigger.create({
      id: `vehicle-${section}`,
      trigger: el,
      start: range.start,
      end: range.end,
      pin: range.pin,
      /*
       * pinSpacing は既定(true)のまま。false にすると、pin解放後に
       * 要素が区間の末尾へずらされ、次のセクションのコピーと
       * 画面上で重なる(実測: Sellの文言がBuyの上に出た)。
       */
      scrub: config.scrub,
      onUpdate(self) {
        config.apply(self.progress);
      },
      /*
       * 区間の識別は4方向すべてで書く。onEnter/onLeave だけだと
       * 逆スクロールで current が更新されず判定が壊れる。
       */
      onEnter: () => (vehicleSection.current = section),
      onEnterBack: () => (vehicleSection.current = section),
    });

    return () => st.kill();
  }, [ref, section]);
}
