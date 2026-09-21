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
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

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
  
  // Expanded list of technologies to make the sphere denser
  // Using devicon standard names for the icons
  const technologies = [
    { label: "Java", color: "#18d26e", icon: "java/java-original.svg" },
    { label: "Golang", color: "#ffffff", icon: "go/go-original.svg" },
    { label: "Kafka", color: "#18d26e", icon: "apachekafka/apachekafka-original.svg" },
    { label: "Vue.js", color: "#ffffff", icon: "vuejs/vuejs-original.svg" },
    { label: "PHP", color: "#18d26e", icon: "php/php-original.svg" },
    { label: "MySQL", color: "#ffffff", icon: "mysql/mysql-original.svg" },
    { label: "Docker", color: "#18d26e", icon: "docker/docker-original.svg" },
    { label: "Kubernetes", color: "#ffffff", icon: "kubernetes/kubernetes-plain.svg" },
    { label: "Redis", color: "#18d26e", icon: "redis/redis-original.svg" },
    { label: "Git", color: "#ffffff", icon: "git/git-original.svg" },
    { label: "Node.js", color: "#18d26e", icon: "nodejs/nodejs-original.svg" },
    { label: "Python", color: "#ffffff", icon: "python/python-original.svg" },
    { label: "React", color: "#18d26e", icon: "react/react-original.svg" },
    { label: "Express", color: "#ffffff", icon: "express/express-original.svg" },
    { label: "MongoDB", color: "#18d26e", icon: "mongodb/mongodb-original.svg" },
    { label: "PostgreSQL", color: "#ffffff", icon: "postgresql/postgresql-original.svg" },
    { label: "Next.js", color: "#18d26e", icon: "nextjs/nextjs-original.svg" },
    { label: "Oracle", color: "#ffffff", icon: "oracle/oracle-original.svg" },
    { label: "AWS", color: "#18d26e", icon: "amazonwebservices/amazonwebservices-original-wordmark.svg" },
    { label: "Firebase", color: "#ffffff", icon: "firebase/firebase-plain.svg" },
    { label: "Elastic", color: "#18d26e", icon: "elasticsearch/elasticsearch-original.svg" },
    { label: "GraphQL", color: "#ffffff", icon: "graphql/graphql-plain.svg" },
    { label: "Linux", color: "#18d26e", icon: "linux/linux-original.svg" },
    { label: "Jenkins", color: "#ffffff", icon: "jenkins/jenkins-original.svg" },
    { label: "TypeScript", color: "#18d26e", icon: "typescript/typescript-original.svg" },
    { label: "Quarkus", color: "#ffffff", icon: "quarkus/quarkus-original.svg" },
    { label: "Spring", color: "#18d26e", icon: "spring/spring-original.svg" },
    { label: "Ubuntu", color: "#ffffff", icon: "ubuntu/ubuntu-plain.svg" },
    { label: "Nginx", color: "#18d26e", icon: "nginx/nginx-original.svg" },
    { label: "Tailwind", color: "#ffffff", icon: "tailwindcss/tailwindcss-original.svg" }
  ];

  function makeLabelTexture(tech) {
    const textureCanvas = document.createElement("canvas");
    const context = textureCanvas.getContext("2d");
    textureCanvas.width = 300;
    textureCanvas.height = 96;

    // Draw background
    context.fillStyle = "rgba(4, 4, 4, 0.7)";
    context.beginPath();
    context.roundRect(10, 18, 280, 60, 12);
    context.fill();

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.minFilter = THREE.LinearFilter;

    // Load the logo
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      // Draw image on the left side
      context.drawImage(img, 24, 24, 48, 48);
      
      // Draw text on the right side
      context.fillStyle = tech.color;
      context.font = "bold 28px Poppins, Arial, sans-serif";
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillText(tech.label, 84, 48);
      
      // Update texture after image loads
      texture.needsUpdate = true;
    };
    img.onerror = () => {
      // Fallback: draw text centered if image fails to load
      context.fillStyle = tech.color;
      context.font = "bold 32px Poppins, Arial, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(tech.label, 150, 48);
      texture.needsUpdate = true;
    };
    img.src = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/" + tech.icon;

    return texture;
  }

  // Fibonacci Sphere Algorithm
  const numNodes = technologies.length;
  const radius = 2.5; // Radius of the sphere
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  technologies.forEach((tech, i) => {
    // Math for Fibonacci sphere distribution
    const y = 1 - (i / (numNodes - 1)) * 2; // y goes from 1 to -1
    const r = Math.sqrt(1 - y * y); // radius at y
    const theta = phi * i; // golden angle increment
    
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    // Create sprite for text and logo
    const spriteMaterial = new THREE.SpriteMaterial({
      map: makeLabelTexture(tech),
      transparent: true,
      opacity: 1
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Scale and position
    sprite.scale.set(1.2, 0.45, 1);
    sprite.position.set(x * radius, y * radius, z * radius);
    
    group.add(sprite);
  });

  // Add a glowing core inside the sphere
  const coreGeometry = new THREE.IcosahedronGeometry(0.8, 1);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x18d26e,
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);

  scene.add(group);
  camera.position.z = 6;

  // Mouse interaction variables
  let targetRotationX = 0;
  let targetRotationY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let isHovering = false;

  function resize() {
    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 320;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // Maintain sharp text by using higher pixel ratio, up to 2
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
  }

  function handleMouseMove(event) {
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Normalize from -1 to 1
    mouseX = (x / rect.width) * 2 - 1;
    mouseY = -(y / rect.height) * 2 + 1;
    
    // Check if mouse is actually over the canvas
    if(x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      isHovering = true;
    } else {
      isHovering = false;
    }
  }

  window.addEventListener('mousemove', handleMouseMove);

  function animate() {
    if (!isVisible) {
      animationFrame = null;
      return;
    }

    if (!prefersReducedMotion) {
      // Auto rotation
      group.rotation.y += 0.002;
      group.rotation.x += 0.001;
      
      core.rotation.y -= 0.003;
      core.rotation.x -= 0.002;

      // Mouse interactive rotation
      if (isHovering) {
        targetRotationY = mouseX * Math.PI * 0.2;
        targetRotationX = -mouseY * Math.PI * 0.2;
      } else {
        // Slowly return to center when not hovering
        targetRotationY *= 0.95;
        targetRotationX *= 0.95;
      }
      
      // Smoothly interpolate current rotation to target rotation
      scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.05;
      scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.05;

      // Dynamic opacity/scale based on Z position (depth)
      // Elements closer to camera get full opacity, elements in back become faded
      group.children.forEach(child => {
        if (child.isSprite) {
          // Calculate world position
          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);
          
          // Map Z from [-radius, radius] to [0.1, 1.0] for opacity
          // Z is negative if pointing away from camera, positive if pointing towards
          const normalizedZ = (worldPos.z + radius) / (radius * 2); 
          const targetOpacity = 0.2 + (normalizedZ * 0.8);
          
          child.material.opacity = targetOpacity;
          
          // Slightly scale up elements in front
          const scaleBase = 1.2;
          const targetScale = scaleBase * (0.8 + (normalizedZ * 0.4));
          child.scale.set(targetScale, targetScale * 0.375, 1);
        }
      });
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
    // Only run if the skills section is visible (using a loose check)
    // Actually, it's better to just use intersection observer, but we'll stick to the existing pattern
    const shouldRun = !document.hidden;

    if (shouldRun) {
      resize();
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

  // Intersection observer for better performance (only play when visible in viewport)
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          play();
        } else {
          pause();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(canvas);
  }

  resize();
  play(); // fallback if observer fails
})();
