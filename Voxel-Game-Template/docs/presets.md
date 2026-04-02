# プリセットエンティティ カタログ

`public/presets/` にある全プリセットの一覧と使用方法。

## ロード方法

```javascript
import { VoxelEntity } from '../engine/VoxelEntity.js';

const res = await fetch('/presets/RPG_Characters/Knight.json');
const def = await res.json();
const entity = new VoxelEntity(def, { position: [x, y, z], scale: 0.6 });
entity.addTo(scene);
entity.playAnimation('idle'); // アニメーションがあれば
```

---

## RPG Characters (`/presets/RPG_Characters/`)

アニメーション付きキャラクター。idle, walk を持つものが多い。

| ファイル | 名前 | タイプ | アニメーション | 備考 |
|---------|------|--------|--------------|------|
| `Archer.json` | Archer | humanoid | idle, walk | 弓兵 |
| `Bat.json` | Bat | quadruped | idle, walk | コウモリ (飛行型) |
| `Bird.json` | Bird | quadruped | idle, walk | 鳥 (飛行型) |
| `Cat.json` | Cat | quadruped | idle, walk | 猫 |
| `Chibi Human.json` | Chibi Human | humanoid | idle, walk | 汎用ちびキャラ |
| `Dog.json` | Dog | quadruped | idle, walk | 犬 |
| `King.json` | King | humanoid | idle, walk | 王 |
| `Knight.json` | Knight | humanoid | idle, walk | 騎士 |
| `Mage.json` | Mage | humanoid | idle, walk | 魔法使い |
| `Skeleton.json` | Skeleton | humanoid | idle, walk | スケルトン |
| `Slime.json` | Slime | static | idle | スライム |

---

## TD Towers (`/presets/TD_Towers/`)

防衛タワー。base + turret の構成が多い。

| ファイル | 名前 | アニメーション | 備考 |
|---------|------|--------------|------|
| `Arrow Tower.json` | Arrow Tower | idle | 矢タワー |
| `Cannon Tower.json` | Cannon Tower | idle | 大砲タワー |
| `Ice Tower.json` | Ice Tower | idle | 氷タワー |
| `Laser Tower.json` | Laser Tower | idle | レーザータワー |
| `Magic Tower.json` | Magic Tower | idle | 魔法タワー |
| `Poison Tower.json` | Poison Tower | idle | 毒タワー |

---

## TD Enemies (`/presets/TD_Enemies/`)

敵キャラクター。walk アニメーション付き。

| ファイル | 名前 | タイプ | アニメーション | 備考 |
|---------|------|--------|--------------|------|
| `Goblin.json` | Goblin | humanoid | idle, walk | 高速・低HP |
| `Orc.json` | Orc | humanoid | idle, walk | 中速・中HP |
| `Troll.json` | Troll | humanoid | idle, walk | 低速・高HP |
| `Gargoyle.json` | Gargoyle | quadruped | idle, walk | 飛行型 |
| `Giant Spider.json` | Giant Spider | quadruped | idle, walk | 高速・低HP |

---

## TD Bases & Traps (`/presets/TD_Bases_and_Traps/`)

構造物・罠。

| ファイル | 名前 | 備考 |
|---------|------|------|
| `Barricade.json` | Barricade | バリケード |
| `Castle Base.json` | Castle Base | 城 (防衛拠点) |
| `Catapult.json` | Catapult | カタパルト |
| `Gold Mine.json` | Gold Mine | 金鉱 |
| `Spike Trap.json` | Spike Trap | スパイクトラップ |
| `Stone Wall.json` | Stone Wall | 石壁 |

---

## RPG Props (`/presets/RPG_Props/`)

環境装飾オブジェクト。

| ファイル | 名前 | 備考 |
|---------|------|------|
| `Anvil.json` | Anvil | 金床 |
| `Banner.json` | Banner | 旗 |
| `Barrel.json` | Barrel | 樽 |
| `Campfire.json` | Campfire | 焚火 |
| `Chest.json` | Chest | 宝箱 |
| `Fence.json` | Fence | フェンス |
| `House.json` | House | 家 |
| `Pine Tree.json` | Pine Tree | 松の木 |
| `Rock.json` | Rock | 岩 |
| `Street Light.json` | Street Light | 街灯 |
| `Tent.json` | Tent | テント |
| `Tree.json` | Tree | 木 |
| `Well.json` | Well | 井戸 |

---

## スケール目安

| 用途 | 推奨 scale |
|------|-----------|
| メインキャラ | `0.5 - 0.8` |
| NPC / 敵 | `0.4 - 0.7` |
| タワー / 建物 | `0.6 - 1.0` |
| 小プロップ | `0.3 - 0.5` |
| 大プロップ (家、城) | `0.8 - 1.2` |

---

## 一括生成パターン

```javascript
// 定義キャッシュ + 複数生成
const goblinDef = await fetch('/presets/TD_Enemies/Goblin.json').then(r => r.json());

function spawnGoblin(x, z) {
  const g = new VoxelEntity(goblinDef, {
    position: [x, 0, z],
    scale: 0.5,
  });
  g.addTo(scene);
  g.playAnimation('walk');
  return g;
}
```

## 全プリセットリスト取得

```javascript
const catalog = await fetch('/presets.json').then(r => r.json());
// catalog は [{ genre, items: [{ label, name, type, url }] }] の配列
```
