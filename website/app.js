let ALL_PROJECTS = [];
let activeFilter = "all";
let searchQuery = "";

/* ── BOOT ── */
document.addEventListener("DOMContentLoaded", async () => {
  await loadProjects();
  setupSearch();
  setupScroll();
});

/* ── LOAD DATA ── */
async function loadProjects() {
  try {
    const res = await fetch("projects.json");
    if (!res.ok) throw new Error("Failed to load projects.json");
    ALL_PROJECTS = await res.json();

    // Compute stats
    const techSet = new Set(ALL_PROJECTS.flatMap((p) => p.tech));
    const authorSet = new Set(ALL_PROJECTS.map((p) => p.author));

    animateNum("statProjects", ALL_PROJECTS.length);
    animateNum("statContributors", authorSet.size);
    animateNum("statTech", techSet.size);

    // Build tech filters
    buildFilters(techSet);

    // Build letter nav
    buildLetterNav();

    // Initial render
    renderProjects(ALL_PROJECTS);
  } catch (err) {
    console.error(err);
    document.getElementById("loadingState").innerHTML =
      '<span style="color:var(--rd)">Failed to load projects.</span>';
  }
}

/* ── RENDER ── */
function renderProjects(projects) {
  const grid = document.getElementById("projectsGrid");
  const empty = document.getElementById("emptyState");
  const loading = document.getElementById("loadingState");

  if (loading) loading.remove();

  if (projects.length === 0) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  // Group by letter
  const byLetter = {};
  for (const p of projects) {
    const l = p.letter.toUpperCase();
    if (!byLetter[l]) byLetter[l] = [];
    byLetter[l].push(p);
  }

  const letters = Object.keys(byLetter).sort();
  let html = "";

  letters.forEach((letter) => {
    html += `
      <div class="letter-group" id="letter-${letter}">
        <div class="letter-group-char">${letter}</div>
        <div class="letter-group-line"></div>
      </div>
    `;
    byLetter[letter].forEach((p, i) => {
      html += buildCard(p, i);
    });
  });

  grid.innerHTML = html;
}

function buildCard(p, delay) {
  const techTags = p.tech
    .map((t) => `<span class="tech-tag">${esc(t)}</span>`)
    .join("");

  return `
    <div class="project-card" style="animation-delay:${delay * 40}ms">
      <div class="card-top">
        <span class="card-emoji">${p.emoji}</span>
        <div class="card-links">
          <a href="${p.repo}" target="_blank" rel="noopener" class="card-link" title="View on GitHub">↗</a>
        </div>
      </div>
      <div class="card-name">${esc(p.name)}</div>
      <div class="card-desc">${esc(p.description)}</div>
      <div class="card-footer">
        <a href="${p.authorUrl}" target="_blank" rel="noopener" class="card-author">${esc(p.author)}</a>
        <div class="card-tech">${techTags}</div>
      </div>
    </div>
  `;
}
