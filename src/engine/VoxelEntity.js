import * as THREE from 'three';
import { AnimationController } from './AnimationController.js';

/**
 * VoxelEntity - Renders a voxel entity from a data definition.
 *
 * Entity definition schema:
 * {
 *   name: string,
 *   type: 'humanoid' | 'quadruped' | 'static',
 *   voxelSize: number (default 1),
 *   palette: string[] (hex color strings),
 *   parts: [
 *     {
 *       name: string,
 *       parent: string | null,
 *       position: [x, y, z],     // pivot pos in parent space
 *       center: [x, y, z],       // pivot in local voxel coords
 *       voxels: [[x, y, z, colorIndex], ...]
 *     }, ...
 *   ],
 *   animations: { [name]: AnimationDefinition }
 * }
 */
export class VoxelEntity {
  constructor(definition, options = {}) {
    this.definition = definition;
    this.voxelSize = definition.voxelSize || 1;
    this.root = new THREE.Group();
    this.root.name = definition.name;
    this.partGroups = {};
    this.animController = new AnimationController();
    this.currentAnimName = null;

    // Build materials from palette
    this.materials = definition.palette.map(hex => {
      return new THREE.MeshLambertMaterial({
        color: new THREE.Color(hex),
      });
    });

    // Shared geometry
    const s = this.voxelSize;
    this.boxGeom = new THREE.BoxGeometry(s * 0.98, s * 0.98, s * 0.98);

    // Edge material for voxel outlines
    this.edgeGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(s, s, s));
    this.edgeMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.12,
    });

    this._buildParts();

    if (options.position) {
      this.root.position.set(...options.position);
    }
    if (options.rotation) {
      this.root.rotation.y = options.rotation;
    }
    if (options.scale) {
      const sc = options.scale;
      this.root.scale.set(sc, sc, sc);
    }
  }

  _buildParts() {
    const s = this.voxelSize;

    for (const partDef of this.definition.parts) {
      const group = new THREE.Group();
      group.name = partDef.name;
      group.position.set(
        partDef.position[0] * s,
        partDef.position[1] * s,
        partDef.position[2] * s
      );

      // Store rest position for animation offsets
      group.userData.restPosition = group.position.clone();

      this._addVoxelMeshes(group, partDef);

      // Attach to parent or root
      const parentGroup = partDef.parent
        ? this.partGroups[partDef.parent]
        : this.root;
      if (parentGroup) {
        parentGroup.add(group);
      } else {
        this.root.add(group);
      }

      this.partGroups[partDef.name] = group;
    }
  }

  _addVoxelMeshes(group, partDef) {
    const s = this.voxelSize;
    const cx = partDef.center[0];
    const cy = partDef.center[1];
    const cz = partDef.center[2];

    for (let i = 0; i < partDef.voxels.length; i++) {
      const [vx, vy, vz, ci] = partDef.voxels[i];
      if (ci < 0 || ci >= this.materials.length) continue;
      const mesh = new THREE.Mesh(this.boxGeom, this.materials[ci]);
      mesh.position.set(
        (vx - cx + 0.5) * s,
        (vy - cy + 0.5) * s,
        (vz - cz + 0.5) * s
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // Store voxel metadata for raycasting
      mesh.userData.isVoxel = true;
      mesh.userData.partName = partDef.name;
      mesh.userData.voxelCoord = [vx, vy, vz];
      mesh.userData.colorIndex = ci;
      group.add(mesh);

      // Subtle edge lines
      const edges = new THREE.LineSegments(this.edgeGeom, this.edgeMat);
      edges.position.copy(mesh.position);
      group.add(edges);
    }
  }

  /** Rebuild a single part's meshes (for editor updates). */
  rebuildPart(partName) {
    const group = this.partGroups[partName];
    if (!group) return;
    const partDef = this.definition.parts.find(p => p.name === partName);
    if (!partDef) return;

    // Remove all children
    while (group.children.length) {
      group.remove(group.children[0]);
    }

    // Update materials if palette changed
    while (this.materials.length < this.definition.palette.length) {
      this.materials.push(new THREE.MeshLambertMaterial({
        color: new THREE.Color(this.definition.palette[this.materials.length]),
      }));
    }

    this._addVoxelMeshes(group, partDef);
  }

  /** Get all voxel Mesh objects (for raycasting). */
  getVoxelMeshes() {
    const meshes = [];
    this.root.traverse((obj) => {
      if (obj.isMesh && obj.userData.isVoxel) {
        meshes.push(obj);
      }
    });
    return meshes;
  }

  /** Play an animation by name */
  playAnimation(name) {
    const animDef = this.definition.animations?.[name];
    if (!animDef) return;
    this.currentAnimName = name;
    this.animController.play(name, animDef);
  }

  /** Get list of available animation names */
  getAnimationNames() {
    return Object.keys(this.definition.animations || {});
  }

  /** Update animations. Call each frame with delta time. */
  update(dt) {
    const transforms = this.animController.update(dt);
    const s = this.voxelSize;

    for (const [partName, transform] of Object.entries(transforms)) {
      const group = this.partGroups[partName];
      if (!group) continue;

      // Apply rotation
      if (transform.rotation) {
        group.rotation.set(
          transform.rotation[0],
          transform.rotation[1],
          transform.rotation[2]
        );
      }

      // Apply position offset from rest position
      if (transform.position) {
        const rest = group.userData.restPosition;
        group.position.set(
          rest.x + transform.position[0] * s,
          rest.y + transform.position[1] * s,
          rest.z + transform.position[2] * s
        );
      }
    }
  }

  /** Add entity to a Three.js scene or group */
  addTo(parent) {
    parent.add(this.root);
  }

  /** Remove from parent */
  removeFrom(parent) {
    parent.remove(this.root);
  }

  /** Dispose of all GPU resources */
  dispose() {
    this.boxGeom.dispose();
    this.edgeGeom.dispose();
    this.edgeMat.dispose();
    this.materials.forEach(m => m.dispose());
  }
}
