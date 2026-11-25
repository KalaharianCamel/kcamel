import * as THREE from 'three';
import { clamp, smooth } from './model.js';
import { getCellPose, getMembranePose, getMicroscopeState, getFramingPose, getCameraDistance } from './choreography.js';

const TAU = Math.PI * 2;
const sand = new THREE.Color('#bf6721');
const copper = new THREE.Color('#dca071');
const quiet = new THREE.Color('#827f72');

// Deliberately asymmetric contours retain the form of an animal cell without
// downloading a model. Meridians and section rings replace triangulated wireframe.
function membranePoint(u, v) {
  const wobble = 1 + .045 * Math.sin(3 * u + 1) * Math.sin(2 * v) + .035 * Math.cos(5 * u - v) * Math.sin(v) ** 2;
  return new THREE.Vector3(2.26 * Math.sin(v) * Math.cos(u) * wobble, 2.1 * Math.cos(v) * wobble, 1.73 * Math.sin(v) * Math.sin(u) * wobble);
}
function line(points, color, opacity = .5, closed = false) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  return closed ? new THREE.LineLoop(geometry, material) : new THREE.Line(geometry, material);
}
function ringGroup(point, { rings = 12, segments = 72, color = quiet, opacity = .35, meridians = 8 } = {}) {
  const group = new THREE.Group();
  for (let j = 1; j < rings; j++) group.add(line(Array.from({ length: segments }, (_, i) => point(i / segments * TAU, j / rings * Math.PI)), color, opacity, true));
  for (let j = 0; j < meridians; j++) group.add(line(Array.from({ length: segments + 1 }, (_, i) => point(j / meridians * TAU, i / segments * Math.PI)), color, opacity * .65));
  return group;
}
function ellipsoidPoint(x, y, z, bend = 0) {
  return (u, v) => {
    const px = x * Math.cos(v);
    return new THREE.Vector3(px, y * Math.sin(v) * Math.cos(u) + bend * (1 - (px / x) ** 2), z * Math.sin(v) * Math.sin(u));
  };
}
function parametricGeometry(point, width = 48, height = 24) {
  const vertices = [], indices = [];
  for (let j = 0; j <= height; j++) for (let i = 0; i <= width; i++) vertices.push(...point(i / width * TAU, j / height * Math.PI).toArray());
  for (let j = 0; j < height; j++) for (let i = 0; i < width; i++) {
    const a = j * (width + 1) + i, b = a + width + 1;
    indices.push(a, a + 1, b, a + 1, b + 1, b);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
function body(point, color, opacity = .12, segments = 14) {
  const indexed = parametricGeometry(point, Math.min(segments, 16), 10);
  const geometry = indexed.toNonIndexed(); indexed.dispose(); geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, flatShading: true, shininess: 5, depthWrite: false }));
}
function closedMembrane(mobile) {
  const geometry = new THREE.IcosahedronGeometry(2, mobile ? 1 : 2);
  const position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
    const irregularity = 1 + .035 * Math.sin(x * 2.5 + y) * Math.cos(z * 2);
    position.setXYZ(i, x * 1.13 * irregularity, y * 1.05 * irregularity, z * .865 * irregularity);
  }
  geometry.computeVertexNormals();
  // Clip the actual triangles into two independently moving, solid half shells.
  // Unlike a discard mask, the cut edge and its interior face stay in view.
  const cell = new THREE.Group();
  for (const sign of [-1, 1]) {
    const vertices = [];
    for (let i = 0; i < position.count; i += 3) {
      const triangle = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(position, i + j));
      const polygon = [];
      for (let j = 0; j < 3; j++) {
        const a = triangle[j], b = triangle[(j + 1) % 3];
        const insideA = a.x * sign >= 0, insideB = b.x * sign >= 0;
        if (insideA) polygon.push(a);
        if (insideA !== insideB) polygon.push(a.clone().lerp(b, -a.x / (b.x - a.x)));
      }
      for (let j = 1; j < polygon.length - 1; j++) vertices.push(...polygon[0].toArray(), ...polygon[j].toArray(), ...polygon[j + 1].toArray());
    }
    const half = new THREE.Group(); half.userData.sign = sign;
    const shellGeometry = new THREE.BufferGeometry();
    shellGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); shellGeometry.computeVertexNormals();
    half.add(new THREE.Mesh(shellGeometry, new THREE.MeshPhongMaterial({ color: '#b56a35', flatShading: true, shininess: 7, side: THREE.DoubleSide, transparent: true })));
    const cut = new THREE.Group(); cut.userData.cut = true;
    let layer = 0;
    const disc = (y, z, ry, rz, color) => {
      const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, mobile ? 24 : 40), new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide, transparent: true, shininess: 3 }));
      const faceX = -sign * (.012 + layer++ * .012);
      mesh.rotation.y = Math.PI / 2; mesh.scale.set(rz, ry, 1); mesh.position.set(faceX, y, z); cut.add(mesh);
      const edge = line(Array.from({ length: 48 }, (_, i) => new THREE.Vector3(faceX - sign * .004, y + Math.sin(i / 48 * TAU) * ry, z + Math.cos(i / 48 * TAU) * rz)), '#f0bb7c', .9, true);
      cut.add(edge);
    };
    disc(0, 0, 2.08, 1.71, '#774527');
    disc(.1, .05, .97, .82, '#c68c52');
    disc(.12, .12, .28, .25, '#754026');
    for (let i = 0; i < 3; i++) {
      const y = [-1.28, 1.3, -.65][i], z = [.45, -.5, -1.1][i];
      disc(y, z, .23, .4, '#bc773c');
      cut.add(line(Array.from({ length: 13 }, (_, j) => new THREE.Vector3(-sign * .04, y + Math.sin(j * 2) * .13, z - .28 + j * .047)), '#f0bb7c', .8));
    }
    half.add(cut); cell.add(half);
  }
  geometry.dispose();
  return cell;
}

function electronMicroscope(mobile) {
  const group = new THREE.Group();
  const metal = new THREE.MeshPhongMaterial({ color: '#717c75', flatShading: true, transparent: true, shininess: 25 });
  const dark = new THREE.MeshPhongMaterial({ color: '#303c36', flatShading: true, transparent: true, shininess: 12 });
  const cylinder = (r1, r2, height, y, material = metal) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, height, mobile ? 16 : 24), material.clone());
    mesh.position.y = y; group.add(mesh); return mesh;
  };
  cylinder(.42, .42, 1.3, 3.05);
  cylinder(.42, .84, .55, 2.2);
  cylinder(.84, .84, .16, 1.84, dark);
  cylinder(1.6, 1.6, .16, -1.65);
  cylinder(.7, .9, .55, -2.02, dark);
  cylinder(.25, .25, .6, -2.58);
  const holder = new THREE.Mesh(new THREE.BoxGeometry(3.7, .09, .42), dark.clone()); holder.position.set(.45, -1.5, 0); group.add(holder);
  // Transparent low-sided Petri dish: glass wall, liquid bed, and two rims.
  const glass = new THREE.MeshPhongMaterial({ color: '#c7ddd1', transparent: true, opacity: .2, shininess: 90, side: THREE.DoubleSide, depthWrite: false });
  const dishWall = new THREE.Mesh(new THREE.CylinderGeometry(1.23, 1.2, .2, mobile ? 32 : 48, 1, true), glass);
  dishWall.position.y = -1.37; group.add(dishWall);
  const medium = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, .025, mobile ? 32 : 48), new THREE.MeshPhongMaterial({ color: '#b0c5a4', transparent: true, opacity: .3, shininess: 50, depthWrite: false }));
  medium.position.y = -1.43; group.add(medium);
  for (const y of [-1.47, -1.27]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.22, .025, 5, mobile ? 32 : 48), new THREE.MeshPhongMaterial({ color: '#d9e7dc', transparent: true, opacity: .85, shininess: 75 }));
    rim.rotation.x = Math.PI / 2; rim.position.y = y; group.add(rim);
  }
  // A specimen grid and pole-piece contours make placement legible before the
  // palette switches and the camera moves into the scanned structures.
  for (const y of [-1.55, 1.72]) group.add(line(Array.from({length:64}, (_, i) => new THREE.Vector3(Math.cos(i / 64 * TAU) * 1.22, y, Math.sin(i / 64 * TAU) * .8)), '#adbaaf', .7, true));
  for (let i = -4; i <= 4; i++) group.add(line([new THREE.Vector3(-1.15, -1.55, i * .16), new THREE.Vector3(1.15, -1.55, i * .16)], '#9aaca0', .45));
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 3.15, 6), new THREE.MeshBasicMaterial({ color: '#b9e1c8', transparent: true, opacity: .22, depthWrite: false }));
  beam.position.y = .12; group.add(beam);
  group.userData.materials = [];
  group.traverse(part => { if (part.material) group.userData.materials.push({ material: part.material, opacity: part.material.opacity }); });
  return group;
}
function contour(point, color, opacity = .4) {
  return ringGroup(point, { rings: 5, meridians: 5, segments: 20, color, opacity });
}
function lowPolyCore(radius, color) {
  return new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 1), new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 5, transparent: true, opacity: .92 }));
}
function mitochondrion(mobile) {
  const group = new THREE.Group();
  const point = ellipsoidPoint(.77, .32, .29, .12);
  group.add(body(point, '#bf6721', .65));
  group.add(contour(point, '#e0a06d', .38));
  // A few folded cristae make the simplified organelle legible as biology.
  for (let i = 0; i < 6; i++) {
    const x = -.45 + i * .18;
    const reach = .23 * Math.sqrt(1 - (x / .8) ** 2);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x - .03, -reach + .1, .13), new THREE.Vector3(x + .06, -.08 + .1, .21),
      new THREE.Vector3(x - .05, .07 + .1, .19), new THREE.Vector3(x + .025, reach + .1, .09),
    ]);
    group.add(line(curve.getPoints(mobile ? 8 : 12), '#e0a06d', .9));
  }
  return group;
}
/*
  The shell, nucleus, and mitochondria use flat normals and coarse geometry.
  Folded networks and ribosome clusters retain their recognizable silhouettes.
*/
function ribbons(mobile, golgi = false) {
  const group = new THREE.Group();
  for (let j = 0; j < (golgi ? 5 : 7); j++) {
    const points = [];
    const length = golgi ? .58 - j * .045 : .85 - j * .04;
    for (let i = 0; i <= 32; i++) {
      const x = (i / 32 * 2 - 1) * length;
      points.push(new THREE.Vector3(x, j * .135 + .12 * Math.cos(x * 4) + (golgi ? 0 : .08 * Math.sin(x * 9 + j)), .15 * Math.sin(x * 3 + j * .5)));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, mobile ? 10 : 16, golgi ? .065 : .04, 3, false), new THREE.MeshPhongMaterial({ color: '#716b5c', transparent: true, opacity: .65, flatShading: true })));
    group.add(line(points.map(p => p.clone().add(new THREE.Vector3(0, .04, .04))), '#d1b18d', .7));
    if (!golgi) for (let i = 1; i < 6; i++) {
      const ribosome = new THREE.Mesh(new THREE.SphereGeometry(.025, 6, 4), new THREE.MeshBasicMaterial({ color: '#cca27a' }));
      ribosome.position.copy(points[i * 5]).add(new THREE.Vector3(0, .07, .07));
      group.add(ribosome);
    }
  }
  return group;
}

export function createCellModel(mobile = false) {
  const root = new THREE.Group();
  const exterior = closedMembrane(mobile); root.add(exterior);

  const membrane = new THREE.Group();
  membrane.add(body(membranePoint, '#9a8064', .055, mobile ? 32 : 64));
  membrane.add(ringGroup(membranePoint, { rings: 7, meridians: 8, segments: 24, color: '#9e866c', opacity: .25 }));
  // Three closely spaced equatorial contours give the membrane a distinct edge.
  for (const offset of [-.015, 0, .015]) membrane.add(line(Array.from({ length: 120 }, (_, i) => membranePoint(i / 120 * TAU, Math.PI / 2 + offset)), '#d09562', .48, true));
  root.add(membrane);

  const nucleus = new THREE.Group();
  const nucleusPoint = (u, v) => new THREE.Vector3(.89 * Math.sin(v) * Math.cos(u), .98 * Math.cos(v), .83 * Math.sin(v) * Math.sin(u));
  nucleus.add(body(nucleusPoint, '#bb7647', .24));
  nucleus.add(contour(nucleusPoint, '#e0a06d', .45));
  const nucleolus = lowPolyCore(.29, sand);
  nucleolus.scale.set(1, 1.1, 1); nucleolus.position.set(.12, -.04, .35); nucleus.add(nucleolus);
  nucleus.add(contour(ellipsoidPoint(.3, .32, .3), '#e0a06d', .3));
  root.add(nucleus);

  const mitos = Array.from({ length: 3 }, () => mitochondrion(mobile));
  mitos.forEach((mito, i) => { mito.rotation.set(.2 + i * .1, .25 - i * .3, [-.5, .7, -.2][i]); root.add(mito); });
  const er = ribbons(mobile); er.rotation.set(.2, -.2, 1.8); root.add(er);
  const golgi = ribbons(mobile, true); golgi.rotation.set(.1, -.25, -.4); root.add(golgi);
  const ribosomes = new THREE.Group();
  const beadGeometry = new THREE.IcosahedronGeometry(.055, 1);
  for (let i = 0; i < (mobile ? 15 : 27); i++) {
    const bead = new THREE.Mesh(beadGeometry, new THREE.MeshPhongMaterial({ color: '#b6ad94', shininess: 5 }));
    const angle = i * 2.399;
    const r = .12 + .055 * Math.sqrt(i);
    bead.position.set(Math.cos(angle) * r * 1.8, Math.sin(angle) * r, Math.sin(i * 3.1) * .22);
    ribosomes.add(bead);
  }
  root.add(ribosomes);
  const vesicles = new THREE.Group();
  for (let i = 0; i < 10; i++) {
    const vesicle = ringGroup(ellipsoidPoint(.09, .09, .09), { rings: 4, meridians: 4, segments: 16, color: '#aaa18a', opacity: .55 });
    vesicle.position.set(Math.cos(i * 4) * (1.3 + .22 * Math.sin(i)), Math.sin(i * 4) * 1.5, -.5 + Math.sin(i) * .5);
    vesicles.add(vesicle);
  }
  root.add(vesicles);

  const moving = [nucleus, ...mitos, er, golgi, ribosomes];
  // All interior materials participate in the reading hierarchy, including the
  // small beads whose original opaque material would otherwise ignore fades.
  moving.forEach(group => group.traverse(part => {
    if (part.material) { part.material.transparent = true; part.material.depthWrite = false; }
  }));
  const compact = [
    [0, .1, .05], [1.05, .98, .08], [-1.22, -.5, .25], [.62, -1.35, .05], [-.99, .7, -.15], [1.15, -.4, -.2], [-.42, -1.38, .3],
  ];
  const exploded = [
    [0, .2, -2], [1.45, 1.3, -1.1], [-1.6, -.65, -1.8], [.6, -1.5, -1.3], [-1.7, .9, -2.2], [1.6, -.5, -2.4], [-.7, -1.3, -1],
  ];
  moving.forEach((object, i) => object.position.fromArray(compact[i]));
  root.rotation.set(.16, -.3, -.12);
  return { root, exterior, membrane, nucleus, mitos, er, golgi, ribosomes, vesicles, moving, compact, exploded };
}

// Shared with the geometry checks: the rendered transforms are the tested ones.
export function applyInteriorPose(model, pose) {
  const { moving, compact, exploded, mitos, er, golgi, vesicles } = model;
  const packing = pose.assembly;
  const spread = pose.spread;
  const compactScale = .86 + .14 * packing;
  moving.forEach((object, i) => {
    const a = compact[i], b = exploded[i];
    object.position.set(...a.map((value, j) => value * .86 + (b[j] - value * .86) * spread));
    object.scale.setScalar(compactScale * (1 + .12 * pose.isolate * Math.max(0, 1 - Math.abs(i - pose.focus))));
  });
  mitos.forEach((mito, index) => {
    const amount = pose.split * Math.max(0, 1 - Math.abs(pose.focus - index - 1));
    mito.children.forEach((part, i) => {
      if (i < 2) { part.position.z = -amount * .3; part.rotation.x = amount * -.35; }
      else { part.position.x = (i - 4.5) * amount * .1; part.position.z = amount * (.15 + .04 * (i - 2)); part.rotation.x = amount * .35; }
    });
  });
  [er, golgi].forEach((group, index) => {
    const amount = pose.split * Math.max(0, 1 - Math.abs(pose.focus - 4 - index));
    group.children.forEach((part, i) => { part.position.y = Math.floor(i / 2) * .04 * amount; part.position.z = Math.sin(i) * .12 * amount; });
  });
  vesicles.scale.setScalar(compactScale);
  vesicles.rotation.z = spread * .15;
}

// Camera and specimen share one scroll-space pose during microscopy. A second
// easing pass on only the specimen causes it to slip as the camera magnifies it.
export function createSpecimenFraming({ root, moving }, camera, mobile = false) {
  const focus = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const units = mobile ? .6 : 1;
  return ({ pose, shell, scope, framing, time }) => {
    let distance = getCameraDistance(pose.camera, mobile, scope.magnification);
    if (shell.section > .01) {
      const fit = 8.6 * units / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
      distance += (Math.max(distance, fit) - distance) * shell.section;
    }
    camera.position.set(0, units * scope.cameraY, distance);
    // Retain ambient motion outside the instrument; a docked specimen is still.
    const ambient = 1 - scope.presence;
    // Native scroll is already eased. Follow it once for every chapter rather
    // than letting the root transform arrive after the camera and reading copy.
    const response = 1;
    root.rotation.y += (pose.yaw + Math.sin(time * .16) * .018 * ambient - root.rotation.y) * response;
    root.rotation.x += (.17 + Math.cos(time * .18) * .015 * ambient - root.rotation.x) * response;
    root.rotation.z += (pose.roll + Math.sin(time * .12) * .012 * ambient - root.rotation.z) * response;
    const low = Math.floor(pose.focus), high = Math.min(moving.length - 1, low + 1);
    focus.copy(moving[low].position).lerp(moving[high].position, pose.focus - low).applyEuler(root.rotation);
    const baseScale = units * scope.specimenScale * framing.scale;
    const visibleHeight = 2 * (distance - focus.z * baseScale) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const x = visibleHeight * camera.aspect * framing.x;
    const y = visibleHeight * framing.y;
    root.position.x += (x - focus.x * pose.isolate * baseScale - root.position.x) * response;
    root.position.y += (y + .04 * (1 - scope.docking) - scope.docking * 1.24 * units - focus.y * pose.isolate * baseScale + Math.sin(time * .35) * .02 * ambient - root.position.y) * response;
    root.scale.lerp(scale.setScalar(baseScale * (1 + Math.sin(time * .4) * .004 * ambient)), response);
    return { x, y, units };
  };
}

export function createCellScene(canvas, { mobile = false, onFailure, onCellFrame, onFactFrame }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.4 : 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, .1, 60);
  camera.position.set(0, 0, 10);
  scene.add(new THREE.AmbientLight('#dfcfb6', .85));
  const key = new THREE.DirectionalLight('#f7d2af', .75); key.position.set(2, 4, 7); scene.add(key);
  const model = createCellModel(mobile);
  const { root, exterior, membrane, mitos, er, golgi, vesicles, moving } = model;
  scene.add(root);
  const microscope = electronMicroscope(mobile); scene.add(microscope);
  let width = 1, height = 1, paused = false, disposed = false, frame = 0, last = 0, time = 0, hasRendered = false;
  let journey = { kind: 'intro', project: 0, local: 0, progress: 0, track: 0 };
  let explosion = 0;
  let pose = getCellPose(0);
  const frameSpecimen = createSpecimenFraming(model, camera, mobile);
  const projection = new THREE.Vector3();
  const otherProjection = new THREE.Vector3();
  const origin = new THREE.Vector3();
  const detailAnchor = new THREE.Vector3(.25, .17, .1);
  const cellCorner = new THREE.Vector3();
  const cellSurface = [];
  exterior.traverse(object => {
    if (object.isMesh) cellSurface.push({ object, positions: object.geometry.getAttribute('position') });
  });
  // Pick real membrane vertices for surface leaders, so their endpoints stay
  // on the faceted shell as it rotates, shrinks and enters the specimen dish.
  const factAnchors = exterior.children.map((half, i) => {
    const object = half.children[0];
    const positions = object.geometry.getAttribute('position');
    const target = new THREE.Vector3(i ? 1 : -1, i ? -1 : 1, 1.3);
    const point = new THREE.Vector3();
    let distance = Infinity, offset = new THREE.Vector3();
    for (let j = 0; j < positions.count; j++) {
      point.fromBufferAttribute(positions, j);
      if (point.distanceToSquared(target) < distance) { distance = point.distanceToSquared(target); offset.copy(point); }
    }
    return { object, offset };
  });
  const cutAnchors = [
    { object: exterior.children[0], offset: new THREE.Vector3(.024, .1, .05) },
    { object: exterior.children[1], offset: new THREE.Vector3(-.060, 1.30, -.5) },
  ];
  const primary = document.querySelector('#primary-annotation');
  const secondary = document.querySelector('#secondary-annotation');
  const primaryLine = document.querySelector('#primary-line');
  const secondaryLine = document.querySelector('#secondary-line');
  const anchorDot = document.querySelector('#anchor-dot');
  let labelMetrics = null;

  function measureLabels() {
    const frame = canvas.parentElement.getBoundingClientRect();
    const a = primary.getBoundingClientRect(), b = secondary.getBoundingClientRect();
    labelMetrics = { a: { left: a.left - frame.left, right: a.right - frame.left, y: a.top - frame.top + a.height / 2 }, b: { left: b.left - frame.left, right: b.right - frame.left, y: b.top - frame.top + b.height / 2 } };
  }
  function resize() {
    const frame = canvas.parentElement.getBoundingClientRect();
    width = Math.max(1, frame.width); height = Math.max(1, frame.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    measureLabels();
    // Opening a dialog removes the page scrollbar and resizes this canvas.
    // Resizing clears WebGL, so repaint the frozen scene even while paused.
    if (hasRendered) renderer.render(scene, camera);
  }
  function projectFocus(offset = origin) {
    const low = Math.floor(pose.focus), high = Math.min(moving.length - 1, low + 1);
    moving[low].localToWorld(projection.copy(offset));
    moving[high].localToWorld(otherProjection.copy(offset));
    projection.lerp(otherProjection, pose.focus - low).project(camera);
    return { x: (projection.x * .5 + .5) * width, y: (-projection.y * .5 + .5) * height };
  }
  function route(point, label, path) {
    const rightward = point.x < (label.left + label.right) / 2;
    const end = rightward ? label.left - 12 : label.right + 12;
    const elbow = end + (rightward ? -35 : 35);
    path.setAttribute('d', `M${point.x.toFixed(1)},${point.y.toFixed(1)} L${elbow.toFixed(1)},${label.y.toFixed(1)} L${end.toFixed(1)},${label.y.toFixed(1)}`);
  }
  function draw(now) {
    if (disposed) return;
    frame = requestAnimationFrame(draw);
    const dt = Math.min((now - last) / 1000 || 0, .05); last = now;
    // A dialog can open while the scene module is loading. Paint its initial
    // specimen once before honoring pause, so reading never freezes an empty canvas.
    if ((paused && hasRendered) || document.hidden) return;
    time += dt;
    // Native scrolling already eases the track. One pose drives both the
    // membrane and its contents, without a second lagging assembly animation.
    pose = getCellPose(journey.track || 0);
    const shell = getMembranePose(journey.track || 0);
    const scope = getMicroscopeState(journey.track || 0, mobile);
    const framing = getFramingPose(journey.track || 0, mobile);
    explosion = pose.spread;
    applyInteriorPose(model, pose);
    exterior.visible = shell.opacity > .001;
    exterior.children.forEach(half => {
      half.position.x = half.userData.sign * shell.separation * 1.65;
      half.rotation.y = half.userData.sign * shell.separation * .82;
      half.children[1].visible = shell.separation > .015;
      half.traverse(part => { if (part.material) part.material.opacity = shell.opacity; });
    });
    microscope.visible = scope.presence > .001;
    microscope.rotation.y = -.28;
    for (const entry of microscope.userData.materials) entry.material.opacity = entry.opacity * scope.presence * (1 - scope.magnification);
    moving.forEach((object, i) => {
      object.visible = pose.open > .015;
      object.traverse(part => {
        if (!part.material) return;
        if (part.userData.originalOpacity === undefined) {
          part.userData.originalOpacity = part.material.opacity;
          part.userData.originalColor = part.material.color.clone();
        }
        const focusWeight = clamp(1 - Math.abs(pose.focus - i));
        const emphasis = 1 - .88 * pose.isolate * (1 - focusWeight);
        const desired = part.userData.originalOpacity * emphasis * (1 - shell.section);
        part.material.opacity = desired;
        part.material.color.copy(part.userData.originalColor).lerp(copper, .55 * focusWeight);
      });
    });
    const membraneScale = 1 + explosion * .2;
    membrane.scale.setScalar(membraneScale);
    membrane.rotation.y = explosion * -.38;
    membrane.traverse(part => {
      if (!part.material) return;
      if (part.userData.originalOpacity === undefined) part.userData.originalOpacity = part.material.opacity;
      part.material.opacity = part.userData.originalOpacity * (.35 + .65 * pose.open) * (1 - pose.isolate * .84) * (1 - shell.opacity);
    });
    membrane.visible = pose.open > .01 && shell.opacity < .001;
    vesicles.visible = pose.open > .1 && shell.section < .9;
    vesicles.traverse(part => { if (part.material) part.material.opacity = .55 * (1 - pose.isolate * .9); });
    const { x, y, units } = frameSpecimen({ pose, shell, scope, framing, time });
    microscope.scale.setScalar(units);
    microscope.position.set(x, y - (1 - scope.presence) * 2.5 * units, 0);
    renderer.render(scene, camera);
    hasRendered = true;
    if (onFactFrame) {
      const cut = journey.factTarget === 'cut';
      onFactFrame((cut ? cutAnchors : factAnchors).map(({ object, offset }, i) => {
        object.localToWorld(projection.copy(offset));
        if (!cut) {
          moving[i + 1].localToWorld(otherProjection.copy(origin));
          projection.lerp(otherProjection, 1 - smooth(shell.opacity));
        }
        projection.project(camera);
        return { x: (projection.x * .5 + .5) * width, y: (-projection.y * .5 + .5) * height };
      }));
    }
    if (onCellFrame && journey.track >= 6.64) {
      // Project the actual shell, rather than a roomy world-space bounding box,
      // so the copy settles close beneath its silhouette on every viewport.
      let bottom = 0;
      for (const { object, positions } of cellSurface) {
        for (let i = 0; i < positions.count; i++) {
          cellCorner.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld).project(camera);
          bottom = Math.max(bottom, (-cellCorner.y * .5 + .5) * height);
        }
      }
      onCellFrame(bottom);
    }
    const annotationOpacity = smooth((pose.open - .25) / .5) * (1 - shell.section) * (1 - (journey.factOpacity || 0));
    primary.style.opacity = annotationOpacity;
    secondary.style.opacity = annotationOpacity * .85;
    primaryLine.style.opacity = annotationOpacity * .65;
    secondaryLine.style.opacity = annotationOpacity * .5;
    anchorDot.style.opacity = annotationOpacity;
    if (labelMetrics) {
      const p = projectFocus();
      route(p, labelMetrics.a, primaryLine);
      anchorDot.setAttribute('cx', p.x); anchorDot.setAttribute('cy', p.y);
      if (!mobile) {
        route(projectFocus(detailAnchor), labelMetrics.b, secondaryLine);
      }
    }
  }
  const labelObserver = new ResizeObserver(measureLabels); labelObserver.observe(primary); labelObserver.observe(secondary);
  const stageObserver = new ResizeObserver(resize); stageObserver.observe(canvas.parentElement);
  const contextLost = event => { event.preventDefault(); onFailure(); };
  canvas.addEventListener('webglcontextlost', contextLost);
  window.addEventListener('resize', resize);
  resize();
  root.position.set(0, .04, 0);
  moving.forEach(object => { object.visible = false; }); membrane.visible = false; vesicles.visible = false;
  let measuredScene = '';
  frame = requestAnimationFrame(draw);
  return {
    setJourney(value) { journey = value; const id = `${value.kind}-${value.project}`; if (id !== measuredScene) { measuredScene = id; measureLabels(); } },
    setPaused(value) { paused = value; },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); window.removeEventListener('resize', resize); labelObserver.disconnect(); stageObserver.disconnect(); canvas.removeEventListener('webglcontextlost', contextLost);
      scene.traverse(object => { object.geometry?.dispose(); if (Array.isArray(object.material)) object.material.forEach(m => m.dispose()); else object.material?.dispose(); });
      renderer.dispose();
    },
  };
}
