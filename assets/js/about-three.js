(function () {
  const canvas = document.getElementById("about-three");

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
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);

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

  const group = new THREE.Group();
  const orbit = new THREE.Group();
  const technologies = [
    { label: "Java", color: "#f89820" },
    { label: "Golang", color: "#00add8" },
    { label: "Kafka", color: "#ffffff" },
    { label: "Vue.js", color: "#42b883" },
    { label: "PHP", color: "#8993be" },
    { label: "SQL", color: "#18d26e" },
    { label: "Docker", color: "#2496ed" },
    { label: "Kubernetes", color: "#326ce5" },
    { label: "Redis", color: "#dc382c" },
    { label: "Git", color: "#f34f29" },
    { label: "Node.js", color: "#66cc66" },
    { label: "Python", color: "#3776ab" },
    { label: "React", color: "#61dafb" },
    { label: "Express", color: "#68a063" },
    { label: "MongoDB", color: "#47a248" },
    { label: "PostgreSQL", color: "#0064a5" },
    { label: "Next.js", color: "#000000" },
    { label: "Oracle", color: "#e535ab" },
    { label: "S3", color: "#ff9900" },
    { label: "Firebase", color: "#ff421d" }
  ];

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x18d26e,
      transparent: true,
      opacity: 0.16,
      wireframe: true
    })
  );

  const halo = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.TorusGeometry(1.35, 0.01, 8, 96)),
    new THREE.LineBasicMaterial({
      color: 0x18d26e,
      transparent: true,
      opacity: 0.42
    })
  );

  const haloAlt = halo.clone();
  halo.rotation.x = Math.PI * 0.52;
  haloAlt.rotation.y = Math.PI * 0.52;
  group.add(core, halo, haloAlt);

  function makeLabelTexture(text, color) {
    const textureCanvas = document.createElement("canvas");
    const context = textureCanvas.getContext("2d");
    textureCanvas.width = 256;
    textureCanvas.height = 96;

    function roundedRect(x, y, width, height, radius) {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
    }

    context.fillStyle = "rgba(4, 4, 4, 0.76)";
    context.strokeStyle = color;
    context.lineWidth = 3;
    roundedRect(14, 18, 228, 60, 12);
    context.fill();
    context.stroke();

    context.fillStyle = "#ffffff";
    context.font = "600 30px Poppins, Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 128, 48);

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  technologies.forEach((technology, index) => {
    const angle = (index / technologies.length) * Math.PI * 2;
    const radius = 2.05;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeLabelTexture(technology.label, technology.color),
        transparent: true,
        opacity: 0.9
      })
    );

    sprite.position.set(Math.cos(angle) * radius, Math.sin(angle) * 0.82, Math.sin(angle) * radius);
    sprite.scale.set(0.9, 0.34, 1);
    orbit.add(sprite);
  });

  group.add(orbit);
  scene.add(group);
  camera.position.z = 5.4;

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
      group.rotation.y += 0.004;
      core.rotation.x += 0.004;
      core.rotation.y += 0.006;
      halo.rotation.z += 0.003;
      haloAlt.rotation.x += 0.002;
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
    const aboutSection = document.getElementById("about");
    const shouldRun = !document.hidden && aboutSection && aboutSection.classList.contains("section-show");

    if (shouldRun) {
      resize();
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
