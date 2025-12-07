/**
 * Blog Engine
 * Handles rendering of list view and detailed article view
 */

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
  let html = `<h1 style="margin-bottom:30px; font-size:2.5rem;">Latest <span style="color:var(--primary)">Articles</span></h1>`;
  html += `<div class="blog-grid">`;

  BLOG_DATA.forEach((post) => {
    html += `
            <div class="blog-card" onclick="openArticle('${post.id}')">
                <img src="${post.thumbnail}" onerror="this.src='https://placehold.co/600x400/222/FFF?text=Aim+Pro'" class="card-img" alt="${post.title}">
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

function renderArticle(id) {
  const post = BLOG_DATA.find((p) => p.id === id);
  const container = document.getElementById("blog-content");

  if (!post) {
    container.innerHTML =
      "<h2>Article not found. <a href='blog.html' style='color:var(--primary)'>Go Back</a></h2>";
    return;
  }

  // UPDATE SEO TAGS DYNAMICALLY
  document.title = `${post.title} - Valorant Aim Trainer`;
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", post.excerpt);

  let html = `
        <div class="article-view">
            <button onclick="window.location.href='blog.html'" style="background:none; border:none; color:var(--text-muted); cursor:pointer; margin-bottom:20px; font-size:1rem;">← Back to Articles</button>
            
            <div class="article-header">
                <h1 class="article-title">${post.title}</h1>
                <div class="article-meta">Published on ${post.date} • by ${post.author}</div>
            </div>

            <div class="article-body">
                ${post.content}
            </div>
        </div>
    `;

  container.innerHTML = html;
}

function openArticle(id) {
  window.location.href = `blog.html?id=${id}`;
}
