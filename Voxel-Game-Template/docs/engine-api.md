# Boxel Voxel Engine — API Reference

## Overview

ボクセルモデルをJSONファイルから読み込み、Three.jsシーン上にレンダリングするエンジン。
階層パーツ構造、パレットカラーリング、キーフレームアニメーション、InstancedMesh による描画最適化をサポート。

コアファイル:
- `src/engine/VoxelEntity.js` — モデル構築・レンダリング
- `src/engine/AnimationController.js` — キーフレーム補間・ブレンド

> ⚠️ `src/engine/` 内のファイルは変更不可。バグを見つけた場合は Voxel-Entity-Editor プロジェクト側で修正すること。

---

## VoxelEntity

### コンストラクタ

```javascript
import { VoxelEntity } from '../engine/VoxelEntity.js';

const entity = new VoxelEntity(definition, options);
```

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `definition` | `Object` | エンティティJSON定義 (→ entity-format.md 参照) |
| `options.position` | `[x, y, z]` | ワールド座標 |
| `options.rotation` | `number` | Y軸回転 (ラジアン) |
| `options.scale` | `number` | 均一スケール |

### プロパティ

| プロパティ | 型 | 説明 |
|----------|------|------|
| `root` | `THREE.Group` | Three.jsルートオブジェクト |
| `partGroups` | `{[name]: THREE.Group}` | パーツ名→グループのマップ |
| `animController` | `AnimationController` | アニメーション制御 |
| `definition` | `Object` | 元のJSON定義 |
| `voxelSize` | `number` | ボクセルサイズ (default: 1) |
| `materials` | `THREE.Material[]` | パレットに対応するマテリアル配列 |

### メソッド

| メソッド | 説明 |
|--------|------|
| `addTo(parent)` | `scene.add(entity.root)` のラッパー |
| `removeFrom(parent)` | `scene.remove(entity.root)` のラッパー |
| `update(dt)` | **毎フレーム呼出必須。** アニメーション更新 |
| `playAnimation(name)` | アニメーション再生開始（自動ブレンド） |
| `getAnimationNames()` | `string[]` 利用可能アニメーション名一覧 |
| `rebuildPart(partName)` | ランタイムでボクセルデータ変更後にメッシュを再構築 |
| `getVoxelMeshes()` | レイキャスト対象の InstancedMesh 配列を返す |
| `dispose()` | **削除時に必須呼出。** GPU リソース解放 |

### 典型的な使用パターン

```javascript
// 1. ロード
const res = await fetch('/presets/RPG_Characters/Knight.json');
const def = await res.json();

// 2. 生成
const knight = new VoxelEntity(def, {
  position: [5, 0, 3],
  scale: 0.6,
});
knight.addTo(scene);

// 3. アニメーション
knight.playAnimation('walk');

// 4. 毎フレーム更新
knight.update(deltaTime);

// 5. Three.js標準の操作
knight.root.position.set(10, 0, 5);
knight.root.rotation.y = Math.PI / 2;

// 6. クリーンアップ (必須)
knight.removeFrom(scene);
knight.dispose();
```

### パフォーマンスのための定義キャッシュ

同じエンティティを複数生成する場合、JSONの `fetch` + `parse` を1回だけ行い、
同じ `def` オブジェクトから複数の `VoxelEntity` を生成できる:

```javascript
// 定義を1回だけ取得
const goblinDef = await fetch('/presets/TD_Enemies/Goblin.json').then(r => r.json());

// 同じ定義から複数インスタンスを生成
for (let i = 0; i < 10; i++) {
  const g = new VoxelEntity(goblinDef, {
    position: [i * 3, 0, 0],
    scale: 0.5,
  });
  g.addTo(scene);
  g.playAnimation('walk');
}
```

---

## AnimationController

通常 `entity.animController` 経由でアクセス。

### プロパティ

| プロパティ | 型 | 説明 |
|----------|------|------|
| `playing` | `boolean` | 再生中かどうか |
| `speed` | `number` | 再生速度倍率 (default: 1.0) |
| `time` | `number` | 現在の再生時刻 (秒) |
| `blending` | `boolean` | ブレンド遷移中かどうか |

### メソッド

| メソッド | 説明 |
|--------|------|
| `play(name, animDef, restart?)` | アニメーション開始（自動ブレンド遷移） |
| `stop()` | 再生停止 (現在のポーズで固定) |
| `update(dt)` | `{[partName]: {rotation, position}}` を返す |
| `seekTo(normalizedTime)` | 指定時刻にジャンプ (再生停止) |
| `getTransformsAt(animDef, normalizedTime)` | 副作用なしで指定時刻のポーズを取得 |

### 速度制御

```javascript
entity.animController.speed = 0.5;  // スロー再生
entity.animController.speed = 2.0;  // 倍速再生
```

---

## レイキャスティング

InstancedMesh に対するレイキャストは Three.js 標準で対応:

```javascript
const raycaster = new THREE.Raycaster();
raycaster.setFromCamera(mouse, camera);

const meshes = entity.getVoxelMeshes(); // InstancedMesh[]
const hits = raycaster.intersectObjects(meshes, false);

if (hits.length > 0) {
  const hit = hits[0];
  const instanceId = hit.instanceId;
  const voxelMap = hit.object.userData.voxelMap;
  const { coord } = voxelMap[instanceId]; // [x, y, z] ボクセル座標
  const partName = hit.object.userData.partName;
}
```

---

## パフォーマンスノート

- **InstancedMesh**: 同色ボクセルをバッチ化。ドローコール数 = パレット色数/パーツ
- **dispose() 必須**: 呼ばないと GPU メモリがリークする
- **推奨エンティティ数**: 同時100体程度まで快適。200体以上はLOD/カリング検討
- **定義キャッシュ**: 同一タイプの定義JSONは1回だけfetchしてキャッシュ
