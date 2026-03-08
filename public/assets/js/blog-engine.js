/**
 * Blog Engine
 * Handles rendering of list view and detailed article view
 */

// Auto-init if DOMContentLoaded already fired (normal page load)
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  if (postId) {
    renderArticle(postId);
  } else {
    renderList();
  }
});

function renderList() {
  const container = document.getElementById("blog-content");
  if (!container) return;

  let html = `
      <div class="blog-intro">
        <h1 style="margin-bottom:10px; font-size:2.3rem;">Latest <span style="color:var(--primary)">Articles</span></h1>
        <p style="margin:0; color:var(--text-muted); max-width:760px;">
          Improve aim with structured guides and then practice instantly in the trainer.
          <a href="/" style="color: var(--primary); text-decoration: underline;">Start training</a>
          or
          <a href="https://valocrossdb.site/" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">explore crosshairs</a>.
        </p>
      </div>
  `;
  html += `<div class="blog-grid">`;

  BLOG_DATA.forEach((post) => {
    const thumbnail = resolveThumbnail(post.thumbnail);
    html += `
            <div class="blog-card" onclick="openArticle('${post.id}')">
                <img src="${thumbnail}" class="card-img" loading="lazy" alt="${post.title}">
                <div class="card-content">
                    <div class="card-date">${post.date}</div>
                    <h2 class="card-title">${post.title}</h2>
                    <p class="card-excerpt">${post.excerpt}</p>
                    <div class="read-more">Read Article →</div>
                </div>
            </div>
        `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function resolveThumbnail(path) {
  if (!path) return "/assets/favicon.png";

  // Current dataset uses thumb-* paths that do not exist in /public/assets/blog.
  // Route them to a valid local asset to prevent 404 noise and CLS from retries.
  if (/^assets\/blog\/thumb-\d+\.jpg$/i.test(path)) {
    return "/assets/favicon.png";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function renderArticle(id) {
  const post = BLOG_DATA.find(
    (p) => p.id === id || (Array.isArray(p.aliases) && p.aliases.includes(id)),
  );
  const container = document.getElementById("blog-content");

  if (!post) {
    container.innerHTML =
      "<h2>Article not found. <a href='blog.html' style='color:var(--primary)'>Go Back</a></h2>";
    return;
  }

  // Canonicalize legacy IDs in the URL to avoid duplicates
  if (post.id && post.id !== id) {
    window.history.replaceState(null, "", `/blog?id=${post.id}`);
  }

  // UPDATE SEO TAGS DYNAMICALLY
  document.title = `${post.title} - AimTrainerPro`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", post.excerpt);
  }

  let html = `
        <div class="article-view">
            <button onclick="window.location.href='/blog'" style="background:none; border:none; color:var(--text-muted); cursor:pointer; margin-bottom:20px; font-size:1rem;">← Back to Articles</button>
            
            <div class="article-header">
                <h1 class="article-title">${post.title}</h1>
                <div class="article-meta">Published on ${post.date} • by ${post.author}</div>
            </div>

            <div class="article-body">
                ${post.content}
              ${getLongFormAppendix(post)}
            </div>
        </div>
    `;

  container.innerHTML = html;
}

function getLongFormAppendix(post) {
  const title = (post?.title || "").toLowerCase();

  if (title.includes("crosshair")) {
    return `
      <h2>Advanced Crosshair Testing Framework</h2>
      <p>If you want to get reliable results from crosshair testing, do not swap settings every game. Test one setup for a minimum of 3 sessions and track the same metrics: first-bullet duel confidence, long-range correction comfort, and visibility during fast camera movement. A crosshair that looks good in static menus can fail under movement and utility chaos.</p>
      <p>A practical method is to test in three blocks: aim trainer benchmark, deathmatch sample, and ranked pressure sample. In your benchmark, pay attention to over-correction behavior on tiny targets. In deathmatch, focus on how quickly your eyes reacquire the center after recoil reset. In ranked, monitor whether your first two bullets are calm and deliberate instead of panic-fired.</p>

      <h2>Crosshair + Aim Routine Stack</h2>
      <ol>
        <li>Run 8 minutes of flick and micro-adjustment drills in our <a href="/" style="color: var(--primary);">aim trainer</a>.</li>
        <li>Play one short DM block with your new crosshair.</li>
        <li>Queue ranked only if visibility and confidence stay stable.</li>
        <li>Keep notes for 7 days before making another change.</li>
      </ol>

      <h2>Bonus Tool for Valorant Crosshairs</h2>
      <p>If you want to explore and compare detailed Valorant crosshair styles, a useful reference is <a href="https://valocrossdb.site" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline;">ValoCrossDB</a>. It can help you test presets faster and then validate them with your in-game routine.</p>

      <h2>FAQ</h2>
      <p><strong>Should I copy pro crosshairs exactly?</strong> You can use pro settings as a starting point, but visibility and comfort are personal. Keep what helps your first-shot confidence.</p>
      <p><strong>Does changing color improve aim instantly?</strong> Not instantly. Color helps visibility, but consistency and practice are still the main drivers of results.</p>
      <p><strong>How often should I change crosshair settings?</strong> Only when repeated data shows a problem. Weekly or bi-weekly changes are safer than daily changes.</p>
    `;
  }

  if (title.includes("valorant")) {
    return `
      <h2>7-Day Valorant Improvement Protocol</h2>
      <p>To make aim gains transfer into ranked games, run a repeatable 7-day protocol instead of random practice. Keep the same sensitivity and crosshair for the full week. Start each day with 20 to 30 minutes of controlled mechanics: static clicking, medium flick correction, and short micro-target sessions. Then play 2 to 3 focused games where your only aim objective is first-bullet quality.</p>
      <p>After each match, review three events: opening duel accuracy, overflick frequency on shoulder peeks, and panic spray moments. This review loop helps you identify mechanical patterns quickly. Most players improve faster when they reduce panic speed and increase deliberate shot timing.</p>

      <h2>Ranked Transfer Checklist</h2>
      <ul>
        <li>Crosshair at head level before every swing.</li>
        <li>Counter-strafe before committing to bursts.</li>
        <li>Reset mentally after missed first shots instead of speed-spamming.</li>
        <li>Track consistency over 10 games, not one hot match.</li>
      </ul>

      <h2>FAQ</h2>
      <p><strong>How long before I see aim improvements?</strong> Most consistent players notice cleaner duels in 2 to 4 weeks when routine and settings are stable.</p>
      <p><strong>Should I train before or after ranked?</strong> Usually before ranked. Short warmups improve confidence and reduce shaky first games.</p>
      <p><strong>What matters more: speed or precision?</strong> Precision first. Speed naturally follows as movement efficiency improves.</p>
    `;
  }

  if (title.includes("cs2")) {
    return `
      <h2>CS2 Precision Transfer Plan</h2>
      <p>CS2 rewards controlled first contact. A strong transfer plan starts with 20 minutes of drills and finishes with intentional in-game application. Use your warmup to reinforce stop-and-shoot rhythm, not highlight-level speed. During matches, your goal is to reduce unnecessary large flicks by improving pre-aim and angle discipline.</p>
      <p>Track your mistakes by category: crosshair placement misses, timing errors while moving, and recoil panic after first-shot miss. If a category appears repeatedly, allocate more drill time to that exact weakness the next day. This feedback loop compounds quickly over 2 to 3 weeks.</p>

      <h2>Weekly Focus Rotation</h2>
      <ul>
        <li>Days 1-2: first-shot precision and head-level micro-corrections.</li>
        <li>Days 3-4: swing reaction drills and close-angle stabilizing.</li>
        <li>Days 5-6: mixed benchmark + transfer deathmatch.</li>
        <li>Day 7: light recovery and VOD review.</li>
      </ul>

      <h2>FAQ</h2>
      <p><strong>Is deathmatch enough for aim training?</strong> Deathmatch helps transfer, but dedicated drills build cleaner mechanics faster.</p>
      <p><strong>Should I lower sensitivity for CS2?</strong> Lower or medium sensitivity often improves precision, but only if you can still handle close-range turns.</p>
      <p><strong>How do I stop overflicking?</strong> Slow your initial movement slightly and focus on decisive stopping before clicking.</p>
    `;
  }

  if (title.includes("fortnite")) {
    return `
      <h2>Fortnite Mechanics Layering</h2>
      <p>Fortnite fights can shift from flick-heavy shotgun trades to close tracking within seconds. That is why your training should layer skills in sequence. Start with precision flick reps, then transition into sustained tracking, then finish with target switching under mild pressure. This ordering reflects realistic fight flow better than random drill order.</p>
      <p>To keep progress measurable, run the same three benchmark scenarios twice per week and compare 7-day averages. If your tracking stability improves but flicking confidence drops, rebalance your drill split rather than changing settings immediately.</p>

      <h2>Controller and Mouse Transfer Notes</h2>
      <ul>
        <li>Mouse players: prioritize smooth hand tension control and click timing.</li>
        <li>Controller players: prioritize stick discipline and target reacquisition patterns.</li>
        <li>Both: avoid overtraining to fatigue, which reduces in-game precision.</li>
      </ul>

      <h2>FAQ</h2>
      <p><strong>How much daily training is ideal?</strong> 20 to 35 minutes of focused work is enough for steady gains.</p>
      <p><strong>Should I practice only close range?</strong> No. Include mid-range control to improve consistency in different fight states.</p>
      <p><strong>Do high scores always mean better real-game aim?</strong> Not always. Pair high scores with match transfer metrics.</p>
    `;
  }

  if (title.includes("dpi") || title.includes("sensitivity")) {
    return `
      <h2>Consistency Rules for Settings</h2>
      <p>Settings optimization only works if you control variables. When testing sensitivity or DPI, keep everything else stable: mousepad position, sitting posture, monitor distance, and routine structure. Frequent uncontrolled changes make it impossible to identify what caused improvement or decline.</p>
      <p>Use a two-week testing window with only small sensitivity adjustments. Write down your accuracy, smoothness rating, and confidence score after each session. The goal is to find the value that feels repeatable under pressure, not just the one that produces one lucky high score.</p>

      <h2>Two-Week Testing Template</h2>
      <ol>
        <li>Days 1-4: baseline settings and score tracking.</li>
        <li>Days 5-8: one small adjustment (5% to 8%).</li>
        <li>Days 9-12: evaluate with same drills and game sessions.</li>
        <li>Days 13-14: lock the best performing setup.</li>
      </ol>

      <h2>FAQ</h2>
      <p><strong>Should I change DPI or in-game sensitivity first?</strong> Usually keep DPI stable and tune in-game sensitivity first.</p>
      <p><strong>Is low sensitivity always better?</strong> Not always. The best setup is one you can control in both precision and close-range reactions.</p>
      <p><strong>How much should I adjust each test?</strong> Small increments are best. Large jumps often hide useful signal.</p>
    `;
  }

  return `
    <h2>Execution Framework (30-Day Plan)</h2>
    <p>Consistent aim development comes from repeatable systems. Run your routine in blocks: warmup, skill focus, benchmark, and transfer. Keep each block short, intentional, and measurable. Most players improve faster by practicing 25 to 35 minutes daily for 30 days than by doing random long sessions.</p>
    <p>Track one process metric and one performance metric per session. Process examples: clean movement, relaxed grip, no panic clicks. Performance examples: accuracy percentage and benchmark score average. This keeps your training objective and stable over time.</p>

    <h2>Monthly Progress Checklist</h2>
    <ul>
      <li>Settings unchanged for at least 2 weeks.</li>
      <li>At least 5 focused sessions per week.</li>
      <li>7-day average score trend improving.</li>
      <li>In-game duel confidence increasing.</li>
    </ul>

    <h2>FAQ</h2>
    <p><strong>How long should each session be?</strong> 20 to 35 minutes is ideal for most players.</p>
    <p><strong>Can beginners use this plan?</strong> Yes. Beginners should emphasize clean movement and precision before speed.</p>
    <p><strong>How often should I benchmark?</strong> Two to four times per week with the same scenarios.</p>
  `;
}

function openArticle(id) {
  window.location.href = `/blog?id=${id}`;
}

// Expose functions to window for dynamic loading
window.renderList = renderList;
window.renderArticle = renderArticle;
window.openArticle = openArticle;
