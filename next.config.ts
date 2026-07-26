import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // モノレポ直下のlockfileをワークスペース根と誤検出するのを防ぐ
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // 素材(鷹・雲)は写真的内容にPNGが使われており合計5.9MBある。
    // AVIF/WebPへ自動変換して転送量を落とす。
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
