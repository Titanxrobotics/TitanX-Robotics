/**
 * ============================================================================
 * TITANX ROBOTICS - 3D INTERACTIVE COSMIC SPACE ENGINE (space-bg.js)
 * High-performance 60FPS 3D Celestial Starfield with Mouse Inertia,
 * Parallax Nebulae, Shooting Stars, Constellation Links & Depth Warp.
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
      'background: radial-gradient(ellipse at 50% 50%, #060c1e 0%, #030611 60%, #010206 100%)',
      'display: block'
    ].join(';');
    document.body.prepend(canvas);
  }

  var ctx = canvas.getContext('2d');
  var W = (canvas.width = window.innerWidth);
  var H = (canvas.height = window.innerHeight);

  // Configuration
  var STAR_COUNT = Math.min(650, Math.floor((W * H) / 2200));
  var NEBULA_COUNT = 5;
  var FOV = 480;
  var BOUNDS = 1000;

  // Mouse & Camera state
  var mouse = {
    x: W / 2,
    y: H / 2,
    targetRotX: 0,
    targetRotY: 0,
    currRotX: 0,
    currRotY: 0,
    velRotX: 0,
    velRotY: 0,
    lastX: W / 2,
    lastY: H / 2,
    speed: 0
  };

  var autoSpinX = 0;
  var autoSpinY = 0;
  var scrollOffsetZ = 0;
  var targetScrollOffsetZ = 0;

  // Color Palettes
  var STAR_COLORS = [
    { r: 255, g: 255, b: 255, name: 'white' },
    { r: 0, g: 240, b: 255, name: 'cyan' },
    { r: 168, g: 85, b: 247, name: 'purple' },
    { r: 56, g: 189, b: 248, name: 'blue' },
    { r: 251, g: 191, b: 36, name: 'gold' },
    { r: 236, g: 72, b: 153, name: 'pink' }
  ];

  // 1. Generate 3D Stars in spherical cloud
  var stars = [];
  function createStar() {
    // Generate inside a spherical shell for natural celestial look
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(Math.random() * 2 - 1);
    var radius = Math.cbrt(Math.random()) * BOUNDS;

    var colorObj = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    var isHeroStar = Math.random() < 0.08; // 8% large bright pulsing stars

    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi),
      baseSize: isHeroStar ? Math.random() * 2.2 + 1.8 : Math.random() * 1.4 + 0.6,
      color: colorObj,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
      isHero: isHeroStar,
      halo: isHeroStar || Math.random() < 0.15,
      // Projected 2D coordinates
      px: 0,
      py: 0,
      scale: 0,
      visible: false
    };
  }

  function initStars() {
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push(createStar());
    }
  }

  // 2. Volumetric 3D Nebulae Clouds
  var nebulae = [];
  function initNebulae() {
    nebulae = [
      { x: -350, y: -200, z: 200, r: 420, color: 'rgba(0, 240, 255, 0.07)' },
      { x: 380, y: 220, z: -100, r: 480, color: 'rgba(168, 85, 247, 0.08)' },
      { x: -200, y: 300, z: 300, r: 380, color: 'rgba(59, 130, 246, 0.06)' },
      { x: 280, y: -260, z: -250, r: 400, color: 'rgba(236, 72, 153, 0.05)' },
      { x: 0, y: 0, z: 400, r: 500, color: 'rgba(14, 165, 233, 0.04)' }
    ];
  }

  // 3. Shooting Stars / Meteors
  var meteors = [];
  function spawnMeteor() {
    if (meteors.length >= 3) return;
    var startAngle = Math.random() * Math.PI * 2;
    var speed = Math.random() * 14 + 16;
    var dirAngle = startAngle + Math.PI + (Math.random() - 0.5) * 0.5;

    meteors.push({
      x: (Math.random() - 0.5) * W * 1.5,
      y: (Math.random() - 0.5) * H * 1.5,
      z: (Math.random() - 0.5) * 400,
      vx: Math.cos(dirAngle) * speed,
      vy: Math.sin(dirAngle) * speed,
      vz: (Math.random() - 0.5) * 4,
      length: Math.random() * 90 + 70,
      life: 1.0,
      decay: Math.random() * 0.018 + 0.012,
      color: Math.random() > 0.4 ? '#00f0ff' : '#fbcfe8'
    });
  }

  // Resize handler
  function handleResize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    STAR_COUNT = Math.min(650, Math.floor((W * H) / 2200));
    initStars();
    initNebulae();
  }
  window.addEventListener('resize', handleResize);

  // Mouse & Touch Tracking
  function onPointerMove(clientX, clientY) {
    var dx = clientX - mouse.lastX;
    var dy = clientY - mouse.lastY;
    mouse.speed = Math.sqrt(dx * dx + dy * dy);
    mouse.lastX = clientX;
    mouse.lastY = clientY;

    // Convert mouse to 3D rotation angles (-1 to +1 range mapped to radians)
    var normX = (clientX / W - 0.5) * 2; // -1 to 1
    var normY = (clientY / H - 0.5) * 2; // -1 to 1

    // Rotation range: +/- ~45 degrees with mouse, smooth wrap
    mouse.targetRotY = normX * 0.9;
    mouse.targetRotX = -normY * 0.7;

    // Add gentle impulse velocity
    mouse.velRotY += dx * 0.00012;
    mouse.velRotX -= dy * 0.00012;
  }

  window.addEventListener('mousemove', function (e) {
    onPointerMove(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches[0]) {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Scroll reactivity
  window.addEventListener('scroll', function () {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    targetScrollOffsetZ = (scrollY % 1600) * 0.5;
  }, { passive: true });

  // Gyroscope / DeviceOrientation for Mobile Space Gyro Rotation
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma !== null && e.beta !== null) {
        mouse.targetRotY = (e.gamma / 45) * 0.8;
        mouse.targetRotX = ((e.beta - 45) / 45) * 0.6;
      }
    }, { passive: true });
  }

  initStars();
  initNebulae();

  // Animation Loop
  var lastTime = performance.now();
  var meteorTimer = 0;

  function animate(now) {
    var dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Idle Cosmic Drift
    autoSpinY += 0.0006;
    autoSpinX += 0.0003;

    // Smooth Damped Rotation Lerping
    mouse.currRotY += (mouse.targetRotY + mouse.velRotY - mouse.currRotY) * 0.06;
    mouse.currRotX += (mouse.targetRotX + mouse.velRotX - mouse.currRotX) * 0.06;

    // Dampen impulse velocity
    mouse.velRotY *= 0.92;
    mouse.velRotX *= 0.92;

    // Smooth scroll depth
    scrollOffsetZ += (targetScrollOffsetZ - scrollOffsetZ) * 0.08;

    var totalRotY = mouse.currRotY + autoSpinY;
    var totalRotX = mouse.currRotX + Math.sin(autoSpinX) * 0.15;

    // Precalculate Trig
    var cosY = Math.cos(totalRotY);
    var sinY = Math.sin(totalRotY);
    var cosX = Math.cos(totalRotX);
    var sinX = Math.sin(totalRotX);

    // Clear Canvas
    ctx.clearRect(0, 0, W, H);

    // 1. Draw 3D Parallax Nebulae
    for (var n = 0; n < nebulae.length; n++) {
      var neb = nebulae[n];
      // 3D Rotate
      var ny1 = neb.y * cosX - neb.z * sinX;
      var nz1 = neb.y * sinX + neb.z * cosX;
      var nx2 = neb.x * cosY + nz1 * sinY;
      var nz2 = -neb.x * sinY + nz1 * cosY + 600;

      if (nz2 > 50) {
        var nScale = FOV / nz2;
        var npx = W / 2 + nx2 * nScale;
        var npy = H / 2 + ny1 * nScale;
        var nRadius = neb.r * nScale;

        if (npx + nRadius > 0 && npx - nRadius < W && npy + nRadius > 0 && npy - nRadius < H) {
          var grad = ctx.createRadialGradient(npx, npy, 0, npx, npy, Math.max(10, nRadius));
          grad.addColorStop(0, neb.color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(npx, npy, Math.max(10, nRadius), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Project and Sort Stars
    var visibleStars = [];
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];

      // Z-depth warp with scroll
      var sz = s.z - scrollOffsetZ;
      // Wrap coordinates inside cosmic bounding sphere
      while (sz < -BOUNDS) sz += BOUNDS * 2;
      while (sz > BOUNDS) sz -= BOUNDS * 2;

      // 3D Rotation Matrix (X then Y axis)
      var y1 = s.y * cosX - sz * sinX;
      var z1 = s.y * sinX + sz * cosX;
      var x2 = s.x * cosY + z1 * sinY;
      var z2 = -s.x * sinY + z1 * cosY + 750; // Camera distance offset

      if (z2 > 40) {
        var scale = FOV / z2;
        s.px = W / 2 + x2 * scale;
        s.py = H / 2 + y1 * scale;
        s.scale = scale;
        s.z2 = z2;
        s.visible = s.px >= -20 && s.px <= W + 20 && s.py >= -20 && s.py <= H + 20;

        if (s.visible) {
          visibleStars.push(s);
        }
      } else {
        s.visible = false;
      }
    }

    // 3. Draw Constellation Links (Near Cursor & Nearby Stars)
    ctx.lineWidth = 0.6;
    var maxLinks = 40;
    var linkCount = 0;
    for (var i = 0; i < visibleStars.length && linkCount < maxLinks; i++) {
      var s1 = visibleStars[i];
      if (!s1.isHero && Math.random() > 0.4) continue;

      for (var j = i + 1; j < visibleStars.length && linkCount < maxLinks; j++) {
        var s2 = visibleStars[j];
        var ddx = s1.px - s2.px;
        var ddy = s1.py - s2.py;
        var distSq = ddx * ddx + ddy * ddy;

        // Link close stars
        if (distSq < 4900) { // < 70px
          var dist = Math.sqrt(distSq);
          var alpha = (1 - dist / 70) * 0.22 * Math.min(s1.scale, s2.scale) * 1.5;
          ctx.strokeStyle = 'rgba(0, 240, 255, ' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(s1.px, s1.py);
          ctx.lineTo(s2.px, s2.py);
          ctx.stroke();
          linkCount++;
        }
      }
    }

    // 4. Render Stars with Twinkle and Glow Halos
    for (var i = 0; i < visibleStars.length; i++) {
      var s = visibleStars[i];
      s.twinklePhase += s.twinkleSpeed;
      var twinkle = 0.7 + 0.3 * Math.sin(s.twinklePhase);

      // Distance fog / depth alpha
      var depthAlpha = Math.max(0.12, Math.min(1.0, (1400 - s.z2) / 1000));
      var finalAlpha = depthAlpha * twinkle;
      var radius = Math.max(0.4, s.baseSize * s.scale * 1.4);

      var c = s.color;

      // Draw Hero Star Glow Halo
      if (s.halo && radius > 1.2) {
        var haloRadius = radius * 3.8;
        var haloGrad = ctx.createRadialGradient(s.px, s.py, 0, s.px, s.py, haloRadius);
        haloGrad.addColorStop(0, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (finalAlpha * 0.45).toFixed(3) + ')');
        haloGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(s.px, s.py, haloRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Star Core
      ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + finalAlpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(s.px, s.py, radius, 0, Math.PI * 2);
      ctx.fill();

      // Bright white pinpoint center for close stars
      if (radius > 1.8) {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + finalAlpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(s.px, s.py, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 5. Spawn & Draw Meteors / Shooting Stars
    meteorTimer += dt;
    if (meteorTimer > 2.5 + Math.random() * 2) {
      meteorTimer = 0;
      spawnMeteor();
    }

    for (var m = meteors.length - 1; m >= 0; m--) {
      var met = meteors[m];
      met.x += met.vx;
      met.y += met.vy;
      met.z += met.vz;
      met.life -= met.decay;

      if (met.life <= 0) {
        meteors.splice(m, 1);
        continue;
      }

      // Convert meteor to screen coords relative to 3D center
      var headX = W / 2 + met.x;
      var headY = H / 2 + met.y;
      var tailX = headX - met.vx * (met.length / 15);
      var tailY = headY - met.vy * (met.length / 15);

      var mGrad = ctx.createLinearGradient(headX, headY, tailX, tailY);
      mGrad.addColorStop(0, met.color);
      mGrad.addColorStop(0.3, 'rgba(0, 240, 255, ' + (met.life * 0.7).toFixed(2) + ')');
      mGrad.addColorStop(1, 'transparent');

      ctx.strokeStyle = mGrad;
      ctx.lineWidth = Math.max(1, 2.5 * met.life);
      ctx.beginPath();
      ctx.moveTo(headX, headY);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Meteor head spark
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX, headY, 1.8 * met.life, 0, Math.PI * 2);
      ctx.fill();
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
