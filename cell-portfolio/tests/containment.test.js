import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createCellModel, applyInteriorPose } from '../src/scene.js';
import { getCellPose, getMembranePose } from '../src/choreography.js';

function membranePlanes(model) {
  const planes = [];
  for (const half of model.exterior.children) {
    const positions = half.children[0].geometry.attributes.position;
    for (let i = 0; i < positions.count; i += 3) {
      const points = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(positions, i + j));
      const plane = new THREE.Plane().setFromCoplanarPoints(...points);
      if (plane.normal.lengthSq() < .5) continue;
      if (plane.constant > 0) plane.negate();
      planes.push(plane);
    }
  }
  return planes;
}
function clearance(model, planes) {
  model.root.updateMatrixWorld(true);
  const inverse = model.root.matrixWorld.clone().invert();
  let nearest = Infinity, vertices = 0;
  for (const group of [...model.moving, model.vesicles]) group.traverse(part => {
    if (!part.geometry) return;
    const transform = inverse.clone().multiply(part.matrixWorld);
    const positions = part.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const point = new THREE.Vector3().fromBufferAttribute(positions, i).applyMatrix4(transform);
      for (const plane of planes) nearest = Math.min(nearest, -plane.distanceToPoint(point));
      vertices++;
    }
  });
  assert.ok(vertices > 1000, 'audit the actual mesh and line geometry');
  return nearest;
}
function dispose(model) {
  const geometries = new Set(), materials = new Set();
  model.root.traverse(part => { if (part.geometry) geometries.add(part.geometry); if (part.material) materials.add(part.material); });
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
}

test('contents finish packing before any reconstruction membrane closes, in either direction', () => {
  for (let i = 1700; i <= 8000; i++) {
    const track = i / 1000, pose = getCellPose(track), shell = getMembranePose(track);
    if (shell.opacity > .001) assert.equal(pose.assembly, 0, `unpacked contents at ${track}`);
  }
});
for (const mobile of [false, true]) test(`${mobile ? 'phone' : 'desktop'} actual organelle geometry fits inside every closed membrane`, () => {
  const model = createCellModel(mobile), planes = membranePlanes(model);
  // Exercise every reconstruction, plus reverse-to-intro. Start each audit
  // from a different exploded state to catch stale transforms after fast jumps.
  const pairs = [[2.3, 2.92], [3.74, 4.12], [5.4, 5.92], [6.6, 7], [7.8, .15]];
  for (const [before, closed] of [...pairs, ...pairs.toReversed().map(([a, b]) => [a + .02, b + .01])]) {
    applyInteriorPose(model, getCellPose(before));
    applyInteriorPose(model, getCellPose(closed));
    const gap = clearance(model, planes);
    assert.ok(gap >= .12, `contents breach membrane at ${closed}: clearance ${gap}`);
  }
  dispose(model);
});
