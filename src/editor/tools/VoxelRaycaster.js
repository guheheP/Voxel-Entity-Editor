import * as THREE from 'three';

/**
 * VoxelRaycaster — Handles raycasting from mouse position to voxel meshes.
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
   * @param {import('../engine/VoxelEntity.js').VoxelEntity} entity
   * @returns {null|{mesh, partName, voxelCoord, faceNormal, adjacentCoord}}
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
    const mesh = hit.object;
    const ud = mesh.userData;

    if (!ud.isVoxel) return null;

    // Compute face normal in voxel coordinate space
    // The face normal from Three.js is in world space for the mesh
    const faceNormal = hit.face.normal.clone();
    // Transform normal to world space
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    faceNormal.applyMatrix3(normalMatrix).normalize();

    // Snap to nearest axis
    const snapped = snapToAxis(faceNormal);

    // Adjacent voxel coordinate = hit voxel + snapped normal
    const adjacentCoord = [
      ud.voxelCoord[0] + snapped[0],
      ud.voxelCoord[1] + snapped[1],
      ud.voxelCoord[2] + snapped[2],
    ];

    return {
      mesh,
      partName: ud.partName,
      voxelCoord: [...ud.voxelCoord],
      colorIndex: ud.colorIndex,
      faceNormal: snapped,
      adjacentCoord,
      point: hit.point.clone(),
    };
  }
}

function snapToAxis(v) {
  const abs = [Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)];
  const maxI = abs.indexOf(Math.max(...abs));
  const result = [0, 0, 0];
  result[maxI] = v.getComponent(maxI) > 0 ? 1 : -1;
  return result;
}
