(function () {
  const cards = document.querySelectorAll(".portfolio .portfolio-wrap");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!cards.length || prefersReducedMotion) {
    return;
  }

  function reset(card) {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--tilt-lift", "0");
    card.style.setProperty("--tilt-glow-opacity", "0");
  }

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      const rotateY = ((x - centerX) / centerX) * 7;
      const rotateX = ((centerY - y) / centerY) * 7;

      card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
      card.style.setProperty("--tilt-lift", "-6px");
      card.style.setProperty("--tilt-glow-x", `${(x / bounds.width) * 100}%`);
      card.style.setProperty("--tilt-glow-y", `${(y / bounds.height) * 100}%`);
      card.style.setProperty("--tilt-glow-opacity", "1");
    });

    card.addEventListener("pointerleave", () => reset(card));
    card.addEventListener("blur", () => reset(card), true);
  });
})();
