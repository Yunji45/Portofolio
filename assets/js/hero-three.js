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
  const particleCount = window.innerWidth < 768 ? 120 : 220;
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    const index = i * 3;
    particlePositions[index] = (Math.random() - 0.5) * 18;
    particlePositions[index + 1] = (Math.random() - 0.5) * 10;
    particlePositions[index + 2] = (Math.random() - 0.5) * 12;
  }

  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      color: 0x18d26e,
      size: 0.035,
      transparent: true,
      opacity: 0.68
    })
  );

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.5, 2),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    })
  );

  const ring = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.TorusGeometry(2.35, 0.01, 8, 90)),
    new THREE.LineBasicMaterial({
      color: 0x18d26e,
      transparent: true,
      opacity: 0.34
    })
  );

  core.position.set(3.8, 0.2, -1.2);
  ring.position.copy(core.position);
  ring.rotation.x = Math.PI * 0.58;

  scene.add(particles, core, ring);
  camera.position.z = 7;

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(width, height, false);
  }

  function movePointer(event) {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  function animate() {
    if (!isVisible) {
      animationFrame = null;
      return;
    }

    if (!prefersReducedMotion) {
      particles.rotation.y += 0.0009;
      particles.rotation.x += 0.00035;
      core.rotation.x += 0.003;
      core.rotation.y += 0.004;
      ring.rotation.z += 0.0025;
    }

    scene.rotation.x += (pointer.y * 0.05 - scene.rotation.x) * 0.035;
    scene.rotation.y += (pointer.x * 0.07 - scene.rotation.y) * 0.035;
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
    if (material.map) {
      material.map.dispose();
    }
    material.dispose();
  }

  function disposeScene() {
    pause();
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }

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
