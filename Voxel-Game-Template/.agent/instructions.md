---
description: Boxel Voxel Game Template — AI Agent Context & Rules
---

# Boxel Voxel Game Template — プロジェクトコンテキスト

## プロジェクト概要

Three.js ベースのカスタム **ボクセルレンダリングエンジン** を使ったゲーム開発テンプレート。
30種以上のプリセットボクセルエンティティ (キャラクター、タワー、敵、プロップ) を含む。

## テックスタック

- **ランタイム**: Vanilla JavaScript (ES Modules)
- **3Dエンジン**: Three.js (v0.172+)
- **ビルドツール**: Vite
- **アセット**: public/presets/ にあるボクセルエンティティJSON

## 必読ドキュメント

**コードを書く前に必ず以下を読むこと:**

1. `docs/engine-api.md` — VoxelEntity & AnimationController API リファレンス
2. `docs/entity-format.md` — エンティティJSONフォーマット仕様
3. `docs/presets.md` — 利用可能なプリセット全カタログ + コード例

## プロジェクト構造

```
Project/
├── index.html                    # エントリポイント
├── package.json
├── vite.config.js
├── src/
│   ├── engine/                   # ⛔ 変更禁止 — ボクセルエンジン
│   │   ├── VoxelEntity.js        # エンティティ構築 & InstancedMesh レンダリング
│   │   └── AnimationController.js # キーフレームアニメーション & ブレンド
│   ├── game/                     # ✅ ゲームロジック (ここに実装する)
│   │   └── main.js               # エントリポイント (Three.jsシーン含む)
│   └── styles.css                # UI スタイル
├── public/
│   ├── presets.json              # プリセット一覧マニフェスト
│   └── presets/                  # ボクセルエンティティJSON群
│       ├── RPG_Characters/       # 11種 (Knight, Mage, etc.)
│       ├── RPG_Props/            # 13種 (Tree, Rock, House, etc.)
│       ├── TD_Towers/            # 6種 (Arrow, Cannon, Magic, etc.)
│       ├── TD_Enemies/           # 5種 (Goblin, Orc, Troll, etc.)
│       └── TD_Bases_and_Traps/   # 6種 (Castle, Wall, etc.)
└── docs/                         # エンジン & アセット ドキュメント
```

## 絶対に守るべきルール

### 1. `src/engine/` は変更禁止
エンジンファイルは Voxel-Entity-Editor プロジェクトと共有のテスト済みコード。
ゲーム側で変更しないこと。

### 2. dispose() を必ず呼ぶ
エンティティを削除する時は **必ず** `entity.dispose()` を呼ぶこと。
呼ばないと GPU メモリがリークし、長時間プレイでパフォーマンスが劣化する。

```javascript
// ❌ NG — メモリリーク
scene.remove(entity.root);

// ✅ OK — 正しいクリーンアップ
entity.removeFrom(scene);
entity.dispose();
```

### 3. 毎フレーム update() を呼ぶ
全てのアクティブなエンティティに対して `entity.update(dt)` を毎フレーム呼ぶこと。
アニメーションが再生されていなくてもトランスフォーム同期のために必要。

### 4. 定義JSONをキャッシュする
同じエンティティを複数生成する場合、`fetch` は1回だけ行い、
同じ `def` オブジェクトから複数の `VoxelEntity` を生成する。

```javascript
// ✅ 正しいパターン — 1回fetch, N回生成
const goblinDef = await fetch('/presets/TD_Enemies/Goblin.json').then(r => r.json());
for (let i = 0; i < 10; i++) {
  const g = new VoxelEntity(goblinDef, { position: [i*3, 0, 0], scale: 0.5 });
}
```

### 5. エンティティのスケールに注意
プリセットは `voxelSize: 1` で設計されており、そのままでは大きすぎることが多い。
用途に応じて `scale: 0.3 - 1.0` を指定すること (詳細は docs/presets.md)。

## エンティティの基本操作

```javascript
import { VoxelEntity } from '../engine/VoxelEntity.js';

// ロード
const def = await fetch('/presets/RPG_Characters/Knight.json').then(r => r.json());
const knight = new VoxelEntity(def, { position: [0, 0, 0], scale: 0.6 });
knight.addTo(scene);

// アニメーション
knight.playAnimation('walk');
knight.animController.speed = 1.5; // 速度変更

// 移動 (Three.js標準)
knight.root.position.x += speed * dt;
knight.root.rotation.y = Math.atan2(dx, dz);

// 毎フレーム更新
knight.update(dt);

// 削除
knight.removeFrom(scene);
knight.dispose();
```

## 開発

```bash
npm install
npm run dev    # http://localhost:3000
```
