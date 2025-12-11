/**
 * 3D Exercise Engine (Three.js)
 * Aim Lab Style "Graybox" Environment
 * Mobile Support: Touch Drag for Look, Auto-pop when aiming at target
 */

class ExerciseEngine {
  constructor(container) {
    this.container = container;

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x181b21);
    this.scene.fog = new THREE.Fog(0x181b21, 40, 120);

    // 2. Camera Setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(71, aspect, 0.1, 500);
    this.camera.rotation.order = "YXZ";
    this.camera.position.set(0, 0, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(this.renderer.domElement);

    // 4. Raycaster
    this.raycaster = new THREE.Raycaster();
    this.center = new THREE.Vector2(0, 0);

    // 5. Environment
    this.createEnvironment();

    // 6. Game State
    this.targets = [];
    this.currentExercise = null;
    this.exerciseState = {
      running: false,
      paused: false,
      score: 0,
      hits: 0,
      misses: 0,
      clicks: 0,
      timeElapsed: 0,
    };

    this.respawnTimer = null;

    // Mobile Detection
    this.isMobile = this.detectMobileDevice();
    this.lastTouchX = null;
    this.lastTouchY = null;
    this.lastAutoPopTarget = null; // Track last auto-popped target to prevent spam
    this.autoPopCooldown = 0;

    this.resize();
    this.bindInputEvents();
  }

  /**
   * Detect if device is mobile
   */
  detectMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    return mobileRegex.test(userAgent.toLowerCase()) || window.innerWidth < 900;
  }

  bindInputEvents() {
    // Mouse (Desktop)
    document.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    document.addEventListener("click", () => this.handleInput());

    // Touch (Mobile)
    const el = this.renderer.domElement;
    el.addEventListener("touchstart", (e) => this.handleTouchStart(e), {
      passive: false,
    });
    el.addEventListener("touchmove", (e) => this.handleTouchMove(e), {
      passive: false,
    });
    el.addEventListener("touchend", (e) => this.handleTouchEnd(e));
  }

  handleTouchStart(e) {
    if (!this.exerciseState.running || this.exerciseState.paused) return;

    if (e.target === this.renderer.domElement) e.preventDefault();

    const touch = e.touches[0];
    this.lastTouchX = touch.clientX;
    this.lastTouchY = touch.clientY;
  }

  handleTouchMove(e) {
    if (!this.exerciseState.running || this.exerciseState.paused) return;
    if (e.target === this.renderer.domElement) e.preventDefault();

    const touch = e.touches[0];

    if (this.lastTouchX !== null && this.lastTouchY !== null) {
      const dx = touch.clientX - this.lastTouchX;
      const dy = touch.clientY - this.lastTouchY;

      const fakeEvent = {
        movementX: dx * 2.5,
        movementY: dy * 2.5,
      };

      this.handleMouseMove(fakeEvent);
    }

    this.lastTouchX = touch.clientX;
    this.lastTouchY = touch.clientY;
  }

  handleTouchEnd(e) {
    this.lastTouchX = null;
    this.lastTouchY = null;
  }

  createEnvironment() {
    // Materials
    const wallMat = new THREE.MeshBasicMaterial({ color: 0x22252a });
    const gridColor = 0x3a404d;
    const highlightColor = 0x4a505d;

    // Floor
    const gridHelper = new THREE.GridHelper(200, 40, highlightColor, gridColor);
    gridHelper.position.y = -15;
    this.scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMesh = new THREE.Mesh(floorGeo, wallMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -15.1;
    this.scene.add(floorMesh);

    // Ceiling
    const ceilGrid = new THREE.GridHelper(200, 40, highlightColor, gridColor);
    ceilGrid.position.y = 20;
    this.scene.add(ceilGrid);

    // Front Wall
    const wallGeo = new THREE.PlaneGeometry(200, 100);
    const frontWall = new THREE.Mesh(wallGeo, wallMat);
    frontWall.position.z = -60;
    this.scene.add(frontWall);

    const wallGrid = new THREE.GridHelper(200, 20, 0x444444, 0x2a2e35);
    wallGrid.rotation.x = Math.PI / 2;
    wallGrid.position.z = -59.9;
    this.scene.add(wallGrid);

    // Lighting
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    this.scene.add(light);
  }

  initExercise(exerciseId) {
    this.currentExercise = getExerciseById(exerciseId);
    if (!this.currentExercise) return false;
    this.resetState();
    this.exerciseState.running = true;
    return true;
  }

  resetState() {
    this.exerciseState = {
      running: false,
      paused: false,
      score: 0,
      hits: 0,
      misses: 0,
      clicks: 0,
      timeElapsed: 0,
    };

    this.targets.forEach((t) => this.scene.remove(t.mesh));
    this.targets = [];
    if (this.respawnTimer) clearTimeout(this.respawnTimer);

    this.camera.rotation.set(0, 0, 0);
  }

  spawnTargets() {
    if (!this.exerciseState.running) return;
    const mech = this.currentExercise.mechanics;
    const count = mech.targetSpawns || 1;

    if (this.targets.length >= count) return;
    const needed = count - this.targets.length;

    // SPAWN ZONE
    const Z_DEPTH = -45;
    // Manual Limits for Random mode
    const RANGE_X = 35;
    const RANGE_Y = 12;

    for (let i = 0; i < needed; i++) {
      let x,
        y,
        z = Z_DEPTH;

      if (mech.gridBased) {
        // Grid Logic
        const cols = 4;
        const rows = 3;
        let valid = false;
        let attempts = 0;

        while (!valid && attempts < 15) {
          const slot = Math.floor(Math.random() * (cols * rows));
          const c = slot % cols;
          const r = Math.floor(slot / cols);
          x = (c - 1.5) * 14;
          y = (r - 1) * 12;

          valid = true;
          for (const t of this.targets) {
            if (Math.hypot(t.mesh.position.x - x, t.mesh.position.y - y) < 5)
              valid = false;
          }
          attempts++;
        }
      } else if (mech.minDistance || mech.maxDistance) {
        // Radial Logic
        const angle = Math.random() * Math.PI * 2;
        const minR = mech.minDistance || 0;
        const maxR = mech.maxDistance || 15;
        const rad = minR + Math.random() * (maxR - minR);

        x = Math.cos(angle) * rad;
        y = Math.sin(angle) * rad * 0.45;
      } else {
        // Pure Random
        x = (Math.random() - 0.5) * RANGE_X * 2;
        y = (Math.random() - 0.5) * RANGE_Y * 2;
      }

      this.createTargetMesh(x, y, z, mech);
    }
  }

  createTargetMesh(x, y, z, mech) {
    let size = parseFloat(Storage.get(Storage.KEYS.TARGET_SIZE));
    if (!size || size > 8) size = 2.0;

    const colorHex = Storage.get(Storage.KEYS.TARGET_COLOR) || "#00ffff";

    const geometry = new THREE.SphereGeometry(size, 24, 24);
    const material = new THREE.MeshLambertMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.5,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);

    const targetObj = {
      mesh: mesh,
      mech: mech,
      age: 0,
      vx: (Math.random() - 0.5) * (mech.pathSpeed ? 0.4 : 0),
      vy: (Math.random() - 0.5) * (mech.pathSpeed ? 0.4 : 0),
    };

    mesh.scale.set(0.01, 0.01, 0.01);

    this.scene.add(mesh);
    this.targets.push(targetObj);
  }

  /**
   * Check if cursor/aim is over any target and auto-pop on mobile
   */
  checkAimOverTarget() {
    if (
      !this.isMobile ||
      !this.exerciseState.running ||
      this.exerciseState.paused
    )
      return;

    // Cooldown to prevent spam
    if (this.autoPopCooldown > 0) return;

    this.raycaster.setFromCamera(this.center, this.camera);
    const meshes = this.targets.map((t) => t.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const index = this.targets.findIndex((t) => t.mesh === hitMesh);

      if (index !== -1 && this.lastAutoPopTarget !== index) {
        // Register as hit
        this.exerciseState.clicks++;
        this.exerciseState.hits++;
        this.exerciseState.score +=
          this.currentExercise.scoringRules.hitReward || 100;
        AudioSys.play("hit");
        this.removeTarget(index, true);

        this.lastAutoPopTarget = index;
        this.autoPopCooldown = 150; // Prevent immediate re-pop
      }
    }
  }

  update(dt) {
    if (!this.exerciseState.running || this.exerciseState.paused) return;
    this.exerciseState.timeElapsed += dt;

    // Update cooldown
    if (this.autoPopCooldown > 0) {
      this.autoPopCooldown -= dt * 1000;
    } else {
      this.autoPopCooldown = 0;
    }

    // Check auto-pop on mobile
    this.checkAimOverTarget();

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      t.age += dt;

      if (t.mesh.scale.x < 1.0) {
        t.mesh.scale.addScalar(8 * dt);
        if (t.mesh.scale.x > 1.0) t.mesh.scale.set(1, 1, 1);
      }

      if (t.vx !== 0 || t.vy !== 0) {
        t.mesh.position.x += t.vx;
        t.mesh.position.y += t.vy;
        if (Math.abs(t.mesh.position.x) > 35) t.vx *= -1;
        if (Math.abs(t.mesh.position.y) > 12) t.vy *= -1;
      }

      if (t.mech.reflexMode && t.age > t.mech.reflexTime / 1000) {
        this.removeTarget(i, false);
      }
    }

    if (this.targets.length === 0 && !this.respawnTimer) {
      this.respawnTimer = setTimeout(() => {
        this.spawnTargets();
        this.respawnTimer = null;
      }, 100);
    }

    this.renderer.render(this.scene, this.camera);
  }

  handleInput() {
    if (!this.exerciseState.running || this.exerciseState.paused) return;
    this.exerciseState.clicks++;

    this.raycaster.setFromCamera(this.center, this.camera);
    const meshes = this.targets.map((t) => t.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const index = this.targets.findIndex((t) => t.mesh === hitMesh);
      if (index !== -1) {
        this.exerciseState.hits++;
        this.exerciseState.score +=
          this.currentExercise.scoringRules.hitReward || 100;
        AudioSys.play("hit");
        this.removeTarget(index, true);
        return;
      }
    }
    this.exerciseState.misses++;
    this.exerciseState.score = Math.max(0, this.exerciseState.score - 20);
    AudioSys.play("miss");
  }

  removeTarget(index, shouldRespawn) {
    const t = this.targets[index];
    this.scene.remove(t.mesh);
    t.mesh.geometry.dispose();
    t.mesh.material.dispose();
    this.targets.splice(index, 1);

    if (shouldRespawn) {
      const delay = this.currentExercise.mechanics.respawnDelay || 200;
      if (this.respawnTimer) clearTimeout(this.respawnTimer);
      this.respawnTimer = setTimeout(() => {
        this.spawnTargets();
        this.respawnTimer = null;
      }, delay);
    }
  }

  handleMouseMove(e) {
    if (!this.exerciseState.running || this.exerciseState.paused) return;

    if (Math.abs(e.movementX) > 500 || Math.abs(e.movementY) > 500) {
      return;
    }

    const valSens = parseFloat(Storage.get(Storage.KEYS.SENSITIVITY)) || 0.35;
    const sensitivityMultiplier = 0.0022 * valSens;

    this.camera.rotation.y -= e.movementX * sensitivityMultiplier;
    this.camera.rotation.x -= e.movementY * sensitivityMultiplier;

    const MAX_PITCH = Math.PI / 2 - 0.01;
    this.camera.rotation.x = Math.max(
      -MAX_PITCH,
      Math.min(MAX_PITCH, this.camera.rotation.x)
    );
  }

  resize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  stop() {
    this.exerciseState.running = false;
    this.renderer.domElement.remove();
  }
}
