/**
 * Game Background & Visuals
 * Handles the background grid and global visual effects only.
 * Game logic is now handled by exercise-engine.js and ui.js
 */

// Utilities
const $ = (id) => document.getElementById(id);

// Canvas Setup
const bgCanvas = $("bg-canvas");
const bgCtx = bgCanvas.getContext("2d");

let width, height;

/**
 * Handle window resize
 */
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  bgCanvas.width = width;
  bgCanvas.height = height;

  // Also resize game canvas here to ensure they match
  const gameCanvas = $("game-canvas");
  if (gameCanvas) {
    gameCanvas.width = width;
    gameCanvas.height = height;
  }

  drawGrid();
}
window.addEventListener("resize", resize);

/**
 * Draw background grid
 */
function drawGrid() {
  bgCtx.clearRect(0, 0, width, height);

  // Stylish Cyber Grid
  bgCtx.strokeStyle = "rgba(255,255,255,0.03)";
  bgCtx.lineWidth = 1;

  const size = 120;

  // Draw Grid Lines
  bgCtx.beginPath();
  for (let x = size / 2; x < width; x += size) {
    bgCtx.moveTo(x, 0);
    bgCtx.lineTo(x, height);
  }
  for (let y = size / 2; y < height; y += size) {
    bgCtx.moveTo(0, y);
    bgCtx.lineTo(width, y);
  }
  bgCtx.stroke();

  // Draw Intersections (Dots)
  bgCtx.fillStyle = "rgba(255,255,255,0.08)";
  for (let x = size / 2; x < width; x += size) {
    for (let y = size / 2; y < height; y += size) {
      bgCtx.beginPath();
      bgCtx.arc(x, y, 2, 0, Math.PI * 2);
      bgCtx.fill();
    }
  }
}

// Initialize visuals
window.addEventListener("load", () => {
  resize();
  drawGrid();
});
