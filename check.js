import fs from 'fs';

function getBounds(def) {
  const parts = def.parts;
  const groups = {};
  for (const p of parts) {
    groups[p.name] = { pos: p.position || [0,0,0], bounds: [Infinity, -Infinity, Infinity, -Infinity], voxels: p.voxels };
  }
  for (const p of parts) {
    let parentPos = [0,0,0];
    if (p.parent) {
      const par = groups[p.parent];
      parentPos = par ? par.pos : [0,0,0];
    }
    const worldPos = [p.position[0] + parentPos[0], p.position[1] + parentPos[1], p.position[2] + parentPos[2]];
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const v of groups[p.name].voxels) {
      const wx = (v[0] - p.center[0] + 0.5) + worldPos[0];
      const wz = (v[2] - p.center[2] + 0.5) + worldPos[2];
      if (wx - 0.5 < minX) minX = wx - 0.5;
      if (wx + 0.5 > maxX) maxX = wx + 0.5;
      if (wz - 0.5 < minZ) minZ = wz - 0.5;
      if (wz + 0.5 > maxZ) maxZ = wz + 0.5;
    }
    console.log(`${def.name} -> ${p.name}: X[${minX.toFixed(1)}, ${maxX.toFixed(1)}] Z[${minZ.toFixed(1)}, ${maxZ.toFixed(1)}]`);
  }
}

try {
  getBounds(JSON.parse(fs.readFileSync('public/presets/RPG_Characters/Mage.json')));
  getBounds(JSON.parse(fs.readFileSync('public/presets/TD_Enemies/Giant Spider.json')));
  getBounds(JSON.parse(fs.readFileSync('public/presets/RPG_Characters/Bat.json')));
  getBounds(JSON.parse(fs.readFileSync('public/presets/TD_Bases_and_Traps/Spike Trap.json')));
  getBounds(JSON.parse(fs.readFileSync('public/presets/TD_Towers/Laser Tower.json')));
} catch (e) { console.error(e); }
