/**
 * AnimationController - Manages keyframe-based animation
 * playback for a VoxelEntity.
 *
 * Supports: looping, one-shot, smooth transitions between animations.
 */
export class AnimationController {
  constructor() {
    this.currentAnim = null;
    this.currentDef = null;
    this.time = 0;
    this.playing = false;
    this.speed = 1;

    // Transition blending
    this.prevAnim = null;
    this.prevDef = null;
    this.prevTime = 0;
    this.blendDuration = 0.3;
    this.blendElapsed = 0;
    this.blending = false;
  }

  /**
   * Play an animation by name.
   * @param {string} name
   * @param {object} animDef - The animation definition from entity data
   * @param {boolean} [restart=false] - If true, restart even if same anim
   */
  play(name, animDef, restart = false) {
    if (this.currentAnim === name && !restart) return;

    // Save current state for blending
    if (this.currentDef && this.playing) {
      this.prevAnim = this.currentAnim;
      this.prevDef = this.currentDef;
      this.prevTime = this.time;
      this.blending = true;
      this.blendElapsed = 0;
    }

    this.currentAnim = name;
    this.currentDef = animDef;
    this.time = 0;
    this.playing = true;
  }

  stop() {
    this.playing = false;
  }

  /**
   * Update the animation state. Returns per-part transforms.
   * @param {number} dt - Delta time in seconds
   * @returns {Object} Map of partName -> { rotation: [x,y,z], position: [x,y,z] }
   */
  update(dt) {
    if (!this.playing || !this.currentDef) return {};

    this.time += dt * this.speed;
    const dur = this.currentDef.duration || 1;

    if (this.currentDef.loop) {
      this.time = this.time % dur;
    } else if (this.time >= dur) {
      this.time = dur;
      this.playing = false;
    }

    const t = this.time / dur; // 0..1 normalized
    const maxKTime = this.currentDef.keyframes.length > 0 ? this.currentDef.keyframes[this.currentDef.keyframes.length - 1].time : 1;
    const currentTransforms = this._interpolate(this.currentDef.keyframes, t * maxKTime);

    // Handle blending
    if (this.blending) {
      this.blendElapsed += dt;
      const blendT = Math.min(this.blendElapsed / this.blendDuration, 1);
      const smoothT = blendT * blendT * (3 - 2 * blendT); // smoothstep

      if (this.prevDef) {
        const prevDur = this.prevDef.duration || 1;
        const prevT = this.prevTime / prevDur;
        const prevMaxKTime = this.prevDef.keyframes.length > 0 ? this.prevDef.keyframes[this.prevDef.keyframes.length - 1].time : 1;
        const prevTransforms = this._interpolate(this.prevDef.keyframes, prevT * prevMaxKTime);
        const blended = this._blendTransforms(prevTransforms, currentTransforms, smoothT);

        if (blendT >= 1) {
          this.blending = false;
          this.prevDef = null;
        }
        return blended;
      }
      if (blendT >= 1) this.blending = false;
    }

    return currentTransforms;
  }

  _interpolate(keyframes, t) {
    if (!keyframes || keyframes.length === 0) return {};
    if (keyframes.length === 1) return this._cloneFrame(keyframes[0].parts || {});

    // Find surrounding keyframes
    let k0 = keyframes[0], k1 = keyframes[keyframes.length - 1];
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (t >= keyframes[i].time && t <= keyframes[i + 1].time) {
        k0 = keyframes[i];
        k1 = keyframes[i + 1];
        break;
      }
    }

    const range = k1.time - k0.time;
    const localT = range > 0 ? (t - k0.time) / range : 0;
    const smooth = localT * localT * (3 - 2 * localT); // smoothstep

    return this._lerpFrames(k0.parts || {}, k1.parts || {}, smooth);
  }

  _lerpFrames(a, b, t) {
    const result = {};
    const allParts = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const part of allParts) {
      const pa = a[part] || {};
      const pb = b[part] || {};
      result[part] = {
        rotation: this._lerpVec(pa.rotation || [0, 0, 0], pb.rotation || [0, 0, 0], t),
        position: this._lerpVec(pa.position || [0, 0, 0], pb.position || [0, 0, 0], t),
      };
    }
    return result;
  }

  _blendTransforms(a, b, t) {
    const result = {};
    const allParts = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const part of allParts) {
      const pa = a[part] || { rotation: [0, 0, 0], position: [0, 0, 0] };
      const pb = b[part] || { rotation: [0, 0, 0], position: [0, 0, 0] };
      result[part] = {
        rotation: this._lerpVec(pa.rotation, pb.rotation, t),
        position: this._lerpVec(pa.position, pb.position, t),
      };
    }
    return result;
  }

  _lerpVec(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ];
  }

  _cloneFrame(parts) {
    const result = {};
    for (const [k, v] of Object.entries(parts)) {
      result[k] = {
        rotation: [...(v.rotation || [0, 0, 0])],
        position: [...(v.position || [0, 0, 0])],
      };
    }
    return result;
  }

  /**
   * Seek to a normalized time position (0..1). Pauses playback.
   * @param {number} normalizedTime - 0 to 1
   */
  seekTo(normalizedTime) {
    if (!this.currentDef) return {};
    this.time = normalizedTime * (this.currentDef.duration || 1);
    this.playing = false;
    this.blending = false;
    const maxKTime = this.currentDef.keyframes.length > 0 ? this.currentDef.keyframes[this.currentDef.keyframes.length - 1].time : 1;
    return this._interpolate(this.currentDef.keyframes, normalizedTime * maxKTime);
  }

  /**
   * Get transforms at a specific normalized time without changing state.
   * @param {object} animDef - Animation definition
   * @param {number} normalizedTime - 0 to 1
   * @returns {Object} Part transforms
   */
  getTransformsAt(animDef, normalizedTime) {
    if (!animDef || !animDef.keyframes) return {};
    const maxKTime = animDef.keyframes.length > 0 ? animDef.keyframes[animDef.keyframes.length - 1].time : 1;
    return this._interpolate(animDef.keyframes, normalizedTime * maxKTime);
  }
}
