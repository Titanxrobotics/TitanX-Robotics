/**
 * ============================================================================
 * TITANX ROBOTICS - CINEMATIC THUNDERSTORM & GOLDEN/AZURE LIGHTNING ENGINE
 * Photorealistic Thunderstorm Atmosphere with Live Golden-Amber & Azure Lightning,
 * Cloud Illumination Strobes, Interactive Tesla Arcs & Rain Streaks.
 * ============================================================================
 */
(function () {
  'use strict';

  if (window.TitanXSpaceEngineLoaded) return;
  window.TitanXSpaceEngineLoaded = true;

  // Create or attach canvas
  var canvas = document.getElementById('titanx-space-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'titanx-space-canvas';
    canvas.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 100vw',
      'height: 100vh',
      'z-index: -2',
      'pointer-events: none',
      'background: #02040a url("thunder-bg.jpg") no-repeat center center / cover',
      'background-attachment: fixed',
      'display: block'
    ].join(';');
    document.body.prepend(canvas);
  }

  var ctx = canvas.getContext('2d');
  var W = (canvas.width = window.innerWidth);
  var H = (canvas.height = window.innerHeight);

  // Mouse & Touch Tracking
  var mouse = {
    x: W / 2,
    y: H / 2,
    lastX: W / 2,
    lastY: H / 2,
    speed: 0
  };

  // Thunder Engine State
  var storm = {
    strikeTimer: 0,
    nextStrikeInterval: 1.8, // Strikes every 1.5 - 3.5 seconds
    ambientFlash: 0,
    flashColor: 'rgba(245, 158, 11, ', // Golden amber storm flash
    activeBolts: [],
    sheetFlashes: [],
    interactiveArcs: []
  };

  // Angled Storm Rain
  var RAIN_COUNT = Math.min(220, Math.floor((W * H) / 4800));
  var raindrops = [];

  function createRaindrop(initY) {
    return {
      x: Math.random() * (W + 300) - 150,
      y: initY ? Math.random() * H : -20,
      length: Math.random() * 24 + 16,
      speed: Math.random() * 18 + 20,
      slant: -0.25,
      alpha: Math.random() * 0.4 + 0.2,
      width: Math.random() * 1.2 + 0.5
    };
  }

  function initRain() {
    raindrops = [];
    for (var i = 0; i < RAIN_COUNT; i++) {
      raindrops.push(createRaindrop(true));
    }
  }

  // ==========================================================================
  // ⚡ PROCEDURAL FRACTAL LIGHTNING GENERATOR (GOLDEN & AZURE)
  // ==========================================================================
  function generateFractalPath(x1, y1, x2, y2, displacement, depth, maxDepth) {
    if (depth >= maxDepth || displacement < 3) {
      return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    }

    var midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displacement;
    var midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displacement;

    var seg1 = generateFractalPath(x1, y1, midX, midY, displacement * 0.56, depth + 1, maxDepth);
    var seg2 = generateFractalPath(midX, midY, x2, y2, displacement * 0.56, depth + 1, maxDepth);

    return seg1.concat(seg2.slice(1));
  }

  function buildLightningBolt(startX, startY, endX, endY, isTargeted) {
    var trunk = generateFractalPath(startX, startY, endX, endY, Math.min(W, H) * (isTargeted ? 0.18 : 0.28), 0, 5);
    var branches = [];

    // Fork 2-4 realistic branches
    var branchCount = Math.floor(Math.random() * 4) + 2;
    for (var b = 0; b < branchCount; b++) {
      var splitIdx = Math.floor(Math.random() * (trunk.length - 4)) + 2;
      var pt = trunk[splitIdx];
      if (!pt) continue;

      var baseAngle = Math.atan2(endY - startY, endX - startX);
      var angle = baseAngle + (Math.random() - 0.5) * 1.5;
      var len = (Math.random() * 0.5 + 0.3) * Math.hypot(endX - startX, endY - startY);
      var bx = pt.x + Math.cos(angle) * len;
      var by = pt.y + Math.sin(angle) * len;

      var bPath = generateFractalPath(pt.x, pt.y, bx, by, Math.min(W, H) * 0.12, 0, 4);
      branches.push(bPath);
    }

    var isGolden = Math.random() > 0.3; // 70% golden amber like screenshot, 30% azure
    return {
      trunk: trunk,
      branches: branches,
      life: 1.0,
      decay: Math.random() * 0.04 + 0.04,
      colorGlow: isGolden ? '#f59e0b' : '#38bdf8',
      colorMid: isGolden ? 'rgba(251, 191, 36, 0.95)' : 'rgba(0, 240, 255, 0.95)',
      isGolden: isGolden,
      strobePhase: 0,
      strobeFlashes: Math.floor(Math.random() * 3) + 2
    };
  }

  // Major Lightning Strike
  function triggerMajorStrike(targetX, targetY) {
    var isTargeted = typeof targetX === 'number' && typeof targetY === 'number';
    var startX = isTargeted ? targetX + (Math.random() - 0.5) * 250 : (W * (Math.random() * 0.6 + 0.2));
    var startY = -15;
    var endX = isTargeted ? targetX : startX + (Math.random() - 0.5) * (W * 0.7);
    var endY = isTargeted ? targetY : H * (Math.random() * 0.35 + 0.55);

    var bolt = buildLightningBolt(startX, startY, endX, endY, isTargeted);
    storm.activeBolts.push(bolt);

    if (Math.random() < 0.5) {
      var bolt2 = buildLightningBolt(startX + (Math.random() - 0.5) * 160, startY, endX + (Math.random() - 0.5) * 220, endY * 0.88, false);
      storm.activeBolts.push(bolt2);
    }

    storm.ambientFlash = 1.0;
    storm.flashColor = bolt.isGolden ? 'rgba(251, 191, 36, ' : 'rgba(0, 240, 255, ';
  }

  // Cloud Sheet Flash
  function triggerSheetLightning() {
    storm.sheetFlashes.push({
      x: W * (Math.random() * 0.7 + 0.15),
      y: H * (Math.random() * 0.45 + 0.05),
      r: Math.random() * 350 + 220,
      life: 1.0,
      decay: Math.random() * 0.06 + 0.05,
      color: Math.random() > 0.4 ? 'rgba(251, 191, 36, ' : 'rgba(56, 189, 248, '
    });
    storm.ambientFlash = Math.max(storm.ambientFlash, 0.55);
  }

  // Interactive Cursor Sparks
  function spawnCursorArc(cx, cy) {
    if (storm.interactiveArcs.length >= 5) return;
    var angle = Math.random() * Math.PI * 2;
    var len = Math.random() * 65 + 35;
    var tx = cx + Math.cos(angle) * len;
    var ty = cy + Math.sin(angle) * len;
    var path = generateFractalPath(cx, cy, tx, ty, 18, 0, 3);

    storm.interactiveArcs.push({
      path: path,
      life: 1.0,
      decay: 0.12,
      color: Math.random() > 0.5 ? '#fbbf24' : '#00f0ff'
    });
  }

  // Resize handler
  function handleResize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    RAIN_COUNT = Math.min(220, Math.floor((W * H) / 4800));
    initRain();
  }
  window.addEventListener('resize', handleResize);

  // Mouse & Touch Tracking
  function onPointerMove(clientX, clientY) {
    var dx = clientX - mouse.lastX;
    var dy = clientY - mouse.lastY;
    mouse.speed = Math.sqrt(dx * dx + dy * dy);
    mouse.lastX = clientX;
    mouse.lastY = clientY;

    if (mouse.speed > 26 && Math.random() < 0.22) {
      spawnCursorArc(clientX, clientY);
    }
  }

  window.addEventListener('mousemove', function (e) {
    onPointerMove(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchstart', function (e) {
    if (e.touches && e.touches[0]) {
      mouse.lastX = e.touches[0].clientX;
      mouse.lastY = e.touches[0].clientY;
      spawnCursorArc(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches[0]) {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Click / Tap directly strikes lightning at target!
  window.addEventListener('click', function (e) {
    if (e.target && (e.target.closest('a') || e.target.closest('button') || e.target.closest('input') || e.target.closest('select'))) {
      return;
    }
    triggerMajorStrike(e.clientX, e.clientY);
  });

  initRain();

  // Helper to draw lightning polyline
  function renderLightningStroke(points, width, color, shadowBlur, shadowColor) {
    if (!points || points.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (shadowBlur > 0) {
      ctx.shadowBlur = shadowBlur;
      ctx.shadowColor = shadowColor;
    }
    ctx.stroke();
    ctx.restore();
  }

  // Animation Loop
  var lastTime = performance.now();

  function animate(now) {
    var dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // ⚡ Storm Timer Cycle
    storm.strikeTimer += dt;
    if (storm.strikeTimer >= storm.nextStrikeInterval) {
      storm.strikeTimer = 0;
      storm.nextStrikeInterval = Math.random() * 2.2 + 1.2;

      if (Math.random() < 0.78) {
        triggerMajorStrike();
      } else {
        triggerSheetLightning();
      }
    }

    storm.ambientFlash *= 0.86;
    if (storm.ambientFlash < 0.01) storm.ambientFlash = 0;

    // Clear canvas to reveal realistic background wallpaper
    ctx.clearRect(0, 0, W, H);

    // ⚡ 1. DRAW AMBIENT THUNDER STROBE FLASH OVER PHOTOGRAPHIC CLOUDS
    if (storm.ambientFlash > 0.02) {
      ctx.save();
      ctx.fillStyle = storm.flashColor + (storm.ambientFlash * 0.38).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);

      var strobeGrad = ctx.createRadialGradient(W / 2, H * 0.28, 40, W / 2, H * 0.28, Math.max(W, H) * 0.8);
      strobeGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (storm.ambientFlash * 0.55).toFixed(3) + ')');
      strobeGrad.addColorStop(0.35, storm.flashColor + (storm.ambientFlash * 0.35).toFixed(3) + ')');
      strobeGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = strobeGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // ⚡ 2. DRAW CLOUD SHEET LIGHTNING
    for (var sIdx = storm.sheetFlashes.length - 1; sIdx >= 0; sIdx--) {
      var sFlash = storm.sheetFlashes[sIdx];
      sFlash.life -= sFlash.decay;
      if (sFlash.life <= 0) {
        storm.sheetFlashes.splice(sIdx, 1);
        continue;
      }

      var sGrad = ctx.createRadialGradient(sFlash.x, sFlash.y, 0, sFlash.x, sFlash.y, sFlash.r);
      sGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (sFlash.life * 0.55).toFixed(3) + ')');
      sGrad.addColorStop(0.4, sFlash.color + (sFlash.life * 0.45).toFixed(3) + ')');
      sGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(sFlash.x, sFlash.y, sFlash.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ⚡ 3. DRAW ELECTRIC RAIN STREAKS
    for (var rIdx = 0; rIdx < raindrops.length; rIdx++) {
      var drop = raindrops[rIdx];
      drop.x += drop.slant * drop.speed;
      drop.y += drop.speed;

      if (drop.y > H + 30 || drop.x < -100 || drop.x > W + 100) {
        drop.x = Math.random() * (W + 200) - 50;
        drop.y = -20;
      }

      var rainAlpha = Math.min(0.9, drop.alpha + storm.ambientFlash * 0.5);
      var rainColor = storm.ambientFlash > 0.1
        ? 'rgba(251, 191, 36, ' + rainAlpha.toFixed(2) + ')'
        : 'rgba(148, 163, 184, ' + (drop.alpha * 0.35).toFixed(2) + ')';

      ctx.strokeStyle = rainColor;
      ctx.lineWidth = drop.width;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - drop.slant * drop.length, drop.y + drop.length);
      ctx.stroke();
    }

    // ⚡ 4. RENDER GOLDEN & AZURE LIGHTNING BOLTS (Triple Pass Bloom)
    for (var bIdx = storm.activeBolts.length - 1; bIdx >= 0; bIdx--) {
      var bolt = storm.activeBolts[bIdx];
      bolt.life -= bolt.decay;

      if (bolt.life <= 0) {
        storm.activeBolts.splice(bIdx, 1);
        continue;
      }

      bolt.strobePhase++;
      var isStrobe = bolt.strobeFlashes <= 0 || (bolt.strobePhase % 2 === 0);
      if (!isStrobe) continue;

      var alpha = bolt.life;

      // Pass 1: Ionization Halo Glow
      renderLightningStroke(bolt.trunk, 20 * alpha, bolt.colorGlow, 34, bolt.colorGlow);
      for (var k = 0; k < bolt.branches.length; k++) {
        renderLightningStroke(bolt.branches[k], 11 * alpha, bolt.colorGlow, 22, bolt.colorGlow);
      }

      // Pass 2: Golden / Azure Mid Core
      renderLightningStroke(bolt.trunk, 6.0 * alpha, bolt.colorMid, 14, bolt.colorGlow);
      for (var k = 0; k < bolt.branches.length; k++) {
        renderLightningStroke(bolt.branches[k], 3.2 * alpha, bolt.colorMid, 8, bolt.colorGlow);
      }

      // Pass 3: Ultra-Bright White Hot Core
      renderLightningStroke(bolt.trunk, 2.2 * alpha, 'rgba(255, 255, 255, ' + alpha.toFixed(2) + ')', 0, '');
      for (var k = 0; k < bolt.branches.length; k++) {
        renderLightningStroke(bolt.branches[k], 1.2 * alpha, 'rgba(255, 255, 255, ' + (alpha * 0.95).toFixed(2) + ')', 0, '');
      }

      // Ground Splash Spark
      if (bolt.trunk.length > 0) {
        var impactPt = bolt.trunk[bolt.trunk.length - 1];
        ctx.save();
        var impactGrad = ctx.createRadialGradient(impactPt.x, impactPt.y, 0, impactPt.x, impactPt.y, 48 * alpha);
        impactGrad.addColorStop(0, 'rgba(255, 255, 255, ' + alpha.toFixed(2) + ')');
        impactGrad.addColorStop(0.4, bolt.colorMid);
        impactGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = impactGrad;
        ctx.beginPath();
        ctx.arc(impactPt.x, impactPt.y, 48 * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // ⚡ 5. RENDER INTERACTIVE CURSOR TESLA ARCS
    for (var aIdx = storm.interactiveArcs.length - 1; aIdx >= 0; aIdx--) {
      var arc = storm.interactiveArcs[aIdx];
      arc.life -= arc.decay;

      if (arc.life <= 0) {
        storm.interactiveArcs.splice(aIdx, 1);
        continue;
      }

      renderLightningStroke(arc.path, 4.0 * arc.life, arc.color, 14, arc.color);
      renderLightningStroke(arc.path, 1.5 * arc.life, '#ffffff', 0, '');
    }

    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      requestAnimationFrame(animate);
    });
  } else {
    requestAnimationFrame(animate);
  }
})();
