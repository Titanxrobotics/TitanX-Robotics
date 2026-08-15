/**
 * ============================================================================
 * TITANX ROBOTICS - DEDICATED EPIC THUNDERSTORM & LIGHTNING ENGINE (space-bg.js)
 * Intense Real-time Thunderstorm, Volumetric Rolling Stormclouds, Multi-branched
 * Lightning Strikes, Sheet Thunder, Interactive Cursor Lightning & Electric Rain.
 * ============================================================================
 */
(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.TitanXSpaceEngineLoaded) return;
  window.TitanXSpaceEngineLoaded = true;

  // Create or attach background canvas
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
      'background: #02040b',
      'display: block'
    ].join(';');
    document.body.prepend(canvas);
  }

  var ctx = canvas.getContext('2d');
  var W = (canvas.width = window.innerWidth);
  var H = (canvas.height = window.innerHeight);

  // Configuration
  var RAIN_COUNT = Math.min(260, Math.floor((W * H) / 4500));
  var CLOUD_COUNT = 14;

  // Mouse & Camera state
  var mouse = {
    x: W / 2,
    y: H / 2,
    targetRotX: 0,
    targetRotY: 0,
    currRotX: 0,
    currRotY: 0,
    lastX: W / 2,
    lastY: H / 2,
    speed: 0,
    isDown: false
  };

  // ⚡ THUNDERSTORM ENGINE STATE
  var storm = {
    strikeTimer: 0,
    nextStrikeInterval: 1.6, // Frequent dramatic strikes
    ambientFlash: 0,
    flashIntensity: 0,
    flashColor: 'rgba(0, 240, 255, ',
    activeBolts: [],
    sheetFlashes: [],
    interactiveArcs: []
  };

  // 1. Volumetric Rolling Thunderstorm Clouds
  var clouds = [];
  function createCloud() {
    return {
      x: (Math.random() - 0.2) * W * 1.4,
      y: Math.random() * H * 0.7 - 50,
      r: Math.random() * 260 + 180,
      vx: (Math.random() * 0.4 + 0.15) * (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() * 0.15 - 0.075),
      colorBase: Math.random() > 0.4 ? 'rgba(6, 14, 32, ' : 'rgba(18, 10, 36, ',
      glowBase: Math.random() > 0.5 ? 'rgba(0, 240, 255, ' : 'rgba(168, 85, 247, ',
      density: Math.random() * 0.35 + 0.45,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01
    };
  }

  function initClouds() {
    clouds = [];
    for (var i = 0; i < CLOUD_COUNT; i++) {
      clouds.push(createCloud());
    }
  }

  // 2. Angled Electric Storm Rain
  var raindrops = [];
  function createRaindrop(initY) {
    return {
      x: Math.random() * (W + 300) - 150,
      y: initY ? Math.random() * H : -20,
      length: Math.random() * 26 + 18,
      speed: Math.random() * 16 + 22,
      slant: -0.22, // Angled rain
      alpha: Math.random() * 0.45 + 0.25,
      width: Math.random() * 1.2 + 0.6
    };
  }

  function initRain() {
    raindrops = [];
    for (var i = 0; i < RAIN_COUNT; i++) {
      raindrops.push(createRaindrop(true));
    }
  }

  // ==========================================================================
  // ⚡ PROCEDURAL FRACTAL LIGHTNING GENERATOR
  // ==========================================================================
  function generateFractalPath(x1, y1, x2, y2, displacement, depth, maxDepth) {
    if (depth >= maxDepth || displacement < 3) {
      return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    }

    var midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displacement;
    var midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displacement;

    var seg1 = generateFractalPath(x1, y1, midX, midY, displacement * 0.55, depth + 1, maxDepth);
    var seg2 = generateFractalPath(midX, midY, x2, y2, displacement * 0.55, depth + 1, maxDepth);

    return seg1.concat(seg2.slice(1));
  }

  function buildLightningBolt(startX, startY, endX, endY, intensity, isTargeted) {
    var trunk = generateFractalPath(startX, startY, endX, endY, Math.min(W, H) * (isTargeted ? 0.15 : 0.25), 0, 5);
    var branches = [];

    // Fork branches
    var branchCount = Math.floor(Math.random() * 4) + 2;
    for (var b = 0; b < branchCount; b++) {
      var splitIdx = Math.floor(Math.random() * (trunk.length - 4)) + 2;
      var pt = trunk[splitIdx];
      if (!pt) continue;

      var baseAngle = Math.atan2(endY - startY, endX - startX);
      var angle = baseAngle + (Math.random() - 0.5) * 1.6;
      var len = (Math.random() * 0.5 + 0.3) * Math.hypot(endX - startX, endY - startY);
      var bx = pt.x + Math.cos(angle) * len;
      var by = pt.y + Math.sin(angle) * len;

      var bPath = generateFractalPath(pt.x, pt.y, bx, by, Math.min(W, H) * 0.12, 0, 4);
      branches.push(bPath);
    }

    return {
      trunk: trunk,
      branches: branches,
      intensity: intensity || 1.0,
      life: 1.0,
      decay: Math.random() * 0.04 + 0.04,
      colorGlow: Math.random() > 0.35 ? '#00f0ff' : '#c084fc',
      colorMid: Math.random() > 0.35 ? 'rgba(0, 240, 255, 0.9)' : 'rgba(192, 132, 252, 0.9)',
      strobePhase: 0,
      strobeFlashes: Math.floor(Math.random() * 3) + 2
    };
  }

  // Trigger Major Lightning Strike
  function triggerMajorStrike(targetX, targetY) {
    var isTargeted = typeof targetX === 'number' && typeof targetY === 'number';
    var startX = isTargeted ? targetX + (Math.random() - 0.5) * 300 : Math.random() * W;
    var startY = -20;
    var endX = isTargeted ? targetX : startX + (Math.random() - 0.5) * (W * 0.8);
    var endY = isTargeted ? targetY : H * (Math.random() * 0.4 + 0.6);

    var bolt = buildLightningBolt(startX, startY, endX, endY, 1.0, isTargeted);
    storm.activeBolts.push(bolt);

    // Simultaneous second fork for extreme thunderstorm realism
    if (Math.random() < 0.45) {
      var s2X = startX + (Math.random() - 0.5) * 180;
      var e2X = endX + (Math.random() - 0.5) * 250;
      var bolt2 = buildLightningBolt(s2X, startY, e2X, endY * 0.9, 0.8, false);
      storm.activeBolts.push(bolt2);
    }

    // Trigger powerful sky illumination flash
    storm.ambientFlash = 1.0;
    storm.flashColor = Math.random() > 0.35 ? 'rgba(0, 240, 255, ' : 'rgba(168, 85, 247, ';
  }

  // Sheet Lightning (Intra-cloud diffuse rumble)
  function triggerSheetLightning() {
    storm.sheetFlashes.push({
      x: Math.random() * W,
      y: Math.random() * (H * 0.6),
      r: Math.random() * 350 + 200,
      life: 1.0,
      decay: Math.random() * 0.06 + 0.05,
      color: Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : 'rgba(168, 85, 247, '
    });
    storm.ambientFlash = Math.max(storm.ambientFlash, 0.55);
  }

  // Interactive Cursor Tesla Arc
  function spawnCursorArc(cx, cy) {
    if (storm.interactiveArcs.length >= 5) return;
    var angle = Math.random() * Math.PI * 2;
    var len = Math.random() * 70 + 40;
    var tx = cx + Math.cos(angle) * len;
    var ty = cy + Math.sin(angle) * len;
    var path = generateFractalPath(cx, cy, tx, ty, 20, 0, 3);

    storm.interactiveArcs.push({
      path: path,
      life: 1.0,
      decay: 0.12,
      color: Math.random() > 0.4 ? '#00f0ff' : '#a855f7'
    });
  }

  // Resize handler
  function handleResize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    RAIN_COUNT = Math.min(260, Math.floor((W * H) / 4500));
    initClouds();
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

    var normX = (clientX / W - 0.5) * 2;
    var normY = (clientY / H - 0.5) * 2;
    mouse.targetRotY = normX * 0.6;
    mouse.targetRotX = -normY * 0.4;

    // Fast movement triggers electric sparks
    if (mouse.speed > 25 && Math.random() < 0.25) {
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

  // Click / Tap directly summons a massive thunderbolt strike!
  window.addEventListener('click', function (e) {
    // Avoid triggering on buttons / links
    if (e.target && (e.target.closest('a') || e.target.closest('button') || e.target.closest('input'))) {
      return;
    }
    triggerMajorStrike(e.clientX, e.clientY);
  });

  initClouds();
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

    // Smooth camera inertia
    mouse.currRotY += (mouse.targetRotY - mouse.currRotY) * 0.05;
    mouse.currRotX += (mouse.targetRotX - mouse.currRotX) * 0.05;

    // ⚡ THUNDERSTORM TIMING CYCLE
    storm.strikeTimer += dt;
    if (storm.strikeTimer >= storm.nextStrikeInterval) {
      storm.strikeTimer = 0;
      storm.nextStrikeInterval = Math.random() * 2.2 + 1.2; // Strikes every 1.2 - 3.4 seconds

      if (Math.random() < 0.75) {
        triggerMajorStrike();
      } else {
        triggerSheetLightning();
      }
    }

    // Flash decay
    storm.ambientFlash *= 0.85;
    if (storm.ambientFlash < 0.01) storm.ambientFlash = 0;

    // Clear with stormy dark gradient
    ctx.clearRect(0, 0, W, H);

    var bgGrad = ctx.createRadialGradient(W / 2 + mouse.currRotY * 100, H * 0.3 + mouse.currRotX * 50, 80, W / 2, H / 2, Math.max(W, H));
    bgGrad.addColorStop(0, '#061026');
    bgGrad.addColorStop(0.5, '#030816');
    bgGrad.addColorStop(1, '#010308');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ⚡ 1. DRAW AMBIENT THUNDER STROBE FLASH
    if (storm.ambientFlash > 0.02) {
      ctx.save();
      // Sky strobe
      ctx.fillStyle = storm.flashColor + (storm.ambientFlash * 0.4).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);

      // Blinding white radial core
      var strobeGrad = ctx.createRadialGradient(W / 2, H * 0.25, 40, W / 2, H * 0.25, Math.max(W, H) * 0.85);
      strobeGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (storm.ambientFlash * 0.55).toFixed(3) + ')');
      strobeGrad.addColorStop(0.4, 'rgba(0, 240, 255, ' + (storm.ambientFlash * 0.35).toFixed(3) + ')');
      strobeGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = strobeGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // ⚡ 2. DRAW SHEET LIGHTNING IN CLOUDS
    for (var sIdx = storm.sheetFlashes.length - 1; sIdx >= 0; sIdx--) {
      var sFlash = storm.sheetFlashes[sIdx];
      sFlash.life -= sFlash.decay;
      if (sFlash.life <= 0) {
        storm.sheetFlashes.splice(sIdx, 1);
        continue;
      }

      var sGrad = ctx.createRadialGradient(sFlash.x, sFlash.y, 0, sFlash.x, sFlash.y, sFlash.r);
      sGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (sFlash.life * 0.6).toFixed(3) + ')');
      sGrad.addColorStop(0.4, sFlash.color + (sFlash.life * 0.45).toFixed(3) + ')');
      sGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(sFlash.x, sFlash.y, sFlash.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ⚡ 3. DRAW VOLUMETRIC STORM CLOUDS
    for (var cIdx = 0; cIdx < clouds.length; cIdx++) {
      var c = clouds[cIdx];
      c.x += c.vx;
      c.y += c.vy;

      // Wrap around screen
      if (c.x - c.r > W + 50) c.x = -c.r - 20;
      if (c.x + c.r < -100) c.x = W + c.r + 20;

      var cpx = c.x + mouse.currRotY * 40;
      var cpy = c.y + mouse.currRotX * 30;

      var cloudGrad = ctx.createRadialGradient(cpx, cpy, 0, cpx, cpy, c.r);
      // Cloud illuminates dynamically on lightning strikes
      if (storm.ambientFlash > 0.05) {
        cloudGrad.addColorStop(0, c.glowBase + (storm.ambientFlash * 0.4).toFixed(3) + ')');
        cloudGrad.addColorStop(0.4, 'rgba(0, 240, 255, ' + (storm.ambientFlash * 0.25).toFixed(3) + ')');
        cloudGrad.addColorStop(1, 'transparent');
      } else {
        cloudGrad.addColorStop(0, c.colorBase + c.density + ')');
        cloudGrad.addColorStop(0.7, c.colorBase + (c.density * 0.4).toFixed(2) + ')');
        cloudGrad.addColorStop(1, 'transparent');
      }

      ctx.fillStyle = cloudGrad;
      ctx.beginPath();
      ctx.arc(cpx, cpy, c.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ⚡ 4. DRAW RAIN STREAKS (ILLUMINATED DURING THUNDER)
    ctx.lineWidth = 1.0;
    for (var rIdx = 0; rIdx < raindrops.length; rIdx++) {
      var drop = raindrops[rIdx];
      drop.x += drop.slant * drop.speed;
      drop.y += drop.speed;

      if (drop.y > H + 30 || drop.x < -100 || drop.x > W + 100) {
        drop.x = Math.random() * (W + 200) - 50;
        drop.y = -20;
      }

      var rainAlpha = Math.min(1.0, drop.alpha + storm.ambientFlash * 0.55);
      var rainColor = storm.ambientFlash > 0.1
        ? 'rgba(0, 240, 255, ' + rainAlpha.toFixed(2) + ')'
        : 'rgba(148, 163, 184, ' + (drop.alpha * 0.4).toFixed(2) + ')';

      ctx.strokeStyle = rainColor;
      ctx.lineWidth = drop.width;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - drop.slant * drop.length, drop.y + drop.length);
      ctx.stroke();
    }

    // ⚡ 5. RENDER ACTIVE MAJOR LIGHTNING BOLTS (Triple Pass Bloom)
    for (var bIdx = storm.activeBolts.length - 1; bIdx >= 0; bIdx--) {
      var bolt = storm.activeBolts[bIdx];
      bolt.life -= bolt.decay;

      if (bolt.life <= 0) {
        storm.activeBolts.splice(bIdx, 1);
        continue;
      }

      // Multi-strobe flicker
      bolt.strobePhase++;
      var isStrobe = bolt.strobeFlashes <= 0 || (bolt.strobePhase % 2 === 0);
      if (!isStrobe) continue;

      var alpha = bolt.life;

      // Pass 1: Massive Ionization Bloom Glow
      renderLightningStroke(bolt.trunk, 18 * alpha, bolt.colorGlow, 32, bolt.colorGlow);
      for (var k = 0; k < bolt.branches.length; k++) {
        renderLightningStroke(bolt.branches[k], 10 * alpha, bolt.colorGlow, 20, bolt.colorGlow);
      }

      // Pass 2: Electric Core Stroke
      renderLightningStroke(bolt.trunk, 5.5 * alpha, bolt.colorMid, 14, '#00f0ff');
      for (var k = 0; k < bolt.branches.length; k++) {
        renderLightningStroke(bolt.branches[k], 3.0 * alpha, bolt.colorMid, 8, '#00f0ff');
      }

      // Pass 3: Blinding White-Hot Energy Filament
      renderLightningStroke(bolt.trunk, 2.2 * alpha, 'rgba(255, 255, 255, ' + alpha.toFixed(2) + ')', 0, '');
      for (var k = 0; k < bolt.branches.length; k++) {
        renderLightningStroke(bolt.branches[k], 1.2 * alpha, 'rgba(255, 255, 255, ' + (alpha * 0.95).toFixed(2) + ')', 0, '');
      }

      // Ground / Space Splash Spark at impact point
      if (bolt.trunk.length > 0) {
        var impactPt = bolt.trunk[bolt.trunk.length - 1];
        ctx.save();
        var impactGrad = ctx.createRadialGradient(impactPt.x, impactPt.y, 0, impactPt.x, impactPt.y, 45 * alpha);
        impactGrad.addColorStop(0, 'rgba(255, 255, 255, ' + alpha.toFixed(2) + ')');
        impactGrad.addColorStop(0.4, 'rgba(0, 240, 255, ' + (alpha * 0.7).toFixed(2) + ')');
        impactGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = impactGrad;
        ctx.beginPath();
        ctx.arc(impactPt.x, impactPt.y, 45 * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // ⚡ 6. RENDER INTERACTIVE CURSOR TESLA ARCS
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

  // Start when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      requestAnimationFrame(animate);
    });
  } else {
    requestAnimationFrame(animate);
  }
})();
