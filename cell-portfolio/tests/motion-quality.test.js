import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCellModel, applyInteriorPose } from '../src/scene.js';
import { getCellPose } from '../src/choreography.js';
import { advanceScroll } from '../src/scroll.js';

test('rendered organelles never concentrate most of a full reveal or closure into 100ms', t => {
  const model = createCellModel();
  const transitions = [[.32,.95],[2.48,2.92],[3.36,3.70],[3.78,4.12],[4.20,4.60],[5.54,5.92],[6.02,6.56],[6.64,7]];
  let worst = 0;
  for (const fps of [60,120]) for (const interval of transitions) for (const [start,end] of [interval,[...interval].reverse()]) {
    applyInteriorPose(model,getCellPose(start));
    const first = model.moving.map(part=>part.position.clone());
    applyInteriorPose(model,getCellPose(end));
    const last = model.moving.map(part=>part.position.clone());
    let pixels = 0, previous = first;
    const pixelsPerChapter = 900;
    // Deliberately large impulse traverses the whole transition. Sample the
    // actual shared renderer transforms, including packing and disassembly.
    for (let frame=0;frame<fps*2;frame++) {
      pixels=advanceScroll(pixels,(end-start+Math.sign(end-start)*.02)*pixelsPerChapter,1/fps);
      const track=start+pixels/pixelsPerChapter;
      applyInteriorPose(model,getCellPose(track));
      if ((frame+1)%(fps/10)) continue;
      const current=model.moving.map(part=>part.position.clone());
      for (let i=0;i<current.length;i++) {
        const total=first[i].distanceTo(last[i]);
        if (total<1e-6) continue;
        const fraction=current[i].distanceTo(previous[i])/total;
        worst=Math.max(worst,fraction);
        assert.ok(fraction<.5,`${start}–${end}: organelle ${i} moved ${(fraction*100).toFixed(1)}% in 100ms`);
      }
      previous=current;
    }
  }
  t.diagnostic(`Largest rendered 100ms movement: ${(worst*100).toFixed(1)}% of its transition`);
  const geometries=new Set(),materials=new Set();
  model.root.traverse(part=>{if(part.geometry)geometries.add(part.geometry);if(part.material)materials.add(part.material);});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
});
