(function () {
  function all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function one(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function initMenu() {
    var button = one('.menu-toggle');
    var panel = one('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var slider = one('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = all('.hero-slide', slider);
    var dots = all('.hero-dot', slider);
    var prev = one('.hero-prev', slider);
    var next = one('.hero-next', slider);
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var panel = one('.filter-panel');
    var list = one('.filter-list');
    if (!panel || !list) {
      return;
    }
    var cards = all('[data-title]', list);
    var input = one('.filter-input', panel);
    var yearSelect = one('.filter-year', panel);
    var regionSelect = one('.filter-region', panel);
    var typeSelect = one('.filter-type', panel);
    var state = one('.filter-state', panel);
    var years = [];
    var regions = [];
    var types = [];

    cards.forEach(function (card) {
      var year = card.getAttribute('data-year') || '';
      var region = card.getAttribute('data-region') || '';
      var type = card.getAttribute('data-type') || '';
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (region && regions.indexOf(region) === -1) {
        regions.push(region);
      }
      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
    });

    years.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });
    regions.sort(function (a, b) {
      return a.localeCompare(b, 'zh-Hans-CN');
    });
    types.sort(function (a, b) {
      return a.localeCompare(b, 'zh-Hans-CN');
    });

    fillSelect(yearSelect, years);
    fillSelect(regionSelect, regions);
    fillSelect(typeSelect, types);

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input) {
      input.value = query;
    }

    function apply() {
      var words = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matched = true;
        if (words && haystack.indexOf(words) === -1) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (state) {
        state.textContent = visible ? '已显示匹配内容' : '暂无匹配内容';
      }
    }

    [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function initPlayers() {
    all('[data-player]').forEach(function (wrap) {
      var video = one('video', wrap);
      var overlay = one('.player-overlay', wrap);
      var message = one('.player-message', wrap);
      if (!video || !overlay) {
        return;
      }
      var source = video.getAttribute('data-stream');
      var started = false;
      var hls = null;

      function start() {
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        overlay.classList.add('is-hidden');
        video.controls = true;
        if (message) {
          message.textContent = '';
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (message) {
              message.textContent = '点击视频区域继续播放';
            }
          });
        }
      }

      overlay.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
      video.addEventListener('error', function () {
        if (message) {
          message.textContent = '播放遇到问题，请稍后再试';
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  initMenu();
  initHero();
  initFilters();
  initPlayers();
})();
