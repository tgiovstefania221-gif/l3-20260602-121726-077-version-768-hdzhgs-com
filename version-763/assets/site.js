(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let currentSlide = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5600);
  }

  const params = new URLSearchParams(window.location.search);
  const queryValue = (params.get('q') || '').trim();
  const searchInputs = document.querySelectorAll('[data-search-input]');

  searchInputs.forEach(function (input) {
    if (queryValue && !input.value) {
      input.value = queryValue;
    }
  });

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function filterCards() {
    const keywordInput = document.querySelector('[data-page-search]');
    const yearSelect = document.querySelector('[data-year-filter]');
    const typeSelect = document.querySelector('[data-type-filter]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

    if (!cards.length) {
      return;
    }

    const keyword = normalize(keywordInput ? keywordInput.value : queryValue);
    const year = yearSelect ? yearSelect.value : '';
    const type = typeSelect ? typeSelect.value : '';

    cards.forEach(function (card) {
      const haystack = normalize(card.getAttribute('data-title') + card.getAttribute('data-genre') + card.getAttribute('data-region') + card.getAttribute('data-tags'));
      const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchYear = !year || card.getAttribute('data-year') === year;
      const matchType = !type || card.getAttribute('data-type') === type;
      card.classList.toggle('hidden-card', !(matchKeyword && matchYear && matchType));
    });
  }

  document.querySelectorAll('[data-page-search], [data-year-filter], [data-type-filter]').forEach(function (control) {
    control.addEventListener('input', filterCards);
    control.addEventListener('change', filterCards);
  });

  filterCards();

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('[data-search-input]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const layer = player.querySelector('[data-play-layer]');
    const button = player.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    function attachStream() {
      const stream = video.getAttribute('data-stream');

      if (!stream || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          lowLatencyMode: true,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
    }

    function startPlayback() {
      attachStream();

      if (layer) {
        layer.classList.add('is-hidden');
      }

      const result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });
  });
})();
