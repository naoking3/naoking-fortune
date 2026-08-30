(() => {
  'use strict';

  const canvas = document.querySelector('#signature-water');
  if (!canvas) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactViewport = window.matchMedia('(max-width: 760px), (pointer: coarse)');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: 'high-performance'
  });

  if (!gl) {
    document.documentElement.classList.add('no-signature-webgl');
    canvas.hidden = true;
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
    uniform float uTime;
    uniform float uDive;
    uniform float uPulse;
    uniform float uHero;
    uniform float uTransition;

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
      vec2 q = p;
      q.x += sin(q.y * 7.0 + time * 0.42) * 0.055;
      q.y += cos(q.x * 8.0 - time * 0.36) * 0.045;
      float a = abs(sin(q.x * 15.0 + sin(q.y * 6.0 + time * 0.3)));
      float b = abs(cos(q.y * 13.0 - cos(q.x * 5.0 - time * 0.25)));
      return pow(max(0.0, 1.0 - abs(a - b) * 2.45), 7.0);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / max(uResolution, vec2(1.0));
      vec2 centered = uv - 0.5;
      centered.x *= uResolution.x / max(uResolution.y, 1.0);

      float time = uTime * (0.72 + uPulse * 1.35);
      float depth = clamp(uDive, 0.0, 1.0);
      float current = noise(vec2(uv.x * 3.2 + time * 0.055, uv.y * 4.5 - time * 0.038));
      float fineCurrent = noise(vec2(uv.x * 8.0 - time * 0.09, uv.y * 7.0 + time * 0.05));

      vec2 pointer = uPointer - 0.5;
      pointer.x *= uResolution.x / max(uResolution.y, 1.0);
      float pointerDist = length(centered - pointer);
      float pointerWake = sin(pointerDist * 34.0 - time * 2.0) * exp(-pointerDist * 5.8);
      pointerWake *= (0.012 + uHero * 0.026);

      vec2 warped = uv;
      warped.x += (current - 0.5) * (0.025 + depth * 0.018) + pointerWake;
      warped.y += (fineCurrent - 0.5) * 0.014;

      float topGlow = pow(max(0.0, 1.0 - warped.y), 3.1);
      float rayMask = smoothstep(0.78, 0.02, warped.y);
      float rays = pow(max(0.0,
        sin((warped.x + (current - 0.5) * 0.13) * 18.0 - time * 0.12) * 0.5 + 0.5),
        9.0) * rayMask;
      rays += pow(max(0.0,
        sin((warped.x * 0.72 + warped.y * 0.18) * 23.0 + time * 0.09) * 0.5 + 0.5),
        13.0) * rayMask * 0.55;

      float surfaceCaustic = caustic(warped * vec2(1.45, 1.0), time);
      surfaceCaustic *= smoothstep(0.94, 0.18, warped.y);

      float pressureRing = abs(length(centered) - mix(0.75, 0.22, uTransition));
      float pressure = smoothstep(0.11, 0.0, pressureRing) * uTransition;
      float aperture = smoothstep(0.72, 0.12, length(centered)) * uTransition;

      vec3 shallow = vec3(0.20, 0.86, 0.94);
      vec3 mid = vec3(0.025, 0.37, 0.52);
      vec3 abyss = vec3(0.006, 0.075, 0.17);
      vec3 water = mix(mid, abyss, smoothstep(0.05, 0.92, warped.y + depth * 0.38));
      water = mix(water, shallow, topGlow * (0.28 + (1.0 - depth) * 0.38));
      water += vec3(0.27, 0.83, 0.92) * rays * (0.08 + uHero * 0.11 + uPulse * 0.09);
      water += vec3(0.42, 0.95, 0.90) * surfaceCaustic * (0.035 + uPulse * 0.075);
      water += vec3(0.22, 0.68, 0.88) * pressure * 0.42;
      water += vec3(0.58, 0.91, 0.96) * aperture * 0.14;

      float vignette = smoothstep(1.02, 0.28, length(centered));
      float alpha = 0.055 + rays * 0.055 + surfaceCaustic * 0.045;
      alpha += depth * 0.055 + uHero * 0.025 + uPulse * 0.035;
      alpha += pressure * 0.16 + aperture * 0.08;
      alpha *= mix(0.72, 1.0, vignette);
      alpha = clamp(alpha, 0.0, 0.36);

      gl_FragColor = vec4(water, alpha);
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

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Unable to link water shader');
    }
  } catch (error) {
    console.warn('[NAOKING WATERFIELD] WebGL fallback enabled.', error);
    document.documentElement.classList.add('no-signature-webgl');
    canvas.hidden = true;
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW);

  gl.useProgram(program);
  const positionLocation = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const uniforms = Object.fromEntries([
    'uResolution', 'uPointer', 'uTime', 'uDive', 'uPulse', 'uHero', 'uTransition'
  ].map(name => [name, gl.getUniformLocation(program, name)]));

  const opening = document.querySelector('#opening');
  const hero = document.querySelector('.hero');
  const state = {
    running: true,
    heroVisible: Boolean(hero),
    pointerX: 0.5,
    pointerY: 0.46,
    targetPointerX: 0.5,
    targetPointerY: 0.46,
    dive: opening ? 0 : 0.72,
    targetDive: opening ? 0 : 0.72,
    pulse: 0,
    targetPulse: 0,
    transition: 0,
    targetTransition: 0,
    lastFrame: 0,
    pulseTimer: 0,
    openingStarted: performance.now(),
    frame: 0
  };

  const resize = () => {
    const mobile = compactViewport.matches;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.65);
    const width = Math.max(1, Math.round(window.innerWidth * dpr));
    const height = Math.max(1, Math.round(window.innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };

  const pulse = (intensity = 0.7, duration = 900) => {
    state.targetPulse = Math.max(state.targetPulse, Math.min(1, Number(intensity) || 0));
    window.clearTimeout(state.pulseTimer);
    state.pulseTimer = window.setTimeout(() => { state.targetPulse = 0; }, Math.max(120, duration));
    start();
  };

  const start = () => {
    if (state.running || document.hidden) return;
    state.running = true;
    state.lastFrame = 0;
    state.frame = window.requestAnimationFrame(render);
  };

  const stop = () => {
    state.running = false;
    window.cancelAnimationFrame(state.frame);
    state.frame = 0;
  };

  const render = timestamp => {
    if (!state.running) return;
    const frameInterval = compactViewport.matches ? 1000 / 30 : 1000 / 60;
    if (state.lastFrame && timestamp - state.lastFrame < frameInterval) {
      state.frame = window.requestAnimationFrame(render);
      return;
    }
    state.lastFrame = timestamp;

    const openingActive = Boolean(opening && !opening.classList.contains('is-finished'));
    if (openingActive) {
      const elapsed = Math.min(1, (timestamp - state.openingStarted) / 3050);
      state.targetDive = elapsed * elapsed * (3 - 2 * elapsed);
    } else {
      state.targetDive = state.heroVisible ? 0.7 : 0.88;
    }

    state.targetTransition = document.body.classList.contains('is-page-transitioning') ? 1 : 0;
    state.pointerX += (state.targetPointerX - state.pointerX) * 0.055;
    state.pointerY += (state.targetPointerY - state.pointerY) * 0.055;
    state.dive += (state.targetDive - state.dive) * 0.045;
    state.pulse += (state.targetPulse - state.pulse) * (state.targetPulse > state.pulse ? 0.11 : 0.045);
    state.transition += (state.targetTransition - state.transition) * 0.12;

    gl.useProgram(program);
    gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.uPointer, state.pointerX, 1 - state.pointerY);
    gl.uniform1f(uniforms.uTime, timestamp * 0.001);
    gl.uniform1f(uniforms.uDive, state.dive);
    gl.uniform1f(uniforms.uPulse, state.pulse);
    gl.uniform1f(uniforms.uHero, state.heroVisible ? 1 : 0);
    gl.uniform1f(uniforms.uTransition, state.transition);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (reducedMotion.matches && !openingActive && state.targetPulse === 0 && state.transition < 0.01) {
      stop();
      return;
    }
    state.frame = window.requestAnimationFrame(render);
  };

  window.addEventListener('pointermove', event => {
    if (reducedMotion.matches) return;
    state.targetPointerX = event.clientX / Math.max(window.innerWidth, 1);
    state.targetPointerY = event.clientY / Math.max(window.innerHeight, 1);
  }, { passive: true });

  window.addEventListener('naoking:waterpulse', event => {
    pulse(event.detail?.intensity, event.detail?.duration);
  });

  window.addEventListener('naoking:pagechange', () => {
    pulse(0.34, 460);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  window.addEventListener('resize', resize, { passive: true });
  compactViewport.addEventListener?.('change', resize);
  reducedMotion.addEventListener?.('change', () => {
    if (!reducedMotion.matches) start();
  });

  if (hero && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      state.heroVisible = entries.some(entry => entry.isIntersecting);
      canvas.classList.toggle('is-hero-visible', state.heroVisible);
      if (state.heroVisible) start();
    }, { rootMargin: '12% 0px', threshold: 0.02 });
    observer.observe(hero);
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    stop();
    document.documentElement.classList.add('no-signature-webgl');
    canvas.hidden = true;
  });

  resize();
  canvas.classList.add('is-ready');
  window.NaokingWaterfield = Object.freeze({ pulse });
  state.frame = window.requestAnimationFrame(render);
})();
