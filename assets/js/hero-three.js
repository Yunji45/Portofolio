(function () {
  const canvas = document.getElementById("hero-three");

  if (!canvas || typeof THREE === "undefined") {
    if (canvas && canvas.parentElement) {
      canvas.parentElement.classList.add("three-fallback");
    }
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let animationFrame = null;
  let isVisible = true;
  let renderer = null;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
  } catch (error) {
    canvas.parentElement.classList.add("three-fallback");
    return;
  }

  const pointer = new THREE.Vector2(0, 0);
  const maxParticleCount = window.innerWidth < 768 ? 60 : 120;
  const particleCount = maxParticleCount;
  const r = 10;
  const rHalf = r / 2;

  const particlesData = [];
  const particlePositions = new Float32Array(maxParticleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < maxParticleCount; i++) {
    const x = Math.random() * r - r / 2;
    const y = Math.random() * r - r / 2;
    const z = Math.random() * r - r / 2;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02
    });

    particlesData.push({
      numConnections: 0
    });
  }

  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  particlesGeometry.setDrawRange(0, particleCount);

  const particlesMaterial = new THREE.PointsMaterial({
    color: 0x18d26e,
    size: 0.08,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);

  // Pre-allocate segments
  const maxConnections = (maxParticleCount * (maxParticleCount - 1)) / 2;
  const segmentsPositions = new Float32Array(maxConnections * 3 * 2);
  const segmentsColors = new Float32Array(maxConnections * 3 * 2);

  const linesGeometry = new THREE.BufferGeometry();
  linesGeometry.setAttribute("position", new THREE.BufferAttribute(segmentsPositions, 3));
  linesGeometry.setAttribute("color", new THREE.BufferAttribute(segmentsColors, 3));

  const linesMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.4
  });

  const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
  scene.add(linesMesh);

  // A subtle central core
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.2, 1),
    new THREE.MeshBasicMaterial({
      color: 0x18d26e,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    })
  );
  scene.add(core);

  // Group to rotate everything based on mouse
  const group = new THREE.Group();
  group.add(particleSystem);
  group.add(linesMesh);
  group.add(core);
  group.position.set(2, 0, -2);
  scene.add(group);

  camera.position.z = 8;

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); // Reduce pixel ratio for performance
    renderer.setSize(width, height, false);
  }

  function movePointer(event) {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  const effectController = {
    showDots: true,
    showLines: true,
    minDistance: 2.2,
    limitConnections: false,
    maxConnections: 20,
    particleCount: maxParticleCount
  };

  function animate() {
    if (!isVisible) {
      animationFrame = null;
      return;
    }

    if (!prefersReducedMotion) {
      let vertexpos = 0;
      let colorpos = 0;
      let numConnected = 0;

      for (let i = 0; i < particleCount; i++) particlesData[i].numConnections = 0;

      for (let i = 0; i < particleCount; i++) {
        const particleData = particlesData[i];
        const velocity = particleVelocities[i];

        particlePositions[i * 3] += velocity.x;
        particlePositions[i * 3 + 1] += velocity.y;
        particlePositions[i * 3 + 2] += velocity.z;

        if (particlePositions[i * 3] < -rHalf || particlePositions[i * 3] > rHalf) velocity.x = -velocity.x;
        if (particlePositions[i * 3 + 1] < -rHalf || particlePositions[i * 3 + 1] > rHalf) velocity.y = -velocity.y;
        if (particlePositions[i * 3 + 2] < -rHalf || particlePositions[i * 3 + 2] > rHalf) velocity.z = -velocity.z;

        if (effectController.limitConnections && particleData.numConnections >= effectController.maxConnections) continue;

        for (let j = i + 1; j < particleCount; j++) {
          const particleDataB = particlesData[j];
          if (effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections) continue;

          const dx = particlePositions[i * 3] - particlePositions[j * 3];
          const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
          const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < effectController.minDistance) {
            particleData.numConnections++;
            particleDataB.numConnections++;

            const alpha = 1.0 - dist / effectController.minDistance;

            segmentsPositions[vertexpos++] = particlePositions[i * 3];
            segmentsPositions[vertexpos++] = particlePositions[i * 3 + 1];
            segmentsPositions[vertexpos++] = particlePositions[i * 3 + 2];

            segmentsPositions[vertexpos++] = particlePositions[j * 3];
            segmentsPositions[vertexpos++] = particlePositions[j * 3 + 1];
            segmentsPositions[vertexpos++] = particlePositions[j * 3 + 2];

            // Green color (24, 210, 110)
            segmentsColors[colorpos++] = 24 / 255;
            segmentsColors[colorpos++] = 210 / 255;
            segmentsColors[colorpos++] = 110 / 255;

            segmentsColors[colorpos++] = 24 / 255;
            segmentsColors[colorpos++] = 210 / 255;
            segmentsColors[colorpos++] = 110 / 255;

            numConnected++;
          }
        }
      }

      linesMesh.geometry.setDrawRange(0, numConnected * 2);
      linesMesh.geometry.attributes.position.needsUpdate = true;
      linesMesh.geometry.attributes.color.needsUpdate = true;
      particleSystem.geometry.attributes.position.needsUpdate = true;

      core.rotation.y += 0.002;
      core.rotation.x += 0.001;
    }

    // Parallax mouse effect
    group.rotation.y += (pointer.x * 0.2 - group.rotation.y) * 0.05;
    group.rotation.x += (-pointer.y * 0.2 - group.rotation.x) * 0.05;

    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(animate);
  }

  function play() {
    if (!animationFrame) {
      isVisible = true;
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function pause() {
    isVisible = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  function syncVisibility() {
    const header = document.getElementById("header");
    const shouldRun = !document.hidden && header && !header.classList.contains("header-top");

    if (shouldRun) {
      play();
    } else {
      pause();
    }
  }

  function disposeMaterial(material) {
    if (material.map) material.map.dispose();
    material.dispose();
  }

  function disposeScene() {
    pause();
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(disposeMaterial);
        } else {
          disposeMaterial(object.material);
        }
      }
    });
    renderer.dispose();
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", movePointer);
  document.addEventListener("visibilitychange", syncVisibility);
  window.addEventListener("pagehide", disposeScene, { once: true });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    pause();
    canvas.parentElement.classList.add("three-fallback");
  });
  canvas.addEventListener("webglcontextrestored", () => {
    canvas.parentElement.classList.remove("three-fallback");
    syncVisibility();
  });
  document.querySelectorAll("#navbar .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      setTimeout(syncVisibility, 420);
    });
  });
  window.addEventListener("load", () => {
    setTimeout(syncVisibility, 420);
  });

  resize();
  syncVisibility();
})();
