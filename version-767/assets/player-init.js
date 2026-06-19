document.addEventListener("DOMContentLoaded", function () {
  var hlsModuleUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.mjs";
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-overlay");
    var src = video ? video.getAttribute("data-src") : "";
    var ready = false;
    var hlsInstance = null;

    function attachNative() {
      video.src = src;
      ready = true;
    }

    function attachHls(Hls) {
      if (Hls && Hls.isSupported && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        ready = true;
      } else {
        attachNative();
      }
    }

    function prepare() {
      if (!video || !src || ready) {
        return Promise.resolve();
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        attachNative();
        return Promise.resolve();
      }

      return import(hlsModuleUrl)
        .then(function (module) {
          attachHls(module.default || module.Hls || module.H);
        })
        .catch(function () {
          attachNative();
        });
    }

    function playVideo() {
      prepare().then(function () {
        var result = video.play();

        if (result && result.catch) {
          result.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
      prepare();
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  });
});
