(() => {
  'use strict';

  const canvas = document.querySelector('#royal-abyss-lens');
  const hero = document.querySelector('.hero');
  const heroImage = document.querySelector('.hero-king > img');
  if (!canvas || !hero || !heroImage) return;

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactViewport = window.matchMedia('(max-width: 760px), (pointer: coarse)');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: 'high-performance'
  });

  const fallback = reason => {
    if (reason) console.warn('[ROYAL ABYSS LENS] CSS fallback enabled.', reason);
    root.classList.add('no-royal-lens');
    canvas.hidden = true;
  };

  if (!gl) {
    fallback();
    return;
  }

  const vertexSource = `
    attribute vec2 aPosition;
    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision mediump float;

    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform vec2 uVelocity;
    uniform float uTime;
    uniform float uDive;
    uniform float uImpact;
    uniform float uMobile;
    uniform sampler2D uKingdom;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }

    float caustic(vec2 p, float time) {
      p.x += sin(p.y * 9.0 + time * 0.54) * 0.075;
      p.y += cos(p.x * 8.0 - time * 0.42) * 0.065;
      float a = abs(sin(p.x * 16.0 + sin(p.y * 7.0 + time * 0.3)));
      float b = abs(cos(p.y * 14.0 - cos(p.x * 6.0 - time * 0.24)));
      return pow(max(0.0, 1.0 - abs(a - b) * 2.3), 7.0);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / max(uResolution, vec2(1.0));
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      float time = uTime * mix(1.0, 0.72, uMobile);

      vec2 inertia = (uPointer - 0.5) * vec2(0.024, 0.019);
      vec2 center = vec2(0.515, 0.515 - uDive * 0.038) + inertia;
      vec2 p = uv - center;
      p.x *= aspect;

      float radius = mix(0.38, 0.285, uDive);
      vec2 lensPoint = p / vec2(radius, radius * 0.88);
      float radial = length(lensPoint);
      float lensMask = 1.0 - smoothstep(0.955, 1.015, radial);
      float innerMask = 1.0 - smoothstep(0.76, 0.985, radial);
      float rim = smoothstep(0.78, 0.985, radial) * lensMask;
      float depth = sqrt(max(0.0, 1.0 - min(1.0, radial * radial)));

      float currentA = noise(lensPoint * 2.8 + vec2(time * 0.075, -time * 0.052));
      float currentB = noise(lensPoint * 6.2 + vec2(-time * 0.11, time * 0.068));
      float ambientBreath = 0.5 + 0.5 * sin(time * 0.72 + currentA * 2.6);
      float ambientWake = sin(lensPoint.y * 13.0 + lensPoint.x * 4.0 - time * 1.15);
      ambientWake *= 1.0 - smoothstep(0.18, 1.0, radial);
      vec2 current = vec2(currentA - 0.5, currentB - 0.5);
      current += vec2(ambientWake * 0.12, cos(lensPoint.x * 9.0 + time * 0.68) * 0.045);

      float pointerDistance = length(lensPoint - (uPointer - 0.5) * 1.45);
      float pointerRing = sin(pointerDistance * 31.0 - time * 3.0 - uImpact * 4.5);
      pointerRing *= exp(-pointerDistance * 3.8) * (0.012 + uImpact * 0.024);

      vec2 normal = normalize(lensPoint + vec2(0.0001));
      vec2 refraction = normal * (0.024 + depth * 0.022);
      refraction += current * (0.022 + ambientBreath * 0.007 + uImpact * 0.012);
      refraction += uVelocity * 0.048 * depth;
      refraction += normal * pointerRing;

      vec2 sampleUv = center + (uv - center) * mix(0.79, 0.86, uDive) + refraction;
      sampleUv = clamp(sampleUv, vec2(0.001), vec2(0.999));

      vec2 kingdomUv = sampleUv;
      kingdomUv.x = fract(kingdomUv.x * 0.82 + 0.09 + currentA * 0.012);
      vec3 kingdomColor = texture2D(uKingdom, kingdomUv).rgb;
      vec3 refracted = kingdomColor * vec3(0.34, 0.77, 0.88);
      refracted = mix(refracted, vec3(0.12, 0.57, 0.7), (1.0 - depth) * 0.2);

      float light = pow(max(0.0, dot(normalize(vec3(normal, depth)), normalize(vec3(-0.48, 0.72, 0.75)))), 7.0);
      float crownGold = pow(max(0.0, dot(normal, normalize(vec2(-0.5, 0.86)))), 14.0) * rim;
      float waterLight = caustic(lensPoint * 1.42, time) * innerMask;
      float travellingLight = pow(max(0.0, 1.0 - abs(ambientWake)), 8.0) * innerMask;
      float impactRing = (1.0 - smoothstep(0.0, 0.055, abs(radial - (0.24 + uImpact * 0.58)))) * uImpact;

      refracted += vec3(0.48, 0.95, 0.96) * light * 0.34;
      refracted += vec3(0.32, 0.92, 0.91) * waterLight * (0.08 + uImpact * 0.12);
      refracted += vec3(0.55, 0.96, 0.98) * travellingLight * (0.025 + ambientBreath * 0.045);
      refracted += vec3(0.98, 0.79, 0.31) * crownGold * 0.48;
      refracted += vec3(0.58, 0.95, 1.0) * impactRing * 0.32;

      float rimAlpha = rim * (0.38 + light * 0.42 + crownGold * 0.5);
      float alpha = lensMask * (0.28 + depth * 0.2 + waterLight * 0.08 + travellingLight * 0.05);
      alpha += rimAlpha + impactRing * 0.2;
      alpha *= 1.0 - uDive * 0.14;
      alpha = clamp(alpha, 0.0, 0.82);

      gl_FragColor = vec4(refracted, alpha);
    }
  `;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Unknown shader error';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  };

  let vertexShader;
  let fragmentShader;
  let program;
  try {
    vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
    fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Unable to link royal lens shader');
    }
  } catch (error) {
    fallback(error);
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW);

  gl.useProgram(program);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = Object.fromEntries([
    'uResolution', 'uPointer', 'uVelocity', 'uTime', 'uDive', 'uImpact', 'uMobile', 'uKingdom'
  ].map(name => [name, gl.getUniformLocation(program, name)]));

  const state = {
    running: false,
    visible: true,
    pageActive: document.body?.dataset?.page === 'home',
    destroyed: false,
    disabled: false,
    pointerX: 0.5,
    pointerY: 0.5,
    targetPointerX: 0.5,
    targetPointerY: 0.5,
    velocityX: 0,
    velocityY: 0,
    dive: 0,
    targetDive: 0,
    impact: 0,
    targetImpact: 0,
    impactTimer: 0,
    frame: 0,
    lastFrame: 0
  };

  const createTexture = rgba => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(rgba));
    return texture;
  };

  const kingdomTexture = createTexture([8, 73, 104, 255]);
  let textureToken = 0;
  let kingdomReady = false;

  const uploadTexture = (texture, image) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  };

  const loadTexture = (texture, source, callback) => {
    const token = ++textureToken;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (token !== textureToken) return;
      try {
        uploadTexture(texture, image);
        callback?.();
        start();
      } catch (error) {
        if (!kingdomReady) {
          state.disabled = true;
          stop();
          fallback(error);
        } else {
          console.warn('[ROYAL ABYSS LENS] Texture upload skipped.', error);
        }
      }
    };
    image.onerror = () => {
      if (token !== textureToken) return;
      const reason = `Unable to load ${source}`;
      if (!kingdomReady) {
        state.disabled = true;
        stop();
        fallback(reason);
      }
      else console.warn('[ROYAL ABYSS LENS] Keeping the previous texture.', reason);
    };
    image.src = source;
  };

  const firstKingdom = window.NaokingPhotos?.sources?.[window.NaokingPhotos.current?.() || 0]
    || 'assets/backgrounds/vrchat-01.webp';
  loadTexture(kingdomTexture, firstKingdom, () => {
    kingdomReady = true;
    canvas.classList.add('is-ready');
    start();
  });

  const resize = () => {
    if (state.destroyed) return;
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, compactViewport.matches ? 1 : 1.55);
    const width = Math.max(1, Math.round(bounds.width * dpr));
    const height = Math.max(1, Math.round(bounds.height * dpr));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  };

  const updateDive = () => {
    const bounds = hero.getBoundingClientRect();
    const travel = Math.max(1, bounds.height * 0.72);
    state.targetDive = Math.min(1, Math.max(0, -bounds.top / travel));
    hero.style.setProperty('--lens-scale', (1 - state.targetDive * 0.24).toFixed(3));
    hero.style.setProperty('--lens-y', `${(state.targetDive * 42).toFixed(1)}px`);
    hero.style.setProperty('--lens-opacity', (1 - state.targetDive * 0.34).toFixed(3));
    hero.classList.toggle('is-royal-diving', state.targetDive > 0.045);
    start();
  };

  const impact = (intensity = 0.88, duration = 1050) => {
    state.targetImpact = Math.max(state.targetImpact, Math.min(1, Number(intensity) || 0));
    window.clearTimeout(state.impactTimer);
    state.impactTimer = window.setTimeout(() => { state.targetImpact = 0; }, Math.max(180, duration));
    start();
  };

  const stop = () => {
    state.running = false;
    window.cancelAnimationFrame(state.frame);
    state.frame = 0;
  };

  function start() {
    if (
      state.running
      || state.destroyed
      || state.disabled
      || document.hidden
      || !state.visible
      || !state.pageActive
      || document.body?.dataset?.page !== 'home'
      || !kingdomReady
    ) return;
    state.running = true;
    state.lastFrame = 0;
    state.frame = window.requestAnimationFrame(render);
  }

  function render(timestamp) {
    if (!state.running || state.destroyed) return;
    const frameInterval = compactViewport.matches ? 1000 / 30 : 1000 / 60;
    if (state.lastFrame && timestamp - state.lastFrame < frameInterval) {
      state.frame = window.requestAnimationFrame(render);
      return;
    }
    state.lastFrame = timestamp;
    const previousX = state.pointerX;
    const previousY = state.pointerY;
    state.pointerX += (state.targetPointerX - state.pointerX) * 0.075;
    state.pointerY += (state.targetPointerY - state.pointerY) * 0.075;
    state.velocityX += ((state.pointerX - previousX) - state.velocityX) * 0.16;
    state.velocityY += ((state.pointerY - previousY) - state.velocityY) * 0.16;
    state.dive += (state.targetDive - state.dive) * 0.07;
    state.impact += (state.targetImpact - state.impact) * (state.targetImpact > state.impact ? 0.18 : 0.055);

    gl.useProgram(program);
    gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.uPointer, state.pointerX, 1 - state.pointerY);
    gl.uniform2f(uniforms.uVelocity, state.velocityX, -state.velocityY);
    gl.uniform1f(uniforms.uTime, timestamp * 0.001);
    gl.uniform1f(uniforms.uDive, state.dive);
    gl.uniform1f(uniforms.uImpact, state.impact);
    gl.uniform1f(uniforms.uMobile, compactViewport.matches ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, kingdomTexture);
    gl.uniform1i(uniforms.uKingdom, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (reducedMotion.matches && state.targetImpact === 0 && Math.abs(state.impact) < 0.003 && Math.abs(state.dive - state.targetDive) < 0.003) {
      stop();
      return;
    }
    state.frame = window.requestAnimationFrame(render);
  }

  let pointerFrame = 0;
  let pointerEvent = null;
  const updatePointer = () => {
    pointerFrame = 0;
    if (!pointerEvent) return;
    const bounds = hero.getBoundingClientRect();
    state.targetPointerX = Math.min(1, Math.max(0, (pointerEvent.clientX - bounds.left) / Math.max(1, bounds.width)));
    state.targetPointerY = Math.min(1, Math.max(0, (pointerEvent.clientY - bounds.top) / Math.max(1, bounds.height)));
    start();
  };

  hero.addEventListener('pointermove', event => {
    if (reducedMotion.matches) return;
    pointerEvent = event;
    if (!pointerFrame) pointerFrame = window.requestAnimationFrame(updatePointer);
  }, { passive: true });

  const recenterPointer = () => {
    window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    pointerEvent = null;
    state.targetPointerX = 0.5;
    state.targetPointerY = 0.5;
    start();
  };

  hero.addEventListener('pointerleave', recenterPointer);

  hero.addEventListener('pointerdown', event => {
    if (reducedMotion.matches) return;
    const bounds = hero.getBoundingClientRect();
    state.targetPointerX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / Math.max(1, bounds.width)));
    state.targetPointerY = Math.min(1, Math.max(0, (event.clientY - bounds.top) / Math.max(1, bounds.height)));
    impact(1, 1250);
    window.dispatchEvent(new CustomEvent('naoking:waterpulse', { detail: { intensity: 0.68, duration: 900 } }));
  }, { passive: true });
  hero.addEventListener('pointerup', recenterPointer, { passive: true });
  hero.addEventListener('pointercancel', recenterPointer, { passive: true });

  let scrollFrame = 0;
  const onScroll = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      updateDive();
    });
  };

  const onPhotoChange = event => {
    const source = event.detail?.source;
    if (source) loadTexture(kingdomTexture, source, () => {
      kingdomReady = true;
      canvas.classList.add('is-ready');
      start();
    });
  };

  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };

  const onPageChange = event => {
    const isHome = event.detail?.page === 'home';
    state.pageActive = isHome;
    if (!isHome) {
      stop();
      return;
    }
    resize();
    updateDive();
    start();
  };

  const onReducedMotion = () => {
    if (!reducedMotion.matches) {
      start();
      return;
    }
    window.clearTimeout(state.impactTimer);
    state.targetImpact = 0;
    state.impact = 0;
    recenterPointer();
    start();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('naoking:photochange', onPhotoChange);
  window.addEventListener('naoking:pagechange', onPageChange);
  document.addEventListener('visibilitychange', onVisibility);
  compactViewport.addEventListener?.('change', resize);
  reducedMotion.addEventListener?.('change', onReducedMotion);

  let observer = null;
  let resizeObserver = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      state.visible = entries.some(entry => entry.isIntersecting);
      if (state.visible) start();
      else stop();
    }, { rootMargin: '16% 0px', threshold: 0.01 });
    observer.observe(hero);
  }
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
  }

  const destroy = () => {
    if (state.destroyed) return;
    state.destroyed = true;
    state.disabled = true;
    stop();
    window.clearTimeout(state.impactTimer);
    window.cancelAnimationFrame(pointerFrame);
    window.cancelAnimationFrame(scrollFrame);
    observer?.disconnect();
    resizeObserver?.disconnect();
    gl.deleteTexture(kingdomTexture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  };

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    state.disabled = true;
    kingdomReady = false;
    stop();
    fallback('WebGL context lost');
  });
  window.addEventListener('pagehide', event => {
    if (event.persisted) stop();
    else destroy();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) start();
  });

  updateDive();
  resize();
  window.NaokingRoyalLens = Object.freeze({ impact });
})();
