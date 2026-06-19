document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = Number(dot.getAttribute("data-hero-dot"));
        showSlide(target);
        schedule();
      });
    });

    showSlide(0);
    schedule();
  }

  var panel = document.querySelector("[data-filter-panel]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".media-card"));

  if (panel && cards.length) {
    var searchInput = panel.querySelector("[data-search-input]");
    var regionFilter = panel.querySelector("[data-region-filter]");
    var typeFilter = panel.querySelector("[data-type-filter]");
    var yearFilter = panel.querySelector("[data-year-filter]");
    var emptyState = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : "");
      var region = regionFilter ? regionFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }

        if (region && card.getAttribute("data-region") !== region) {
          ok = false;
        }

        if (type && card.getAttribute("data-type") !== type) {
          ok = false;
        }

        if (year && card.getAttribute("data-year") !== year) {
          ok = false;
        }

        card.classList.toggle("hidden", !ok);

        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("hidden", visible !== 0);
      }
    }

    [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
});
