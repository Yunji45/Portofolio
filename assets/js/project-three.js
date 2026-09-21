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
  
  // Holographic Prism Structure
  // 1. Outer Glass Icosahedron
  const outerGeom = new THREE.IcosahedronGeometry(1.8, 1);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x18d26e,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });
  const outerPrism = new THREE.Mesh(outerGeom, outerMat);
  group.add(outerPrism);

  // 2. Inner Solid Octahedron
  const innerGeom = new THREE.OctahedronGeometry(1.1, 0);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x18d26e,
    transparent: true,
    opacity: 0.1
  });
  const innerPrism = new THREE.Mesh(innerGeom, innerMat);
  
  // 3. Inner Wireframe Octahedron
  const innerWireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  const innerWirePrism = new THREE.Mesh(innerGeom, innerWireMat);
  
  innerPrism.add(innerWirePrism);
  group.add(innerPrism);

  // 4. Energy Core
  const coreGeom = new THREE.SphereGeometry(0.4, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });
  const core = new THREE.Mesh(coreGeom, coreMat);
  group.add(core);
  
  // 5. Surrounding Energy Rings
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.01, 4, 64),
    new THREE.MeshBasicMaterial({ color: 0x18d26e, transparent: true, opacity: 0.4 })
  );
  ring1.rotation.x = Math.PI / 2;
  group.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.01, 4, 64),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })
  );
  ring2.rotation.y = Math.PI / 2;
  group.add(ring2);

  scene.add(group);
  camera.position.z = 6;

  function resize() {
    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 320;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(width, height, false);
  }

  let time = 0;

  function animate() {
    if (!isVisible) {
      animationFrame = null;
      return;
    }

    if (!prefersReducedMotion) {
      time += 0.02;
      
      // Rotate the entire group slowly
      group.rotation.x += 0.001;
      group.rotation.y += 0.002;
      
      // Rotate inner elements
      outerPrism.rotation.y -= 0.003;
      outerPrism.rotation.z += 0.001;
      
      innerPrism.rotation.x += 0.005;
      innerPrism.rotation.y += 0.004;
      
      ring1.rotation.y += 0.005;
      ring1.rotation.x += 0.002;
      
      ring2.rotation.x -= 0.004;
      ring2.rotation.z += 0.003;

      // Morphing effect using scale
      const scale1 = 1 + Math.sin(time) * 0.1;
      const scale2 = 1 + Math.cos(time * 1.5) * 0.15;
      
      outerPrism.scale.set(scale1, scale1, scale1);
      innerPrism.scale.set(scale2, scale2, scale2);
      
      // Core pulsating
      const coreScale = 1 + Math.sin(time * 3) * 0.2;
      core.scale.set(coreScale, coreScale, coreScale);
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
