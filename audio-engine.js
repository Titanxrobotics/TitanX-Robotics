// ==========================================================================
// TITANX ROBOTICS - ROBUST UNIVERSAL AUDIO ENGINE v3.0
// ==========================================================================
(function () {
  'use strict';

  var AUDIO_SOURCES = [
    'audio1.mp3',
    'audio.mpeg',
    'audio1.mpeg',
    'WhatsApp Audio 2026-08-13 at 2.30.31 AM.mpeg'
  ];

  var audio = document.getElementById('bgmusic');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'bgmusic';
    audio.loop = true;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    document.body.appendChild(audio);
  }

  // Populate sources if needed
  var existingSources = audio.querySelectorAll('source');
  if (!existingSources || existingSources.length === 0) {
    AUDIO_SOURCES.forEach(function (srcUrl) {
      var sourceEl = document.createElement('source');
      sourceEl.src = srcUrl;
      sourceEl.type = 'audio/mpeg';
      audio.appendChild(sourceEl);
    });
  }

  var savedVol = parseFloat(localStorage.getItem('titanx_vol') || '0.6');
  audio.volume = savedVol;

  var widget    = document.getElementById('audioWidget');
  var toggleBtn = document.getElementById('audioToggleBtn');
  var icon      = document.getElementById('audioIcon');
  var statusTxt = document.getElementById('audioStatusText');
  var volSlider = document.getElementById('volumeSlider');

  if (volSlider) {
    volSlider.value = savedVol;
  }

  function updateUI(playing) {
    if (icon) {
      icon.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
    }
    if (statusTxt) {
      statusTxt.textContent = playing ? 'AUDIO // LIVE' : 'AUDIO // TAP TO PLAY';
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('paused', !playing);
    }
    if (widget) {
      widget.classList.toggle('playing', playing);
      widget.classList.toggle('pulse-sound', playing);
    }
  }

  audio.addEventListener('play', function () {
    updateUI(true);
  });

  audio.addEventListener('pause', function () {
    updateUI(false);
  });

  audio.addEventListener('ended', function () {
    updateUI(false);
  });

  function startAudio() {
    sessionStorage.setItem('titanx_paused', 'false');
    var playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(function () {
        updateUI(true);
      }).catch(function (err) {
        console.log('Autoplay deferred until user interaction:', err);
        updateUI(false);
      });
    }
  }

  function pauseAudio() {
    audio.pause();
    sessionStorage.setItem('titanx_paused', 'true');
    updateUI(false);
  }

  function toggleAudio() {
    if (audio.paused) {
      startAudio();
    } else {
      pauseAudio();
    }
  }

  // Widget interactions
  if (widget) {
    widget.addEventListener('click', function (e) {
      if (volSlider && (e.target === volSlider || volSlider.contains(e.target))) {
        return;
      }
      e.preventDefault();
      toggleAudio();
    });
  }

  if (volSlider) {
    volSlider.addEventListener('input', function (e) {
      e.stopPropagation();
      var val = parseFloat(e.target.value);
      audio.volume = val;
      localStorage.setItem('titanx_vol', val);
      if (val > 0 && audio.paused && sessionStorage.getItem('titanx_paused') !== 'true') {
        startAudio();
      }
    });
  }

  // Autoplay unlock on first user gesture anywhere on page
  var unlocked = false;
  function unlockOnGesture() {
    if (unlocked) return;
    if (sessionStorage.getItem('titanx_paused') !== 'true') {
      startAudio();
    }
    unlocked = true;
    ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(function (evt) {
      document.removeEventListener(evt, unlockOnGesture, true);
    });
  }

  ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(function (evt) {
    document.addEventListener(evt, unlockOnGesture, { capture: true, once: true, passive: true });
  });

  // Attempt immediate play
  var userExplicitlyPaused = sessionStorage.getItem('titanx_paused') === 'true';
  if (!userExplicitlyPaused) {
    setTimeout(function () {
      startAudio();
    }, 400);
  } else {
    updateUI(false);
  }

  // Global API
  window.TitanXAudio = {
    play: startAudio,
    pause: pauseAudio,
    toggle: toggleAudio,
    element: audio
  };

})();
