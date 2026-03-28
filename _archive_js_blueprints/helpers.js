/**
 * VoxelData helpers - Utilities for building voxel definitions.
 * Used to author entity data in a readable and composable way.
 */

/** Fill a box region with a single color. Returns voxel array. */
export function box(sx, sy, sz, w, h, d, colorIdx) {
  const voxels = [];
  for (let x = sx; x < sx + w; x++)
    for (let y = sy; y < sy + h; y++)
      for (let z = sz; z < sz + d; z++)
        voxels.push([x, y, z, colorIdx]);
  return voxels;
}

/** Merge multiple voxel arrays. Later entries override earlier at same position. */
export function mergeVoxels(...layers) {
  const map = new Map();
  for (const layer of layers) {
    for (const v of layer) {
      map.set(`${v[0]},${v[1]},${v[2]}`, v);
    }
  }
  return Array.from(map.values());
}

/** Remove voxels at specific positions. */
export function removeAt(voxels, positions) {
  const removeSet = new Set(positions.map(p => `${p[0]},${p[1]},${p[2]}`));
  return voxels.filter(v => !removeSet.has(`${v[0]},${v[1]},${v[2]}`));
}

/** Set specific voxels (position + color). */
export function setVoxels(...entries) {
  return entries.map(e => [e[0], e[1], e[2], e[3]]);
}

/**
 * Parse string-based voxel layers.
 * Each layer is a string with rows separated by newlines.
 * Each character maps to a color via colorMap. '.' = empty.
 * layers[0] = y=0 (bottom), rows go front(z=0) to back,
 * columns go left(x=0) to right.
 */
export function parseLayers(layers, colorMap) {
  const voxels = [];
  layers.forEach((layerStr, y) => {
    const rows = layerStr.trim().split('\n').map(r => r.trim());
    rows.forEach((row, z) => {
      [...row].forEach((ch, x) => {
        if (ch !== '.' && colorMap[ch] !== undefined) {
          voxels.push([x, y, z, colorMap[ch]]);
        }
      });
    });
  });
  return voxels;
}
