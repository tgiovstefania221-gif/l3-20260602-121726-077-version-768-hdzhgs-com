(function() {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (navButton && nav) {
        navButton.addEventListener('click', function() {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
        var active = 0;
        var showSlide = function(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                showSlide(index);
            });
        });
        window.setInterval(function() {
            showSlide(active + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var queryName = filterInput.getAttribute('data-url-query');
        if (queryName) {
            var params = new URLSearchParams(window.location.search);
            var initialValue = params.get(queryName);
            if (initialValue) {
                filterInput.value = initialValue;
            }
        }
        var applyFilter = function() {
            var keyword = filterInput.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function(card) {
                var haystack = card.getAttribute('data-search') || '';
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        };
        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }
})();

function setupMoviePlayer(source) {
    var video = document.getElementById('movie-player');
    var button = document.querySelector('[data-play-button]');
    if (!video || !source) {
        return;
    }
    var hasLoaded = false;
    var pendingPlay = false;
    var tryPlay = function() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function() {});
        }
    };
    var loadSource = function() {
        if (hasLoaded) {
            return;
        }
        hasLoaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            if (pendingPlay) {
                tryPlay();
            }
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                if (pendingPlay) {
                    tryPlay();
                }
            });
        } else {
            video.src = source;
            if (pendingPlay) {
                tryPlay();
            }
        }
    };
    var start = function() {
        pendingPlay = true;
        loadSource();
        if (button) {
            button.classList.add('is-hidden');
        }
        if (hasLoaded && (!window.Hls || !window.Hls.isSupported() || video.canPlayType('application/vnd.apple.mpegurl'))) {
            tryPlay();
        }
    };
    if (button) {
        button.addEventListener('click', start);
    }
    video.addEventListener('click', function() {
        if (!hasLoaded || video.paused) {
            start();
        }
    });
}
