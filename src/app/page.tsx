"use client";

import { useEffect, useRef } from "react";
import { loadExerciseUI, preloadExerciseScripts } from "@/lib/performance";
import { installBridge } from "@/lib/exercises/exercise-bridge";
import { installPipeline } from "@/lib/exercises/exercise-pipeline";
import { localizeExercises } from "@/lib/exercises/exercise-i18n";
import MobileExerciseRecommendation from "@/components/MobileExerciseRecommendation";
import AccessibilitySettings from "@/components/AccessibilitySettings";
import { useI18n } from "@/components/I18nProvider";

export default function Home() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useI18n();

  // Re-localize exercise cards when language changes
  useEffect(() => {
    localizeExercises(locale);
    // Re-render the exercise grid if it's visible
    if ((window as any).showTab && (window as any).EXERCISES) {
      (window as any).renderExercises?.();
    }
  }, [locale]);

  useEffect(() => {
    // Load Three.js on demand (only needed on the trainer homepage)
    if (!(window as any).THREE) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => initTrainer();
      document.head.appendChild(script);
    } else {
      initTrainer();
    }

    function initTrainer() {
      // Install the exercise bridge BEFORE loading vanilla JS scripts.
      installBridge();
      installPipeline();

      // Apply locale to exercise names/descriptions
      const storedLocale = localStorage.getItem('aimtrainerpro-locale') || 'en';
      localizeExercises(storedLocale);

      preloadExerciseScripts();

      loadExerciseUI().then(() => {
        if ((window as any).initEventListeners) {
          (window as any).initEventListeners();
        }
        if ((window as any).showTab) {
          (window as any).showTab("exercises");
        }
      });
    }

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

      <MobileExerciseRecommendation />

      {/* ---------- FULL-SCREEN GAMEPLAY OVERLAYS ---------- */}
      <div
        id="game-container"
        ref={gameContainerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      ></div>

      <canvas
        id="crosshair-canvas"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 50,
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
                (window as any).ExerciseController?.quit?.();
              }}
            >
              Exit
            </button>
            <button
              className="action-btn primary"
              onClick={() => {
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
                (window as any).ExerciseController?.menu?.();
              }}
            >
              Menu
            </button>
            <button
              className="action-btn primary"
              onClick={() => {
                (window as any).ExerciseController?.repeatExercise?.();
              }}
            >
              Replay
            </button>
          </div>
        </div>
      </div>

      {/* ---------- UNIFIED IN-FLOW TRAINER MENU ---------- */}
      <div id="main-menu" className="trainer-shell">
        <section className="trainer-hero">
          <span className="eyebrow">{t("home.eyebrow")}</span>
          <h1>
            AimTrainer<span className="brand-accent">Pro</span>
          </h1>
          <p>{t("home.subtitle")}</p>
        </section>

        <nav className="trainer-tabs" aria-label="Trainer sections">
          <button
            className="nav-btn active"
            onClick={() => (window as any).showTab?.("exercises")}
          >
            {t("common.exercises")}
          </button>
          <button
            className="nav-btn"
            onClick={() => (window as any).showTab?.("progress")}
          >
            {t("exercises.stats")}
          </button>
          <button
            className="nav-btn"
            onClick={() => (window as any).showTab?.("leaderboard")}
          >
            {t("common.leaderboard")}
          </button>
          <button
            className="nav-btn"
            onClick={() => (window as any).showTab?.("settings")}
          >
            {t("common.settings")}
          </button>
        </nav>

        <div className="trainer-content">
          <div id="tab-exercises" className="main-view">
            <div id="category-selector">
              <h2>{t("home.selectMode")}</h2>
              <div id="category-grid" className="mode-grid"></div>
            </div>
            <div id="exercises-container" style={{ display: "none" }}></div>
          </div>

          <div id="tab-progress" className="main-view hidden">
            <h2>{t("home.stats")}</h2>
            <div id="progress-stats"></div>
            <button
              className="action-btn"
              onClick={() => {
                (window as any).Storage?.clearStats?.();
                (window as any).renderProgress?.();
              }}
              style={{
                marginTop: "20px",
                flex: "none",
                maxWidth: "220px",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              Clear History
            </button>
          </div>

          <div id="tab-settings" className="main-view hidden">
            <AccessibilitySettings />
            <div className="settings-container">
              <div style={{ flex: 1 }}>
                <h3 style={{ color: "var(--accent)" }}>Game Settings</h3>
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.08)",
                    padding: "15px",
                    borderRadius: "10px",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                    marginBottom: "20px",
                  }}
                >
                  <div className="setting-group">
                    <label className="setting-label">Player Display Name</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="text"
                        id="player-name-input"
                        placeholder="Your name"
                        style={{ flex: 1 }}
                      />
                      <button
                        className="action-btn primary"
                        style={{ flex: "none", padding: "10px 18px" }}
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
                        color: "var(--text-muted)",
                        marginTop: "6px",
                      }}
                    >
                      Current: <span id="player-name-display">Guest</span>
                    </div>
                  </div>
                  <div className="setting-group">
                    <label className="setting-label">In-game Sensitivity</label>
                    <input
                      type="number"
                      id="val-sens-input"
                      step="0.001"
                      defaultValue="0.35"
                      onChange={() => (window as any).Settings?.updateSens?.()}
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
                      onChange={() => (window as any).Settings?.updateSens?.()}
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
                  <label className="setting-label">
                    Difficulty
                  </label>
                  <div id="difficulty-selector" style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="difficulty-btn"
                      data-difficulty="easy"
                      onClick={() => (window as any).Settings?.setDifficulty?.("easy")}
                      style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "#4ade80", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      Easy
                    </button>
                    <button
                      type="button"
                      className="difficulty-btn active"
                      data-difficulty="medium"
                      onClick={() => (window as any).Settings?.setDifficulty?.("medium")}
                      style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--primary)", background: "rgba(99,102,241,0.15)", color: "var(--primary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      className="difficulty-btn"
                      data-difficulty="hard"
                      onClick={() => (window as any).Settings?.setDifficulty?.("hard")}
                      style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "#f87171", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      Hard
                    </button>
                  </div>
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
                      style={{ background: "#6366f1" }}
                      onClick={() =>
                        (window as any).Settings?.setTargetColor?.("#6366f1")
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
                  borderRadius: "10px",
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
                      borderRadius: "8px",
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
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
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
                <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                  <button
                    className="action-btn primary"
                    onClick={() =>
                      (window as any).CrosshairManager?.savePreset?.()
                    }
                  >
                    Save New
                  </button>
                </div>
                <hr style={{ borderColor: "var(--border)", margin: "15px 0" }} />
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
                    style={{
                      flex: "none",
                      padding: "10px 18px",
                      background: "rgba(255,255,255,0.05)",
                    }}
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

        <div className="trainer-fineprint">
          <p>{t("home.fineprint")}</p>
          <p style={{ marginTop: "8px" }}>
            <a href="/about">{t("common.about")}</a> · <a href="/privacy-policy">{t("footer.privacyPolicy")}</a>{" "}
            · <a href="/terms">{t("footer.termsOfService")}</a>
          </p>
        </div>
      </div>
    </>
  );
}
