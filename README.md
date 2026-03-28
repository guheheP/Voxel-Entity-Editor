# 🧊 Voxel Entity Editor & Engine

ボクセルアートスタイルのゲーム向け **エンティティエディター** と **レンダリングエンジン** です。
ブラウザ上でボクセルキャラクターやオブジェクトの作成、アニメーション編集、JSON形式でのインポート/エクスポートが可能です。

![Editor Screenshot](docs/screenshot.png)

## ✨ 主な機能

### エディター (`/editor.html`)
- **ボクセルペイントツール** — Place（ブロック配置）/ Erase（削除）/ Paint（色塗り）/ Select（選択）
- **ミラーペイント** — X軸対称配置
- **パーツ管理** — 階層ツリー、リネーム、複製、削除、parent設定
- **カラーパレット** — 追加、ダブルクリックで色変更
- **アニメーションエディター** — タイムライン、キーフレーム追加/削除、パーツごとのrot/pos編集
- **再生プレビュー** — 速度調整（0.1x〜3x）、プレイヘッド同期
- **ビューポートテーマ** — Dark / Daylight / Studio / Neutral + Brightness調整
- **永続化** — localStorage自動保存、JSON Export/Import
- **Undo/Redo** — Ctrl+Z / Ctrl+Y

### エンジン (`src/engine/`)
- **VoxelEntity** — JSONデータからボクセルモデルを構築・レンダリング
- **AnimationController** — キーフレーム補間、ブレンド、ループ再生
- **VoxelEngine** — Three.jsベースのシーン管理

### プレビュー (`/`)
- プリセットエンティティのアニメーション表示デモ

## 🗂 プロジェクト構造

```
VoxelGame01/
├── index.html              # プレビューページ
├── editor.html             # エディターページ
├── vite.config.js          # Viteマルチページ設定
├── package.json
└── src/
    ├── main.js             # プレビューエントリーポイント
    ├── styles.css           # プレビュー用CSS
    ├── engine/
    │   ├── VoxelEngine.js       # Three.jsシーン管理
    │   ├── VoxelEntity.js       # ボクセルエンティティ構築・描画
    │   └── AnimationController.js # アニメーション再生・補間
    ├── editor/
    │   ├── editor-main.js       # エディターUI・ロジック
    │   ├── editor-styles.css    # エディター用CSS
    │   ├── EditorState.js       # 状態管理 + Undo/Redo
    │   └── tools/
    │       ├── EditorTools.js   # ペイント/消しゴム/塗り/選択
    │       └── VoxelRaycaster.js # マウス→ボクセル座標変換
    ├── data/
    │   ├── helpers.js           # 色生成ユーティリティ
    │   ├── entities/
    │   │   ├── humanoid.js      # 人型プリセット
    │   │   └── cat.js           # 猫プリセット
    │   └── objects/
    │       ├── house.js         # 家
    │       ├── streetLight.js   # 街灯
    │       └── fence.js         # 柵
    └── ui/
        └── ControlPanel.js      # プレビュー用UIパネル
```

## 🚀 セットアップ

```bash
npm install
npm run dev
```

- **エディター**: http://localhost:3000/editor.html
- **プレビュー**: http://localhost:3000/

## 📦 エクスポートデータの利用

エディターから Export JSON でダウンロードしたデータは、エンジンでそのまま使用できます：

```javascript
import { VoxelEntity } from './engine/VoxelEntity.js';

// JSONを読み込み
const response = await fetch('character.json');
const entityDef = await response.json();

// Three.jsシーンに追加
const entity = new VoxelEntity(entityDef);
entity.addTo(scene);

// アニメーション再生
entity.playAnimation('walk');

// レンダーループ
function animate() {
  requestAnimationFrame(animate);
  entity.update(deltaTime);
  renderer.render(scene, camera);
}
```

## 📋 エンティティデータ形式 (JSON)

```json
{
  "name": "Chibi Human",
  "type": "Humanoid",
  "voxelSize": 1,
  "palette": ["#4a7abf", "#f5c5a3", ...],
  "parts": [
    {
      "name": "body",
      "position": [0, 0, 0],
      "center": [2, 0, 2],
      "parent": null,
      "voxels": [[0, 0, 0, 0], [1, 0, 0, 0], ...]
    }
  ],
  "animations": {
    "walk": {
      "duration": 0.8,
      "loop": true,
      "keyframes": [
        {
          "time": 0,
          "parts": {
            "rightArm": { "rotation": [0.3, 0, 0] },
            "leftLeg": { "rotation": [-0.3, 0, 0] }
          }
        }
      ]
    }
  }
}
```

## ⌨️ ショートカット

| キー | 機能 |
|------|------|
| B | Place ツール |
| E | Erase ツール |
| P | Paint ツール |
| S | Select ツール |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+S | 明示的保存 |

## 🛠 技術スタック

- [Three.js](https://threejs.org/) — 3Dレンダリング
- [Vite](https://vitejs.dev/) — 開発サーバー・ビルド
- Vanilla JavaScript — フレームワーク不使用

## 📜 ライセンス

MIT
