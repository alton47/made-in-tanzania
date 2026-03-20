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
