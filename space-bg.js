/**
 * ============================================================================
 * TITANX ROBOTICS - 3D INTERACTIVE COSMIC SPACE & PLANETARY ENGINE (space-bg.js)
 * High-performance 60FPS 3D Celestial Cosmos with 3D Orbital Planets,
 * Saturn-like 3D Ring Systems, Orbiting Moons, Parallax Nebulae,
 * Starfield, Constellations, Shooting Stars, Depth Warp & Mouse Inertia.
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
  var FOV = 480;
  var BOUNDS = 1100;

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

  // Color Palettes for Stars
  var STAR_COLORS = [
    { r: 255, g: 255, b: 255, name: 'white' },
    { r: 0, g: 240, b: 255, name: 'cyan' },
    { r: 168, g: 85, b: 247, name: 'purple' },
    { r: 56, g: 189, b: 248, name: 'blue' },
    { r: 251, g: 191, b: 36, name: 'gold' },
    { r: 236, g: 72, b: 153, name: 'pink' }
  ];

  // 1. Generate 3D Stars
  var stars = [];
  function createStar() {
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(Math.random() * 2 - 1);
    var radius = Math.cbrt(Math.random()) * BOUNDS;

    var colorObj = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    var isHeroStar = Math.random() < 0.08;

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
      px: 0,
      py: 0,
      scale: 0,
      z2: 0,
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
      { x: -350, y: -200, z: 200, r: 440, color: 'rgba(0, 240, 255, 0.06)' },
      { x: 380, y: 220, z: -100, r: 480, color: 'rgba(168, 85, 247, 0.07)' },
      { x: -200, y: 300, z: 300, r: 380, color: 'rgba(59, 130, 246, 0.05)' },
      { x: 280, y: -260, z: -250, r: 400, color: 'rgba(236, 72, 153, 0.04)' },
      { x: 0, y: 0, z: 450, r: 520, color: 'rgba(14, 165, 233, 0.035)' }
    ];
  }

  // 3. 3D Planets & Moons Model System
  var planets = [
    {
      name: 'Titan-Prime', // Gas Giant with 3D Rings
      orbitRadius: 520,
      orbitSpeed: 0.00035,
      orbitAngle: 0.8,
      orbitTilt: 0.25,
      baseRadius: 46,
      selfRot: 0,
      selfRotSpeed: 0.008,
      type: 'gas-giant',
      colors: {
        base: '#0c2340',
        bright: '#00f0ff',
        mid: '#1d4ed8',
        dark: '#030712',
        atmosphere: 'rgba(0, 240, 255, 0.5)',
        halo: 'rgba(0, 240, 255, 0.18)'
      },
      hasRings: true,
      ringInner: 58,
      ringOuter: 104,
      ringTilt: 0.42, // Angle in radians
      ringColorInner: 'rgba(0, 240, 255, 0.55)',
      ringColorMid: 'rgba(168, 85, 247, 0.4)',
      ringColorOuter: 'rgba(0, 240, 255, 0.05)',
      hasMoon: false
    },
    {
      name: 'Aether-9', // Violet Planet with Moon
      orbitRadius: 380,
      orbitSpeed: -0.0005,
      orbitAngle: 3.2,
      orbitTilt: -0.3,
      baseRadius: 30,
      selfRot: 0,
      selfRotSpeed: 0.006,
      type: 'terrestrial-violet',
      colors: {
        base: '#3b0764',
        bright: '#c084fc',
        mid: '#7c3aed',
        dark: '#030008',
        atmosphere: 'rgba(192, 132, 252, 0.5)',
        halo: 'rgba(168, 85, 247, 0.22)'
      },
      hasRings: false,
      hasMoon: true,
      moonOrbitRadius: 54,
      moonOrbitSpeed: 0.015,
      moonAngle: 0,
      moonRadius: 6.5,
      moonColor: '#cbd5e1'
    },
    {
      name: 'Solaris-Prime', // Fiery Molten Planet
      orbitRadius: 680,
      orbitSpeed: 0.00028,
      orbitAngle: 4.9,
      orbitTilt: 0.15,
      baseRadius: 26,
      selfRot: 0,
      selfRotSpeed: 0.01,
      type: 'molten',
      colors: {
        base: '#7c2d12',
        bright: '#fbbf24',
        mid: '#ea580c',
        dark: '#050201',
        atmosphere: 'rgba(251, 191, 36, 0.45)',
        halo: 'rgba(234, 88, 12, 0.2)'
      },
      hasRings: false,
      hasMoon: false
    },
    {
      name: 'Cryo-Glacis', // Luminous Ice Planet
      orbitRadius: 790,
      orbitSpeed: -0.0002,
      orbitAngle: 1.9,
      orbitTilt: -0.2,
      baseRadius: 21,
      selfRot: 0,
      selfRotSpeed: 0.005,
      type: 'ice',
      colors: {
        base: '#082f49',
        bright: '#38bdf8',
        mid: '#0284c7',
        dark: '#010912',
        atmosphere: 'rgba(56, 189, 248, 0.5)',
        halo: 'rgba(14, 165, 233, 0.25)'
      },
      hasRings: false,
      hasMoon: false
    }
  ];

  // 4. Shooting Stars / Meteors
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

    var normX = (clientX / W - 0.5) * 2;
    var normY = (clientY / H - 0.5) * 2;

    mouse.targetRotY = normX * 0.95;
    mouse.targetRotX = -normY * 0.75;

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

  // Gyroscope for Mobile
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

  // Draw a 3D Planet Sphere with light source and surface details
  function drawPlanetBody(p, px, py, radius, scale, rotX, rotY) {
    if (radius < 2) return;

    ctx.save();

    // 1. Atmosphere / Outer Corona Halo
    var haloRadius = radius * 1.5;
    var haloGrad = ctx.createRadialGradient(px, py, radius * 0.8, px, py, haloRadius);
    haloGrad.addColorStop(0, p.colors.halo);
    haloGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(px, py, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Planet Disc Clip for Internal Atmospheric Shading & Texture Bands
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.clip();

    // Base Planet Color Fill
    ctx.fillStyle = p.colors.base;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);

    // Dynamic 3D Atmospheric Bands / Surface Texture
    var bandOffset = (p.selfRot % 1) * radius * 0.8;
    var bandCount = p.type === 'gas-giant' ? 8 : 4;
    for (var b = -bandCount; b <= bandCount; b++) {
      var by = py + (b * radius * 0.28) + Math.sin(p.selfRot + b) * 3;
      var bh = radius * 0.16;
      ctx.fillStyle = b % 2 === 0 ? p.colors.mid : p.colors.bright;
      ctx.globalAlpha = 0.28 + 0.1 * Math.sin(b + p.selfRot);
      ctx.beginPath();
      ctx.ellipse(px, by, radius * 1.05, bh, p.hasRings ? p.ringTilt * 0.5 : 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 3. Spherical 3D Lighting & Shadow (Day/Night Terminator)
    // Simulated cosmic light from upper-left
    var lightX = px - radius * 0.45;
    var lightY = py - radius * 0.45;
    var sphereGrad = ctx.createRadialGradient(
      lightX, lightY, radius * 0.1,
      px, py, radius * 1.05
    );
    sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    sphereGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
    sphereGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.4)');
    sphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');

    ctx.fillStyle = sphereGrad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);

    // 4. Atmospheric Rim Glow (Fresnel Limb Lighting)
    var rimGrad = ctx.createRadialGradient(px, py, radius * 0.75, px, py, radius);
    rimGrad.addColorStop(0, 'transparent');
    rimGrad.addColorStop(0.85, p.colors.atmosphere);
    rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    ctx.fillStyle = rimGrad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);

    ctx.restore(); // End planet clip

    // Planet Border Crisp Edge
    ctx.strokeStyle = p.colors.atmosphere;
    ctx.lineWidth = Math.max(0.5, 1.2 * scale);
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw 3D Saturn-like Planetary Rings (split into back and front halves for true 3D occlusion)
  function drawPlanetRings(p, px, py, scale, isFrontHalf) {
    if (!p.hasRings) return;

    var innerR = p.ringInner * scale;
    var outerR = p.ringOuter * scale;
    var heightRatio = 0.28; // Tilted perspective flatness
    var angle = p.ringTilt;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);

    // Front half = angles from 0 to PI (bottom/front)
    // Back half = angles from PI to 2*PI (top/back)
    var startAngle = isFrontHalf ? 0 : Math.PI;
    var endAngle = isFrontHalf ? Math.PI : Math.PI * 2;

    ctx.beginPath();
    ctx.ellipse(0, 0, outerR, outerR * heightRatio, 0, startAngle, endAngle);
    ctx.ellipse(0, 0, innerR, innerR * heightRatio, 0, endAngle, startAngle, true);
    ctx.closePath();

    var ringGrad = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR);
    ringGrad.addColorStop(0, p.ringColorInner);
    ringGrad.addColorStop(0.5, p.ringColorMid);
    ringGrad.addColorStop(0.8, p.ringColorInner);
    ringGrad.addColorStop(1, p.ringColorOuter);

    ctx.fillStyle = ringGrad;
    ctx.fill();

    // Subtle luminous ring stripes
    ctx.lineWidth = Math.max(0.5, 0.8 * scale);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 0, (innerR + outerR) * 0.5, (innerR + outerR) * 0.5 * heightRatio, 0, startAngle, endAngle);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Orbiting Moon
  function drawMoon(p, scale) {
    if (!p.hasMoon || !p.moon) return;
    var m = p.moon;
    if (m.px < -20 || m.px > W + 20 || m.py < -20 || m.py > H + 20) return;

    var mRadius = Math.max(0.8, p.moonRadius * m.scale);

    // Moon glow
    ctx.save();
    var mGrad = ctx.createRadialGradient(m.px - mRadius * 0.3, m.py - mRadius * 0.3, mRadius * 0.1, m.px, m.py, mRadius * 1.4);
    mGrad.addColorStop(0, '#ffffff');
    mGrad.addColorStop(0.4, p.moonColor);
    mGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = mGrad;
    ctx.beginPath();
    ctx.arc(m.px, m.py, mRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
  }

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

      var sz = s.z - scrollOffsetZ;
      while (sz < -BOUNDS) sz += BOUNDS * 2;
      while (sz > BOUNDS) sz -= BOUNDS * 2;

      var y1 = s.y * cosX - sz * sinX;
      var z1 = s.y * sinX + sz * cosX;
      var x2 = s.x * cosY + z1 * sinY;
      var z2 = -s.x * sinY + z1 * cosY + 750;

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

    // 3. Draw Constellation Links
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

        if (distSq < 4900) {
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

    // 4. Render Stars
    for (var i = 0; i < visibleStars.length; i++) {
      var s = visibleStars[i];
      s.twinklePhase += s.twinkleSpeed;
      var twinkle = 0.7 + 0.3 * Math.sin(s.twinklePhase);
      var depthAlpha = Math.max(0.12, Math.min(1.0, (1400 - s.z2) / 1000));
      var finalAlpha = depthAlpha * twinkle;
      var radius = Math.max(0.4, s.baseSize * s.scale * 1.4);

      var c = s.color;

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

      ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + finalAlpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(s.px, s.py, radius, 0, Math.PI * 2);
      ctx.fill();

      if (radius > 1.8) {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + finalAlpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(s.px, s.py, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 5. Update & Render 3D Planetary Systems
    // Update planetary orbital positions
    for (var pIdx = 0; pIdx < planets.length; pIdx++) {
      var p = planets[pIdx];
      p.orbitAngle += p.orbitSpeed;
      p.selfRot += p.selfRotSpeed;

      // 3D Orbital Coordinates
      var rawPlanetX = Math.cos(p.orbitAngle) * p.orbitRadius;
      var rawPlanetZ = Math.sin(p.orbitAngle) * p.orbitRadius;
      var rawPlanetY = Math.sin(p.orbitAngle * 1.5) * (p.orbitRadius * p.orbitTilt);

      // Apply 3D Camera / Mouse Rotation Matrix
      var py1 = rawPlanetY * cosX - rawPlanetZ * sinX;
      var pz1 = rawPlanetY * sinX + rawPlanetZ * cosX;
      var px2 = rawPlanetX * cosY + pz1 * sinY;
      var pz2 = -rawPlanetX * sinY + pz1 * cosY + 700; // Camera distance

      p.z2 = pz2;
      if (pz2 > 50) {
        var pScale = FOV / pz2;
        p.px = W / 2 + px2 * pScale;
        p.py = H / 2 + py1 * pScale;
        p.scale = pScale;
        p.renderedRadius = p.baseRadius * pScale;
        p.visible = p.px + p.renderedRadius > -100 && p.px - p.renderedRadius < W + 100 &&
                    p.py + p.renderedRadius > -100 && p.py - p.renderedRadius < H + 100;
      } else {
        p.visible = false;
      }

      // Calculate Orbiting Moon if present
      if (p.hasMoon && p.visible) {
        p.moonAngle += p.moonOrbitSpeed;
        var rawMoonX = rawPlanetX + Math.cos(p.moonAngle) * p.moonOrbitRadius;
        var rawMoonZ = rawPlanetZ + Math.sin(p.moonAngle) * p.moonOrbitRadius;
        var rawMoonY = rawPlanetY + Math.sin(p.moonAngle) * (p.moonOrbitRadius * 0.4);

        var my1 = rawMoonY * cosX - rawMoonZ * sinX;
        var mz1 = rawMoonY * sinX + rawMoonZ * cosX;
        var mx2 = rawMoonX * cosY + mz1 * sinY;
        var mz2 = -rawMoonX * sinY + mz1 * cosY + 700;

        if (mz2 > 50) {
          var mScale = FOV / mz2;
          p.moon = {
            px: W / 2 + mx2 * mScale,
            py: H / 2 + my1 * mScale,
            z2: mz2,
            scale: mScale
          };
        }
      }
    }

    // Sort Planets by Depth (Z-buffer back-to-front rendering)
    var sortedPlanets = planets.slice().sort(function (a, b) {
      return b.z2 - a.z2;
    });

    for (var pIdx = 0; pIdx < sortedPlanets.length; pIdx++) {
      var p = sortedPlanets[pIdx];
      if (!p.visible) continue;

      // 1. Draw Back Half of 3D Rings (behind planet body)
      if (p.hasRings) {
        drawPlanetRings(p, p.px, p.py, p.scale, false);
      }

      // 2. Draw Moon behind planet if moon.z2 > planet.z2
      if (p.hasMoon && p.moon && p.moon.z2 >= p.z2) {
        drawMoon(p, p.scale);
      }

      // 3. Draw Planet Body with 3D Shader
      drawPlanetBody(p, p.px, p.py, p.renderedRadius, p.scale, totalRotX, totalRotY);

      // 4. Draw Front Half of 3D Rings (in front of planet body)
      if (p.hasRings) {
        drawPlanetRings(p, p.px, p.py, p.scale, true);
      }

      // 5. Draw Moon in front of planet if moon.z2 < planet.z2
      if (p.hasMoon && p.moon && p.moon.z2 < p.z2) {
        drawMoon(p, p.scale);
      }
    }

    // 6. Spawn & Draw Meteors / Shooting Stars
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
