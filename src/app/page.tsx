"use client";

import { useEffect, useRef } from "react";

export default function Home() {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load all scripts dynamically (only once)
    const scripts = [
      "/assets/js/storage.js",
      "/assets/js/audio.js",
      "/assets/js/exercises/exercise-definitions.js",
      "/assets/js/exercises/exercise-engine.js",
      "/assets/js/ui.js",
      "/assets/js/leaderboard.js",
    ];

    // Check if scripts are already loaded
    const loadedScripts = new Set<string>();
    document.querySelectorAll("script[src]").forEach((script) => {
      loadedScripts.add(script.getAttribute("src") || "");
    });

    // Load scripts and wait for them to complete
    const scriptPromises = scripts.map((src) => {
      return new Promise<void>((resolve) => {
        // If script is already loaded, resolve immediately
        if (loadedScripts.has(src)) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = false;

        script.onload = () => resolve();
        script.onerror = () => {
          // console.error(`Failed to load script: ${src}`);
          resolve(); // Resolve even on error to prevent hanging
        };

        document.body.appendChild(script);
      });
    });

    // Wait for all scripts to load before continuing
    Promise.all(scriptPromises).then(() => {
      // Trigger initialization after all scripts are loaded
      // Initialize event listeners
      if ((window as any).initEventListeners) {
        (window as any).initEventListeners();
        // console.log("Event listeners initialized");
      }

      // Call showTab to display exercises (mimics the load event behavior)
      if ((window as any).showTab) {
        (window as any).showTab("exercises");
        // console.log("Scripts loaded, exercises initialized");
      } else {
        // console.warn("showTab not available after loading scripts");
      }
    });

    // Mobile orientation handler
    const handlePlayClick = () => {
      if (window.innerWidth < 1000) {
        document.body.classList.add("force-landscape");
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        if ((screen.orientation as any)?.lock) {
          (screen.orientation as any).lock("landscape").catch(() => {
            // console.log("Orientation lock not supported");
          });
        }
      }
    };

    document.body.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(".exercise-card") ||
        target.closest(".action-btn.primary")
      ) {
        handlePlayClick();
      }
    });

    return () => {
      document.body.removeEventListener("click", handlePlayClick);
    };
  }, []);

  return (
    <>
      <div id="orientation-warning">
        <div className="rotate-icon">↻</div>
        <div className="warning-content">
          <h2 className="warning-title">ROTATE DEVICE</h2>
          <p className="warning-desc">
            Please rotate your device to <strong>Landscape</strong> mode to
            play.
          </p>
        </div>
      </div>

      <div
        id="game-container"
        ref={gameContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      ></div>

      <canvas
        id="crosshair-canvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 5,
        }}
      ></canvas>

      <div id="vignette"></div>

      <div
        id="click-overlay"
        className="hidden"
        onClick={() => {
          (window as any).ExerciseController?.resume();
        }}
      >
        <div className="click-msg">Click to Resume</div>
      </div>

      <button
        id="mobile-pause-btn"
        className="mobile-pause-button hidden"
        onClick={() => {
          (window as any).ExerciseController?.pause();
        }}
        style={{ display: "none" }}
      >
        ⏸
      </button>

      <div id="hud" style={{ opacity: 0 }}>
        <div className="hud-stat">
          <div className="hud-val" id="score-val">
            0
          </div>
          <div className="hud-lbl">Score</div>
        </div>
        <div className="hud-stat">
          <div className="hud-val" id="time-val">
            00:00
          </div>
          <div className="hud-lbl">Time</div>
        </div>
        <div className="hud-stat">
          <div className="hud-val" id="acc-val">
            100%
          </div>
          <div className="hud-lbl">Accuracy</div>
        </div>
      </div>

      <div id="ui-layer">
        <div id="fps-counter" style={{ display: "none" }}>
          60 FPS
        </div>
        <div id="center-msg">3</div>

        <div id="main-menu" className="panel">
          <div className="panel-header">
            <h1 style={{ fontSize: "2rem" }}>
              AIMTRAINER <span className="brand-accent">PRO</span>
            </h1>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              FREE ONLINE AIM TRAINER
            </div>
          </div>

          <div className="content-area">
            <div className="sidebar">
              <button
                className="nav-btn active"
                onClick={() => (window as any).showTab?.("exercises")}
              >
                Exercises
              </button>
              <button
                className="nav-btn"
                onClick={() => (window as any).showTab?.("progress")}
              >
                Stats
              </button>
              <button
                className="nav-btn"
                onClick={() => (window as any).showTab?.("leaderboard")}
              >
                Leaderboard
              </button>
              <button
                className="nav-btn"
                onClick={() => (window as any).showTab?.("settings")}
              >
                Settings
              </button>
              <button
                className="nav-btn"
                onClick={() => (window.location.href = "https://valocrossdb.site/")}
              >
                Crosshairs
              </button>
              <button
                className="nav-btn"
                onClick={() => (window.location.href = "/blog")}
              >
                Blog
              </button>
              <button
                className="nav-btn"
                onClick={() => (window.location.href = "/contact")}
              >
                Contact
              </button>

              <div
                style={{
                  marginTop: "auto",
                  padding: "20px",
                  fontSize: "0.7rem",
                  color: "#444",
                  lineHeight: "1.4",
                }}
              >
                <p>
                  <strong>AimTrainerPro</strong> is a free 3D tool
                  to improve your aim in browser. No download required.
                </p>
                <p style={{ marginTop: "10px", color: "#555" }}>
                  AimTrainerPro is not affiliated with, endorsed, sponsored, or
                  specifically approved by Riot Games, Inc. Valorant and Riot
                  Games are trademarks or registered trademarks of Riot Games,
                  Inc.
                </p>
                <p>© 2026 AimTrainerPro</p>
              </div>
            </div>

            <div id="tab-exercises" className="main-view">
              <div id="category-selector">
                <h2 style={{ color: "var(--accent)" }}>Select Training Mode</h2>
                <div id="category-grid" className="mode-grid"></div>
              </div>
              <div id="exercises-container" style={{ display: "none" }}></div>
            </div>

            <div id="tab-progress" className="main-view hidden">
              <h2 style={{ color: "var(--accent)" }}>Your Stats</h2>
              <div id="progress-stats"></div>
              <button
                className="action-btn"
                onClick={() => {
                  (window as any).Storage?.clearStats?.();
                  (window as any).renderProgress?.();
                }}
                style={{ marginTop: "20px", background: "#444" }}
              >
                Clear History
              </button>
            </div>

            <div id="tab-settings" className="main-view hidden">
              <div className="settings-container">
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: "var(--accent)" }}>Game Settings</h3>
                  <div
                    style={{
                      background: "rgba(255, 70, 85, 0.1)",
                      padding: "15px",
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 70, 85, 0.3)",
                      marginBottom: "20px",
                    }}
                  >
                    <div className="setting-group">
                      <label className="setting-label">
                        Player Display Name
                      </label>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          type="text"
                          id="player-name-input"
                          placeholder="Your name"
                          style={{ flex: 1 }}
                        />
                        <button
                          className="action-btn primary"
                          onClick={() =>
                            (window as any).Settings?.updatePlayerName?.()
                          }
                        >
                          Save
                        </button>
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#aaa",
                          marginTop: "6px",
                        }}
                      >
                        Current: <span id="player-name-display">Guest</span>
                      </div>
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        In-game Sensitivity
                      </label>
                      <input
                        type="number"
                        id="val-sens-input"
                        step="0.001"
                        defaultValue="0.35"
                        onChange={() =>
                          (window as any).Settings?.updateSens?.()
                        }
                        style={{
                          width: "100%",
                          color: "var(--accent)",
                          fontWeight: "bold",
                        }}
                      />
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">Mouse DPI</label>
                      <input
                        type="number"
                        id="mouse-dpi-input"
                        step="50"
                        defaultValue="800"
                        onChange={() =>
                          (window as any).Settings?.updateSens?.()
                        }
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div
                      id="edpi-display"
                      style={{
                        textAlign: "right",
                        fontSize: "0.8rem",
                        color: "#fff",
                        opacity: 0.7,
                        fontWeight: "bold",
                      }}
                    >
                      eDPI: 280
                    </div>
                  </div>
                  <div className="setting-group">
                    <label className="setting-label">Target Size</label>
                    <input
                      type="range"
                      id="target-size-slider"
                      min="1"
                      max="5"
                      step="0.1"
                      onChange={(e) =>
                        (window as any).Settings?.setTargetSize?.(
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="setting-group">
                    <label className="setting-label">Target Color</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div
                        className="color-opt"
                        style={{ background: "#00ffff" }}
                        onClick={() =>
                          (window as any).Settings?.setTargetColor?.("#00ffff")
                        }
                      ></div>
                      <div
                        className="color-opt"
                        style={{ background: "#ff4655" }}
                        onClick={() =>
                          (window as any).Settings?.setTargetColor?.("#ff4655")
                        }
                      ></div>
                      <div
                        className="color-opt"
                        style={{ background: "#ffff00" }}
                        onClick={() =>
                          (window as any).Settings?.setTargetColor?.("#ffff00")
                        }
                      ></div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    background: "rgba(0, 0, 0, 0.2)",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                  <h3 style={{ color: "var(--accent)", marginTop: 0 }}>
                    Crosshair Creator
                  </h3>
                  <div style={{ textAlign: "center", marginBottom: "15px" }}>
                    <canvas
                      id="crosshair-preview-canvas"
                      width="150"
                      height="150"
                      style={{
                        background: "#333",
                        border: "1px solid #555",
                      }}
                    ></canvas>
                  </div>
                  <div className="setting-group">
                    <label className="setting-label">Name</label>
                    <input
                      type="text"
                      id="cr-name"
                      placeholder="My Crosshair"
                      onChange={() =>
                        (window as any).CrosshairManager?.onInputChange?.()
                      }
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label className="setting-label">Style</label>
                      <select
                        id="cr-style"
                        onChange={() =>
                          (window as any).CrosshairManager?.onInputChange?.()
                        }
                        style={{ width: "100%" }}
                      >
                        <option value="classic">Classic</option>
                        <option value="dot">Dot</option>
                        <option value="circle">Circle</option>
                        <option value="plus">Plus</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="setting-label">Size</label>
                      <input
                        type="number"
                        id="cr-size"
                        defaultValue="6"
                        onChange={() =>
                          (window as any).CrosshairManager?.onInputChange?.()
                        }
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                  >
                    <div style={{ flex: 1 }}>
                      <label className="setting-label">Color</label>
                      <input
                        type="color"
                        id="cr-color"
                        defaultValue="#00ff00"
                        onChange={() =>
                          (window as any).CrosshairManager?.onInputChange?.()
                        }
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="setting-label">Opacity</label>
                      <input
                        type="number"
                        id="cr-opacity"
                        step="0.1"
                        max="1"
                        min="0.1"
                        defaultValue="1"
                        onChange={() =>
                          (window as any).CrosshairManager?.onInputChange?.()
                        }
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div
                    style={{ marginTop: "15px", display: "flex", gap: "10px" }}
                  >
                    <button
                      className="action-btn primary"
                      onClick={() =>
                        (window as any).CrosshairManager?.savePreset?.()
                      }
                    >
                      Save New
                    </button>
                  </div>
                  <hr style={{ borderColor: "#444", margin: "15px 0" }} />
                  <label className="setting-label">Saved Crosshairs</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <select
                      id="saved-crosshairs"
                      onChange={(e) =>
                        (window as any).CrosshairManager?.loadPreset?.(
                          e.target.value
                        )
                      }
                      style={{ flex: 1 }}
                    ></select>
                    <button
                      className="action-btn"
                      onClick={() =>
                        (window as any).CrosshairManager?.deletePreset?.()
                      }
                      style={{ background: "#444" }}
                    >
                      Del
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div id="tab-leaderboard" className="main-view hidden">
              <div id="leaderboard-container"></div>
            </div>
          </div>
        </div>

        <div id="exercise-hud" className="panel mini-menu hidden">
          <div style={{ position: "absolute", top: "20px", right: "30px" }}>
            <span
              id="exercise-name"
              style={{ color: "var(--accent)", fontWeight: "bold" }}
            ></span>
          </div>
          <h2>PAUSED</h2>
          <div className="btn-row">
            <button
              className="action-btn"
              onClick={() => {
                // console.log("[React] Exit button clicked");
                (window as any).ExerciseController?.quit?.();
              }}
            >
              Exit
            </button>
            <button
              className="action-btn primary"
              onClick={() => {
                // console.log("[React] Resume button clicked");
                (window as any).ExerciseController?.resume?.();
              }}
            >
              Resume
            </button>
          </div>
        </div>

        <div id="results-menu" className="panel mini-menu hidden">
          <h2>COMPLETE</h2>
          <div id="exercise-result"></div>
          <div className="stats-grid">
            <div className="hud-stat">
              <div className="hud-val" id="res-score">
                0
              </div>
              <div className="hud-lbl">Score</div>
            </div>
            <div className="hud-stat">
              <div className="hud-val" id="res-acc">
                0%
              </div>
              <div className="hud-lbl">Accuracy</div>
            </div>
            <div className="hud-stat">
              <div className="hud-val" id="res-hits">
                0
              </div>
              <div className="hud-lbl">Hits</div>
            </div>
            <div className="hud-stat">
              <div className="hud-val" id="res-kps">
                0
              </div>
              <div className="hud-lbl">KPS</div>
            </div>
          </div>
          <div className="btn-row">
            <button
              className="action-btn"
              onClick={() => {
                // console.log("[React] Menu button clicked");
                (window as any).ExerciseController?.menu?.();
              }}
            >
              Menu
            </button>
            <button
              className="action-btn primary"
              onClick={() => {
                // console.log("[React] Replay button clicked");
                (window as any).ExerciseController?.repeatExercise?.();
              }}
            >
              Replay
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
