/*
 * Opening Animation の完了と、Hero の入場アニメーションを同期させるための橋渡し。
 *
 * Heroのマウントは Opening がまだ画面を覆っている間に起きる。そのまま即再生すると、
 * 雲が晴れる頃には演出が終わっており、静止した状態しか見えない。
 * 逆に遅すぎれば、Heroが空白のまま現れてしまう。
 * そこで Opening 側が「雲が晴れ始める」瞬間に合図を出し、Hero はそれを待って再生する。
 *
 * Opening をスキップした場合・2回目以降の訪問・reduced motion では、
 * markOpeningDone() が即座に呼ばれるため Hero はすぐ再生される。
 */

type Listener = () => void;

let done = false;
let listeners: Listener[] = [];

/**
 * Opening完了(または不要と判断された)タイミングで実行するコールバックを登録する。
 * 既に完了済みなら即座に実行する。戻り値は解除関数。
 */
export function onOpeningDone(listener: Listener): () => void {
  if (done) {
    listener();
    return () => {};
  }
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/** Openingの完了を通知する。待機中のコールバックをすべて実行する。 */
export function markOpeningDone() {
  if (done) return;
  done = true;
  const queued = listeners;
  listeners = [];
  queued.forEach((listener) => listener());
}

/** Openingを再生すべきか(初回訪問のみ・セッション単位)。 */
export function shouldPlayOpening(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem("foresight:opening") !== "seen";
  } catch {
    // プライベートブラウジング等でsessionStorageが使えない場合は再生する
    return true;
  }
}

/** Openingを再生済みとして記録する。 */
export function markOpeningSeen() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem("foresight:opening", "seen");
  } catch {
    // 記録できなくても体験は成立するため無視する
  }
}
