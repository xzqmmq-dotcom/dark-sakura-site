export function createSakuraCanvas(canvas) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return { destroy() {} };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: -1000, y: -1000 };
  const petals = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let lastFrame = 0;
  const maxPetals = Math.min(42, Math.max(16, Math.floor(window.innerWidth / 30)));

  const random = (min, max) => min + Math.random() * (max - min);

  function makePetal(fromTop = false) {
    return {
      x: random(0, width),
      y: fromTop ? random(-height, -10) : random(0, height),
      size: random(2.5, 6),
      speedY: random(.25, .85),
      drift: random(-.35, .35),
      angle: random(0, Math.PI * 2),
      spin: random(-.012, .012),
      opacity: random(.18, .58),
      sway: random(.5, 1.8),
      phase: random(0, Math.PI * 2)
    };
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    petals.length = 0;
    for (let index = 0; index < maxPetals; index += 1) petals.push(makePetal());
    if (reducedMotion.matches) drawStill();
  }

  function drawPetal(petal) {
    context.save();
    context.translate(petal.x, petal.y);
    context.rotate(petal.angle);
    context.globalAlpha = petal.opacity;
    context.fillStyle = "#ffb7c5";
    context.beginPath();
    context.moveTo(0, -petal.size);
    context.bezierCurveTo(petal.size * 1.1, -petal.size * .65, petal.size * 1.15, petal.size * .5, 0, petal.size);
    context.bezierCurveTo(-petal.size * .9, petal.size * .55, -petal.size * .85, -petal.size * .65, 0, -petal.size);
    context.fill();
    context.restore();
  }

  function drawStill() {
    context.clearRect(0, 0, width, height);
    petals.slice(0, 14).forEach(drawPetal);
  }

  function tick(timestamp = 0) {
    if (reducedMotion.matches) {
      drawStill();
      animationFrame = 0;
      return;
    }
    if (timestamp - lastFrame < 30) {
      animationFrame = requestAnimationFrame(tick);
      return;
    }
    lastFrame = timestamp;
    context.clearRect(0, 0, width, height);
    for (const petal of petals) {
      const dx = petal.x - pointer.x;
      const dy = petal.y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      let pushX = 0;
      let pushY = 0;
      if (distance < 130 && distance > 0) {
        const force = (130 - distance) / 130;
        pushX = (dx / distance) * force * 1.2;
        pushY = (dy / distance) * force * .6;
      }
      petal.phase += .012;
      petal.x += petal.drift + Math.sin(petal.phase) * petal.sway * .18 + pushX;
      petal.y += petal.speedY + pushY;
      petal.angle += petal.spin;
      if (petal.y > height + 20 || petal.x < -30 || petal.x > width + 30) Object.assign(petal, makePetal(true), { y: -10 });
      drawPetal(petal);
    }
    animationFrame = requestAnimationFrame(tick);
  }

  function onPointerMove(event) { pointer.x = event.clientX; pointer.y = event.clientY; }
  function onPointerLeave() { pointer.x = -1000; pointer.y = -1000; }
  function onMotionChange() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (reducedMotion.matches) drawStill();
    else animationFrame = requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave, { passive: true });
  reducedMotion.addEventListener?.("change", onMotionChange);
  resize();
  if (!reducedMotion.matches) animationFrame = requestAnimationFrame(tick);

  return {
    destroy() {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      reducedMotion.removeEventListener?.("change", onMotionChange);
    }
  };
}
