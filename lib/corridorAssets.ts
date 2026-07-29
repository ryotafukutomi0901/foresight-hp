/*
 * 回廊テクスチャ(10枚・約790KB)の取得タイミングを制御する。
 *
 * 回廊は gateProgress により What We Can Do に入るまで一切描画されないのに、
 * useTexture がマウント時点で走るため、初期表示で全部落ちてきていた。
 * 描画されないものを初回訪問の転送量に載せているだけなので、
 * 「近づいたら取りに行く」へ変える。
 *
 * ただし到達してから取りに行くとポップインするため、
 * Narrative の手前(2画面分)で先読みを始める。BrandMessage と Unseen の
 * 2セクションを挟むので、通常のスクロール速度なら余裕を持って間に合う。
 *
 * Reactのstateではなくモジュールスコープに置く理由:
 *   armはページ全体で1回だけ起きる不可逆な事象で、所有者となるコンポーネントが
 *   存在しない(書き込むのはNarrative、読むのはCanvas内のNarrativeCorridor)。
 *   contextで繋ぐとCanvas境界をまたぐことになり、R3Fでは扱いが煩雑になる。
 */

let armed = false;
const listeners = new Set<() => void>();

/** 先読みを開始する。冪等。 */
export function armCorridorAssets() {
  if (armed) return;
  armed = true;
  for (const notify of listeners) notify();
}

export function subscribeCorridorAssets(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

export function isCorridorArmed() {
  return armed;
}

/**
 * SSR用。サーバーでは常に false を返す。
 * useSyncExternalStore はサーバースナップショットを別に要求するため分けている。
 */
export function isCorridorArmedOnServer() {
  return false;
}
