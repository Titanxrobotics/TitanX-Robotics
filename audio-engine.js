// ==========================================================================
// TITANX ROBOTICS - ALWAYS-ON AUDIO ENGINE v2.0
// ==========================================================================
(function () {
  var AUDIO_FILE = 'WhatsApp Audio 2026-08-13 at 2.30.31 AM.mpeg';

  var audio = document.getElementById('bgmusic');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'bgmusic';
    audio.loop = true;
    audio.preload = 'auto';
    var src = document.createElement('source');
    src.src = AUDIO_FILE;
    src.type = 'audio/mpeg';
    audio.appendChild(src);
    document.body.appendChild(audio);
  } else {
    var existingSrc = audio.querySelector('source');
    if (!existingSrc || existingSrc.src.indexOf('WhatsApp') === -1) {
      audio.innerHTML = '';
      var src2 = document.createElement('source');
      src2.src = AUDIO_FILE;
      src2.type = 'audio/mpeg';
      audio.appendChild(src2);
      audio.load();
    }
  }

  var savedVol = parseFloat(localStorage.getItem('titanx_vol') || '0.6');
  audio.volume = savedVol;
  var userPaused = sessionStorage.getItem('titanx_paused') === 'true';

  var widget    = document.getElementById('audioWidget');
  var toggleBtn = document.getElementById('audioToggleBtn');
  var icon      = document.getElementById('audioIcon');
  var statusTxt = document.getElementById('audioStatusText');
  var volSlider = document.getElementById('volumeSlider');

  if (volSlider) volSlider.value = savedVol;

  function updateUI(playing) {
    if (icon)      icon.textContent = playing ? '\u23f8' : '\u25b6';
    if (statusTxt) statusTxt.textContent = playing ? 'AUDIO // LIVE' : 'AUDIO // PAUSED';
    if (toggleBtn) toggleBtn.classList.toggle('paused', !playing);
    if (widget)    widget.classList.toggle('playing', playing);
  }

  function tryPlay() {
    var p = audio.play();
    if (p !== undefined) {
      p.then(function() {
        sessionStorage.setItem('titanx_paused', 'false');
        updateUI(true);
        removeOverlay();
      }).catch(function() {
        updateUI(false);
        showOverlay();
      });
    }
  }

  function pauseAudio() {
    audio.pause();
    sessionStorage.setItem('titanx_paused', 'true');
    updateUI(false);
  }

  function resumeAudio() {
    sessionStorage.setItem('titanx_paused', 'false');
    tryPlay();
  }

  if (widget) {
    ['mousedown','touchstart','pointerdown'].forEach(function(evt) {
      widget.addEventListener(evt, function(e){ e.stopPropagation(); }, {passive:true});
    });
    widget.addEventListener('click', function(e) {
      e.stopPropagation();
      if (e.target === volSlider) return;
      audio.paused ? resumeAudio() : pauseAudio();
    });
  }

  if (volSlider) {
    volSlider.addEventListener('input', function(e) {
      e.stopPropagation();
      audio.volume = parseFloat(e.target.value);
      localStorage.setItem('titanx_vol', e.target.value);
      if (audio.paused && parseFloat(e.target.value) > 0 && sessionStorage.getItem('titanx_paused') !== 'true') {
        resumeAudio();
      }
    });
  }

  var overlayEl = null;

  function showOverlay() {
    if (overlayEl || document.getElementById('_txOverlay')) return;

    var css = '<style>' +
      '@keyframes _txFI{from{opacity:0}to{opacity:1}}' +
      '@keyframes _txFO{from{opacity:1}to{opacity:0}}' +
      '@keyframes _txPulse{0%,100%{box-shadow:0 0 30px rgba(0,240,255,0.4)}50%{box-shadow:0 0 70px rgba(0,240,255,0.9),0 0 100px rgba(168,85,247,0.5)}}' +
      '@keyframes _txFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}' +
      '@keyframes _txRing{to{transform:rotate(360deg)}}' +
      '@keyframes _txW{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.25)}}' +
      '._txW{display:flex;gap:5px;align-items:flex-end;height:36px;margin:0 auto 14px;justify-content:center}' +
      '._txB{width:5px;border-radius:3px;background:linear-gradient(to top,#00f0ff,#a855f7)}' +
      '._txB:nth-child(1){height:14px;animation:_txW 1.2s ease-in-out infinite 0s}' +
      '._txB:nth-child(2){height:22px;animation:_txW 1.2s ease-in-out infinite 0.2s}' +
      '._txB:nth-child(3){height:30px;animation:_txW 1.2s ease-in-out infinite 0.1s}' +
      '._txB:nth-child(4){height:22px;animation:_txW 1.2s ease-in-out infinite 0.3s}' +
      '._txB:nth-child(5){height:14px;animation:_txW 1.2s ease-in-out infinite 0.15s}' +
      '._txBtn{font-family:Rajdhani,sans-serif;font-size:1.2rem;font-weight:700;letter-spacing:2px;padding:16px 44px;background:linear-gradient(135deg,rgba(0,240,255,0.15),rgba(168,85,247,0.15));border:1px solid rgba(0,240,255,0.55);border-radius:14px;color:#00f0ff;cursor:pointer;animation:_txPulse 2.5s ease-in-out infinite;transition:all 0.2s}' +
      '._txBtn:hover{background:linear-gradient(135deg,rgba(0,240,255,0.3),rgba(168,85,247,0.3));transform:scale(1.04)}' +
      '._txRw{position:relative;width:130px;height:130px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}' +
      '._txRing{position:absolute;inset:0;border:2px dashed rgba(0,240,255,0.35);border-radius:50%;animation:_txRing 8s linear infinite}' +
      '._txRing2{position:absolute;inset:10px;border:2px solid transparent;border-top-color:#a855f7;border-bottom-color:#00f0ff;border-radius:50%;animation:_txRing 3s linear infinite reverse}' +
      '._txIco{font-size:48px;animation:_txFloat 3s ease-in-out infinite}' +
      '</style>';

    overlayEl = document.createElement('div');
    overlayEl.id = '_txOverlay';
    overlayEl.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(2,4,10,0.93);backdrop-filter:blur(14px);cursor:pointer;animation:_txFI 0.5s ease;text-align:center;padding:32px 20px';

    overlayEl.innerHTML = css +
      '<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(0,240,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,0.04) 1px,transparent 1px);background-size:50px 50px;pointer-events:none"></div>' +
      '<div style="position:absolute;width:400px;height:400px;top:-100px;right:-100px;background:radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 70%);pointer-events:none"></div>' +
      '<div style="position:absolute;width:350px;height:350px;bottom:-80px;left:-80px;background:radial-gradient(circle,rgba(0,240,255,0.12) 0%,transparent 70%);pointer-events:none"></div>' +
      '<div style="position:relative;z-index:2">' +
        '<div class="_txRw"><div class="_txRing"></div><div class="_txRing2"></div><div class="_txIco">&#127925;</div></div>' +
        '<div class="_txW"><div class="_txB"></div><div class="_txB"></div><div class="_txB"></div><div class="_txB"></div><div class="_txB"></div></div>' +
        '<div style="font-family:Orbitron,Rajdhani,sans-serif;font-size:clamp(1.4rem,4vw,2rem);font-weight:900;background:linear-gradient(135deg,#00f0ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px;letter-spacing:3px">TITANX CYBER AUDIO</div>' +
        '<div style="font-family:Rajdhani,sans-serif;font-size:1.1rem;color:#94a3b8;font-weight:600;margin-bottom:28px;letter-spacing:1px">Click anywhere to unlock the soundtrack</div>' +
        '<button class="_txBtn" id="_txBtn">&#9889; ENTER WITH SOUND</button>' +
        '<div style="margin-top:18px;font-family:Rajdhani,sans-serif;font-size:0.85rem;color:#475569;letter-spacing:1px">or press any key</div>' +
      '</div>';

    document.body.appendChild(overlayEl);

    function unlock() {
      removeOverlay();
      tryPlay();
      document.removeEventListener('keydown', unlock);
    }

    overlayEl.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock, {once: true});
  }

  function removeOverlay() {
    var el = document.getElementById('_txOverlay');
    if (el) {
      el.style.animation = '_txFO 0.5s ease forwards';
      setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 500);
      overlayEl = null;
    }
  }

  ['click','keydown','touchstart','pointerdown'].forEach(function(evt) {
    document.addEventListener(evt, function() {
      if (document.getElementById('_txOverlay')) return;
      if (audio.paused && sessionStorage.getItem('titanx_paused') !== 'true') {
        tryPlay();
      }
    }, {passive: true});
  });

  if (!userPaused) {
    setTimeout(tryPlay, 300);
  } else {
    updateUI(false);
  }

  window.TitanXAudio = {
    play:    function(){ sessionStorage.setItem('titanx_paused','false'); tryPlay(); },
    pause:   pauseAudio,
    toggle:  function(){ audio.paused ? resumeAudio() : pauseAudio(); },
    element: audio
  };

})();
