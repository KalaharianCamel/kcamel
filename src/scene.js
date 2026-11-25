import * as THREE from 'three';
import { profile } from './profile.js';
import { damping, fixedStepper, taglineCycler } from './motion.js';

function createCellGeometry() {
  const points = [];
  for (let i = 0; i <= 48; i++) {
    const angle = i / 48 * Math.PI;
    const radius = Math.sin(angle);
    points.push(new THREE.Vector2(radius, Math.cos(angle) * (.18 + .68 * radius ** 2 - .25 * radius ** 4)));
  }
  return new THREE.LatheGeometry(points, 48);
}

export function startScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0x000000, 0);
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.z = 20;
  const material = new THREE.MeshMatcapMaterial({ color: '#dc8b9a' });
  let disposed = false;
  new THREE.TextureLoader().load('/textures/matcap.jpeg', texture => {
    if (disposed) { texture.dispose(); return; }
    material.matcap = texture;
    material.needsUpdate = true;
    render(1);
  });
  const geometry = createCellGeometry();
  let seed = 513;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  const cells = Array.from({ length: 40 }, () => {
    const radius = [.6, .6, 1, 1, 1.25][Math.floor(random() * 5)];
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(radius);
    const position = new THREE.Vector3((random() - .5) * 7, (random() - .5) * 7, (random() - .5) * 7);
    mesh.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    scene.add(mesh);
    return { mesh, radius: radius * .83, position, previous: position.clone(), velocity: new THREE.Vector3(), spin: new THREE.Vector3((random() - .5) * .1, (random() - .5) * .1, (random() - .5) * .1) };
  });
  const delta = new THREE.Vector3();
  const pointer = new THREE.Vector3(100, 100, 1.5);
  const targetPointer = pointer.clone();
  const previousPointer = pointer.clone();
  let pointerActive = false, pointerWeight = 0, pointerSpeed = 0;
  let pulse = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const cycleTagline = taglineCycler(document.querySelector('#tagline'), profile.taglines);
  const navigation = document.querySelector('#navigation');
  function simulate(dt, interact = true) {
    previousPointer.copy(pointer);
    pointer.lerp(targetPointer, damping(13, dt));
    pointerSpeed += (Math.min(pointer.distanceTo(previousPointer) / dt, 18) - pointerSpeed) * damping(9, dt);
    pointerWeight += ((pointerActive ? 1 : 0) - pointerWeight) * damping(pointerActive ? 10 : 5, dt);
    for (const cell of cells) {
      cell.previous.copy(cell.position);
      const p = cell.position;
      cell.velocity.addScaledVector(p, -3.3 * dt);
      cell.velocity.x += p.z * .08 * dt;
      cell.velocity.z -= p.x * .08 * dt;
      if (interact && pointerWeight > .001) {
        delta.subVectors(p, pointer);
        const distance = delta.length();
        const contactDistance = cell.radius + 1.65;
        if (distance < contactDistance && distance > .001) {
          const penetration = 1 - distance / contactDistance;
          delta.divideScalar(distance);
          cell.velocity.addScaledVector(delta, penetration ** 2 * (18 + pointerSpeed * 2) * pointerWeight * dt);
          if (pointerActive && pointerSpeed > 2) cycleTagline();
        }
      }
      if (pulse > .001) cell.velocity.addScaledVector(p, pulse * 8 * dt);
      cell.velocity.multiplyScalar(Math.exp(-1.35 * dt));
      p.addScaledVector(cell.velocity, dt);
      cell.mesh.rotation.x += (cell.spin.x + cell.velocity.y * .025) * dt;
      cell.mesh.rotation.y += (cell.spin.y + cell.velocity.x * .025) * dt;
      cell.mesh.rotation.z += cell.spin.z * dt;
    }
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i], b = cells[j];
        delta.subVectors(b.position, a.position);
        const distance = delta.length();
        const minimum = a.radius + b.radius;
        if (distance >= minimum || distance < .001) continue;
        delta.divideScalar(distance);
        const separation = (minimum - distance) * .3;
        a.position.addScaledVector(delta, -separation);
        b.position.addScaledVector(delta, separation);
        const speed = delta.x * (b.velocity.x - a.velocity.x) + delta.y * (b.velocity.y - a.velocity.y) + delta.z * (b.velocity.z - a.velocity.z);
        if (speed < 0) { a.velocity.addScaledVector(delta, speed * .52); b.velocity.addScaledVector(delta, -speed * .52); }
      }
    }
    pulse *= Math.exp(-7 * dt);
  }
  for (let i = 0; i < 320; i++) simulate(1 / 120, false);
  cells.forEach(cell => cell.previous.copy(cell.position));
  function render(alpha) {
    cells.forEach(cell => cell.mesh.position.lerpVectors(cell.previous, cell.position, alpha));
    renderer.render(scene, camera);
  }
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height || disposed) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < .65 ? 24 : 20;
    camera.updateProjectionMatrix();
    render(1);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const events = new AbortController();
  const listen = (target, name, listener) => target.addEventListener(name, listener, { signal: events.signal });
  listen(container, 'pointermove', event => {
    if (reducedMotion.matches) return;
    const bounds = container.getBoundingClientRect();
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - 1.5);
    targetPointer.set(((event.clientX - bounds.left) / bounds.width * 2 - 1) * height * camera.aspect / 2, -((event.clientY - bounds.top) / bounds.height * 2 - 1) * height / 2, 1.5);
    if (!pointerActive && pointerWeight < .01) pointer.copy(targetPointer);
    pointerActive = true;
  });
  listen(container, 'pointerleave', () => { pointerActive = false; });
  listen(container, 'pointerup', event => { if (event.pointerType !== 'mouse') pointerActive = false; });
  listen(container, 'pointercancel', () => { pointerActive = false; });
  listen(container, 'pointerdown', () => { cycleTagline(); if (!reducedMotion.matches) pulse = Math.min(pulse + 1, 1.4); });
  const stepper = fixedStepper(simulate);
  let previous = performance.now(), frame = 0;
  function tick(now) {
    frame = requestAnimationFrame(tick);
    const elapsed = (now - previous) / 1000;
    previous = now;
    if (document.hidden || navigation?.open || reducedMotion.matches) { stepper.reset(); return; }
    render(stepper.advance(elapsed));
  }
  listen(reducedMotion, 'change', () => { stepper.reset(); previous = performance.now(); render(1); });
  resize();
  frame = requestAnimationFrame(tick);
  return () => {
    disposed = true;
    events.abort();
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    material.matcap?.dispose();
    geometry.dispose(); material.dispose(); renderer.dispose();
  };
}
