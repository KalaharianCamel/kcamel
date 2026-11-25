import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createCellModel, applyInteriorPose, createSpecimenFraming } from '../src/scene.js';
import { getCellPose, getMembranePose, getMicroscopeState, getFramingPose, getCameraDistance } from '../src/choreography.js';

function specimen(mobile) {
  const model = createCellModel(mobile);
  const camera = new THREE.PerspectiveCamera(37, mobile ? 390 / 844 : 1440 / 900, .1, 60);
  const frame = createSpecimenFraming(model, camera, mobile);
  return (track, time, fps) => {
    const pose = getCellPose(track);
    applyInteriorPose(model, pose);
    frame({ pose, shell: getMembranePose(track), scope: getMicroscopeState(track, mobile), framing: getFramingPose(track, mobile), time, damping: 1 - Math.exp(-5 / fps) });
    model.root.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    // Track actual projected anatomy, not only the authored scalar keyframes.
    const points = [model.root, ...model.moving].map(object => object.getWorldPosition(new THREE.Vector3()).project(camera).toArray());
    return [...points.flat(), ...model.root.matrixWorld.elements];
  };
}

for (const mobile of [false, true]) {
  test(`${mobile ? 'phone' : 'desktop'} every chapter reaches the camera pose without a second transform delay`, () => {
    const forward = specimen(mobile), reverse = specimen(mobile);
    for (let i = 0; i <= 80; i++) forward(i / 10, i / 60, 60);
    for (let i = 80; i >= 0; i--) reverse(i / 10, i / 30, 30);
    for (const track of [.5,1.1,1.6,2.24,3.3,3.7,4.88,5.28,5.54,6.56,6.9,7.2]) {
      const a = forward(track, 10, 60), b = reverse(track, 10, 30);
      a.forEach((value, i) => assert.ok(Math.abs(value - b[i]) < 1e-9, `chapter framing lags at ${track}`));
    }
  });

  test(`${mobile ? 'phone' : 'desktop'} microscope camera keeps the tiny specimen in the field throughout magnification`, () => {
    const start = -1.24 / getCameraDistance(10.6, mobile);
    let previous = start;
    for (let i = 0; i <= 100; i++) {
      const track = 3.36 + .34 * i / 100;
      const scope = getMicroscopeState(track, mobile);
      const distance = getCameraDistance(getCellPose(track).camera, mobile, scope.magnification);
      const vertical = (-1.24 - scope.cameraY) / distance;
      assert.ok(vertical >= previous - 1e-10, `specimen drops out of the field at ${track}`);
      assert.ok(vertical >= start - 1e-10 && vertical <= 1e-10);
      previous = vertical;
    }
    assert.ok(Math.abs(previous) < 1e-10);
  });

  test(`${mobile ? 'phone' : 'desktop'} microscope zoom has no transform lag when reversing or changing frame rate`, () => {
    const forward = specimen(mobile), reverse = specimen(mobile), direct = specimen(mobile);
    for (let i = 0; i <= 30; i++) forward(2.9 + .35 * i / 30, i / 60, 60);
    for (let i = 0; i <= 30; i++) reverse(4.2 - .41 * i / 30, i / 30, 30);
    for (let i = 0; i <= 52; i++) {
      const track = 3.26 + .52 * i / 52;
      const expected = direct(track, 0, 120);
      for (const actual of [forward(track, 10 + i / 60, 60), reverse(track, 100 + i / 30, 30)]) {
        expected.forEach((value, j) => assert.ok(Math.abs(value - actual[j]) < 1e-9, `projected specimen slips at track ${track}, coordinate ${j}`));
      }
    }
  });

  test(`${mobile ? 'phone' : 'desktop'} docked specimen stays still at every microscope zoom position`, () => {
    const render = specimen(mobile);
    for (const track of [3.26, 3.36, 3.42, 3.55, 3.7, 3.78]) {
      const expected = render(track, 0, 60);
      for (const time of [.25, 1, 10, 100]) {
        render(track, time, 30).forEach((value, i) => assert.ok(Math.abs(value - expected[i]) < 1e-9, `ambient drift at ${track}`));
      }
    }
  });
}
