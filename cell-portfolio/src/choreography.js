import { clamp } from './model.js';

// Each stop is a position in the document, not elapsed time. Reversing native
// scrolling therefore retraces the same path, including every reconstruction.
// x is the specimen's screen offset; camera passes inside the original membrane.
// Zero velocity and acceleration at each hold: no kick into or out of a reveal.
export function cushion(value) {
  const t = clamp(value);
  if (t < 1e-12) return 0;
  if (1 - t < 1e-12) return 1;
  return clamp(t * t * t * (t * (t * 6 - 15) + 10));
}
const stops = [
  [0,    10.4, 0,    0,    0, .17, 0,    0, -.35, .12],
  [.32,  10.4, 0,    0,    0, .17, 0,    0, -.35, .12],
  [.95, 11.3,  1,    .08,  0, 0,   0,   0, -.18, .04],
  [1.30,11.3,  1,    .08,  0, 0,   0,   0, -.18, .04],
  [1.64, 1.12, 1,    .5,   0, 0,   .65, 0,  .12, -.12],
  [2.24, 3.25, 1,    1.05, 1,-.19, 1,   1, -.12, -.45],
  [2.48, 3.25, 1,    1.05, 1,-.19, 1,   1, -.12, -.45],
  [2.92, 9.0,  0,    0,    0, 0,   0,   0,  .45,  .12],
  [3.0,  9.0,  0,    0,    0, 0,   0,   0,  .45,  .12],
  [3.26,10.6,  0,    0,    0, 0,   0,   0,  0,    0],
  [3.36,10.6,  0,    0,    0, 0,   0,   0,  0,    0],
  [3.70, .82,  1,    .9,   2, .1, .55, .3, .3,   .1],
  [3.78, .82,  1,    .9,   2, .1, .55, .3, .3,   .1],
  [4.12, 8.8,  0,    0,    0, 0,   0,   0, -.55,  0],
  [4.20, 8.8,  0,    0,    0, 0,   0,   0, -.55,  0],
  [4.60, 2.65, 1,    1.35, 3,-.17, 1,  .85, -.55, -.28],
  [4.80, 2.65, 1,    1.35, 3,-.17, 1,  .85, -.55, -.28],
  [5.28, 3.6,  1,    1.5,  4, .18, 1,   1, -.25, -.3],
  [5.54, 4.9,  1,    1.9,  4, .12, .9,  1,  .2,  -.15],
  [5.92, 8.7,  0,    0,    0, 0,   0,   0,  .5,   .1],
  [6.02, 8.7,  0,    0,    0, 0,   0,   0,  .5,   .1],
  [6.56, 3.4,  1,    1.3,  6,-.19, 1,   1,  .3,   .1],
  [6.64, 3.4,  1,    1.3,  6,-.19, 1,   1,  .3,   .1],
  [7.0, 10.4,  0,    0,    0, .17, 0,   0, -.35,  .12],
  [8,   10.4,  0,    0,    0, .17, 0,   0, -.35,  .12],
];
const keys = ['camera', 'open', 'spread', 'focus', 'x', 'isolate', 'split', 'yaw', 'roll'];
export const CHAPTER_STUDIES = Object.freeze({ intro: 0, projects: 2.24, 'project-2': 3.70, 'project-3': 4.60, experience: 5.28, academics: 6.56, contact: 7 });
// The ruler changes chapter when its reading begins, including the Contact
// reveal during reconstruction, rather than waiting for the next DOM section.
export const CHAPTER_STARTS = Object.freeze({ intro: 0, projects: 1.4, experience: 5.04, academics: 6.02, contact: 6.64 });
export function getChapterRanges(sections, viewport, maximum) {
  const starts = Object.entries(CHAPTER_STARTS).map(([id, track]) => ({ id, start: getScrollPosition(sections, track, viewport) }));
  return starts.map((start, i) => ({ ...start, end: starts[i + 1]?.start ?? maximum }));
}
export function getContactProgress(track) {
  return cushion((track - 6.64) / .36);
}
export function getCameraDistance(distance, mobile = false, magnification = 0) {
  if (!mobile) return distance;
  // A soft lower bound avoids the velocity snap of Math.max at phone framing.
  const framed = 5.4 + .55 * Math.log1p(Math.exp((distance * 1.12 - 5.4) / .55));
  return framed + (distance * .7 - framed) * clamp(magnification);
}
export function getCellPose(track) {
  const position = clamp(track, 0, 8);
  let i = 0;
  while (i < stops.length - 2 && position > stops[i + 1][0]) i++;
  const a = stops[i], b = stops[i + 1];
  const progress = clamp((position - a[0]) / (b[0] - a[0]));
  const t = cushion(progress);
  const opening = b[2] > a[2], closing = b[2] < a[2];
  // Phase raw scroll once for each physical stage. Never ease an already-eased
  // openness again: that concentrates organelle movement into a late burst.
  const interior = opening ? cushion((progress - .20) / .80) : closing ? cushion(progress / .80) : t;
  const shell = opening ? cushion(progress / .20) : closing ? cushion((progress - .80) / .20) : t;
  const pose = Object.fromEntries(keys.map((key, j) => {
    const from = a[j + 1], to = b[j + 1];
    if (key === 'camera') return [key, from === to || t === 0 ? from : t === 1 ? to : 1 / ((1 - t) / from + t / to)];
    const fraction = ['spread', 'isolate', 'split'].includes(key) ? interior : t;
    return [key, from + (to - from) * fraction];
  }));
  pose.assembly = a[2] + (b[2] - a[2]) * interior;
  pose.shell = a[2] + (b[2] - a[2]) * shell;
  return pose;
}
export function getMembranePose(track) {
  const pose = getCellPose(track);
  if (track < 1.7) {
    const separation = cushion((track - .32) / .63);
    const departure = cushion((track - 1.30) / .34);
    return { separation: separation * (1 + departure * .6), opacity: 1 - departure, section: separation * (1 - departure) };
  }
  const opening = pose.shell;
  return { separation: opening * .9, opacity: 1 - opening, section: 0 };
}
export function getMicroscopeState(track, mobile = false) {
  const docking = cushion((track - 2.96) / .30) * (1 - cushion((track - 3.82) / .32));
  const magnification = cushion((track - 3.36) / .34) * (1 - cushion((track - 3.78) / .34));
  const distance = getCameraDistance(getCellPose(track).camera, mobile, magnification);
  const far = getCameraDistance(track <= 3.78 ? 10.6 : 8.8, mobile);
  const imaging = cushion((track - 3.26) / .10) * (1 - cushion((track - 4) / .14));
  return {
    presence: cushion((track - 2.90) / .36) * (1 - cushion((track - 3.82) / .32)),
    docking,
    specimenScale: 1 - docking * .945,
    magnification,
    // Aim in projected space: linear camera-height movement with reciprocal
    // zoom sends the tiny specimen below the field halfway through the approach.
    cameraY: magnification > 0 ? -1.24 * (1 - (1 - magnification) * distance / far) : 0,
    imaging,
    electron: imaging > 0,
  };
}
// Copy and illustration sample one timeline, including the imaging palette.
export function getChapterVisibility(track, id) {
  if (id === 'intro') return 1 - cushion((track - .55) / .40);
  if (id === 'project-2') return getMicroscopeState(track).imaging;
  const windows = {
    projects: [CHAPTER_STARTS.projects, 2.0, 2.58, 2.92],
    'project-3': [4.14, 4.48, 4.72, 5.04],
    experience: [CHAPTER_STARTS.experience, 5.28, 5.64, 5.92],
    academics: [CHAPTER_STARTS.academics, 6.32, 6.64, 7],
    contact: [CHAPTER_STARTS.contact, 6.84],
  };
  const window = windows[id];
  if (!window) return 1;
  const [start, visible, end, hidden] = window;
  return cushion((track - start) / (visible - start)) * (hidden === undefined ? 1 : 1 - cushion((track - end) / (hidden - end)));
}
export function getFunFactState(track) {
  const windows = [
    { start: .72, visible: .96, end: 1.30, hidden: 1.44, facts: [0, 1], target: 'cut' },
    { start: 2.62, visible: 2.90, end: 3.16, hidden: 3.30, facts: [2, 3], target: 'surface' },
    { start: 4.0, visible: 4.12, end: 4.20, hidden: 4.40, facts: [4, 5], target: 'surface' },
    { start: 5.70, visible: 5.92, end: 6.02, hidden: 6.30, facts: [6, 7], target: 'surface' },
  ];
  const window = windows.find(w => track >= w.start && track <= w.hidden);
  if (!window) return { opacity: 0, facts: [], target: 'surface' };
  const reading = Math.max(...Object.keys(CHAPTER_STUDIES).map(id => getChapterVisibility(track, id)));
  const opacity = cushion((track - window.start) / (window.visible - window.start)) * (1 - cushion((track - window.end) / (window.hidden - window.end))) * (1 - reading);
  return { opacity, facts: window.facts, target: window.target };
}
// Screen framing is authored in scroll space, never changed by chapter CSS.
// Columns may change sides while this one continuous stage stays fixed.
const framing = [
  [0,.23,0,.27], [.32,.23,0,.27], [.95,0,0,0], [1.30,0,0,0],
  [2.24,-.23,0,.27], [2.48,-.23,0,.27], [2.92,-.18,0,.27],
  [3.26,.23,.02,.27], [3.78,.23,.02,.27], [4.14,.04,0,.27],
  [4.60,-.23,0,.27], [4.80,-.23,0,.27],
  [5.28,.23,.02,.27], [5.54,.23,.02,.27], [5.92,.15,0,.27],
  [6.56,.23,.02,.27], [6.64,.23,.02,.27],
  [7,0,.27,.31], [8,0,.27,.31],
];
export function getFramingPose(track, mobile = false) {
  const position = clamp(track, 0, 8);
  let i = 0;
  while (i < framing.length - 2 && position > framing[i + 1][0]) i++;
  const a = framing[i], b = framing[i + 1], t = cushion((position - a[0]) / (b[0] - a[0]));
  return { x: mobile ? 0 : a[1] + (b[1] - a[1]) * t, y: a[mobile ? 3 : 2] + (b[mobile ? 3 : 2] - a[mobile ? 3 : 2]) * t, scale: 1 - cushion((position - 6.64) / .36) * (mobile ? .18 : .48) };
}
export function getScrollTrack(sections, scroll, viewport) {
  const anchors = sections.map((s, i) => i ? Math.max(0, s.top - viewport * .18) : 0);
  let i = 0;
  while (i < anchors.length - 1 && scroll >= anchors[i + 1]) i++;
  const end = anchors[i + 1] ?? (sections[i].top + sections[i].height - viewport * .3);
  return i + clamp((scroll - anchors[i]) / Math.max(1, end - anchors[i]));
}
export function getScrollPosition(sections, track, viewport) {
  if (!sections.length) return 0;
  const position = clamp(track, 0, sections.length);
  const i = Math.min(Math.floor(position), sections.length - 1);
  const start = i ? Math.max(0, sections[i].top - viewport * .18) : 0;
  const end = sections[i + 1] ? Math.max(0, sections[i + 1].top - viewport * .18) : sections[i].top + sections[i].height - viewport * .3;
  return start + (end - start) * (position - i);
}
