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
    // Pixel ratio is set after device detection (below) and adapts at runtime.
    // Ensure the renderer canvas fills the container and is positioned correctly
    this.renderer.domElement.id = "game-canvas";
    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.top = "0";
    this.renderer.domElement.style.left = "0";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.renderer.domElement.style.zIndex = "1";
    this.renderer.domElement.style.touchAction = "none"; // allow touch handling manually
    // Re-enable pointer events on the canvas even though the parent
    // #game-container has pointer-events:none — touch listeners are bound here
    // and need to receive touch events on mobile.
    this.renderer.domElement.style.pointerEvents = "auto";
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

    // Tracking mode state
    this.trackingState = {
      active: false,
      sampleRate: 60, // Hz (default, overridden by exercise config)
      sampleInterval: null,
      samples: [], // boolean array: true = cursor in hitbox
      lastSampleTime: 0,
    };

    // Reactive tracking state
    this.reactiveState = {
      active: false,
      cursorProximityStart: null, // timestamp when cursor entered 1.5x radius
      directionChanged: false,
    };

    // Headshot mode state
    this.headshotState = {
      active: false,
      criticalZoneRatio: 0.3,
      criticalMultiplier: 2.0,
    };

    // Multi-target sequential elimination state
    this.multiTargetState = {
      active: false,
      sequentialElimination: false,
      nextTargetOrder: 1, // next expected target number
      targetLabels: [], // maps target index to label number
    };

    // Time-to-kill tracking state
    this.ttkState = {
      active: false,
      spawnTimes: new Map(), // target mesh uuid → spawn timestamp
      timeToKills: [], // recorded TTK values in ms
      maxTTK: 5000, // ms before target is marked as missed
    };

    // Mobile Detection
    this.isMobile = this.detectMobileDevice();

    // Adaptive render quality. Mobile/low-end caps at 1.0 device pixels; the
    // runtime controller (see update) lowers resolution further when FPS dips
    // so we hold ~60fps even on weak hardware or on battery.
    this.maxPixelRatio = Math.min(
      window.devicePixelRatio || 1,
      this.isMobile ? 1 : 1.5
    );
    this.currentPixelRatio = this.maxPixelRatio;
    this.renderer.setPixelRatio(this.currentPixelRatio);
    this.fpsAccum = 0;
    this.fpsFrames = 0;
    this.qualityCooldown = 0;

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
    const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const coarsePointer = typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches;
    // Mobile if: mobile UA, OR touch+coarse pointer, OR a narrow viewport
    // (covers DevTools device emulation reliably).
    return isMobileUA || (hasTouchScreen && coarsePointer) || window.innerWidth < 900;
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
    this.initMechanics();
    return true;
  }

  /**
   * Initialize new mechanics based on exercise config
   */
  initMechanics() {
    const mech = this.currentExercise.mechanics;
    const scoring = this.currentExercise.scoringRules;

    // Tracking mode
    if (mech.trackingMode) {
      this.trackingState.active = true;
      this.trackingState.sampleRate = Math.max(30, mech.trackingSampleRate || 60);
      this.trackingState.samples = [];
      this.trackingState.lastSampleTime = 0;
      this.startTrackingSampler();
    }

    // Reactive tracking (works alongside tracking mode)
    if (mech.pathPattern === 'random' || mech.trackingMode) {
      this.reactiveState.active = true;
      this.reactiveState.cursorProximityStart = null;
      this.reactiveState.directionChanged = false;
    }

    // Headshot mode
    if (mech.headshotMode) {
      this.headshotState.active = true;
      this.headshotState.criticalZoneRatio = mech.criticalZoneRatio || 0.3;
      this.headshotState.criticalMultiplier = scoring.criticalMultiplier || 2.0;
    }

    // Multi-target sequential elimination
    if (mech.multiTarget && mech.sequentialElimination) {
      this.multiTargetState.active = true;
      this.multiTargetState.sequentialElimination = true;
      this.multiTargetState.nextTargetOrder = 1;
      this.multiTargetState.targetLabels = [];
      this.multiTargetState.waveStartTime = performance.now();
    }

    // Color trigger mode: multiple targets stay red, one flashes green briefly
    this.colorTriggerActive = !!mech.colorTrigger;
    if (this.colorTriggerActive) {
      this.colorTriggerState = {
        armedIndex: -1, // which target index is currently green (-1 = none)
        nextArmTime: performance.now() + 1000, // first green after 1s
        activeWindow: mech.reflexTime || 800, // how long it stays green (ms)
        armedAt: 0, // when current target was armed
      };
    }

    // Speed-ladder mode: the display window shrinks with each successful hit.
    this.ladderActive = !!mech.ladder;
    if (this.ladderActive) {
      this.ladderBase = mech.reflexTime && mech.reflexTime > 0 ? mech.reflexTime : 1000;
      this.ladderWindow = this.ladderBase;
    }

    // Time-to-kill tracking (always active for flicking/click exercises)
    if (!mech.trackingMode) {
      this.ttkState.active = true;
      this.ttkState.spawnTimes = new Map();
      this.ttkState.timeToKills = [];
    }
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

    // Reset tracking state
    if (this.trackingState.sampleInterval) {
      clearInterval(this.trackingState.sampleInterval);
      this.trackingState.sampleInterval = null;
    }
    this.trackingState.active = false;
    this.trackingState.samples = [];
    this.trackingState.lastSampleTime = 0;

    // Reset reactive state
    this.reactiveState.active = false;
    this.reactiveState.cursorProximityStart = null;
    this.reactiveState.directionChanged = false;

    // Reset headshot state
    this.headshotState.active = false;

    // Reset multi-target state
    this.multiTargetState.active = false;
    this.multiTargetState.sequentialElimination = false;
    this.multiTargetState.nextTargetOrder = 1;
    this.multiTargetState.targetLabels = [];

    // Reset color trigger
    this.colorTriggerActive = false;

    // Reset speed-ladder
    this.ladderActive = false;
    this.ladderWindow = 0;

    // Reset TTK state
    this.ttkState.active = false;
    this.ttkState.spawnTimes = new Map();
    this.ttkState.timeToKills = [];

    this.camera.rotation.set(0, 0, 0);
  }

  spawnTargets() {
    if (!this.exerciseState.running) return;
    const mech = this.currentExercise.mechanics;
    const count = mech.targetSpawns || 1;

    if (this.targets.length >= count) return;
    const needed = count - this.targets.length;

    // Read unit system from bridge (window.UNIT_SYSTEM) with hardcoded fallback
    const us = window.UNIT_SYSTEM || {
      ranges: {
        spawnDistance: { min: 0, max: 35 },
        targetSize: { min: 0.25, max: 10 },
        pathSpeed: { min: 0, max: 50 },
      },
      playArea: {
        halfWidth: 35,
        halfHeight: 12,
        depth: -45,
        minHittableRadius: 0.25,
      },
    };

    const VERTICAL_COMPRESSION = 0.45;
    const Z_DEPTH = us.playArea.depth || -45;
    const RANGE_X = us.playArea.halfWidth || 35;
    const RANGE_Y = us.playArea.halfHeight || 12;

    // Helper: clamp a value to [min, max]
    const clampVal = (v, min, max) => Math.max(min, Math.min(max, v));

    // Helper: max reachable spawn distance for a target of given size
    const maxReachableDist = (targetSize) => {
      const radius = targetSize / 2;
      const horizontalLimit = RANGE_X - radius;
      const verticalLimit = (RANGE_Y - radius) / VERTICAL_COMPRESSION;
      const maxDist = Math.min(horizontalLimit, verticalLimit);
      return Math.max(us.ranges.spawnDistance.min, Math.min(us.ranges.spawnDistance.max, maxDist));
    };

    // Resolve target size for reachability calculations
    // Use the configured target size (clamped to unit-system range)
    const rawSize = mech.targetSize ? parseFloat(mech.targetSize) : 2.0;
    const targetSize = clampVal(rawSize, us.ranges.targetSize.min, us.ranges.targetSize.max);

    // Cap the effective max distance based on target size reachability
    const reachable = maxReachableDist(targetSize);

    for (let i = 0; i < needed; i++) {
      let x,
        y,
        z = Z_DEPTH;

      if (mech.multiStimulus) {
        // Multi-Stimulus: target lights up at one of several fixed positions,
        // training spatial unpredictability and peripheral awareness.
        const radius = targetSize / 2;
        const maxX = RANGE_X - radius;
        const maxY = RANGE_Y - radius;
        const POSITIONS = [
          { x: -26, y: 6 },
          { x: 26, y: 6 },
          { x: 0, y: 8 },
          { x: -26, y: -6 },
          { x: 26, y: -6 },
          { x: 0, y: -5 },
        ];
        const p = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
        x = clampVal(p.x, -maxX, maxX);
        y = clampVal(p.y, -maxY, maxY);
      } else if (mech.gridBased) {
        // Grid Logic — clamp grid positions so target center + radius stays in play area
        const cols = 4;
        const rows = 3;
        let valid = false;
        let attempts = 0;
        const radius = targetSize / 2;
        const maxX = RANGE_X - radius;
        const maxY = RANGE_Y - radius;

        while (!valid && attempts < 15) {
          const slot = Math.floor(Math.random() * (cols * rows));
          const c = slot % cols;
          const r = Math.floor(slot / cols);
          x = clampVal((c - 1.5) * 14, -maxX, maxX);
          y = clampVal((r - 1) * 12, -maxY, maxY);

          valid = true;
          for (const t of this.targets) {
            if (Math.hypot(t.mesh.position.x - x, t.mesh.position.y - y) < 5)
              valid = false;
          }
          attempts++;
        }
      } else if (mech.minDistance || mech.maxDistance) {
        // Radial Logic — clamp distances to unit-system range [0, 35] and cap at reachable
        const rawMin = mech.minDistance || 0;
        const rawMax = mech.maxDistance || 15;

        let clampedMin = clampVal(rawMin, us.ranges.spawnDistance.min, us.ranges.spawnDistance.max);
        let clampedMax = clampVal(rawMax, us.ranges.spawnDistance.min, us.ranges.spawnDistance.max);

        // Cap at reachable distance for this target size
        clampedMax = Math.min(clampedMax, reachable);

        // Ensure min <= max
        const effectiveMin = Math.min(clampedMin, clampedMax);
        const effectiveMax = Math.max(clampedMin, clampedMax);

        // Try up to 20 positions to avoid overlap with existing targets
        let bestX = 0, bestY = 0;
        let bestMinDist = 0;
        const minSeparation = targetSize * 2.5; // minimum distance between target centers
        for (let attempt = 0; attempt < 20; attempt++) {
          const angle = Math.random() * Math.PI * 2;
          const rad = effectiveMin + Math.random() * (effectiveMax - effectiveMin);
          const tryX = Math.cos(angle) * rad;
          const tryY = Math.sin(angle) * rad * VERTICAL_COMPRESSION;

          // Check distance from all existing targets
          let closestDist = Infinity;
          for (const existing of this.targets) {
            const dx = existing.mesh.position.x - tryX;
            const dy = existing.mesh.position.y - tryY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < closestDist) closestDist = dist;
          }

          if (closestDist >= minSeparation) {
            bestX = tryX;
            bestY = tryY;
            break;
          }
          if (closestDist > bestMinDist) {
            bestMinDist = closestDist;
            bestX = tryX;
            bestY = tryY;
          }
        }

        x = bestX;
        y = bestY;

        // Final safety clamp: ensure center + radius stays in play area
        const radius = targetSize / 2;
        x = clampVal(x, -(RANGE_X - radius), RANGE_X - radius);
        y = clampVal(y, -(RANGE_Y - radius), RANGE_Y - radius);
      } else {
        // Pure Random — respect target radius bounds
        const radius = targetSize / 2;
        x = (Math.random() - 0.5) * (RANGE_X - radius) * 2;
        y = (Math.random() - 0.5) * (RANGE_Y - radius) * 2;
      }

      this.createTargetMesh(x, y, z, mech);
    }
  }

  createTargetMesh(x, y, z, mech) {
    // Read target size bounds from window.UNIT_SYSTEM with fallback to hardcoded constants
    const unitSystem = window.UNIT_SYSTEM || {
      ranges: { targetSize: { min: 0.25, max: 10 } },
      playArea: { minHittableRadius: 0.25 },
    };
    const sizeRange = unitSystem.ranges.targetSize;
    const minHittable = unitSystem.playArea.minHittableRadius;

    // Per-exercise target size (world units). Fall back to a sensible medium
    // default when an exercise does not specify one.
    let size = mech && mech.targetSize ? parseFloat(mech.targetSize) : 3;

    // Clamp to unit-system range [0.25, 10] instead of silently resetting to 2.0
    if (isNaN(size)) {
      size = sizeRange.min;
    } else {
      size = Math.max(sizeRange.min, Math.min(sizeRange.max, size));
    }

    // Ensure at least minimum hittable radius
    if (size < minHittable) {
      size = minHittable;
    }

    // Global user size preference (Settings → Target Size). Interpreted as a
    // SCALE multiplier so it applies on top of every exercise's own size,
    // letting players globally shrink or enlarge targets. Clamped to a sane
    // range so the smallest setting produces genuinely small targets.
    let sizeScale = parseFloat(Storage.get(Storage.KEYS.TARGET_SIZE));
    if (isNaN(sizeScale)) sizeScale = 1;
    sizeScale = Math.max(0.4, Math.min(1.5, sizeScale));

    // Adjust target size based on device and exercise specifics.
    // Desktop → make targets smaller (harder) by default. Mobile keeps configured size.
    // The `micro_adjust` exercise should be notably smaller on desktop to increase difficulty.
    let deviceMultiplier = this.isMobile ? 1.0 : 0.6;
    const exId =
      this.currentExercise && this.currentExercise.id
        ? this.currentExercise.id
        : null;
    if (exId === "micro_adjust") {
      // Make micro adjustments significantly smaller on desktop
      deviceMultiplier = this.isMobile ? 1.0 : 0.35;
    }

    // Final computed size (clamped to unit-system range after device + user scale)
    const finalSize = Math.max(
      minHittable,
      Math.min(sizeRange.max, size * deviceMultiplier * sizeScale)
    );

    // Target color: each category gets a distinct color so the catalog reads
    // as visually varied. If the player set a custom color (different from the
    // default), their choice is respected instead.
    const DEFAULT_TARGET_COLOR = "#00ffff";
    const CATEGORY_COLORS = {
      flicking: "#ff5c5c",
      tracking: "#4cd964",
      speed: "#ffd23f",
      precision: "#00f0ff",
      reaction: "#c77dff",
      "game-specific": "#ff8a3d",
    };
    const userColor = Storage.get(Storage.KEYS.TARGET_COLOR);
    const cat = this.currentExercise && this.currentExercise.category;
    const colorHex =
      userColor && userColor !== DEFAULT_TARGET_COLOR
        ? userColor
        : CATEGORY_COLORS[cat] || DEFAULT_TARGET_COLOR;

    const seg = this.isMobile ? 12 : 16;
    const geometry = new THREE.SphereGeometry(finalSize, seg, seg);
    const material = new THREE.MeshLambertMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.5,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);

    // Movement: pathSpeed is in world units PER SECOND and applied dt-based in
    // update(), so motion looks identical regardless of framerate (smooth on
    // low-end devices). pathPattern selects the trajectory so each moving drill
    // behaves distinctly.
    const unitSys = window.UNIT_SYSTEM || { ranges: { pathSpeed: { min: 0, max: 50 } } };
    const pathSpeedRange = unitSys.ranges.pathSpeed || { min: 0, max: 50 };
    let speed = mech.pathSpeed || 0;
    speed = Math.max(pathSpeedRange.min, Math.min(pathSpeedRange.max, speed));

    const moves = speed > 0 && !mech.targetStatic;
    const pattern = moves ? mech.pathPattern || "linear" : null;

    const targetObj = {
      mesh: mesh,
      mech: mech,
      age: 0,
      radius: finalSize,
      order: 0, // for sequential elimination
      // movement state
      pattern: pattern,
      speed: speed,
      dir: Math.random() < 0.5 ? -1 : 1,
      baseY: y,
      amp: 3 + Math.random() * 5, // sinusoidal vertical amplitude
      freq: 1.4 + Math.random() * 1.6, // sinusoidal frequency (rad/s)
      phase: Math.random() * Math.PI * 2,
      retargetIn: 0.4 + Math.random() * 1.0, // 'random' pattern re-aim timer
      grewIn: false,
      shrinking: !!mech.shrinking,
      vx: 0,
      vy: 0,
    };

    // Seed an initial velocity vector for the erratic 'random' pattern.
    if (pattern === "random") {
      const a = Math.random() * Math.PI * 2;
      targetObj.vx = Math.cos(a) * speed;
      targetObj.vy = Math.sin(a) * speed * 0.6;
    }

    mesh.scale.set(0.01, 0.01, 0.01);

    // Pop Shot: target rises up from behind "cover" into its firing position.
    if (mech.popUp) {
      targetObj.popUp = true;
      targetObj.targetY = y;
      mesh.position.y = y - 7;
    }

    // Wall Peek: target slides in from the nearest edge, holds briefly, then
    // retreats back out of view (a miss if not shot during the exposure).
    if (mech.peek) {
      const halfW =
        (window.UNIT_SYSTEM && window.UNIT_SYSTEM.playArea.halfWidth) || 35;
      targetObj.peek = true;
      targetObj.targetX = x;
      targetObj.peekSign = x >= 0 ? 1 : -1;
      targetObj.peekPhase = "in";
      targetObj.peekTimer = 0;
      targetObj.peekHold =
        mech.reflexTime && mech.reflexTime > 0 ? mech.reflexTime : 600;
      mesh.position.x = targetObj.peekSign * halfW;
    }

    // Speed Ladder: each target's visible window is the current (shrinking) one.
    if (this.ladderActive) {
      targetObj.ladder = true;
      targetObj.activeWindow = this.ladderWindow;
    }

    // Color trigger: all targets spawn red. The engine manages which one is green.
    if (this.colorTriggerActive) {
      targetObj.colorTrigger = true;
      targetObj.armed = false;
      const decoy = 0xff3b3b;
      material.color.setHex(decoy);
      material.emissive.setHex(decoy);
    }

    // Headshot mode: add critical zone indicator (inner ring)
    if (this.headshotState.active) {
      const critRadius = finalSize * this.headshotState.criticalZoneRatio;
      const critSeg = this.isMobile ? 10 : 14;
      const critGeometry = new THREE.SphereGeometry(critRadius, critSeg, critSeg);
      const critMaterial = new THREE.MeshLambertMaterial({
        color: 0xff3333,
        emissive: 0xff3333,
        emissiveIntensity: 0.8,
      });
      const critMesh = new THREE.Mesh(critGeometry, critMaterial);
      mesh.add(critMesh); // child of main mesh, moves with it
      targetObj.criticalRadius = critRadius;
    }

    // Multi-target sequential elimination: assign order label
    if (this.multiTargetState.active) {
      const labelNum = this.targets.length + 1; // next number = current alive count + 1 (since this target is about to be pushed)
      targetObj.order = labelNum;

      // Create a sprite with the number label (high contrast: dark circle + white bold number)
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      // Dark background circle for contrast
      ctx.beginPath();
      ctx.arc(64, 64, 52, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#22ff88";
      ctx.stroke();
      // Number text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 72px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(labelNum), 64, 66);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(finalSize * 2.5, finalSize * 2.5, 1);
      sprite.position.copy(mesh.position);
      sprite.position.z += finalSize + 0.3;
      sprite.renderOrder = 999;
      this.scene.add(sprite); // Add to scene directly, not as child
      targetObj.labelSprite = sprite;
      targetObj.labelIsSceneChild = true;
    }

    // Time-to-kill: record spawn time
    if (this.ttkState.active) {
      this.ttkState.spawnTimes.set(mesh.uuid, performance.now());
    }

    this.scene.add(mesh);
    this.targets.push(targetObj);
  }

  /**
   * Check if cursor/aim is over any target and auto-pop on mobile
   */
  checkAimOverTarget() {
    if (!this.exerciseState.running || this.exerciseState.paused) return;

    // Disable auto-pop in tracking mode (tracking is sampled, not clicked)
    if (this.trackingState.active) return;

    // Cooldown to prevent spam
    if (this.autoPopCooldown > 0) return;

    this.raycaster.setFromCamera(this.center, this.camera);
    const meshes = this.targets.map((t) => t.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      // Find the parent target mesh
      let hitMesh = intersects[0].object;
      while (hitMesh.parent && !this.targets.find((t) => t.mesh === hitMesh)) {
        hitMesh = hitMesh.parent;
      }

      const index = this.targets.findIndex((t) => t.mesh === hitMesh);

      if (index !== -1) {
        const target = this.targets[index];
        const uuid = hitMesh.uuid;
        if (this.lastAutoPopTarget === uuid) return;

        // Color trigger: never auto-pop a target that hasn't armed (still red)
        if (target.colorTrigger && !target.armed) return;

        // Multi-target sequential elimination: check order
        if (this.multiTargetState.active && this.multiTargetState.sequentialElimination) {
          if (target.order !== this.multiTargetState.nextTargetOrder) {
            return; // Can't auto-pop out-of-order target
          }
          this.multiTargetState.nextTargetOrder++;
        }

        // Headshot mode: check critical zone for auto-pop
        if (this.headshotState.active) {
          const hitPoint = intersects[0].point;
          const targetCenter = target.mesh.position.clone();
          const distFromCenter = hitPoint.distanceTo(targetCenter);
          const criticalRadius = target.criticalRadius || (target.radius * this.headshotState.criticalZoneRatio);

          this.exerciseState.clicks++;
          this.exerciseState.hits++;
          if (distFromCenter <= criticalRadius) {
            // Critical zone hit - award multiplied points
            const reward = (this.currentExercise.scoringRules.hitReward || 100) * this.headshotState.criticalMultiplier;
            this.exerciseState.score += reward;
          } else {
            // Outer zone hit - award base points (no multiplier)
            this.exerciseState.score += this.currentExercise.scoringRules.hitReward || 100;
          }
        } else {
          // Standard auto-pop
          this.exerciseState.clicks++;
          this.exerciseState.hits++;
          this.exerciseState.score +=
            this.currentExercise.scoringRules.hitReward || 100;
        }

        AudioSys.play("hit");

        // Record TTK
        if (this.ttkState.active) {
          const spawnTime = this.ttkState.spawnTimes.get(target.mesh.uuid);
          if (spawnTime) {
            const ttk = performance.now() - spawnTime;
            this.ttkState.timeToKills.push(Math.min(ttk, this.ttkState.maxTTK));
            this.ttkState.spawnTimes.delete(target.mesh.uuid);
          }
        }

        // store uuid then remove
        this.lastAutoPopTarget = uuid;
        if (target.ladder) {
          this.ladderWindow = Math.max(350, this.ladderWindow * 0.85);
        }
        this.removeTarget(index, true);

        this.autoPopCooldown = 150; // Prevent immediate re-pop
      }
    }
  }

  update(dt) {
    if (!this.exerciseState.running || this.exerciseState.paused) return;
    this.exerciseState.timeElapsed += dt;

    // Adaptive quality: hold ~60fps by scaling render resolution up/down.
    this.fpsAccum += dt;
    this.fpsFrames++;
    if (this.qualityCooldown > 0) this.qualityCooldown -= dt;
    if (this.fpsAccum >= 1) {
      const fps = this.fpsFrames / this.fpsAccum;
      this.fpsAccum = 0;
      this.fpsFrames = 0;
      if (this.qualityCooldown <= 0) {
        if (fps < 50 && this.currentPixelRatio > 0.6) {
          // Struggling — drop resolution to recover framerate.
          this.currentPixelRatio = Math.max(0.6, this.currentPixelRatio - 0.25);
          this.renderer.setPixelRatio(this.currentPixelRatio);
          this.renderer.setSize(window.innerWidth, window.innerHeight, false);
          this.qualityCooldown = 2.5;
        } else if (fps > 58 && this.currentPixelRatio < this.maxPixelRatio) {
          // Headroom available — restore sharpness gradually.
          this.currentPixelRatio = Math.min(
            this.maxPixelRatio,
            this.currentPixelRatio + 0.25
          );
          this.renderer.setPixelRatio(this.currentPixelRatio);
          this.renderer.setSize(window.innerWidth, window.innerHeight, false);
          this.qualityCooldown = 4;
        }
      }
    }

    // Update cooldown
    if (this.autoPopCooldown > 0) {
      this.autoPopCooldown -= dt * 1000;
    } else {
      this.autoPopCooldown = 0;
    }

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      t.age += dt;

      // Spawn-in grow animation, then (for shrinking drills) shrink over the
      // target's lifetime until it vanishes — a miss if not clicked in time.
      if (!t.grewIn) {
        t.mesh.scale.addScalar(8 * dt);
        if (t.mesh.scale.x >= 1.0) {
          t.mesh.scale.set(1, 1, 1);
          t.grewIn = true;
        }
      } else if (t.shrinking) {
        const lifetime =
          (t.mech.reflexTime && t.mech.reflexTime > 0 ? t.mech.reflexTime : 3000) /
          1000;
        const k = Math.max(0.15, 1 - t.age / lifetime);
        t.mesh.scale.set(k, k, k);
        if (k <= 0.15) {
          this.exerciseState.misses++;
          this.removeTarget(i, true);
          continue;
        }
      }

      // Pop Shot: rise up into position.
      if (t.popUp && t.mesh.position.y < t.targetY) {
        t.mesh.position.y = Math.min(t.targetY, t.mesh.position.y + 45 * dt);
      }

      // Sequential elimination: pulse the "next" target to indicate order
      if (this.multiTargetState.active && this.multiTargetState.sequentialElimination) {
        // Keep label sprite position synced with target
        if (t.labelSprite && t.labelIsSceneChild) {
          t.labelSprite.position.copy(t.mesh.position);
          t.labelSprite.position.z += t.radius + 0.3;
        }
        if (t.order === this.multiTargetState.nextTargetOrder) {
          // Gentle scale pulse on the next target
          const pulse = 1.0 + 0.08 * Math.sin(t.age * 6);
          if (t.grewIn && !t.shrinking) {
            t.mesh.scale.set(pulse, pulse, pulse);
          }
          // Brighten the next target's emissive
          if (t.mesh.material && t.mesh.material.emissive) {
            t.mesh.material.emissive.setHex(0x44ff44);
            t.mesh.material.emissiveIntensity = 0.4 + 0.2 * Math.sin(t.age * 6);
          }
        } else {
          // Dim non-next targets slightly
          if (t.mesh.material && t.mesh.material.emissive) {
            t.mesh.material.emissive.setHex(0x000000);
            t.mesh.material.emissiveIntensity = 0;
          }
        }
      }

      // Wall Peek: slide in -> hold -> retreat (miss if it fully retreats).
      if (t.peek) {
        const slide = 45;
        const halfW =
          (window.UNIT_SYSTEM && window.UNIT_SYSTEM.playArea.halfWidth) || 35;
        if (t.peekPhase === "in") {
          const dx = t.targetX - t.mesh.position.x;
          const step = Math.sign(dx) * slide * dt;
          if (Math.abs(step) >= Math.abs(dx)) {
            t.mesh.position.x = t.targetX;
            t.peekPhase = "hold";
            t.peekTimer = 0;
          } else {
            t.mesh.position.x += step;
          }
        } else if (t.peekPhase === "hold") {
          t.peekTimer += dt * 1000;
          if (t.peekTimer >= t.peekHold) t.peekPhase = "out";
        } else {
          t.mesh.position.x += t.peekSign * slide * dt;
          if (Math.abs(t.mesh.position.x) >= halfW) {
            this.exerciseState.misses++;
            this.removeTarget(i, true);
            continue;
          }
        }
      }

      // Speed Ladder: expire when the (shrinking) window elapses; missing eases
      // the window back up slightly.
      if (t.ladder && t.age * 1000 > t.activeWindow) {
        this.exerciseState.misses++;
        this.ladderWindow = Math.min(this.ladderBase, this.ladderWindow / 0.85);
        this.removeTarget(i, true);
        continue;
      }

      // Movement patterns (dt-based → framerate-independent / smooth on low-end).
      if (t.pattern) {
        const us = window.UNIT_SYSTEM || {
          playArea: { halfWidth: 35, halfHeight: 12 },
        };
        const halfW = us.playArea.halfWidth || 35;
        const halfH = us.playArea.halfHeight || 12;
        const r = t.radius || 0;
        const boundX = halfW - r;
        const boundY = halfH - r;

        if (t.pattern === "sinusoidal") {
          // Smooth horizontal travel with a vertical sine wave.
          t.mesh.position.x += t.dir * t.speed * dt;
          if (t.mesh.position.x > boundX) {
            t.mesh.position.x = boundX;
            t.dir = -1;
          } else if (t.mesh.position.x < -boundX) {
            t.mesh.position.x = -boundX;
            t.dir = 1;
          }
          const amp = Math.min(t.amp, boundY);
          const ny = t.baseY + amp * Math.sin(t.freq * t.age + t.phase);
          t.mesh.position.y = Math.max(-boundY, Math.min(boundY, ny));
        } else if (t.pattern === "acceleration") {
          // Horizontal strafe whose speed oscillates between 25% and 100%.
          const sp = t.speed * (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t.age * 1.4)));
          t.mesh.position.x += t.dir * sp * dt;
          if (t.mesh.position.x > boundX) {
            t.mesh.position.x = boundX;
            t.dir = -1;
          } else if (t.mesh.position.x < -boundX) {
            t.mesh.position.x = -boundX;
            t.dir = 1;
          }
        } else if (t.pattern === "random") {
          // Erratic: re-aim at random intervals, full 2D bounce.
          t.retargetIn -= dt;
          if (t.retargetIn <= 0) {
            const a = Math.random() * Math.PI * 2;
            t.vx = Math.cos(a) * t.speed;
            t.vy = Math.sin(a) * t.speed * 0.6;
            t.retargetIn = 0.4 + Math.random() * 1.0;
          }
          t.mesh.position.x += t.vx * dt;
          t.mesh.position.y += t.vy * dt;
          if (t.mesh.position.x > boundX) {
            t.mesh.position.x = boundX;
            t.vx = -Math.abs(t.vx);
          } else if (t.mesh.position.x < -boundX) {
            t.mesh.position.x = -boundX;
            t.vx = Math.abs(t.vx);
          }
          if (t.mesh.position.y > boundY) {
            t.mesh.position.y = boundY;
            t.vy = -Math.abs(t.vy);
          } else if (t.mesh.position.y < -boundY) {
            t.mesh.position.y = -boundY;
            t.vy = Math.abs(t.vy);
          }
        } else {
          // linear: predictable horizontal strafe, bounce at edges.
          t.mesh.position.x += t.dir * t.speed * dt;
          if (t.mesh.position.x > boundX) {
            t.mesh.position.x = boundX;
            t.dir = -1;
          } else if (t.mesh.position.x < -boundX) {
            t.mesh.position.x = -boundX;
            t.dir = 1;
          }
        }
      }

      // Reactive tracking: change direction when cursor within 1.5x target radius
      if (this.reactiveState.active && (t.vx !== 0 || t.vy !== 0)) {
        this.checkReactiveTracking(t);
      }

      // Time-to-kill timeout: mark as missed after maxTTK ms
      if (this.ttkState.active && !this.trackingState.active && !t.colorTrigger) {
        const spawnTime = this.ttkState.spawnTimes.get(t.mesh.uuid);
        if (spawnTime && (performance.now() - spawnTime) > this.ttkState.maxTTK) {
          this.ttkState.spawnTimes.delete(t.mesh.uuid);
          this.exerciseState.misses++;
          this.ttkState.timeToKills.push(this.ttkState.maxTTK);
          this.removeTarget(i, true);
          continue;
        }
      }

      // Color trigger: managed globally, not per-target. Skip old per-target logic.
      // (Global color trigger logic is handled outside the per-target loop below)

      if (t.colorTrigger) {
        // Don't remove color trigger targets on reflex timeout
        continue;
      }

      if (t.mech.reflexMode && t.age > t.mech.reflexTime / 1000) {
        this.removeTarget(i, false);
      }
    }

    // --- Global Color Trigger Logic (outside per-target loop) ---
    if (this.colorTriggerActive && this.colorTriggerState && this.targets.length > 0) {
      const now = performance.now();
      const cts = this.colorTriggerState;

      if (cts.armedIndex >= 0) {
        // A target is currently green — check if its window expired
        if (now - cts.armedAt > cts.activeWindow) {
          // Expired without being clicked = miss
          this.exerciseState.misses++;
          // Turn it back to red
          const t = this.targets[cts.armedIndex];
          if (t) {
            t.armed = false;
            t.mesh.material.color.setHex(0xff3b3b);
            t.mesh.material.emissive.setHex(0xff3b3b);
          }
          cts.armedIndex = -1;
          cts.nextArmTime = now + (400 + Math.random() * 800);
        }
      } else if (now >= cts.nextArmTime) {
        // Time to arm a random target
        const idx = Math.floor(Math.random() * this.targets.length);
        const t = this.targets[idx];
        if (t && t.colorTrigger) {
          t.armed = true;
          t.mesh.material.color.setHex(0x33dd66);
          t.mesh.material.emissive.setHex(0x33dd66);
          cts.armedIndex = idx;
          cts.armedAt = now;
        }
      }
    }

    // Check auto-pop on mobile AFTER targets have been updated/scaled
    this.checkAimOverTarget();

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

    // In tracking mode, clicks don't register as hits (tracking is sampled continuously)
    if (this.trackingState.active) return;

    this.exerciseState.clicks++;

    this.raycaster.setFromCamera(this.center, this.camera);
    const meshes = this.targets.map((t) => t.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, true); // recursive for child meshes

    if (intersects.length > 0) {
      // Find the parent target mesh (in case we hit a child like critical zone or label)
      let hitMesh = intersects[0].object;
      while (hitMesh.parent && !this.targets.find((t) => t.mesh === hitMesh)) {
        hitMesh = hitMesh.parent;
      }

      const index = this.targets.findIndex((t) => t.mesh === hitMesh);
      if (index !== -1) {
        const target = this.targets[index];

        // Color trigger: clicking a not-yet-armed (red) target is penalized
        if (target.colorTrigger && !target.armed) {
          this.exerciseState.misses++;
          this.exerciseState.score = Math.max(
            0,
            this.exerciseState.score -
              (this.currentExercise.scoringRules.misspenalty || 20)
          );
          AudioSys.play("miss");
          // Don't remove — just penalize
          return;
        }

        // Color trigger: clicking the armed (green) target is a hit
        if (target.colorTrigger && target.armed) {
          this.exerciseState.hits++;
          this.exerciseState.score += this.currentExercise.scoringRules.hitReward || 100;
          AudioSys.play("hit");
          // Turn back to red
          target.armed = false;
          target.mesh.material.color.setHex(0xff3b3b);
          target.mesh.material.emissive.setHex(0xff3b3b);
          // Schedule next green target
          if (this.colorTriggerState) {
            this.colorTriggerState.armedIndex = -1;
            this.colorTriggerState.nextArmTime = performance.now() + (300 + Math.random() * 700);
          }
          return;
        }

        // Multi-target sequential elimination: check order
        if (this.multiTargetState.active && this.multiTargetState.sequentialElimination) {
          if (target.order !== this.multiTargetState.nextTargetOrder) {
            // Out-of-order hit: counts as miss, don't remove target
            this.exerciseState.misses++;
            this.exerciseState.score = Math.max(
              0,
              this.exerciseState.score - (this.currentExercise.scoringRules.misspenalty || 20)
            );
            AudioSys.play("miss");
            return;
          }
          // Correct order: advance to next
          this.multiTargetState.nextTargetOrder++;
        }

        // Headshot mode: check if hit is in critical zone
        if (this.headshotState.active) {
          const hitPoint = intersects[0].point;
          const targetCenter = target.mesh.position.clone();
          const distFromCenter = hitPoint.distanceTo(targetCenter);
          const criticalRadius = target.criticalRadius || (target.radius * this.headshotState.criticalZoneRatio);

          this.exerciseState.hits++;
          if (distFromCenter <= criticalRadius) {
            // Critical zone hit - award multiplied points
            const reward = (this.currentExercise.scoringRules.hitReward || 100) * this.headshotState.criticalMultiplier;
            this.exerciseState.score += reward;
          } else {
            // Outer zone hit - award base points (no multiplier)
            this.exerciseState.score += this.currentExercise.scoringRules.hitReward || 100;
          }
          AudioSys.play("hit");
        } else {
          // Standard hit. Shrinking targets award more the smaller they are
          // when struck, rewarding patience (up to ~1.85x).
          this.exerciseState.hits++;
          const base = this.currentExercise.scoringRules.hitReward || 100;
          const bonus = target.shrinking
            ? 2 - Math.max(0.15, target.mesh.scale.x)
            : 1;
          this.exerciseState.score += base * bonus;
          AudioSys.play("hit");
        }

        // Record time-to-kill
        if (this.ttkState.active) {
          const spawnTime = this.ttkState.spawnTimes.get(target.mesh.uuid);
          if (spawnTime) {
            const ttk = performance.now() - spawnTime;
            this.ttkState.timeToKills.push(Math.min(ttk, this.ttkState.maxTTK));
            this.ttkState.spawnTimes.delete(target.mesh.uuid);
          }
        }

        if (target.ladder) {
          this.ladderWindow = Math.max(350, this.ladderWindow * 0.85);
        }
        this.removeTarget(index, true);
        return;
      }
    }

    // Miss (no target hit)
    this.exerciseState.misses++;
    this.exerciseState.score = Math.max(
      0,
      this.exerciseState.score - (this.currentExercise.scoringRules.misspenalty || 20)
    );
    AudioSys.play("miss");
  }

  _updateLabelTexture(sprite, num) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(64, 64, 52, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#22ff88";
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(num), 64, 66);
    if (sprite.material.map) sprite.material.map.dispose();
    sprite.material.map = new THREE.CanvasTexture(canvas);
    sprite.material.needsUpdate = true;
  }

  removeTarget(index, shouldRespawn) {
    const t = this.targets[index];
    // Remove scene-level label sprite if present
    if (t.labelSprite && t.labelIsSceneChild) {
      this.scene.remove(t.labelSprite);
      if (t.labelSprite.material) {
        if (t.labelSprite.material.map) t.labelSprite.material.map.dispose();
        t.labelSprite.material.dispose();
      }
    }
    this.scene.remove(t.mesh);
    t.mesh.geometry.dispose();
    t.mesh.material.dispose();
    // Dispose child meshes (critical zone, labels)
    if (t.mesh.children) {
      t.mesh.children.forEach((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
    }
    this.targets.splice(index, 1);

    // Sequential Elimination: DON'T respawn individual targets.
    // Wait until entire wave is cleared, then spawn a fresh batch.
    // Faster clears = shorter delay between waves (rewards speed).
    if (this.multiTargetState.active && this.multiTargetState.sequentialElimination) {
      if (this.targets.length === 0) {
        // Wave cleared! Reset and spawn next batch
        this.multiTargetState.nextTargetOrder = 1;
        this.multiTargetState.targetLabels = [];

        // Calculate wave clear time and scale delay: faster clear = shorter wait
        const waveTime = this.multiTargetState.waveStartTime
          ? (performance.now() - this.multiTargetState.waveStartTime) / 1000
          : 2.0;
        // Base delay 0.5s, but if cleared in under 2s, reduce to as low as 0.15s
        const minDelay = 150;
        const maxDelay = 600;
        const delay = Math.max(minDelay, Math.min(maxDelay, waveTime * 200));

        if (this.respawnTimer) clearTimeout(this.respawnTimer);
        this.respawnTimer = setTimeout(() => {
          this.spawnTargets();
          this.multiTargetState.waveStartTime = performance.now();
          this.respawnTimer = null;
        }, delay);
      }
      // Don't respawn individual targets — wait for wave clear
      return;
    }

    // Non-sequential: standard single-target respawn
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
      if (this.currentPixelRatio) this.renderer.setPixelRatio(this.currentPixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      // keep canvas style full-bleed
      if (this.renderer.domElement) {
        this.renderer.domElement.style.width = window.innerWidth + "px";
        this.renderer.domElement.style.height = window.innerHeight + "px";
      }
    }
  }

  /**
   * Start the tracking accuracy sampler at the configured Hz rate.
   * Samples cursor position relative to target hitbox.
   */
  startTrackingSampler() {
    // Cap the sampler on mobile/low-end to 30Hz to keep the main thread free.
    const rate = this.isMobile ? 30 : this.trackingState.sampleRate;
    const intervalMs = 1000 / rate;
    this.trackingState.sampleInterval = setInterval(() => {
      if (!this.exerciseState.running || this.exerciseState.paused) return;
      if (this.targets.length === 0) return;

      // Check if cursor (crosshair center) is within any target hitbox
      this.raycaster.setFromCamera(this.center, this.camera);
      const meshes = this.targets.map((t) => t.mesh);
      const intersects = this.raycaster.intersectObjects(meshes, true);

      const isOnTarget = intersects.length > 0;
      this.trackingState.samples.push(isOnTarget);

      // Update score for tracking (reward for staying on target)
      if (isOnTarget) {
        this.exerciseState.hits++;
        this.exerciseState.score += (this.currentExercise.scoringRules.hitReward || 50) / this.trackingState.sampleRate;
      }
    }, intervalMs);
  }

  /**
   * Check reactive tracking: if cursor is within 1.5x target radius,
   * change target direction within 100ms.
   */
  checkReactiveTracking(target) {
    if (!this.reactiveState.active) return;

    // Project target position to screen space and compare with cursor center
    const targetPos = target.mesh.position.clone();
    targetPos.project(this.camera);

    // Calculate distance in normalized device coordinates
    const dx = targetPos.x - this.center.x;
    const dy = targetPos.y - this.center.y;
    const screenDist = Math.sqrt(dx * dx + dy * dy);

    // Convert target radius to NDC space (approximate)
    const targetRadius = target.radius || 2.0;
    const distToCamera = target.mesh.position.distanceTo(this.camera.position);
    const fov = this.camera.fov * (Math.PI / 180);
    const ndcRadius = (targetRadius / (distToCamera * Math.tan(fov / 2)));
    const proximityThreshold = ndcRadius * 1.5;

    if (screenDist < proximityThreshold) {
      // Cursor is within 1.5x target radius
      if (!this.reactiveState.cursorProximityStart) {
        this.reactiveState.cursorProximityStart = performance.now();
        this.reactiveState.directionChanged = false;
      } else if (!this.reactiveState.directionChanged) {
        const elapsed = performance.now() - this.reactiveState.cursorProximityStart;
        if (elapsed <= 100) {
          // Change direction within 100ms
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.sqrt(target.vx * target.vx + target.vy * target.vy) || 0.3;
          target.vx = Math.cos(angle) * speed;
          target.vy = Math.sin(angle) * speed;
          this.reactiveState.directionChanged = true;
        }
      }
    } else {
      // Cursor left proximity zone, reset
      this.reactiveState.cursorProximityStart = null;
      this.reactiveState.directionChanged = false;
    }
  }

  /**
   * Get the current tracking accuracy (0.0 - 1.0).
   * Returns the ratio of on-target samples to total samples.
   */
  getTrackingAccuracy() {
    if (!this.trackingState.active || this.trackingState.samples.length === 0) {
      return 0;
    }
    const onTarget = this.trackingState.samples.filter((s) => s).length;
    return onTarget / this.trackingState.samples.length;
  }

  /**
   * Get time-to-kill recordings array (ms per target).
   */
  getTimeToKills() {
    return this.ttkState.timeToKills.slice();
  }

  /**
   * Get tracking samples array for external score calculation.
   */
  getTrackingSamples() {
    return this.trackingState.samples.slice();
  }

  /**
   * Get the full exercise result data for the completed exercise.
   * Returns an object compatible with ExerciseResult interface.
   */
  getExerciseResult() {
    const state = this.exerciseState;
    const total = state.hits + state.misses;
    const accuracy = total === 0 ? 0 : state.hits / total;
    const hitsPerSecond = state.hits / Math.max(state.timeElapsed, 1);

    const result = {
      exerciseId: this.currentExercise ? this.currentExercise.id : "",
      score: state.score,
      rawScore: state.score,
      accuracy: accuracy,
      hits: state.hits,
      misses: state.misses,
      totalClicks: state.clicks,
      hitsPerSecond: hitsPerSecond,
      duration: state.timeElapsed,
    };

    // Include tracking accuracy if in tracking mode
    if (this.trackingState.active) {
      result.trackingAccuracy = this.getTrackingAccuracy();
      result.trackingSamples = this.getTrackingSamples();
    }

    // Include time-to-kill data if available
    if (this.ttkState.active && this.ttkState.timeToKills.length > 0) {
      result.timeToKills = this.getTimeToKills();
    }

    return result;
  }

  stop() {
    this.exerciseState.running = false;
    // Clean up tracking sampler
    if (this.trackingState.sampleInterval) {
      clearInterval(this.trackingState.sampleInterval);
      this.trackingState.sampleInterval = null;
    }
    this.renderer.domElement.remove();
  }
}
