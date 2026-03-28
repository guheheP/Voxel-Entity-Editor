import * as THREE from 'three';

/**
 * VoxelRaycaster — Handles raycasting from mouse position to voxel meshes.
 * Supports both InstancedMesh (batched) and individual Mesh hits.
 * Returns hit info including part name, voxel coord, and adjacent position.
 */
export class VoxelRaycaster {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  /**
   * Cast a ray from mouse position and find the first voxel hit.
   * @param {MouseEvent} event
   * @param {import('../../engine/VoxelEntity.js').VoxelEntity} entity
   * @returns {null|{mesh, partName, voxelCoord, faceNormal, adjacentCoord, colorIndex, point}}
   */
  cast(event, entity) {
    if (!entity) return null;

    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const meshes = entity.getVoxelMeshes();
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length === 0) return null;

    const hit = intersects[0];
    const obj = hit.object;

    // Handle InstancedMesh hit
    if (obj.isInstancedMesh && obj.userData.isVoxelBatch) {
      const instanceId = hit.instanceId;
      const voxelMap = obj.userData.voxelMap;

      if (instanceId === undefined || !voxelMap || !voxelMap[instanceId]) return null;

      const { coord } = voxelMap[instanceId];

      // Compute face normal
      const faceNormal = hit.face.normal.clone();
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(obj.matrixWorld);
      faceNormal.applyMatrix3(normalMatrix).normalize();
      const snapped = snapToAxis(faceNormal);

      const adjacentCoord = [
        coord[0] + snapped[0],
        coord[1] + snapped[1],
        coord[2] + snapped[2],
      ];

      return {
        mesh: obj,
        partName: obj.userData.partName,
        voxelCoord: [...coord],
        colorIndex: obj.userData.colorIndex,
        faceNormal: snapped,
        adjacentCoord,
        point: hit.point.clone(),
      };
    }

    // Fallback: handle individual Mesh hit (legacy support)
    if (obj.isMesh && obj.userData.isVoxel) {
      const ud = obj.userData;
      const faceNormal = hit.face.normal.clone();
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(obj.matrixWorld);
      faceNormal.applyMatrix3(normalMatrix).normalize();
      const snapped = snapToAxis(faceNormal);

      const adjacentCoord = [
        ud.voxelCoord[0] + snapped[0],
        ud.voxelCoord[1] + snapped[1],
        ud.voxelCoord[2] + snapped[2],
      ];

      return {
        mesh: obj,
        partName: ud.partName,
        voxelCoord: [...ud.voxelCoord],
        colorIndex: ud.colorIndex,
        faceNormal: snapped,
        adjacentCoord,
        point: hit.point.clone(),
      };
    }

    return null;
  }
}

function snapToAxis(v) {
  const abs = [Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)];
  const maxI = abs.indexOf(Math.max(...abs));
  const result = [0, 0, 0];
  result[maxI] = v.getComponent(maxI) > 0 ? 1 : -1;
  return result;
}
