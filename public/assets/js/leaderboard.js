/* Leaderboard frontend helper
   - Stores player name in localStorage under 'player_name'
   - Fetches top-10 from /api/leaderboard/get
   - Posts score to /api/leaderboard/post
*/
const Leaderboard = (function () {
  const API_GET = "/api/leaderboard/get";
  const API_POST = "/api/leaderboard/post";
  let currentExerciseId = "static_grid";

  const EXERCISE_NAMES = {
    static_grid: "Static Grid",
    micro_adjust: "Micro Adjustments",
    pop_up_reflex: "Pop-Up Reflex",
    strafe_track: "Strafe Tracking",
    dynamic_flicks: "Dynamic Flicks",
  };

  function getPlayerName() {
    return localStorage.getItem("player_name") || null;
  }

  function setPlayerName(name) {
    if (!name) return;
    localStorage.setItem("player_name", name.toString().substring(0, 64));
  }

  function promptForNameIfMissing() {
    const existingName = getPlayerName();
    // console.log("[Leaderboard] Checking for stored name:", existingName);

    if (!existingName) {
      // console.log("[Leaderboard] No name found. Prompting user...");
      const name = prompt(
        "Enter your display name for the leaderboard (or leave blank for 'Guest'):",
        "Player"
      );
      const finalName = name && name.trim() ? name.trim() : "Guest";
      setPlayerName(finalName);
      // console.log("[Leaderboard] Set name to:", finalName);
    } else {
      // console.log("[Leaderboard] Using existing name:", existingName);
    }
  }

  async function fetchTop(exerciseId = currentExerciseId) {
    try {
      // console.log(
      //   "[Leaderboard] Fetching from",
      //   API_GET,
      //   "for exercise:",
      //   exerciseId
      // );
      const res = await fetch(
        `${API_GET}?exerciseId=${encodeURIComponent(exerciseId)}`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      // console.log(
      //   "[Leaderboard] Fetched",
      //   data.length || 0,
      //   "entries for",
      //   exerciseId
      // );
      return data;
    } catch (err) {
      // console.error("[Leaderboard] Fetch error:", err);
      throw err;
    }
  }

  async function postScore(score, exerciseId = currentExerciseId) {
    const name = getPlayerName() || "Guest";
    // console.log(
    //   "[Leaderboard] Posting score:",
    //   { name, score, exerciseId },
    //   "to",
    //   API_POST
    // );
    try {
      const res = await fetch(API_POST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score, exerciseId }),
      });
      const data = await res.json();
      // console.log("[Leaderboard] Post response:", data);
      return data;
    } catch (err) {
      // console.error("[Leaderboard] Post error:", err);
      return null;
    }
  }

  async function renderInto(elementId, exerciseId = currentExerciseId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = "Loading...";
    currentExerciseId = exerciseId;
    try {
      const top = await fetchTop(exerciseId);
      const exerciseName = EXERCISE_NAMES[exerciseId] || exerciseId;

      let html = `
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: var(--accent); font-size: 2rem; margin: 0 0 10px 0;">${exerciseName.toUpperCase()} LEADERBOARD</h2>
            <p style="color: #888; font-size: 0.9rem; margin: 0;">Top 10 scores</p>
            <div style="margin-top: 15px; padding: 10px;">
              <label style="color: #aaa; margin-right: 10px;">Select Exercise:</label>
              <select id="leaderboard-exercise-select" onChange="window.Leaderboard.switchExercise(this.value)" style="background: #222; color: var(--accent); border: 1px solid var(--accent); padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                <option value="static_grid" ${
                  exerciseId === "static_grid" ? "selected" : ""
                }>Static Grid</option>
                <option value="micro_adjust" ${
                  exerciseId === "micro_adjust" ? "selected" : ""
                }>Micro Adjustments</option>
                <option value="pop_up_reflex" ${
                  exerciseId === "pop_up_reflex" ? "selected" : ""
                }>Pop-Up Reflex</option>
                <option value="strafe_track" ${
                  exerciseId === "strafe_track" ? "selected" : ""
                }>Strafe Tracking</option>
                <option value="dynamic_flicks" ${
                  exerciseId === "dynamic_flicks" ? "selected" : ""
                }>Dynamic Flicks</option>
              </select>
            </div>
          </div>
          
          <div style="background: rgba(255, 70, 85, 0.05); border: 1px solid rgba(255, 70, 85, 0.2); border-radius: 8px; padding: 20px;">
      `;

      if (!top || top.length === 0) {
        html += `<div style="text-align: center; color: #888; padding: 40px 20px;">No scores yet. Complete the ${exerciseName} exercise to appear on the leaderboard!</div>`;
      } else {
        html += '<table style="width: 100%; border-collapse: collapse;">';
        html +=
          '<thead><tr style="border-bottom: 2px solid var(--accent);"><th style="text-align: left; padding: 12px 0; color: var(--accent); font-weight: bold;">Rank</th><th style="text-align: left; padding: 12px 0; color: var(--accent); font-weight: bold;">Player</th><th style="text-align: right; padding: 12px 0; color: var(--accent); font-weight: bold;">Score</th></tr></thead>';
        html += "<tbody>";

        top.forEach((r, idx) => {
          const rank = idx + 1;
          let medalIcon = "";
          if (rank === 1) medalIcon = "🥇";
          else if (rank === 2) medalIcon = "🥈";
          else if (rank === 3) medalIcon = "🥉";

          const rowColor =
            idx % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "transparent";
          html += `
            <tr style="background: ${rowColor}; border-bottom: 1px solid rgba(255, 70, 85, 0.1);">
              <td style="padding: 14px 0; color: var(--accent); font-weight: bold; text-align: left; width: 50px;">${
                medalIcon ? medalIcon + " " + rank : rank
              }</td>
              <td style="padding: 14px 0; color: white; text-align: left;">${escapeHtml(
                r.name
              )}</td>
              <td style="padding: 14px 0; color: var(--accent); text-align: right; font-weight: bold; font-size: 1.1rem;">${
                r.score
              }</td>
            </tr>
          `;
        });

        html += "</tbody></table>";
      }

      html += `
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 15px; background: rgba(0, 0, 0, 0.3); border-radius: 6px; font-size: 0.85rem; color: #aaa;">
            <p style="margin: 0;">Complete the <strong>${exerciseName}</strong> exercise to submit your score to this leaderboard.</p>
          </div>
        </div>
      `;

      el.innerHTML = html;
    } catch (err) {
      el.innerHTML = `
        <div style="text-align: center; color: #f44; padding: 40px 20px;">
          <p>Failed to load leaderboard.</p>
          <p style="font-size: 0.9rem; color: #888;">Try refreshing the page.</p>
        </div>
      `;
    }
  }

  function escapeHtml(s) {
    if (!s) return "";
    return s.replace(/[&<>\"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function switchExercise(exerciseId) {
    // console.log("[Leaderboard] Switching to exercise:", exerciseId);
    renderInto("leaderboard-container", exerciseId);
  }

  return {
    init: promptForNameIfMissing,
    renderInto,
    postScore,
    setPlayerName,
    getPlayerName,
    switchExercise,
  };
})();

// Expose Leaderboard to window so React can access it
window.Leaderboard = Leaderboard;

// Auto-init prompt on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // console.log("[Leaderboard] Page loaded, initializing...");
    Leaderboard.init();
  });
} else {
  // Document already loaded (e.g., script added dynamically)
  // console.log("[Leaderboard] Document already loaded, initializing...");
  Leaderboard.init();
}
