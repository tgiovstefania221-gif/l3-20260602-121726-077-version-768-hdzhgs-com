(function() {
  function setupMoviePlayer(videoUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");
    var loading = document.querySelector(".player-loading");
    if (!video) {
      return;
    }

    function showLoading(active) {
      if (loading) {
        loading.hidden = !active;
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function beginPlayback() {
      hideOverlay();
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function() {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    showLoading(true);

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
        showLoading(false);
      });
      hls.on(window.Hls.Events.ERROR, function(_, data) {
        if (data && data.fatal) {
          showLoading(false);
          video.src = videoUrl;
        }
      });
      window.addEventListener("pagehide", function() {
        hls.destroy();
      });
    } else {
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", function() {
        showLoading(false);
      }, { once: true });
    }

    video.addEventListener("canplay", function() {
      showLoading(false);
    });

    if (overlay) {
      overlay.addEventListener("click", beginPlayback);
    }

    video.addEventListener("play", hideOverlay);
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
