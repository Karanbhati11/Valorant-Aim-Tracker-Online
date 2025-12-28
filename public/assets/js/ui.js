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
    ) || window.innerWidth < 900,

  async initExercise(exerciseId) {
    const ex = getExerciseById(exerciseId);
    if (!ex) return;

    this.currentExercise = ex;
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

    this.resizeCrosshairCanvas();
    this.showMobilePauseButton();

    await this.countdown();

    this.engine.spawnTargets();
    this.startGameLoop();

    // Only request pointer lock on desktop (mobile doesn't support it)
    if (!this.isMobile && document.body.requestPointerLock) {
      document.body.requestPointerLock();
    }
    // Hide native cursor while playing on desktop
    if (!this.isMobile) document.body.classList.add("playing");
  },

  resizeCrosshairCanvas() {
    const c = document.getElementById("crosshair-canvas");
    c.width = window.innerWidth;
    c.height = window.innerHeight;
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
    let frames = 0;
    let lastFpsTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

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
          return;
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

    // Submit score to leaderboard (serverless) if player has a saved name
    try {
      const playerName = localStorage.getItem("player_name");
      if (
        playerName &&
        window.Leaderboard &&
        typeof window.Leaderboard.postScore === "function"
      ) {
        // post asynchronously (don't block UI) with exerciseId
        window.Leaderboard.postScore(
          finalData.score,
          finalData.exerciseId
        ).then((res) => {
          // Optionally re-render leaderboard if visible
          if (document.getElementById("leaderboard-container")) {
            window.Leaderboard.renderInto(
              "leaderboard-container",
              finalData.exerciseId
            );
          }
        });
      }
    } catch (e) {
      // console.warn("Leaderboard submit error", e);
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
    // console.log(
    //   "[repeatExercise] Called with exercise:",
    //   this.currentExercise?.id
    // );
    document.getElementById("results-menu").classList.add("hidden");
    this.initExercise(this.currentExercise.id);
  },

  returnToMenu() {
    if (this.engine) this.engine.stop();
    cancelAnimationFrame(this.animationId);

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
  window.showCategoryExercises("CORE");
};

// Expose CrosshairManager globally for React UI handlers
window.CrosshairManager = CrosshairManager;

window.showCategoryExercises = (key) => {
  document.getElementById("category-selector").style.display = "none";
  document.getElementById("exercises-container").style.display = "block";
  const cat = EXERCISES[key];
  const container = document.getElementById("exercises-container");
  let html = `<h2 style="color:var(--accent)">${cat.category}</h2><div class="mode-grid">`;
  cat.exercises.forEach((ex) => {
    html += `
            <div class="exercise-card" onclick="ExerciseController.initExercise('${
              ex.id
            }')">
                <h3>${ex.name}</h3>
                <div style="font-size:0.8rem; color:#888">${
                  ex.description
                }</div>
                <div style="margin-top:10px; font-size:0.7rem">Focus: ${ex.stats.join(
                  " • "
                )}</div>
            </div>`;
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
    const s = Storage.get(Storage.KEYS.TARGET_SIZE) || 2;
    document.getElementById("target-size-slider").value = s;
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
  setTargetSize(val) {
    Storage.set(Storage.KEYS.TARGET_SIZE, val);
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
