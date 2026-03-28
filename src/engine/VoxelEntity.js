import * as THREE from 'three';
import { AnimationController } from './AnimationController.js';

/**
 * VoxelEntity - Renders a voxel entity from a data definition.
 *
 * Uses InstancedMesh to batch voxels by color, dramatically reducing
 * draw calls. Each color group is a single InstancedMesh with per-instance
 * transforms. Voxel metadata is stored for raycasting support.
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

    // Shared geometry (slightly smaller for voxel gap effect)
    const s = this.voxelSize;
    this.boxGeom = new THREE.BoxGeometry(s * 0.98, s * 0.98, s * 0.98);

    // Edge material for voxel outlines (shared)
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

  /**
   * Add voxel meshes using InstancedMesh for batching.
   * Groups voxels by color index, creates one InstancedMesh per color.
   * Also adds subtle edge lines per voxel.
   */
  _addVoxelMeshes(group, partDef) {
    const s = this.voxelSize;
    const cx = partDef.center[0];
    const cy = partDef.center[1];
    const cz = partDef.center[2];

    // Group voxels by color index
    const colorBuckets = new Map(); // colorIndex -> [{vx, vy, vz, idx}]
    for (let i = 0; i < partDef.voxels.length; i++) {
      const [vx, vy, vz, ci] = partDef.voxels[i];
      if (ci < 0 || ci >= this.materials.length) continue;
      if (!colorBuckets.has(ci)) colorBuckets.set(ci, []);
      colorBuckets.get(ci).push({ vx, vy, vz, origIdx: i });
    }

    const dummy = new THREE.Object3D();
    const edgeGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(s, s, s));

    for (const [ci, bucket] of colorBuckets) {
      // Create InstancedMesh for this color group
      const instancedMesh = new THREE.InstancedMesh(
        this.boxGeom,
        this.materials[ci],
        bucket.length
      );
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;

      // Store metadata for raycasting
      instancedMesh.userData.isVoxelBatch = true;
      instancedMesh.userData.partName = partDef.name;
      instancedMesh.userData.colorIndex = ci;
      instancedMesh.userData.voxelMap = []; // instanceId -> {coord, origIdx}

      for (let i = 0; i < bucket.length; i++) {
        const { vx, vy, vz, origIdx } = bucket[i];
        const px = (vx - cx + 0.5) * s;
        const py = (vy - cy + 0.5) * s;
        const pz = (vz - cz + 0.5) * s;

        dummy.position.set(px, py, pz);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        // Store mapping from instanceId to voxel coordinate
        instancedMesh.userData.voxelMap[i] = {
          coord: [vx, vy, vz],
          origIdx,
        };

        // Add edge lines (these are lightweight LineSegments, not meshes)
        const edges = new THREE.LineSegments(edgeGeom, this.edgeMat);
        edges.position.set(px, py, pz);
        group.add(edges);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      group.add(instancedMesh);
    }

    // Store edge geometry reference for disposal
    group.userData._edgeGeom = edgeGeom;
  }

  /** Rebuild a single part's meshes (for editor updates). */
  rebuildPart(partName) {
    const group = this.partGroups[partName];
    if (!group) return;
    const partDef = this.definition.parts.find(p => p.name === partName);
    if (!partDef) return;

    // Dispose edge geometry stored on the group
    if (group.userData._edgeGeom) {
      group.userData._edgeGeom.dispose();
    }

    // Remove and dispose all children to prevent GPU memory leaks
    const children = [...group.children];
    for (const child of children) {
      group.remove(child);
      // Dispose InstancedMesh or LineSegments
      if (child.isInstancedMesh) {
        // Don't dispose shared boxGeom or shared materials
        child.dispose(); // disposes instance data
      }
      if (child.geometry && child.geometry !== this.boxGeom) {
        child.geometry.dispose();
      }
      if (child.material && child.material !== this.edgeMat && !this.materials.includes(child.material)) {
        child.material.dispose();
      }
    }

    // Sync all materials with palette (handle color changes and additions)
    for (let i = 0; i < this.definition.palette.length; i++) {
      if (i < this.materials.length) {
        this.materials[i].color.set(this.definition.palette[i]);
      } else {
        this.materials.push(new THREE.MeshLambertMaterial({
          color: new THREE.Color(this.definition.palette[i]),
        }));
      }
    }

    this._addVoxelMeshes(group, partDef);
  }

  /**
   * Get all raycastable objects (InstancedMesh instances).
   * Returns objects that support raycasting with instanceId.
   */
  getVoxelMeshes() {
    const meshes = [];
    this.root.traverse((obj) => {
      if (obj.isInstancedMesh && obj.userData.isVoxelBatch) {
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

      if (transform.rotation) {
        group.rotation.set(
          transform.rotation[0],
          transform.rotation[1],
          transform.rotation[2]
        );
      }

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
    this.root.traverse((obj) => {
      if (obj.isInstancedMesh) {
        obj.dispose();
      }
      if (obj.geometry && obj.geometry !== this.boxGeom) {
        obj.geometry.dispose();
      }
    });
    this.boxGeom.dispose();
    this.edgeMat.dispose();
    this.materials.forEach(m => m.dispose());
  }
}
