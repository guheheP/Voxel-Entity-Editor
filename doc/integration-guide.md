# 🧊 Voxel Engine Integration Guide

このドキュメントでは、本プロジェクト（VoxelGame01）で構築された**ボクセルレンダリングエンジン**を、他のゲーム開発プロジェクト（特にThree.jsを用いたプロジェクト）に組み込んで使用するための具体的な手順とベストプラクティスを解説します。

---

## 📂 1. 必要なファイルの組み込み

このエンジンは外部ライブラリとしてパッケージ化されていませんが、わずか数ファイルをあなたのプロジェクトにコピーするだけで完全に動作します。

以下のディレクトリ・コードをあなたのプロジェクトのソースコード内にコピーしてください。

*   `src/engine/VoxelEntity.js` (モデル構築とプロパティ管理)
*   `src/engine/AnimationController.js` (アニメーション補間と再生ロジック)

> [!NOTE]
> `VoxelEngine.js` はThree.jsのシーン構築・レンダーループのサンプル（ラッパー）に過ぎません。すでにThree.jsのシーンやレンダリングループが構築されている既存プロジェクトに組み込む場合は、`VoxelEngine.js` は不要です。

## 📦 2. 依存関係 (Dependencies)

このエンジンは完全に **Three.js** に依存しています。
開発先のプロジェクトに以下のパッケージがインストールされていることを確認してください。

```bash
npm install three
```
*(※エディターと同じ挙動を保証するため、バージョン `^0.172.0` 以上を推奨します)*

---

## 🚀 3. 基本的な使い方

既存のThree.jsシーンに、エディターからエクスポートしたJSONキャラクターを追加してアニメーションを再生する基本フローです。

### ステップ 1: JSONファイルの読み込みとインスタンス化

`fetch()` などでJSONデータを読み込み、`VoxelEntity` クラスに渡します。

```javascript
import * as THREE from 'three';
import { VoxelEntity } from './path/to/engine/VoxelEntity.js';

// 1. JSONデータを取得
const response = await fetch('path/to/Chibi Human.json');
const entityDef = await response.json();

// 2. エンティティを初期化
const character = new VoxelEntity(entityDef);

// 3. Three.jsのシーンに追加
// character.root は THREE.Group オブジェクトです
scene.add(character.root); 
// または character.addTo(scene);
```

### ステップ 2: 座標・スケールの調整

`character.root` は通常の `THREE.Group` のため、Three.js標準のプロパティをそのまま操作できます。

```javascript
// 位置の変更
character.root.position.set(10, 0, 5);

// 向きの変更 (Y軸回転)
character.root.rotation.y = Math.PI / 2;

// スケールの変更
character.root.scale.set(2, 2, 2);
```

### ステップ 3: アニメーションの再生と更新ループ

アニメーションを再生し、毎フレームの更新 `update(dt)` をフックします。

```javascript
// アニメーションの再生開始
// 引数には、エディターで名付けたアニメーション名(例: 'walk', 'idle')を指定します
character.playAnimation('walk');

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  // デルタタイム(前フレームからの経過時間、秒単位)を計算
  const delta = clock.getDelta();
  
  // 毎フレーム必ず update() を呼び出し、各パーツの再計算を行う
  character.update(delta);
  
  renderer.render(scene, camera);
}
animate();
```

---

## 🎮 4. 高度なアニメーション制御

`AnimationController.js` は、アニメーションを自然に見せるための高度な機能を持っています。

### アニメーションの切り替え（スムーズなブレンド）
現在のアニメーションから別のアニメーションに切り替える際、エンジンは自動的に**ボーン（パーツ）間のスムーズなブレンド（補間）**を行います。
特別な設定は必要なく、単に `playAnimation()` を呼ぶだけです。

```javascript
// プレイヤーの入力に応じてリアルタイムに切り替える例
window.addEventListener('keydown', (e) => {
  if (e.key === 'w') {
    character.playAnimation('walk'); // 自動的に blend() が実行される
  } else if (e.key === ' ') {
    character.playAnimation('attack');
  }
});
```

### 再生スピードの変更
スローモーションや、キャラクターの移動速度に応じた歩行アニメーションの加速などが可能です。

```javascript
// 2倍速で再生する
character.animController.speed = 2.0;

// スピードを動的に変える例
character.animController.speed = playerVelocity.length() * 0.5;
```

---

## 🛠️ まとめと制限事項

> [!TIP]
> - このエンジンは内部的に多数の `THREE.Mesh` オブジェクトを `THREE.Group` にぶら下げて構築されています。（スキンメッシュ・ボーンアニメーション機能 `THREE.SkinnedMesh` ではなく、オブジェクトベースの階層トランスフォームを使用しています）
> - メモリとドローコールの最適化より、「分かりやすさ」と「エディターとの完全な連携」を重視して作られています。何百体ものエンティティを同時に描画するモブゲームなどの場合は工夫（インスタンシングなど）が必要です。

> [!IMPORTANT]
> エンティティをシーンから削除する際、メモリリークを防ぐために必ず `dispose()` を呼び出してください。
> ```javascript
> scene.remove(character.root);
> character.dispose(); // 内部のGeometryやMaterialなどのGPUリソースを解放します
> ```
