/**
 * LocalStorage Management
 * Fixed: Guarantees Default Crosshair exists on First Load
 */

const Storage = {
  KEYS: {
    TARGET_COLOR: "aim_target_color",
    TARGET_SIZE: "aim_target_size",
    SENSITIVITY: "aim_sensitivity",
    VOLUME: "aim_volume",
    CROSSHAIR_CONFIG: "aim_active_crosshair",
    SAVED_CROSSHAIRS: "aim_saved_crosshairs",
    EXERCISE_RESULTS: "aim_exercise_results",
  },

  init() {
    this.sanitizeValues();

    // Check key settings individually.
    // If a user has old data but missing crosshair data, this fixes it.
    if (!this.get(this.KEYS.TARGET_COLOR)) {
      this.setDefaults();
    }

    // Explicitly check for Crosshair Config
    if (!this.get(this.KEYS.CROSSHAIR_CONFIG)) {
      this.resetCrosshair();
    }
  },

  sanitizeValues() {
    // Fix 2D size values for 3D engine
    let size = parseFloat(this.get(this.KEYS.TARGET_SIZE));
    if (isNaN(size) || size > 10) {
      this.set(this.KEYS.TARGET_SIZE, "2.0");
    }
  },

  setDefaults() {
    localStorage.setItem(this.KEYS.TARGET_COLOR, "#00ffff");
    localStorage.setItem(this.KEYS.TARGET_SIZE, "2.0");
    localStorage.setItem(this.KEYS.SENSITIVITY, "0.314");
    localStorage.setItem(this.KEYS.VOLUME, "30");
    this.resetCrosshair();
  },

  // Helper to force-set the default crosshair
  resetCrosshair() {
    const defaultCrosshair = {
      name: "Default Green",
      style: "classic",
      size: 6,
      color: "#00ff00",
      opacity: 1,
    };
    localStorage.setItem(
      this.KEYS.CROSSHAIR_CONFIG,
      JSON.stringify(defaultCrosshair)
    );
    localStorage.setItem(
      this.KEYS.SAVED_CROSSHAIRS,
      JSON.stringify([defaultCrosshair])
    );
  },

  getCrosshairConfig() {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEYS.CROSSHAIR_CONFIG));
      return data || null;
    } catch (e) {
      this.resetCrosshair();
      return this.getCrosshairConfig();
    }
  },

  setCrosshairConfig(config) {
    localStorage.setItem(this.KEYS.CROSSHAIR_CONFIG, JSON.stringify(config));
  },

  getSavedCrosshairs() {
    return JSON.parse(localStorage.getItem(this.KEYS.SAVED_CROSSHAIRS) || "[]");
  },

  addCustomCrosshair(crosshairObj) {
    const list = this.getSavedCrosshairs();
    const filtered = list.filter((c) => c.name !== crosshairObj.name);
    filtered.push(crosshairObj);
    localStorage.setItem(this.KEYS.SAVED_CROSSHAIRS, JSON.stringify(filtered));
  },

  deleteCustomCrosshair(name) {
    const list = this.getSavedCrosshairs();
    const filtered = list.filter((c) => c.name !== name);
    localStorage.setItem(this.KEYS.SAVED_CROSSHAIRS, JSON.stringify(filtered));
  },

  get(key) {
    return localStorage.getItem(key);
  },

  set(key, value) {
    localStorage.setItem(key, value);
  },

  saveResult(result) {
    let results = JSON.parse(
      localStorage.getItem(this.KEYS.EXERCISE_RESULTS) || "[]"
    );
    result.timestamp = Date.now();
    results.push(result);
    localStorage.setItem(this.KEYS.EXERCISE_RESULTS, JSON.stringify(results));
  },

  getResults() {
    return JSON.parse(localStorage.getItem(this.KEYS.EXERCISE_RESULTS) || "[]");
  },

  clearStats() {
    localStorage.removeItem(this.KEYS.EXERCISE_RESULTS);
  },
};

Storage.init();
