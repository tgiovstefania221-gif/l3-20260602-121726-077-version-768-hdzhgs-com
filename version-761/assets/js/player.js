(function () {
  function setupPlayer(options) {
    var video = document.querySelector(options.videoSelector);
    var cover = document.querySelector(options.coverSelector);
    var loading = document.querySelector(options.loadingSelector);
    var mediaUrl = options.url;
    var hls = null;
    var loaded = false;

    if (!video || !mediaUrl) {
      return;
    }

    function setLoading(value) {
      if (!loading) {
        return;
      }
      if (value) {
        loading.removeAttribute("hidden");
      } else {
        loading.setAttribute("hidden", "");
      }
    }

    function bindSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      setLoading(true);
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setLoading(false);
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = mediaUrl;
      }
    }

    function startPlayback() {
      bindSource();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(function () {
          setLoading(false);
        }).catch(function () {
          setLoading(false);
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener("canplay", function () {
      setLoading(false);
    });

    video.addEventListener("playing", function () {
      setLoading(false);
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupPlayer = setupPlayer;
})();
