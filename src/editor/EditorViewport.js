/**
 * EditorViewport — Manages the 3D scene, camera, lighting, grid,
 * viewport themes, gizmos, and render loop for the voxel editor.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VoxelEntity } from '../engine/VoxelEntity.js';

// ===== Viewport Theme Presets =====
const viewportThemes = {
  dark: {
    label: '🌙 Dark',
    clearColor: 0x12151e,
    fogColor: 0x12151e, fogDensity: 0.006,
    groundColor: 0x2d4a3e,
    gridColors: [0x3a6b5a, 0x2f5a49], gridOpacity: 0.4,
    ambient: { color: 0x8899bb, intensity: 0.6 },
    hemi: { sky: 0x87ceeb, ground: 0x3d5c3a, intensity: 0.4 },
    sun: { color: 0xfff4e6, intensity: 1.2 },
  },
  daylight: {
    label: '☀️ Daylight',
    clearColor: 0x87ceeb,
    fogColor: 0x87ceeb, fogDensity: 0.003,
    groundColor: 0x5a9e6f,
    gridColors: [0x7db892, 0x6aad80], gridOpacity: 0.3,
    ambient: { color: 0xc8daf0, intensity: 0.8 },
    hemi: { sky: 0x87ceeb, ground: 0x6b8f5e, intensity: 0.6 },
    sun: { color: 0xfff8e8, intensity: 1.6 },
  },
  studio: {
    label: '💡 Studio',
    clearColor: 0x303030,
    fogColor: 0x303030, fogDensity: 0.002,
    groundColor: 0x404040,
    gridColors: [0x555555, 0x4a4a4a], gridOpacity: 0.5,
    ambient: { color: 0xffffff, intensity: 1.0 },
    hemi: { sky: 0xffffff, ground: 0x888888, intensity: 0.5 },
    sun: { color: 0xffffff, intensity: 1.8 },
  },
  neutral: {
    label: '⬜ Neutral',
    clearColor: 0xe8e8e8,
    fogColor: 0xe8e8e8, fogDensity: 0.002,
    groundColor: 0xcccccc,
    gridColors: [0xbbbbbb, 0xb0b0b0], gridOpacity: 0.35,
    ambient: { color: 0xffffff, intensity: 0.9 },
    hemi: { sky: 0xffffff, ground: 0xaaaaaa, intensity: 0.4 },
    sun: { color: 0xfff8f0, intensity: 1.4 },
  },
};

export class EditorViewport {
  constructor(canvas, viewportEl, state) {
    this.canvas = canvas;
    this.viewportEl = viewportEl;
    this.state = state;
    this.currentThemeName = 'dark';
    this.brightnessMultiplier = 1.0;
    this.currentEntity = null;
    this.clock = new THREE.Clock();

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initLights();
    this._initGround();
    this._initGizmos();
    this._initControls();

    window.addEventListener('resize', () => this.onResize());
    this.onResize();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.setClearColor(0x12151e);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x12151e, 0.006);
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
    this.camera.position.set(25, 20, 25);
    this.camera.lookAt(0, 6, 0);
  }

  _initLights() {
    this.ambientLight = new THREE.AmbientLight(0x8899bb, 0.6);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d5c3a, 0.4);
    this.scene.add(this.hemiLight);

    this.sun = new THREE.DirectionalLight(0xfff4e6, 1.2);
    this.sun.position.set(20, 30, 15);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -30;
    this.sun.shadow.camera.right = 30;
    this.sun.shadow.camera.top = 30;
    this.sun.shadow.camera.bottom = -30;
    this.sun.shadow.bias = -0.001;
    this.scene.add(this.sun);
  }

  _initGround() {
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    this.groundMat = new THREE.MeshLambertMaterial({ color: 0x2d4a3e });
    const ground = new THREE.Mesh(groundGeo, this.groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.gridHelper = new THREE.GridHelper(40, 40, 0x3a6b5a, 0x2f5a49);
    this.gridHelper.position.y = 0.01;
    this.gridHelper.material.transparent = true;
    this.gridHelper.material.opacity = 0.4;
    this.scene.add(this.gridHelper);
  }

  _initGizmos() {
    this.gizmoGroup = new THREE.Group();
    this.gizmoGroup.name = 'gizmos';
    this.scene.add(this.gizmoGroup);
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 6, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 80;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
  }

  // ===== Theme =====

  /** @returns {Object} themes dictionary for UI rendering */
  get themes() { return viewportThemes; }

  applyTheme(themeName) {
    const t = viewportThemes[themeName];
    if (!t) return;
    this.currentThemeName = themeName;

    this.renderer.setClearColor(t.clearColor);
    this.scene.fog = new THREE.FogExp2(t.fogColor, t.fogDensity);
    this.groundMat.color.set(t.groundColor);

    if (Array.isArray(this.gridHelper.material)) {
      this.gridHelper.material[0]?.color?.set(t.gridColors[0]);
      this.gridHelper.material[1]?.color?.set(t.gridColors[1]);
      this.gridHelper.material.forEach(m => { m.opacity = t.gridOpacity; });
    } else {
      this.gridHelper.material.opacity = t.gridOpacity;
    }

    this.applyBrightness();
  }

  applyBrightness() {
    const t = viewportThemes[this.currentThemeName];
    if (!t) return;
    const b = this.brightnessMultiplier;

    this.ambientLight.color.set(t.ambient.color);
    this.ambientLight.intensity = t.ambient.intensity * b;

    this.hemiLight.color.set(t.hemi.sky);
    this.hemiLight.groundColor.set(t.hemi.ground);
    this.hemiLight.intensity = t.hemi.intensity * b;

    this.sun.color.set(t.sun.color);
    this.sun.intensity = t.sun.intensity * b;
  }

  setBrightness(value) {
    this.brightnessMultiplier = value;
    this.applyBrightness();
  }

  // ===== Entity =====

  rebuildEntity() {
    if (this.currentEntity) {
      this.currentEntity.removeFrom(this.scene);
      this.currentEntity.dispose();
    }
    if (!this.state.entityDef) { this.currentEntity = null; return; }
    this.currentEntity = new VoxelEntity(this.state.entityDef);
    this.currentEntity.addTo(this.scene);
    this.rebuildGizmos();
  }

  // ===== Gizmos =====

  rebuildGizmos() {
    while (this.gizmoGroup.children.length) {
      this.gizmoGroup.remove(this.gizmoGroup.children[0]);
    }
    if (!this.state.showGizmos || !this.state.entityDef) return;

    const s = this.state.entityDef.voxelSize || 1;
    for (const part of this.state.entityDef.parts) {
      const pivotWorld = this._computePivotWorld(part, this.state.entityDef, s);
      const axisLen = 2;
      const colors = [0xff4444, 0x44ff44, 0x4488ff];
      const dirs = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1),
      ];
      for (let i = 0; i < 3; i++) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          pivotWorld.clone(),
          pivotWorld.clone().add(dirs[i].clone().multiplyScalar(axisLen)),
        ]);
        const mat = new THREE.LineBasicMaterial({
          color: colors[i],
          transparent: true,
          opacity: this.state.selectedPart === part.name ? 0.9 : 0.3,
          depthTest: false,
        });
        const line = new THREE.Line(geo, mat);
        line.renderOrder = 999;
        this.gizmoGroup.add(line);
      }
    }
  }

  _computePivotWorld(partDef, entityDef, s) {
    const pos = new THREE.Vector3(
      partDef.position[0] * s,
      partDef.position[1] * s,
      partDef.position[2] * s
    );
    if (partDef.parent) {
      const parentDef = entityDef.parts.find(p => p.name === partDef.parent);
      if (parentDef) {
        pos.add(this._computePivotWorld(parentDef, entityDef, s));
      }
    }
    return pos;
  }

  // ===== Resize =====

  onResize() {
    const rect = this.viewportEl.getBoundingClientRect();
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // ===== Render Loop =====

  start() {
    this.clock.start();
    const animate = () => {
      requestAnimationFrame(animate);
      const dt = this.clock.getDelta();
      if (this.currentEntity) {
        this.currentEntity.update(dt);

        // Sync timeline playhead with animation playback
        const ac = this.currentEntity.animController;
        if (ac.playing && ac.currentDef) {
          const normalized = ac.time / (ac.currentDef.duration || 1);
          const playheadEl = document.getElementById('timeline-playhead');
          if (playheadEl) {
            playheadEl.style.left = `${(normalized % 1) * 100}%`;
          }
        }
      }
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  // ===== Camera Presets =====
  setCameraPreset(preset) {
    const target = this.controls.target.clone();
    const dist = this.camera.position.distanceTo(target);

    switch (preset) {
      case 'front':
        this.camera.position.set(target.x, target.y, target.z + dist);
        break;
      case 'back':
        this.camera.position.set(target.x, target.y, target.z - dist);
        break;
      case 'left':
        this.camera.position.set(target.x - dist, target.y, target.z);
        break;
      case 'right':
        this.camera.position.set(target.x + dist, target.y, target.z);
        break;
      case 'top':
        this.camera.position.set(target.x, target.y + dist, target.z + 0.001);
        break;
      case 'perspective':
        this.camera.position.set(target.x + dist * 0.6, target.y + dist * 0.5, target.z + dist * 0.6);
        break;
    }
    this.controls.update();
  }

  resetCamera() {
    this.camera.position.set(25, 20, 25);
    this.controls.target.set(0, 6, 0);
    this.controls.update();
  }

  // ===== Grid visibility =====
  setGridVisible(visible) {
    this.gridHelper.visible = visible;
  }
}
