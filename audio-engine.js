// ==========================================================================
// TITANX ROBOTICS - ROBUST UNIVERSAL AUDIO ENGINE v4.0
// Fully Reliable Play/Pause, Race-Condition Protection & State Persistence
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

  // Saved Volume (default 0.5)
  var savedVol = parseFloat(localStorage.getItem('titanx_vol') || '0.5');
  audio.volume = Math.max(0, Math.min(1, savedVol));

  // User Pause State persistence (check both localStorage and sessionStorage)
  var isUserPaused = (localStorage.getItem('titanx_audio_paused') === 'true') ||
                     (sessionStorage.getItem('titanx_audio_paused') === 'true');

  var widget    = document.getElementById('audioWidget');
  var toggleBtn = document.getElementById('audioToggleBtn');
  var icon      = document.getElementById('audioIcon');
  var statusTxt = document.getElementById('audioStatusText');
  var volSlider = document.getElementById('volumeSlider');

  if (volSlider) {
    volSlider.value = audio.volume;
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

  // Promise tracking to prevent browser async race conditions
  var currentPlayPromise = null;
  var isStarting = false;

  function startAudio(force) {
    // If not forced and user chose to pause, do nothing
    if (!force && isUserPaused) {
      updateUI(false);
      return;
    }

    isUserPaused = false;
    localStorage.setItem('titanx_audio_paused', 'false');
    sessionStorage.setItem('titanx_audio_paused', 'false');

    if (audio.volume === 0) {
      audio.volume = 0.5;
      if (volSlider) volSlider.value = 0.5;
      localStorage.setItem('titanx_vol', '0.5');
    }

    isStarting = true;
    try {
      currentPlayPromise = audio.play();
      if (currentPlayPromise !== undefined) {
        currentPlayPromise.then(function () {
          isStarting = false;
          // If user clicked pause while play() was pending in background, pause immediately!
          if (isUserPaused) {
            audio.pause();
            updateUI(false);
          } else {
            updateUI(true);
          }
        }).catch(function (err) {
          isStarting = false;
          console.log('Audio autoplay blocked / waiting for interaction:', err);
          updateUI(false);
        });
      } else {
        isStarting = false;
        updateUI(!audio.paused);
      }
    } catch (e) {
      isStarting = false;
      console.warn('Audio play exception:', e);
      updateUI(false);
    }
  }

  function pauseAudio() {
    isUserPaused = true;
    localStorage.setItem('titanx_audio_paused', 'true');
    sessionStorage.setItem('titanx_audio_paused', 'true');

    try {
      audio.pause();
    } catch (e) {
      console.warn('Audio pause error:', e);
    }

    // Also handle if a play promise was in-flight
    if (currentPlayPromise && currentPlayPromise.then) {
      currentPlayPromise.then(function () {
        audio.pause();
        updateUI(false);
      }).catch(function () {
        updateUI(false);
      });
    }

    updateUI(false);
  }

  function toggleAudio() {
    if (audio.paused || isUserPaused) {
      startAudio(true);
    } else {
      pauseAudio();
    }
  }

  // Bind widget click (safeguarded against duplicate triggers)
  if (widget) {
    widget.addEventListener('click', function (e) {
      // Ignore if user is dragging volume slider
      if (volSlider && (e.target === volSlider || volSlider.contains(e.target))) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      toggleAudio();
    });
  }

  if (toggleBtn && toggleBtn !== widget) {
    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleAudio();
    });
  }

  // Volume slider
  if (volSlider) {
    volSlider.addEventListener('input', function (e) {
      e.stopPropagation();
      var val = parseFloat(e.target.value);
      audio.volume = val;
      localStorage.setItem('titanx_vol', val.toString());
      if (val === 0) {
        pauseAudio();
      } else if (audio.paused && !isUserPaused) {
        startAudio();
      }
    });
    volSlider.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  // Audio element native event listeners
  audio.addEventListener('play', function () {
    if (isUserPaused) {
      audio.pause();
      updateUI(false);
    } else {
      updateUI(true);
    }
  });

  audio.addEventListener('pause', function () {
    updateUI(false);
  });

  audio.addEventListener('ended', function () {
    updateUI(false);
  });

  // User gesture unlock for initial autoplay
  var hasUnlocked = false;
  function handleInitialGesture(e) {
    if (hasUnlocked) return;

    // Do not auto-play if clicked specifically on the widget
    var isWidgetClick = e && e.target && (
      (widget && (e.target === widget || widget.contains(e.target))) ||
      (toggleBtn && (e.target === toggleBtn || toggleBtn.contains(e.target)))
    );

    hasUnlocked = true;

    // Remove listener after first interaction
    ['click', 'touchstart', 'keydown'].forEach(function (evt) {
      document.removeEventListener(evt, handleInitialGesture, false);
    });

    if (!isWidgetClick && !isUserPaused) {
      startAudio();
    }
  }

  ['click', 'touchstart', 'keydown'].forEach(function (evt) {
    document.addEventListener(evt, handleInitialGesture, false);
  });

  // Initial startup check
  if (!isUserPaused) {
    setTimeout(function () {
      if (!isUserPaused) {
        startAudio();
      }
    }, 400);
  } else {
    updateUI(false);
  }

  // Global API
  window.TitanXAudio = {
    play: function (force) { startAudio(force); },
    pause: pauseAudio,
    toggle: toggleAudio,
    element: audio,
    isPaused: function () { return isUserPaused || audio.paused; }
  };

})();
