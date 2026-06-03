(function () {
  const canvas = document.getElementById("project-three");

  if (!canvas || typeof THREE === "undefined") {
    if (canvas && canvas.parentElement) {
      canvas.parentElement.classList.add("three-fallback");
    }
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer = null;
  let animationFrame = null;
  let isVisible = true;

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

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  const group = new THREE.Group();
  const accent = new THREE.Color(0x18d26e);
  const white = new THREE.Color(0xffffff);

  const layerMaterial = new THREE.MeshBasicMaterial({
    color: 0x18d26e,
    wireframe: true,
    transparent: true,
    opacity: 0.34
  });

  for (let i = 0; i < 4; i += 1) {
    const layer = new THREE.Mesh(
      new THREE.BoxGeometry(2.3 - i * 0.22, 0.12, 1.45 - i * 0.12),
      layerMaterial.clone()
    );

    layer.position.y = (i - 1.5) * 0.42;
    layer.rotation.y = i * 0.16;
    group.add(layer);
  }

  const nodeGeometry = new THREE.SphereGeometry(0.055, 12, 12);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const linePoints = [];

  for (let i = 0; i < 20; i += 1) {
    const angle = (i / 20) * Math.PI * 2;
    const radius = i % 2 === 0 ? 1.62 : 1.28;
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());

    node.material.color = i % 3 === 0 ? accent : white;
    node.position.set(Math.cos(angle) * radius, Math.sin(i * 1.7) * 0.85, Math.sin(angle) * radius);
    linePoints.push(node.position.clone());
    group.add(node);
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lines = new THREE.LineLoop(
    lineGeometry,
    new THREE.LineBasicMaterial({
      color: 0x18d26e,
      transparent: true,
      opacity: 0.3
    })
  );

  group.add(lines);
  scene.add(group);
  camera.position.z = 5.3;

  function resize() {
    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 320;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(width, height, false);
  }

  function animate() {
    if (!isVisible) {
      animationFrame = null;
      return;
    }

    if (!prefersReducedMotion) {
      group.rotation.x += 0.0025;
      group.rotation.y += 0.0045;
      lines.rotation.z -= 0.003;
    }

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
    if (document.hidden) {
      pause();
    } else {
      resize();
      play();
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

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    pause();
    canvas.parentElement.classList.add("three-fallback");
  });

  canvas.addEventListener("webglcontextrestored", () => {
    canvas.parentElement.classList.remove("three-fallback");
    syncVisibility();
  });

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", syncVisibility);
  window.addEventListener("pagehide", disposeScene, { once: true });

  resize();
  syncVisibility();
})();
