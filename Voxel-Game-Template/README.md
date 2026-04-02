# 🧊 Boxel Voxel Game Template

Three.js ベースのボクセルレンダリングエンジンを使ったゲーム開発テンプレート。

## クイックスタート

```bash
npm install
npm run dev
```

http://localhost:3000 でデモ (Knight のアイドルアニメーション) が表示されます。

## 構造

| ディレクトリ | 内容 |
|-------------|------|
| `src/engine/` | ボクセルレンダリングエンジン (⛔ 変更禁止) |
| `src/game/` | ゲームロジック (✅ ここに実装) |
| `public/presets/` | ボクセルエンティティJSON (30種+) |
| `docs/` | エンジンAPI・データ形式・プリセットカタログ |
| `.agent/` | AIエージェント向けコンテキスト |

## ドキュメント

- [Engine API](docs/engine-api.md) — VoxelEntity & AnimationController
- [Entity Format](docs/entity-format.md) — JSON データ形式仕様
- [Presets Catalog](docs/presets.md) — 利用可能プリセット一覧 (30種+)

## 利用可能アセット

- **RPGキャラクター 11種**: Knight, Mage, Archer, Skeleton, Cat, Dog 等
- **TDタワー 6種**: Arrow, Cannon, Ice, Laser, Magic, Poison
- **TD敵 5種**: Goblin, Orc, Troll, Gargoyle, Giant Spider
- **拠点・罠 6種**: Castle Base, Stone Wall, Spike Trap 等
- **装飾プロップ 13種**: Tree, Rock, House, Campfire 等

## ゲーム開発の進め方

1. `src/game/main.js` の `init()` 関数を編集してゲームを構築
2. 必要に応じてモジュール分割 (`src/game/` 内にファイル追加)
3. UIは `#ui-root` に追加 (pointer-events は個別に有効化)
4. プリセットカタログ (`docs/presets.md`) からアセットを選択して使用
