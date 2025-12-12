/* Leaderboard frontend helper
   - Stores player name in localStorage under 'player_name'
   - Fetches top-10 from /api/leaderboard/get
   - Posts score to /api/leaderboard/post
*/
const Leaderboard = (function () {
  const API_GET = "/api/leaderboard/get";
  const API_POST = "/api/leaderboard/post";

  function getPlayerName() {
    return localStorage.getItem("player_name") || null;
  }

  function setPlayerName(name) {
    if (!name) return;
    localStorage.setItem("player_name", name.toString().substring(0, 64));
  }

  function promptForNameIfMissing() {
    const existingName = getPlayerName();
    console.log("[Leaderboard] Checking for stored name:", existingName);

    if (!existingName) {
      console.log("[Leaderboard] No name found. Prompting user...");
      const name = prompt(
        "Enter your display name for the leaderboard (or leave blank for 'Guest'):",
        "Player"
      );
      const finalName = name && name.trim() ? name.trim() : "Guest";
      setPlayerName(finalName);
      console.log("[Leaderboard] Set name to:", finalName);
    } else {
      console.log("[Leaderboard] Using existing name:", existingName);
    }
  }

  async function fetchTop() {
    try {
      console.log("[Leaderboard] Fetching from", API_GET);
      const res = await fetch(API_GET);
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log("[Leaderboard] Fetched", data.length || 0, "entries");
      return data;
    } catch (err) {
      console.error("[Leaderboard] Fetch error:", err);
      throw err;
    }
  }

  async function postScore(score) {
    const name = getPlayerName() || "Guest";
    console.log(
      "[Leaderboard] Posting score:",
      { name, score },
      "to",
      API_POST
    );
    try {
      const res = await fetch(API_POST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score }),
      });
      const data = await res.json();
      console.log("[Leaderboard] Post response:", data);
      return data;
    } catch (err) {
      console.error("[Leaderboard] Post error:", err);
      return null;
    }
  }

  async function renderInto(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = "Loading...";
    try {
      const top = await fetchTop();

      let html = `
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: var(--accent); font-size: 2rem; margin: 0 0 10px 0;">GRID WARMUP LEADERBOARD</h2>
            <p style="color: #888; font-size: 0.9rem; margin: 0;">Top 10 scores from Grid Warmup exercise</p>
          </div>
          
          <div style="background: rgba(255, 70, 85, 0.05); border: 1px solid rgba(255, 70, 85, 0.2); border-radius: 8px; padding: 20px;">
      `;

      if (!top || top.length === 0) {
        html +=
          '<div style="text-align: center; color: #888; padding: 40px 20px;">No scores yet. Complete the Grid Warmup exercise to appear on the leaderboard!</div>';
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
            <p style="margin: 0;">Complete the <strong>Grid Warmup</strong> exercise to submit your score to this leaderboard.</p>
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

  return {
    init: promptForNameIfMissing,
    renderInto,
    postScore,
    setPlayerName,
    getPlayerName,
  };
})();

// Expose Leaderboard to window so React can access it
window.Leaderboard = Leaderboard;

// Auto-init prompt on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("[Leaderboard] Page loaded, initializing...");
    Leaderboard.init();
  });
} else {
  // Document already loaded (e.g., script added dynamically)
  console.log("[Leaderboard] Document already loaded, initializing...");
  Leaderboard.init();
}
