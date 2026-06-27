/* Leaderboard frontend helper
   - Stores player name in localStorage under 'player_name'
   - Fetches top-N from /api/leaderboard/get
   - Posts score to /api/leaderboard/post
   - Default view: "Overall" global ranking (zero clicks)
   - A single searchable selector drills into a specific exercise
*/
const Leaderboard = (function () {
  const API_GET = "/api/leaderboard/get";
  const API_POST = "/api/leaderboard/post";
  let currentExerciseId = "overall";

  // Dynamically build exercise list from the bridge's window.EXERCISES
  function getExerciseOptions() {
    const exercises = window.EXERCISES;
    if (!exercises) return [];
    const options = [];
    for (const key of Object.keys(exercises)) {
      const cat = exercises[key];
      if (!cat || !cat.exercises) continue;
      for (const ex of cat.exercises) {
        options.push({ id: ex.id, name: ex.name, category: cat.category || key });
      }
    }
    return options;
  }

  function getExerciseName(exerciseId) {
    if (exerciseId === "overall") return "Overall";
    const found = getExerciseOptions().find((e) => e.id === exerciseId);
    return found ? found.name : exerciseId;
  }

  function getPlayerName() {
    return localStorage.getItem("player_name") || null;
  }

  function setPlayerName(name) {
    if (!name) return;
    localStorage.setItem("player_name", name.toString().substring(0, 64));
  }

  function promptForNameIfMissing() {
    const existingName = getPlayerName();
    if (!existingName) {
      const name = prompt(
        "Enter your display name for the leaderboard (or leave blank for 'Guest'):",
        "Player"
      );
      const finalName = name && name.trim() ? name.trim() : "Guest";
      setPlayerName(finalName);
    }
  }

  async function fetchTop(exerciseId = currentExerciseId, difficulty = null) {
    try {
      let url = `${API_GET}?exerciseId=${encodeURIComponent(exerciseId)}`;
      if (difficulty && difficulty !== "all") {
        url += `&difficulty=${encodeURIComponent(difficulty)}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      return data.entries || data || [];
    } catch (err) {
      throw err;
    }
  }

  async function postScore(score, exerciseId = currentExerciseId, accuracy = null) {
    const name = getPlayerName() || "Guest";
    const difficulty = (typeof Storage !== 'undefined' && Storage.get) ? (Storage.get("aim_difficulty") || "medium") : "medium";
    try {
      const res = await fetch(API_POST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score, exerciseId, accuracy, difficulty }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return null;
    }
  }

  let currentDifficultyFilter = "all";

  // Main entry. exerciseId defaults to "overall" so the leaderboard always
  // shows a meaningful global ranking on first render with zero clicks.
  async function renderInto(elementId, exerciseId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const selected = exerciseId || "overall";
    currentExerciseId = selected;
    const isOverall = selected === "overall";
    const selectedName = getExerciseName(selected);

    const diffBtnStyle = (d) => {
      const active = currentDifficultyFilter === d;
      return `padding:7px 14px;border-radius:6px;border:1px solid ${active ? 'var(--primary)' : 'var(--border)'};background:${active ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)'};color:${active ? 'var(--primary)' : 'var(--text-muted)'};font-size:0.75rem;font-weight:600;cursor:pointer;font-family:inherit;`;
    };

    el.innerHTML = `
      <div style="max-width:680px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:18px;">
          <h2 style="color:var(--text-main);font-size:1.3rem;margin:0 0 4px;letter-spacing:-0.3px;">🏆 Leaderboard</h2>
          <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">${isOverall ? "Global ranking across every exercise" : "Top players for this exercise"}</p>
        </div>

        <div style="position:relative;margin-bottom:12px;">
          <input id="lb-search" type="text" autocomplete="off" readonly
            value="${escapeHtml(selectedName)}"
            placeholder="Search exercises..."
            style="width:100%;box-sizing:border-box;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:12px 40px 12px 14px;color:var(--text-main);font-family:inherit;font-size:0.9rem;cursor:pointer;outline:none;" />
          <span id="lb-search-caret" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:0.7rem;">▼</span>
          <div id="lb-dropdown" style="display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;background:#141a26;border:1px solid var(--border);border-radius:10px;max-height:320px;overflow-y:auto;z-index:50;box-shadow:0 12px 30px rgba(0,0,0,0.5);"></div>
        </div>

        <div id="lb-difficulty-filter" style="display:flex;gap:6px;margin-bottom:14px;justify-content:center;flex-wrap:wrap;">
          <button onclick="window.Leaderboard.setDifficultyFilter('all')" style="${diffBtnStyle('all')}">All</button>
          <button onclick="window.Leaderboard.setDifficultyFilter('easy')" style="${diffBtnStyle('easy')}">🟢 Easy</button>
          <button onclick="window.Leaderboard.setDifficultyFilter('medium')" style="${diffBtnStyle('medium')}">🟡 Medium</button>
          <button onclick="window.Leaderboard.setDifficultyFilter('hard')" style="${diffBtnStyle('hard')}">🔴 Hard</button>
        </div>

        <div id="lb-table" style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:14px;min-height:180px;">
          <div style="text-align:center;padding:24px;color:var(--text-muted);">Loading...</div>
        </div>
      </div>`;

    wireSearch(selected);

    try {
      const top = await fetchTop(selected, currentDifficultyFilter);
      renderTable(top, isOverall, selectedName);
    } catch (err) {
      const tableEl = document.getElementById("lb-table");
      if (tableEl)
        tableEl.innerHTML = `<div style="text-align:center;padding:24px;color:#ef4444;">Failed to load. Try again.</div>`;
    }
  }

  function setDifficultyFilter(diff) {
    currentDifficultyFilter = diff;
    renderInto("leaderboard-container", currentExerciseId);
  }

  function renderTable(top, isOverall, selectedName) {
    const tableEl = document.getElementById("lb-table");
    if (!tableEl) return;

    if (!top || top.length === 0) {
      tableEl.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:28px 16px;">
        <div style="font-size:1.8rem;margin-bottom:10px;">🏆</div>
        <p style="margin:0;font-size:0.9rem;">No scores yet${isOverall ? "" : ` for <strong style="color:var(--accent)">${escapeHtml(selectedName)}</strong>`}.</p>
        <p style="margin:6px 0 0;font-size:0.8rem;color:var(--text-muted);">Play to claim #1!</p>
      </div>`;
      return;
    }

    const thirdHead = isOverall ? "Played" : "Acc";
    let html = '<table style="width:100%;border-collapse:collapse;">';
    html +=
      '<thead><tr>' +
      th("#", "left") +
      th("Player", "left") +
      th("Score", "right") +
      th(thirdHead, "right") +
      '</tr></thead><tbody>';

    top.forEach((r, idx) => {
      const rank = r.position || idx + 1;
      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
      const bg = idx % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent";
      const third = isOverall
        ? (r.exercises != null ? r.exercises : "—")
        : (r.accuracy != null ? Math.round(r.accuracy) + "%" : "—");
      html += `<tr style="background:${bg}">
        <td style="padding:10px 8px;color:var(--primary);font-weight:700;font-size:0.9rem;">${medal}</td>
        <td style="padding:10px 8px;color:var(--text-main);font-size:0.9rem;">${escapeHtml(r.name)}</td>
        <td style="padding:10px 8px;color:var(--accent);text-align:right;font-weight:700;">${r.score}</td>
        <td style="padding:10px 8px;color:var(--text-muted);text-align:right;font-size:0.85rem;">${third}</td>
      </tr>`;
    });

    html += "</tbody></table>";
    tableEl.innerHTML = html;
  }

  function th(label, align) {
    return `<th style="text-align:${align};padding:8px;color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid var(--border);">${label}</th>`;
  }

  // Wire up the compact searchable selector. Clicking the input opens a
  // filterable list containing "Overall" + every exercise grouped by category.
  function wireSearch(selectedId) {
    const input = document.getElementById("lb-search");
    const dropdown = document.getElementById("lb-dropdown");
    const caret = document.getElementById("lb-search-caret");
    if (!input || !dropdown) return;

    let isOpen = false;

    function buildList(filter) {
      const q = (filter || "").toLowerCase().trim();
      const opts = getExerciseOptions();

      // Group items by category, always include Overall at top
      let html = "";
      if (!q || "overall".includes(q)) {
        html += rowHtml("overall", "🌐 Overall", selectedId === "overall");
      }

      const grouped = {};
      for (const ex of opts) {
        if (q && !ex.name.toLowerCase().includes(q)) continue;
        if (!grouped[ex.category]) grouped[ex.category] = [];
        grouped[ex.category].push(ex);
      }

      for (const cat of Object.keys(grouped)) {
        html += `<div style="padding:8px 14px 4px;color:var(--text-muted);font-size:0.65rem;text-transform:uppercase;letter-spacing:1.2px;font-weight:700;">${escapeHtml(cat)}</div>`;
        for (const ex of grouped[cat]) {
          html += rowHtml(ex.id, ex.name, selectedId === ex.id);
        }
      }

      if (!html) {
        html = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.85rem;">No matches</div>`;
      }
      dropdown.innerHTML = html;
    }

    function rowHtml(id, name, active) {
      return `<div class="lb-option" data-id="${escapeHtml(id)}" style="padding:10px 14px;cursor:pointer;font-size:0.88rem;color:${active ? "var(--accent)" : "var(--text-main)"};font-weight:${active ? "700" : "400"};border-radius:6px;" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='transparent'">${escapeHtml(name)}</div>`;
    }

    function open() {
      isOpen = true;
      input.removeAttribute("readonly");
      input.value = "";
      input.placeholder = "Search exercises...";
      buildList("");
      dropdown.style.display = "block";
      if (caret) caret.textContent = "▲";
      input.focus();
    }

    function close() {
      isOpen = false;
      dropdown.style.display = "none";
      input.setAttribute("readonly", "readonly");
      input.value = getExerciseName(currentExerciseId);
      if (caret) caret.textContent = "▼";
    }

    input.addEventListener("click", function (e) {
      e.stopPropagation();
      if (isOpen) close();
      else open();
    });

    input.addEventListener("input", function () {
      if (isOpen) buildList(input.value);
    });

    dropdown.addEventListener("click", function (e) {
      const opt = e.target.closest(".lb-option");
      if (!opt) return;
      e.stopPropagation();
      const id = opt.getAttribute("data-id");
      dropdown.style.display = "none";
      renderInto("leaderboard-container", id);
    });

    // Close when clicking outside
    document.addEventListener("click", function onDocClick(e) {
      if (!isOpen) return;
      if (e.target === input || dropdown.contains(e.target)) return;
      close();
    });
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return s.toString().replace(/[&<>\"']/g, function (c) {
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
    renderInto("leaderboard-container", exerciseId);
  }

  return {
    init: promptForNameIfMissing,
    renderInto,
    postScore,
    setPlayerName,
    getPlayerName,
    switchExercise,
    setDifficultyFilter,
  };
})();

// Expose Leaderboard to window so React can access it
window.Leaderboard = Leaderboard;

// Auto-init prompt on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    Leaderboard.init();
  });
} else {
  Leaderboard.init();
}
