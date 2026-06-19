(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function() {
      var opened = menu.hasAttribute("hidden");
      if (opened) {
        menu.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        menu.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-slide") || 0));
        start();
      });
    });

    start();
  }

  function setupCatalog() {
    var input = document.querySelector(".catalog-search");
    var grid = document.getElementById("catalog-grid");
    if (input && grid) {
      input.addEventListener("input", function() {
        var q = input.value.trim().toLowerCase();
        Array.prototype.forEach.call(grid.querySelectorAll(".movie-card"), function(card) {
          var hay = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-tags") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          card.classList.toggle("is-hidden-by-filter", q && hay.indexOf(q) === -1);
        });
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll(".sort-actions"), function(group) {
      group.addEventListener("click", function(event) {
        var button = event.target.closest("button[data-sort]");
        if (!button) {
          return;
        }
        var targetId = group.getAttribute("data-sort-target");
        var target = document.getElementById(targetId);
        if (!target) {
          return;
        }
        Array.prototype.forEach.call(group.querySelectorAll("button"), function(item) {
          item.classList.toggle("is-active", item === button);
        });
        var mode = button.getAttribute("data-sort");
        var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
        cards.sort(function(a, b) {
          if (mode === "year") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }
          return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
        });
        cards.forEach(function(card) {
          target.appendChild(card);
        });
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function(char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function buildCard(movie) {
    return [
      "<article class=\"movie-card\">",
      "<a href=\"" + escapeHtml(movie.url) + "\" class=\"card-link\">",
      "<span class=\"poster-wrap\">",
      "<img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"badge badge-red\">" + escapeHtml(movie.category) + "</span>",
      "<span class=\"duration\">" + escapeHtml(movie.year) + "</span>",
      "</span>",
      "<span class=\"card-body\">",
      "<strong>" + escapeHtml(movie.title) + "</strong>",
      "<span>" + escapeHtml(movie.description) + "</span>",
      "<small>" + escapeHtml(movie.region) + " · " + escapeHtml((movie.tags || []).slice(0, 3).join(" / ")) + "</small>",
      "</span>",
      "</a>",
      "</article>"
    ].join("");
  }

  function setupSearchPage() {
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var summary = document.getElementById("searchSummary");
    if (!input || !results || !summary || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    input.value = query;

    function run(q) {
      var keyword = q.trim().toLowerCase();
      if (!keyword) {
        summary.textContent = "输入关键词后即可检索影片名称、题材、地区与标签。";
        results.innerHTML = "";
        return;
      }
      var list = window.SEARCH_MOVIES.filter(function(movie) {
        var hay = [
          movie.title,
          movie.description,
          movie.category,
          movie.year,
          movie.region,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase();
        return hay.indexOf(keyword) !== -1;
      }).sort(function(a, b) {
        return Number(b.score || 0) - Number(a.score || 0);
      }).slice(0, 120);
      summary.textContent = list.length ? "为你匹配到相关影片" : "没有找到匹配影片，可尝试更换关键词。";
      results.innerHTML = list.map(buildCard).join("");
    }

    run(query);
  }

  ready(function() {
    setupMenu();
    setupHero();
    setupCatalog();
    setupSearchPage();
  });
})();
