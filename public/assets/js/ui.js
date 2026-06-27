/**
 * UI System & Controller
 * Fixed: Crosshair Fallback (Prevents invisible crosshair)
 */

let ExerciseController = {
  engine: null,
  currentExercise: null,
  animationId: null,
  isMobile:
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent.toLowerCase()
    ) ||
    (('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches) ||
    window.innerWidth < 900,

  async initExercise(exerciseId) {
    const ex = getExerciseById(exerciseId);
    if (!ex) return;

    this.currentExercise = ex;

    // Show difficulty picker before starting
    const difficulty = await this.showDifficultyPicker(ex.name);
    if (difficulty === null) return; // user cancelled

    // Apply difficulty
    const scaleMap = { easy: 1.4, medium: 1.0, hard: 0.5 };
    Storage.set("aim_difficulty", difficulty);
    Storage.set(Storage.KEYS.TARGET_SIZE, scaleMap[difficulty] || 1.0);

    const container = document.getElementById("game-container");
    container.innerHTML = "";

    // Init 3D Engine
    this.engine = new ExerciseEngine(container);
    if (!this.engine.initExercise(exerciseId)) return;

    // UI Updates - HIDE EVERYTHING ELSE
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("results-menu").classList.add("hidden");
    document.getElementById("exercise-hud").classList.add("hidden");
    document.getElementById("click-overlay").classList.add("hidden");
    document.getElementById("hud").style.opacity = 1;

    // Reset FPS display
    document.getElementById("fps-counter").style.display = "block";

    // Hide native cursor immediately on desktop (CSS), before countdown
    if (!this.isMobile) document.body.classList.add("playing");

    this.resizeCrosshairCanvas();
    this.showMobilePauseButton();

    await this.countdown();

    this.engine.spawnTargets();
    this.startGameLoop();

    // Only request pointer lock on desktop (mobile doesn't support it)
    if (!this.isMobile && document.body.requestPointerLock) {
      document.body.requestPointerLock();
    }
  },

  async initExerciseWithVariants(defaultId, variantDataEncoded) {
    const variants = JSON.parse(decodeURIComponent(variantDataEncoded));
    // Show difficulty picker with variant selector
    const result = await this.showDifficultyPickerWithVariants(defaultId, variants);
    if (!result) return; // cancelled

    const { exerciseId, difficulty } = result;
    const scaleMap = { easy: 1.4, medium: 1.0, hard: 0.5 };
    Storage.set("aim_difficulty", difficulty);
    Storage.set(Storage.KEYS.TARGET_SIZE, scaleMap[difficulty] || 1.0);

    const ex = getExerciseById(exerciseId);
    if (!ex) return;
    this.currentExercise = ex;

    const container = document.getElementById("game-container");
    container.innerHTML = "";

    this.engine = new ExerciseEngine(container);
    if (!this.engine.initExercise(exerciseId)) return;

    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("results-menu").classList.add("hidden");
    document.getElementById("exercise-hud").classList.add("hidden");
    document.getElementById("click-overlay").classList.add("hidden");
    document.getElementById("hud").style.opacity = 1;
    document.getElementById("fps-counter").style.display = "block";

    this.resizeCrosshairCanvas();
    this.showMobilePauseButton();

    await this.countdown();
    this.engine.spawnTargets();
    this.startGameLoop();

    if (!this.isMobile && document.body.requestPointerLock) {
      document.body.requestPointerLock();
    }
    if (!this.isMobile) document.body.classList.add("playing");
  },

  showDifficultyPickerWithVariants(defaultId, variants) {
    return new Promise((resolve) => {
      const currentDiff = Storage.get("aim_difficulty") || "medium";
      let selectedVariant = defaultId;
      const overlay = document.createElement("div");
      overlay.id = "difficulty-picker-overlay";
      overlay.style.cssText = "position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);";

      let variantOptions = variants.map(v =>
        `<option value="${v.id}" ${v.id === defaultId ? 'selected' : ''}>${v.name}</option>`
      ).join('');

      overlay.innerHTML = `
        <div style="background:#141a26;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px 28px;max-width:400px;width:90%;text-align:center;">
          <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:12px;">Configure Exercise</div>

          <div style="margin-bottom:16px;text-align:left;">
            <label style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:#888;font-weight:600;display:block;margin-bottom:6px;">Variant</label>
            <select id="variant-select" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:#0d1117;color:#fff;font-size:0.9rem;font-family:inherit;">
              ${variantOptions}
            </select>
          </div>

          <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:#888;font-weight:600;margin-bottom:8px;text-align:left;">Target Size</div>
          <div style="display:flex;gap:10px;margin-bottom:16px;">
            <button data-d="easy" style="flex:1;padding:14px 10px;border-radius:10px;border:2px solid ${currentDiff === 'easy' ? '#4ade80' : 'rgba(255,255,255,0.1)'};background:${currentDiff === 'easy' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)'};cursor:pointer;transition:all 0.15s;">
              <div style="font-size:1.2rem;margin-bottom:2px;">🟢</div>
              <div style="font-size:0.8rem;font-weight:700;color:#4ade80;">Easy</div>
              <div style="font-size:0.65rem;color:#888;">Large</div>
            </button>
            <button data-d="medium" style="flex:1;padding:14px 10px;border-radius:10px;border:2px solid ${currentDiff === 'medium' ? '#6366f1' : 'rgba(255,255,255,0.1)'};background:${currentDiff === 'medium' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)'};cursor:pointer;transition:all 0.15s;">
              <div style="font-size:1.2rem;margin-bottom:2px;">🟡</div>
              <div style="font-size:0.8rem;font-weight:700;color:#6366f1;">Medium</div>
              <div style="font-size:0.65rem;color:#888;">Standard</div>
            </button>
            <button data-d="hard" style="flex:1;padding:14px 10px;border-radius:10px;border:2px solid ${currentDiff === 'hard' ? '#f87171' : 'rgba(255,255,255,0.1)'};background:${currentDiff === 'hard' ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.03)'};cursor:pointer;transition:all 0.15s;">
              <div style="font-size:1.2rem;margin-bottom:2px;">🔴</div>
              <div style="font-size:0.8rem;font-weight:700;color:#f87171;">Hard</div>
              <div style="font-size:0.65rem;color:#888;">Tiny</div>
            </button>
          </div>
          <button id="diff-cancel" style="background:none;border:none;color:#666;font-size:0.8rem;cursor:pointer;padding:8px;font-family:inherit;">Cancel</button>
        </div>
      `;

      document.body.appendChild(overlay);

      overlay.querySelectorAll("[data-d]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const d = btn.getAttribute("data-d");
          const variantSelect = document.getElementById("variant-select");
          const exerciseId = variantSelect ? variantSelect.value : defaultId;
          overlay.remove();
          resolve({ exerciseId, difficulty: d });
        });
      });

      overlay.querySelector("#diff-cancel").addEventListener("click", () => {
        overlay.remove();
        resolve(null);
      });
    });
  },

  resizeCrosshairCanvas() {
    const c = document.getElementById("crosshair-canvas");
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  },

  showDifficultyPicker(exerciseName) {
    return new Promise((resolve) => {
      const currentDiff = Storage.get("aim_difficulty") || "medium";
      const overlay = document.createElement("div");
      overlay.id = "difficulty-picker-overlay";
      overlay.style.cssText = "position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);";

      overlay.innerHTML = `
        <div style="background:#141a26;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px 28px;max-width:380px;width:90%;text-align:center;">
          <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:8px;">Select Difficulty</div>
          <div style="font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:20px;">${exerciseName || 'Exercise'}</div>
          <div style="display:flex;gap:10px;margin-bottom:16px;">
            <button data-d="easy" style="flex:1;padding:14px 10px;border-radius:10px;border:2px solid ${currentDiff === 'easy' ? '#4ade80' : 'rgba(255,255,255,0.1)'};background:${currentDiff === 'easy' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)'};cursor:pointer;transition:all 0.15s;">
              <div style="font-size:1.4rem;margin-bottom:4px;">🟢</div>
              <div style="font-size:0.85rem;font-weight:700;color:#4ade80;">Easy</div>
              <div style="font-size:0.7rem;color:#888;margin-top:2px;">Large targets</div>
            </button>
            <button data-d="medium" style="flex:1;padding:14px 10px;border-radius:10px;border:2px solid ${currentDiff === 'medium' ? '#6366f1' : 'rgba(255,255,255,0.1)'};background:${currentDiff === 'medium' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)'};cursor:pointer;transition:all 0.15s;">
              <div style="font-size:1.4rem;margin-bottom:4px;">🟡</div>
              <div style="font-size:0.85rem;font-weight:700;color:#6366f1;">Medium</div>
              <div style="font-size:0.7rem;color:#888;margin-top:2px;">Standard</div>
            </button>
            <button data-d="hard" style="flex:1;padding:14px 10px;border-radius:10px;border:2px solid ${currentDiff === 'hard' ? '#f87171' : 'rgba(255,255,255,0.1)'};background:${currentDiff === 'hard' ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.03)'};cursor:pointer;transition:all 0.15s;">
              <div style="font-size:1.4rem;margin-bottom:4px;">🔴</div>
              <div style="font-size:0.85rem;font-weight:700;color:#f87171;">Hard</div>
              <div style="font-size:0.7rem;color:#888;margin-top:2px;">Tiny targets</div>
            </button>
          </div>
          <button id="diff-cancel" style="background:none;border:none;color:#666;font-size:0.8rem;cursor:pointer;padding:8px;font-family:inherit;">Cancel</button>
        </div>
      `;

      document.body.appendChild(overlay);

      overlay.querySelectorAll("[data-d]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const d = btn.getAttribute("data-d");
          overlay.remove();
          resolve(d);
        });
      });

      overlay.querySelector("#diff-cancel").addEventListener("click", () => {
        overlay.remove();
        resolve(null);
      });
    });
  },

  clearCrosshairCanvas() {
    const c = document.getElementById("crosshair-canvas");
    if (!c) return;
    const ctx = c.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, c.width, c.height);
  },

  showMobilePauseButton() {
    if (this.isMobile) {
      const btn = document.getElementById("mobile-pause-btn");
      if (btn) {
        btn.classList.remove("hidden");
        btn.style.display = "flex";
      }
    }
  },

  hideMobilePauseButton() {
    const btn = document.getElementById("mobile-pause-btn");
    if (btn) {
      btn.classList.add("hidden");
      btn.style.display = "none";
    }
  },

  countdown() {
    return new Promise((resolve) => {
      const el = document.getElementById("center-msg");
      let count = 3;
      el.classList.add("visible");
      el.innerText = count;
      AudioSys.play("tick");
      const intv = setInterval(() => {
        count--;
        if (count > 0) {
          el.innerText = count;
          AudioSys.play("tick");
        } else {
          clearInterval(intv);
          el.classList.remove("visible");
          resolve();
        }
      }, 700);
    });
  },

  startGameLoop() {
    let lastTime = performance.now();
    let lastRender = lastTime;
    let frames = 0;
    let lastFpsTime = performance.now();
    // Cap to ~60fps. Movement is dt-based so this stays smooth, and on
    // high-refresh screens it avoids rendering 90/120fps (big battery saving).
    const FRAME_MS = 1000 / 60 - 1;

    const loop = (now) => {
      // Throttle to the target framerate; keep the loop alive while capped.
      if (now - lastRender < FRAME_MS) {
        this.animationId = requestAnimationFrame(loop);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      lastRender = now;

      // FPS Calculation
      frames++;
      if (now >= lastFpsTime + 1000) {
        document.getElementById("fps-counter").innerText = frames + " FPS";
        frames = 0;
        lastFpsTime = now;
      }

      if (
        this.engine &&
        this.engine.exerciseState.running &&
        !this.engine.exerciseState.paused
      ) {
        this.engine.update(dt);
        this.drawOverlayCrosshair();
        this.updateHUD();

        if (
          this.engine.exerciseState.timeElapsed >= this.currentExercise.duration
        ) {
          this.finishExercise();
          return; // stop the loop (don't request another frame)
        }
      }
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  },

  drawOverlayCrosshair() {
    const canvas = document.getElementById("crosshair-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const config = Storage.getCrosshairConfig();
    CrosshairManager.drawToContext(ctx, cx, cy, config);
  },

  updateHUD() {
    if (!this.engine) return;
    const state = this.engine.exerciseState;
    const timeLeft = Math.max(
      0,
      this.currentExercise.duration - state.timeElapsed
    );

    document.getElementById("score-val").innerText = Math.floor(state.score);
    document.getElementById("time-val").innerText = `00:${Math.ceil(timeLeft)
      .toString()
      .padStart(2, "0")}`;

    const acc =
      state.clicks > 0 ? Math.round((state.hits / state.clicks) * 100) : 100;
    document.getElementById("acc-val").innerText = acc + "%";
  },

  finishExercise() {
    cancelAnimationFrame(this.animationId);
    this.clearCrosshairCanvas();

    document.getElementById("exercise-hud").classList.add("hidden");
    document.getElementById("click-overlay").classList.add("hidden");
    document.getElementById("hud").style.opacity = 0;
    document.getElementById("fps-counter").style.display = "none";
    this.hideMobilePauseButton();

    document.exitPointerLock();
    // Restore native cursor when exercise finishes
    if (!this.isMobile) document.body.classList.remove("playing");

    const results = this.engine.exerciseState;

    const finalData = {
      score: Math.floor(results.score),
      hits: results.hits,
      misses: results.misses,
      clicks: results.clicks,
      accuracy:
        results.clicks > 0
          ? ((results.hits / results.clicks) * 100).toFixed(1)
          : 100,
      kps: (results.hits / this.currentExercise.duration).toFixed(2),
      exercise: this.currentExercise.name,
      exerciseId: this.currentExercise.id,
    };

    Storage.saveResult(finalData);

    // Display results immediately (within 2 seconds of completion - Req 1.7)
    document.getElementById("results-menu").classList.remove("hidden");
    document.getElementById("res-score").innerText = finalData.score;
    document.getElementById("res-acc").innerText = finalData.accuracy + "%";
    document.getElementById(
      "res-hits"
    ).innerText = `${finalData.hits}/${finalData.clicks}`;
    document.getElementById("res-kps").innerText = finalData.kps;
    document.getElementById(
      "exercise-result"
    ).innerHTML = `<h3 style="margin:0">${this.currentExercise.name} Completed</h3>`;

    // Run the scoring pipeline if available (non-blocking)
    // Pipeline: score engine → progression update → leaderboard submission
    if (window.ExercisePipeline && typeof window.ExercisePipeline.processCompletion === 'function') {
      const rawResult = this.engine.getExerciseResult();
      window.ExercisePipeline.processCompletion(rawResult).then((pipelineResult) => {
        // Update display with normalized score if pipeline completed
        if (pipelineResult) {
          // Show normalized score alongside raw score
          const scoreEl = document.getElementById("res-score");
          if (scoreEl) {
            scoreEl.innerText = finalData.score;
            scoreEl.title = `Normalized: ${pipelineResult.normalizedScore}/1000`;
          }
          // Update rank if available
          if (pipelineResult.leaderboardRank) {
            const resultEl = document.getElementById("exercise-result");
            if (resultEl) {
              resultEl.innerHTML = `<h3 style="margin:0">${this.currentExercise.name} Completed</h3>
                <div style="font-size:0.8rem; color:#888; margin-top:5px;">
                  Rank #${pipelineResult.leaderboardRank} ${pipelineResult.tier ? '• ' + pipelineResult.tier : ''}
                </div>`;
            }
          }
        }
      }).catch(() => {
        // Pipeline failure is non-critical, results already displayed
      });
    } else {
      // Fallback: submit score to leaderboard directly (legacy path)
      try {
        const playerName = localStorage.getItem("player_name");
        if (
          playerName &&
          window.Leaderboard &&
          typeof window.Leaderboard.postScore === "function"
        ) {
          window.Leaderboard.postScore(
            finalData.score,
            finalData.exerciseId
          ).then((res) => {
            if (document.getElementById("leaderboard-container")) {
              window.Leaderboard.renderInto(
                "leaderboard-container",
                finalData.exerciseId
              );
            }
          });
        }
      } catch (e) {
        // Leaderboard submit error - non-critical
      }
    }
  },

  resume() {
    // console.log("[resume] Called");
    document.getElementById("exercise-hud").classList.add("hidden");
    document.getElementById("click-overlay").classList.add("hidden");
    if (this.engine) {
      this.engine.exerciseState.paused = false;
      // Only request pointer lock on desktop
      if (!this.isMobile && document.body.requestPointerLock) {
        document.body.requestPointerLock();
      }
      if (!this.isMobile) document.body.classList.add("playing");
    }
  },

  pause() {
    // console.log(
    //   "[pause] Called - engine:",
    //   !!this.engine,
    //   "running:",
    //   this.engine?.exerciseState?.running
    // );
    if (!this.engine || !this.engine.exerciseState.running) {
      // console.warn("[pause] Returning early - no engine or not running");
      return;
    }
    if (!document.getElementById("results-menu").classList.contains("hidden")) {
      // console.warn("[pause] Returning early - results menu visible");
      return;
    }

    // console.log("[pause] Setting paused state");
    this.engine.exerciseState.paused = true;
    document.getElementById("exercise-hud").classList.remove("hidden");
    // Only exit pointer lock if it was enabled (desktop)
    if (!this.isMobile && document.exitPointerLock) {
      document.exitPointerLock();
    }

    // Restore native cursor when paused/menus open
    if (!this.isMobile) document.body.classList.remove("playing");

    // Hide mobile pause button when returning to menu
    this.hideMobilePauseButton();
  },

  quit() {
    // console.log("[quit] Called");
    document.getElementById("exercise-hud").classList.add("hidden");
    this.returnToMenu();
  },

  menu() {
    // console.log("[menu] Called");
    document.getElementById("results-menu").classList.add("hidden");
    this.returnToMenu();
  },

  repeatExercise() {
    document.getElementById("results-menu").classList.add("hidden");
    this.startExerciseDirect(this.currentExercise.id);
  },

  // Start exercise directly without difficulty picker (for retries)
  async startExerciseDirect(exerciseId) {
    const ex = getExerciseById(exerciseId);
    if (!ex) return;
    this.currentExercise = ex;

    const container = document.getElementById("game-container");
    container.innerHTML = "";

    this.engine = new ExerciseEngine(container);
    if (!this.engine.initExercise(exerciseId)) return;

    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("results-menu").classList.add("hidden");
    document.getElementById("exercise-hud").classList.add("hidden");
    document.getElementById("click-overlay").classList.add("hidden");
    document.getElementById("hud").style.opacity = 1;
    document.getElementById("fps-counter").style.display = "block";

    // Hide native cursor immediately on desktop (CSS), before countdown
    if (!this.isMobile) document.body.classList.add("playing");

    this.resizeCrosshairCanvas();
    this.showMobilePauseButton();

    await this.countdown();
    this.engine.spawnTargets();
    this.startGameLoop();

    if (!this.isMobile && document.body.requestPointerLock) {
      document.body.requestPointerLock();
    }
  },

  returnToMenu() {
    if (this.engine) this.engine.stop();
    cancelAnimationFrame(this.animationId);
    this.clearCrosshairCanvas();

    document.getElementById("exercise-hud").classList.add("hidden");
    document.getElementById("results-menu").classList.add("hidden");
    document.getElementById("click-overlay").classList.add("hidden");
    document.getElementById("fps-counter").style.display = "none";

    document.getElementById("main-menu").classList.remove("hidden");
    document.getElementById("hud").style.opacity = 0;

    // Only exit pointer lock if it was enabled (desktop)
    if (!this.isMobile && document.exitPointerLock) {
      document.exitPointerLock();
    }
    if (!this.isMobile) document.body.classList.remove("playing");

    if (window.renderProgress) {
      window.renderProgress();
    }
  },
};

const CrosshairManager = {
  activeConfig: {},
  init() {
    this.activeConfig = Storage.getCrosshairConfig();
    this.updateInputs();
    this.renderPreview();
    this.populateSavedList();
  },
  drawToContext(ctx, x, y, config) {
    // FALLBACK: If config is null/undefined, use default green
    if (!config) {
      config = { style: "classic", size: 6, color: "#00ff00", opacity: 1 };
    }

    ctx.save();
    ctx.globalAlpha = config.opacity;
    ctx.translate(x, y);
    ctx.fillStyle = config.color;
    ctx.strokeStyle = config.color;
    const size = config.size;

    if (config.style === "classic") {
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(-2, 0);
      ctx.moveTo(2, 0);
      ctx.lineTo(size, 0);
      ctx.moveTo(0, -size);
      ctx.lineTo(0, -2);
      ctx.moveTo(0, 2);
      ctx.lineTo(0, size);
      ctx.stroke();
    } else if (config.style === "dot") {
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (config.style === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (config.style === "plus") {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-size / 2, 0);
      ctx.lineTo(size / 2, 0);
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(0, size / 2);
      ctx.stroke();
    }
    ctx.restore();
  },
  renderPreview() {
    const canvas = document.getElementById("crosshair-preview-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    this.drawToContext(
      ctx,
      canvas.width / 2,
      canvas.height / 2,
      this.activeConfig
    );
  },
  updateInputs() {
    const c = this.activeConfig;
    if (!c) return; // Guard
    setVal("cr-style", c.style);
    setVal("cr-size", c.size);
    setVal("cr-color", c.color);
    setVal("cr-opacity", c.opacity);
    if (document.getElementById("cr-name"))
      document.getElementById("cr-name").value = c.name || "Custom";
  },
  onInputChange() {
    this.activeConfig = {
      name: document.getElementById("cr-name").value,
      style: document.getElementById("cr-style").value,
      size: parseInt(document.getElementById("cr-size").value),
      color: document.getElementById("cr-color").value,
      opacity: parseFloat(document.getElementById("cr-opacity").value),
    };
    Storage.setCrosshairConfig(this.activeConfig);
    this.renderPreview();
  },
  savePreset() {
    const name = document.getElementById("cr-name").value;
    if (!name) return alert("Please name your crosshair");
    this.activeConfig.name = name;
    Storage.addCustomCrosshair(this.activeConfig);
    this.populateSavedList();
    alert("Crosshair Saved!");
  },
  populateSavedList() {
    const list = Storage.getSavedCrosshairs();
    const select = document.getElementById("saved-crosshairs");
    select.innerHTML = '<option value="">-- Load Saved --</option>';
    list.forEach((c, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.innerText = c.name;
      select.appendChild(opt);
    });
  },
  loadPreset(idx) {
    if (idx === "") return;
    const list = Storage.getSavedCrosshairs();
    if (list[idx]) {
      this.activeConfig = list[idx];
      Storage.setCrosshairConfig(this.activeConfig);
      this.updateInputs();
      this.renderPreview();
    }
  },
  deletePreset() {
    const name = document.getElementById("cr-name").value;
    if (confirm(`Delete stored crosshair '${name}'?`)) {
      Storage.deleteCustomCrosshair(name);
      this.populateSavedList();
    }
  },
};

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

window.showTab = (tabName) => {
  document
    .querySelectorAll(".main-view")
    .forEach((el) => el.classList.add("hidden"));
  document.getElementById("tab-" + tabName).classList.remove("hidden");
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));
  const btns = document.querySelectorAll(".nav-btn");
  if (tabName === "exercises") btns[0].classList.add("active");
  if (tabName === "progress") btns[1].classList.add("active");
  if (tabName === "leaderboard") btns[2].classList.add("active");
  if (tabName === "settings") btns[3].classList.add("active");

  if (tabName === "exercises") window.renderExercises();
  if (tabName === "progress") window.renderProgress();
  if (tabName === "settings") {
    Settings.init();
    CrosshairManager.init();
  }
  if (tabName === "leaderboard") {
    // lazy-load leaderboard
    // console.log(
    //   "[showTab] leaderboard tab - checking window.Leaderboard:",
    //   !!window.Leaderboard
    // );
    if (
      window.Leaderboard &&
      typeof window.Leaderboard.renderInto === "function"
    ) {
      // console.log("[showTab] Rendering leaderboard...");
      window.Leaderboard.renderInto("leaderboard-container");
    } else {
      // console.warn(
      //   "[showTab] Leaderboard not available or renderInto not a function"
      // );
    }
  }
};

window.renderExercises = () => {
  // Show category selector grid with all available categories
  document.getElementById("category-selector").style.display = "block";
  document.getElementById("exercises-container").style.display = "none";

  const grid = document.getElementById("category-grid");
  if (!grid) return;

  // Re-read EXERCISES in case bridge has updated it
  if (typeof window !== 'undefined' && window.EXERCISES) {
    EXERCISES = window.EXERCISES;
  }

  let html = '';
  const categoryKeys = Object.keys(EXERCISES);
  categoryKeys.forEach((key) => {
    const cat = EXERCISES[key];
    const count = cat.exercises ? cat.exercises.length : 0;
    html += `
      <div class="exercise-card" onclick="window.showCategoryExercises('${key}')">
        <h3>${cat.icon || '🎯'} ${cat.category}</h3>
        <div style="font-size:0.8rem; color:#888">${count} exercise${count !== 1 ? 's' : ''}</div>
      </div>`;
  });
  grid.innerHTML = html;
};

// Expose CrosshairManager globally for React UI handlers
window.CrosshairManager = CrosshairManager;

window.showCategoryExercises = (key) => {
  document.getElementById("category-selector").style.display = "none";
  document.getElementById("exercises-container").style.display = "block";
  const cat = EXERCISES[key];
  const container = document.getElementById("exercises-container");

  if (!cat || !cat.exercises || cat.exercises.length === 0) {
    // Empty category message (Requirement 1.6)
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <button class="action-btn" onclick="window.renderExercises()" style="margin-bottom: 20px; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted);" onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-muted)'">← Back to Categories</button>
        <h2 style="color: var(--accent)">${cat ? cat.category : 'Category'}</h2>
        <p style="color: #888; font-size: 1rem; margin-top: 20px;">No exercises are available in this category yet.</p>
        <p style="color: #666; font-size: 0.85rem; margin-top: 10px;">Check back soon for new exercises!</p>
      </div>`;
    return;
  }

  let html = `<button class="action-btn" onclick="window.renderExercises()" style="margin-bottom: 20px; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted);" onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-muted)'">← Back to Categories</button>`;
  html += `<h2 style="color:var(--accent)">${cat.icon || ''} ${cat.category}</h2><div class="mode-grid">`;

  // Group exercises into families for a cleaner card view
  const FAMILY_MAP = {
    'flick_micro': 'flick_distance',
    'flick_medium': 'flick_distance',
    'flick_wide': 'flick_distance',
    'flick_multi_target': 'flick_sequential',
    'flick_multi_target_easy': 'flick_sequential',
    'flick_multi_target_hard': 'flick_sequential',
    'tracking_strafe': 'tracking_strafe',
    'tracking_smooth': 'tracking_strafe',
    'speed_blitz': 'speed_blitz',
    'speed_blitz_sequential': 'speed_blitz',
  };

  const FAMILY_META = {
    'flick_distance': { name: 'Flick Training', description: 'Practice flick shots at different angles — from micro adjustments to wide 180° snaps.', defaultId: 'flick_medium' },
    'flick_sequential': { name: 'Sequential Elimination', description: 'Multiple targets spawn with numbers. Eliminate them in order as fast as possible.', defaultId: 'flick_multi_target' },
  };

  const seen = new Set();
  const groupedExercises = [];

  cat.exercises.forEach((ex) => {
    const family = FAMILY_MAP[ex.id];
    if (family) {
      if (!seen.has(family)) {
        seen.add(family);
        const variants = cat.exercises.filter((e) => FAMILY_MAP[e.id] === family);
        const meta = FAMILY_META[family];
        groupedExercises.push({
          isGroup: true,
          family,
          name: meta ? meta.name : variants[0].name,
          description: meta ? meta.description : variants[0].description,
          defaultId: meta ? meta.defaultId : variants[0].id,
          variants,
          stats: variants[0].stats,
        });
      }
    } else {
      groupedExercises.push({ isGroup: false, exercise: ex });
    }
  });

  groupedExercises.forEach((item) => {
    if (item.isGroup) {
      const variantData = encodeURIComponent(JSON.stringify(item.variants.map(v => ({ id: v.id, name: v.name }))));
      html += `
            <div class="exercise-card" onclick="ExerciseController.initExerciseWithVariants('${item.defaultId}', '${variantData}')">
                <h3>${item.name}</h3>
                <div style="font-size:0.8rem; color:#888">${item.description}</div>
                <div style="margin-top:6px; font-size:0.7rem; color:var(--accent)">${item.variants.length} variants</div>
                <div style="margin-top:4px; font-size:0.7rem; color:#666">Focus: ${item.stats.join(" • ")}</div>
            </div>`;
    } else {
      const ex = item.exercise;
      html += `
            <div class="exercise-card" onclick="ExerciseController.initExercise('${ex.id}')">
                <h3>${ex.name}</h3>
                <div style="font-size:0.8rem; color:#888">${ex.description}</div>
                <div style="margin-top:4px; font-size:0.7rem; color:#666">Focus: ${ex.stats.join(" • ")}</div>
            </div>`;
    }
  });
  html += `</div>`;
  container.innerHTML = html;
};

window.renderProgress = () => {
  const list = Storage.getResults();
  const container = document.getElementById("progress-stats");
  if (list.length === 0) {
    container.innerHTML = "No stats recorded yet.";
    return;
  }
  const totalScore = list.reduce((a, b) => a + b.score, 0);
  const avgAcc = (
    list.reduce((a, b) => a + parseFloat(b.accuracy), 0) / list.length
  ).toFixed(1);
  container.innerHTML = `
        <div class="stats-card">
            <div class="stat-item"><div class="stat-label">Total Plays</div><div class="stat-value">${
              list.length
            }</div></div>
            <div class="stat-item"><div class="stat-label">Total Score</div><div class="stat-value">${totalScore}</div></div>
            <div class="stat-item"><div class="stat-label">Avg Accuracy</div><div class="stat-value">${avgAcc}%</div></div>
        </div>
        <br><h3>Recent History</h3>
        <div style="max-height:300px; overflow-y:auto; background:rgba(0,0,0,0.2); padding:10px;">
            ${list
              .slice()
              .reverse()
              .map(
                (r) => `
                <div style="border-bottom:1px solid #333; padding:5px; font-size:0.8rem; display:flex; justify-content:space-between;">
                    <span>${r.exercise}</span><span>Score: ${r.score} | Acc: ${r.accuracy}%</span>
                </div>`
              )
              .join("")}
        </div>`;
};

const Settings = {
  init() {
    // Difficulty maps to target size scale: easy=1.4, medium=1.0, hard=0.5
    const difficulty = Storage.get("aim_difficulty") || "medium";
    const scaleMap = { easy: 1.4, medium: 1.0, hard: 0.5 };
    const s = scaleMap[difficulty] || 1.0;
    Storage.set(Storage.KEYS.TARGET_SIZE, s);
    // Highlight active difficulty button
    Settings.highlightDifficulty(difficulty);
    const sens = Storage.get(Storage.KEYS.SENSITIVITY) || 0.35;
    const dpi = Storage.get("aim_mouse_dpi") || 800;
    document.getElementById("val-sens-input").value = sens;
    document.getElementById("mouse-dpi-input").value = dpi;
    Settings.calcEdpi();

    // Initialize player name field/display if present
    try {
      const nameInput = document.getElementById("player-name-input");
      const nameDisplay = document.getElementById("player-name-display");
      const currentName =
        (window.Leaderboard &&
          window.Leaderboard.getPlayerName &&
          window.Leaderboard.getPlayerName()) ||
        localStorage.getItem("player_name") ||
        "Guest";
      if (nameInput) nameInput.value = currentName;
      if (nameDisplay) nameDisplay.textContent = currentName;
    } catch (e) {
      // console.warn(\"[Settings] Unable to initialize player name:\", e);
    }
  },
  setTargetColor(c) {
    Storage.set(Storage.KEYS.TARGET_COLOR, c);
  },
  setDifficulty(level) {
    const scaleMap = { easy: 1.4, medium: 1.0, hard: 0.5 };
    const scale = scaleMap[level] || 1.0;
    Storage.set("aim_difficulty", level);
    Storage.set(Storage.KEYS.TARGET_SIZE, scale);
    Settings.highlightDifficulty(level);
  },
  highlightDifficulty(level) {
    const btns = document.querySelectorAll("#difficulty-selector button");
    btns.forEach((btn) => {
      const d = btn.getAttribute("data-difficulty");
      if (d === level) {
        btn.style.border = "1px solid var(--primary)";
        btn.style.background = "rgba(99,102,241,0.15)";
      } else {
        btn.style.border = "1px solid var(--border)";
        btn.style.background = "var(--bg-card)";
      }
    });
  },
  updateSens() {
    const sens = document.getElementById("val-sens-input").value;
    const dpi = document.getElementById("mouse-dpi-input").value;
    Storage.set(Storage.KEYS.SENSITIVITY, sens);
    Storage.set("aim_mouse_dpi", dpi);
    Settings.calcEdpi();
  },
  updatePlayerName() {
    const nameInput = document.getElementById("player-name-input");
    const newName = nameInput && nameInput.value ? nameInput.value.trim() : "";
    if (!newName) return;
    if (window.Leaderboard && window.Leaderboard.setPlayerName) {
      window.Leaderboard.setPlayerName(newName);
    } else {
      localStorage.setItem("player_name", newName);
    }
    const nameDisplay = document.getElementById("player-name-display");
    if (nameDisplay) nameDisplay.textContent = newName;
  },
  calcEdpi() {
    const sens =
      parseFloat(document.getElementById("val-sens-input").value) || 0;
    const dpi = parseInt(document.getElementById("mouse-dpi-input").value) || 0;
    document.getElementById("edpi-display").innerText = `eDPI: ${(
      sens * dpi
    ).toFixed(0)}`;
  },
};

// --- INPUT LISTENERS ---
const initEventListeners = () => {
  // Remove existing listeners to prevent duplicates
  window.removeEventListener("mousemove", ExerciseController.handleMouseMove);
  window.removeEventListener("mousedown", ExerciseController.handleMouseDown);
  window.removeEventListener("keydown", ExerciseController.handleKeyDown);
  document.removeEventListener(
    "pointerlockchange",
    ExerciseController.handlePointerLockChange
  );
  window.removeEventListener("resize", ExerciseController.handleResize);

  // Add listeners
  window.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement && ExerciseController.engine) {
      ExerciseController.engine.handleMouseMove(e);
    }
  });
  window.addEventListener("mousedown", () => {
    if (document.pointerLockElement && ExerciseController.engine) {
      ExerciseController.engine.handleInput();
    }
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") ExerciseController.pause();
  });
  document.addEventListener("pointerlockchange", () => {
    if (
      !document.pointerLockElement &&
      ExerciseController.engine?.exerciseState.running
    ) {
      ExerciseController.pause();
    }
  });
  window.addEventListener("resize", () => {
    if (ExerciseController.engine) ExerciseController.engine.resize();
    ExerciseController.resizeCrosshairCanvas();
  });
};

window.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement && ExerciseController.engine) {
    ExerciseController.engine.handleMouseMove(e);
  }
});

// Expose Settings to window so React can call its methods
window.Settings = Settings;
window.addEventListener("mousedown", () => {
  if (document.pointerLockElement && ExerciseController.engine) {
    ExerciseController.engine.handleInput();
  }
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") ExerciseController.pause();
});
document.addEventListener("pointerlockchange", () => {
  if (
    !document.pointerLockElement &&
    ExerciseController.engine?.exerciseState.running
  ) {
    ExerciseController.pause();
  }
});
window.addEventListener("resize", () => {
  if (ExerciseController.engine) ExerciseController.engine.resize();
  ExerciseController.resizeCrosshairCanvas();
});
window.addEventListener("load", () => {
  window.showTab("exercises");
});

// Expose ExerciseController to window so React can access it
window.ExerciseController = ExerciseController;
