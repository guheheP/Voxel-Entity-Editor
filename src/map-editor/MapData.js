export default class MapData {
  constructor(sizeX = 32, sizeZ = 32) {
    this.name = "New Map";
    this.size = [sizeX, 8, sizeZ]; // default height is 8 for terrain
    
    // Default terrain palette
    this.terrainPalette = [
      '#7cfc00', // Grass
      '#8b4513', // Dirt
      '#808080', // Stone
      '#d2b48c', // Sand
      '#1e90ff'  // Water
    ];
    
    // x,y,z string -> palette index
    this.voxels = new Map();
    
    // Array of { id, preset, position: [x,y,z], rotation: [x,y,z] }
    this.objects = [];
    this.nextObjectId = 1;
    
    this._generateFlatFloor();
  }

  _generateFlatFloor() {
    this.voxels.clear();
    const sx = this.size[0];
    const sz = this.size[2];
    for (let x = 0; x < sx; x++) {
      for (let z = 0; z < sz; z++) {
        // Place grass at y=0
        this.setVoxel(x, 0, z, 0);
      }
    }
  }

  resize(sx, sz) {
    this.size[0] = sx;
    this.size[2] = sz;
    this._generateFlatFloor();
    this.objects = [];
  }

  // Terrain operations
  getVoxel(x, y, z) {
    return this.voxels.get(`${x},${y},${z}`);
  }

  setVoxel(x, y, z, colorIndex) {
    if (x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1] || z < 0 || z >= this.size[2]) return false;
    this.voxels.set(`${x},${y},${z}`, colorIndex);
    return true;
  }

  removeVoxel(x, y, z) {
    return this.voxels.delete(`${x},${y},${z}`);
  }

  // Convert map terrain to VoxelEntity part format
  getTerrainVoxelsList() {
    const list = [];
    for (const [key, colorIdx] of this.voxels.entries()) {
      const parts = key.split(',').map(Number);
      list.push([parts[0], parts[1], parts[2], colorIdx]);
    }
    return list;
  }

  // Object operations
  addObject(presetPath, position, rotation = [0,0,0]) {
    const obj = {
      id: this.nextObjectId++,
      preset: presetPath,
      position: [...position],
      rotation: [...rotation]
    };
    this.objects.push(obj);
    return obj;
  }

  removeObject(id) {
    const idx = this.objects.findIndex(o => o.id === id);
    if (idx >= 0) {
      this.objects.splice(idx, 1);
      return true;
    }
    return false;
  }

  // File I/O
  toJSON() {
    // Array format for smaller size
    const terrainArr = this.getTerrainVoxelsList();
    return {
      name: this.name,
      size: this.size,
      terrainPalette: this.terrainPalette,
      terrain: terrainArr,
      objects: this.objects
    };
  }

  fromJSON(data) {
    this.name = data.name || "Loaded Map";
    this.size = data.size || [32, 8, 32];
    this.terrainPalette = data.terrainPalette || [];
    this.voxels.clear();
    if (data.terrain) {
      for (const [x, y, z, c] of data.terrain) {
        this.voxels.set(`${x},${y},${z}`, c);
      }
    }
    this.objects = data.objects || [];
    
    // Find max id to avoid collision
    let maxId = 0;
    for (const o of this.objects) {
      // Ensure all objects have an id
      if (!o.id) o.id = ++maxId;
      if (o.id > maxId) maxId = o.id;
    }
    this.nextObjectId = maxId + 1;
  }
}
