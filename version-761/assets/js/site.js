(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var isOpen = panel.hasAttribute("hidden");
        if (isOpen) {
          panel.removeAttribute("hidden");
          toggle.setAttribute("aria-expanded", "true");
        } else {
          panel.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length) {
      var current = Math.max(0, slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
      }));
      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
          slide.setAttribute("aria-hidden", i === current ? "false" : "true");
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
          dot.setAttribute("aria-current", i === current ? "true" : "false");
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      showSlide(current);
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      var type = params.get("type") || "";
      var input = searchPage.querySelector("input[name='q']");
      var select = searchPage.querySelector("select[name='type']");
      if (input) {
        input.value = q;
      }
      if (select) {
        select.value = type;
      }
      var cards = Array.prototype.slice.call(searchPage.querySelectorAll(".movie-card"));
      var empty = searchPage.querySelector(".empty-panel");
      var total = searchPage.querySelector("[data-result-count]");
      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }
      function runFilter() {
        var query = normalize(input && input.value);
        var chosenType = normalize(select && select.value);
        var hits = 0;
        cards.forEach(function (card) {
          var text = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre"));
          var cardType = normalize(card.getAttribute("data-type"));
          var ok = (!query || text.indexOf(query) !== -1) && (!chosenType || cardType === chosenType);
          card.hidden = !ok;
          if (ok) {
            hits += 1;
          }
        });
        if (empty) {
          empty.hidden = hits !== 0;
        }
        if (total) {
          total.textContent = hits ? "找到 " + hits + " 部相关影片" : "没有找到相关影片";
        }
      }
      if (input) {
        input.addEventListener("input", runFilter);
      }
      if (select) {
        select.addEventListener("change", runFilter);
      }
      runFilter();
    }
  });
})();
