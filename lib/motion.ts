import { CustomEase } from "@/hooks/useGsap";
import { easeCurves } from "@/lib/tokens";

/*
 * ブランドの緩急カーブを CustomEase として登録する。
 * ベジェ値は docs/motion-bible.md が正本で、lib/tokens.ts 経由で受け取る。
 * ここに数値を直書きしないこと（Token Freeze）。
 */

let registered = false;

export function registerBrandEases() {
  if (registered || typeof window === "undefined") return;
  registered = true;

  for (const [name, curve] of Object.entries(easeCurves)) {
    CustomEase.create(name, curve);
  }
}
