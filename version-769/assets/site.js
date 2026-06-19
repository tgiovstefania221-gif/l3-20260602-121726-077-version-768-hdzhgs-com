(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var previous = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
      startHero();
    });
  });

  startHero();

  document.querySelectorAll('[data-scroll-left]').forEach(function (button) {
    button.addEventListener('click', function () {
      var target = document.getElementById(button.getAttribute('data-scroll-left'));
      if (target) {
        target.scrollBy({ left: -360, behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('[data-scroll-right]').forEach(function (button) {
    button.addEventListener('click', function () {
      var target = document.getElementById(button.getAttribute('data-scroll-right'));
      if (target) {
        target.scrollBy({ left: 360, behavior: 'smooth' });
      }
    });
  });

  var searchInput = document.getElementById('site-search');
  var regionFilter = document.getElementById('region-filter');
  var yearFilter = document.getElementById('year-filter');
  var searchGrid = document.getElementById('search-grid');

  function applySearch() {
    if (!searchGrid) {
      return;
    }

    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var region = regionFilter ? regionFilter.value : '';
    var year = yearFilter ? yearFilter.value : '';

    searchGrid.querySelectorAll('.movie-card').forEach(function (card) {
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var cardRegion = card.getAttribute('data-region') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var bodyText = card.textContent.toLowerCase();
      var matchKeyword = !keyword || title.indexOf(keyword) >= 0 || bodyText.indexOf(keyword) >= 0;
      var matchRegion = !region || cardRegion === region;
      var matchYear = !year || cardYear === year;

      card.classList.toggle('is-hidden', !(matchKeyword && matchRegion && matchYear));
    });
  }

  [searchInput, regionFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applySearch);
      control.addEventListener('change', applySearch);
    }
  });

  document.querySelectorAll('.movie-player').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;

    function loadStream() {
      if (!video || !stream || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
    }

    function playVideo(event) {
      if (event) {
        event.preventDefault();
      }

      loadStream();
      player.classList.add('is-playing');

      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    player.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }

      if (!player.classList.contains('is-playing')) {
        playVideo(event);
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
