const config = {
  particleCount: 2500,
  starCount: 200,
  heartScale: 16,
  baseSpeed: 0.02,
  pulseIntensity: 0.08,
  colorShiftSpeed: 0.5,
  particle: {
    sizeRange: [0.8, 2.2],
    floatProbability: 0.08,
    sparkleIntensity: 1.2,
    turbulence: 0.02
  },
  star: {
    speedRange: [0.2, 1.2],
    sizeRange: [0.3, 1.5],
    twinkleSpeed: 0.02
  }
};

let particles = [];
let stars = [];
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noStroke();

  for (let i = 0; i < config.particleCount; i++) {
    particles.push(new Particle());
  }

  for (let i = 0; i < config.starCount; i++) {
    stars.push(new Star());
  }
}

function draw() {
  background(0, 50);

  t += config.baseSpeed;
  const pulse = 1 + config.pulseIntensity * sin(t * 2);
  const hueShift = (frameCount * config.colorShiftSpeed) % 360;

  translate(width / 2, height / 2);
  rotate(0.004 * sin(t * 1.5));

  drawStars();
  drawParticles(pulse, hueShift);
}

function drawStars() {
  push();
  translate(-width / 2, -height / 2);
  stars.forEach(star => {
    star.update();
    star.show();
  });
  pop();
}

function drawParticles(pulse, hueShift) {
  colorMode(HSB, 360, 100, 100, 100);
  particles.forEach(p => {
    p.update(pulse);
    p.show(hueShift);
  });
  colorMode(RGB);
}

class Particle {
  constructor() {
    const angle = random(TWO_PI);
    const r = sqrt(random(0.2, 1));
    const heart = this.heartFunction(angle);

    this.basePos = createVector(
      heart.x * r * config.heartScale,
      heart.y * r * config.heartScale
    );
    this.offset = p5.Vector.random2D().mult(random(0.3, 1.5));
    this.vel = createVector(0, 0);
    this.floatAway = random() < config.particle.floatProbability;
    this.size = random(...config.particle.sizeRange);
    this.sparkleSpeed = random(0.5, 1.5);
    this.hueOffset = random(-30, 30);
    this.turbulence = config.particle.turbulence;
  }

  heartFunction(t) {
    const x = 16 * pow(sin(t), 3);
    const y = 13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t);
    return createVector(x, -y);
  }

  update(pulse) {
    this.offset.add(p5.Vector.random2D().mult(this.turbulence));

    if (this.floatAway) {
      this.vel.lerp(p5.Vector.random2D().mult(0.1), 0.02);
      this.offset.add(this.vel);
    }

    this.pos = p5.Vector.mult(this.basePos, pulse).add(this.offset);
  }

  show(hueShift) {
    const sparkle = this.size + sin(frameCount * this.sparkleSpeed) * config.particle.sparkleIntensity;
    const hue = (hueShift + this.hueOffset + 360) % 360;
    const alpha = map(sparkle, 0, 4, 50, 100);

    fill(hue, 80, 100, alpha);
    ellipse(this.pos.x, this.pos.y, sparkle);
  }
}

class Star {
  constructor() {
    this.reset(true);
    this.twinklePhase = random(TWO_PI);
  }

  reset(initial = false) {
    this.pos = createVector(random(width), initial ? random(height) : -20);
    this.speed = random(...config.star.speedRange);
    this.baseSize = random(...config.star.sizeRange);
  }

  update() {
    this.pos.y += this.speed;
    if (this.pos.y > height + 20) this.reset();
    this.twinklePhase += config.star.twinkleSpeed;
  }

  show() {
    const twinkle = sin(this.twinklePhase) * 0.5 + 0.5;
    const size = this.baseSize * (0.8 + twinkle * 0.4);

    fill(200, 80, 100, 80 + twinkle * 20);
    ellipse(this.pos.x, this.pos.y, size);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseMoved() {
  const mouse = createVector(mouseX - width / 2, mouseY - height / 2);
  particles.forEach(p => {
    const d = p5.Vector.dist(mouse, p.pos);
    if (d < 150) {
      const force = p5.Vector.sub(p.pos, mouse).setMag(20 / d);
      p.offset.add(force);
    }
  });
}

// Keyboard controls
function keyPressed() {
  if (key === ' ') {
    // Reset animation
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle());
    }
    return false;
  }
}
