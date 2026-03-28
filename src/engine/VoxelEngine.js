import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * VoxelEngine - Manages the Three.js scene, camera, lighting, and render loop.
 */
export class VoxelEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.entities = [];
    this.clock = new THREE.Clock();

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initLights();
    this._initGround();
    this._initControls();

    window.addEventListener('resize', () => this._onResize());
    this._onResize();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.setClearColor(0x1a1a2e);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.008);
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
    this.camera.position.set(25, 20, 25);
    this.camera.lookAt(0, 6, 0);
  }

  _initLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x8899bb, 0.6);
    this.scene.add(ambient);

    // Hemisphere light for sky/ground color variation
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x3d5c3a, 0.4);
    this.scene.add(hemi);

    // Main directional light (sun)
    const sun = new THREE.DirectionalLight(0xfff4e6, 1.2);
    sun.position.set(20, 30, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    sun.shadow.bias = -0.001;
    this.scene.add(sun);

    // Accent point light
    const accent = new THREE.PointLight(0x63b3ed, 0.5, 40);
    accent.position.set(-10, 15, 10);
    this.scene.add(accent);
  }

  _initGround() {
    // Ground plane with grid
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshLambertMaterial({
      color: 0x2d4a3e,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Subtle grid
    const gridHelper = new THREE.GridHelper(60, 60, 0x3a6b5a, 0x2f5a49);
    gridHelper.position.y = 0.01;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
    this.scene.add(gridHelper);
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 6, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 80;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.update();
  }

  _onResize() {
    const container = this.canvas.parentElement || document.body;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /** Add a VoxelEntity to the scene */
  addEntity(entity) {
    this.entities.push(entity);
    entity.addTo(this.scene);
  }

  /** Remove a VoxelEntity from the scene */
  removeEntity(entity) {
    const idx = this.entities.indexOf(entity);
    if (idx >= 0) this.entities.splice(idx, 1);
    entity.removeFrom(this.scene);
  }

  /** Clear all entities */
  clearEntities() {
    for (const e of this.entities) {
      e.removeFrom(this.scene);
      e.dispose();
    }
    this.entities = [];
  }

  /** Start the render loop */
  start() {
    this.clock.start();
    const animate = () => {
      requestAnimationFrame(animate);
      const dt = this.clock.getDelta();

      // Update all entities
      for (const entity of this.entities) {
        entity.update(dt);
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  /** Reset camera to default position */
  resetCamera() {
    this.camera.position.set(25, 20, 25);
    this.controls.target.set(0, 6, 0);
    this.controls.update();
  }
}
