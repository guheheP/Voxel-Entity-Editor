# エンティティ JSON フォーマット仕様

## 概要

各ボクセルエンティティは `.json` ファイルで定義される。
階層パーツ構造、パレットベースの色付け、キーフレームアニメーションを持つ。

---

## スキーマ

```jsonc
{
  "name": "Knight",               // 表示名
  "type": "humanoid",             // エンティティタイプ (後述)
  "voxelSize": 1,                 // ボクセル1個のワールド単位サイズ
  "palette": [                    // 色パレット (hex文字列の配列)
    "#8B4513",                    // インデックス 0
    "#A0A0A0",                    // インデックス 1
    "#FFD700"                     // インデックス 2
  ],
  "parts": [                      // パーツ配列 (階層構造)
    {
      "name": "body",             // パーツ名 (ユニーク)
      "parent": null,             // 親パーツ名 (null = ルート)
      "position": [0, 0, 0],     // 親空間での位置 (voxelSize単位)
      "center": [2, 0, 2],       // ローカルピボット (回転中心)
      "voxels": [                 // [x, y, z, paletteIndex] の配列
        [0, 0, 0, 0],
        [1, 0, 0, 1],
        [0, 1, 0, 2]
      ]
    }
  ],
  "animations": {                 // 名前付きアニメーション
    "idle": {
      "duration": 2.0,            // 秒
      "loop": true,               // ループ再生
      "keyframes": [
        {
          "time": 0.0,            // 正規化時間 (0.0 〜 1.0)
          "parts": {
            "rightArm": {
              "rotation": [0, 0, 0.2],    // [rx, ry, rz] ラジアン
              "position": [0, 0, 0]        // [dx, dy, dz] rest位置からのオフセット
            }
          }
        },
        {
          "time": 1.0,
          "parts": {
            "rightArm": {
              "rotation": [0, 0, -0.2]
            }
          }
        }
      ]
    }
  }
}
```

---

## パーツ階層

パーツは木構造を形成する。親パーツの回転・移動は全子パーツに伝播する。

```
root (entity.root)
├── body (parent: null)
│   ├── head (parent: "body")
│   ├── rightArm (parent: "body")
│   ├── leftArm (parent: "body")
│   ├── rightLeg (parent: "body")
│   └── leftLeg (parent: "body")
```

- **position**: 親パーツのピボットからの相対位置
- **center**: ローカルのボクセルグリッド内での回転中心

---

## 座標系

- **X**: 右 (+) / 左 (-)
- **Y**: 上 (+) / 下 (-)
- **Z**: 前 (+) / 後 (-)
- ボクセルは整数グリッド座標に配置
- 各ボクセルのワールドサイズ = `voxelSize` (通常1.0)

---

## アニメーション補間

- キーフレーム間は **smoothstep** で補間
- `playAnimation()` で切替時、現在のポーズから自動 **ブレンド遷移** (約0.3秒)
- キーフレームの `parts` に記載されていないパーツはそのままのポーズを維持

---

## エンティティタイプ一覧

| type | 説明 | 典型的パーツ |
|------|------|-------------|
| `humanoid` | 二足歩行キャラ | body, head, rightArm, leftArm, rightLeg, leftLeg |
| `quadruped` | 四足歩行クリーチャー | body, head, frontRightLeg, frontLeftLeg, backRightLeg, backLeftLeg |
| `static` | 静的オブジェクト | base (単一パーツ) |
| `tower` | TDタワー | base, turret, barrel (型による) |
| `prop` | 環境装飾 | 様々 |
