
(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }
  }

  var search = document.querySelector('.movie-search');
  var select = document.querySelector('.filter-type');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (search && q) {
    search.value = q;
  }
  var apply = function () {
    var keyword = search ? search.value.trim().toLowerCase() : '';
    var type = select ? select.value : '';
    cards.forEach(function (card) {
      var hay = (card.getAttribute('data-search') || '').toLowerCase();
      var cardType = card.getAttribute('data-type') || '';
      var matched = (!keyword || hay.indexOf(keyword) !== -1) && (!type || cardType === type);
      card.classList.toggle('is-hidden', !matched);
    });
  };
  if (search) {
    search.addEventListener('input', apply);
  }
  if (select) {
    select.addEventListener('change', apply);
  }
  if (search || select) {
    apply();
  }

  var start = function (button) {
    var video = document.getElementById(button.getAttribute('data-video-id'));
    var stream = button.getAttribute('data-stream');
    if (!video || !stream) {
      return;
    }
    var cover = button.closest('.player-cover');
    if (cover) {
      cover.classList.add('is-hidden');
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.play();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      return;
    }
    video.src = stream;
    video.play();
  };

  document.querySelectorAll('.play-gate').forEach(function (button) {
    button.addEventListener('click', function () {
      start(button);
    });
  });
})();
