// Separate from reading annotations: these only occupy the quiet passages.
export function createFactCallouts(stage, facts) {
  const overlay = document.createElement('div');
  overlay.className = 'fact-callouts';
  overlay.innerHTML = '<svg class="fact-lines"><path/><circle r="3"/><path/><circle r="3"/></svg><span class="fact-label fact-label-a"></span><span class="fact-label fact-label-b"></span>';
  stage.append(overlay);
  const labels = [...overlay.querySelectorAll('.fact-label')];
  const paths = [...overlay.querySelectorAll('path')];
  const dots = [...overlay.querySelectorAll('circle')];
  let metrics = [];
  let visible = false;
  function measure() {
    metrics = labels.map(label => label.getBoundingClientRect());
  }
  const observer = new ResizeObserver(measure);
  labels.forEach(label => observer.observe(label));
  window.addEventListener('resize', measure);
  return {
    setState(state, reduced = false) {
      let changed = overlay.dataset.target !== state.target;
      overlay.dataset.target = state.target;
      visible = state.opacity > .001 && state.facts.every(index => facts[index]);
      overlay.style.opacity = reduced ? Number(state.opacity >= .5) : state.opacity;
      overlay.style.visibility = visible ? 'visible' : 'hidden';
      state.facts.forEach((index, i) => {
        if (labels[i].textContent !== facts[index]) { labels[i].textContent = facts[index] || ''; changed = true; }
      });
      if (changed) measure();
    },
    setPoints(points) {
      if (!visible || metrics.length !== 2) return;
      points.forEach((point, i) => {
        const onScreen = point.x >= 0 && point.x <= window.innerWidth && point.y >= 0 && point.y <= window.innerHeight;
        for (const element of [labels[i], paths[i], dots[i]]) element.style.opacity = Number(onScreen);
        if (!onScreen) return;
        const label = metrics[i];
        const rightward = point.x < (label.left + label.right) / 2;
        const end = rightward ? label.left - 10 : label.right + 10;
        const y = label.top + label.height / 2;
        paths[i].setAttribute('d', `M${point.x.toFixed(1)},${point.y.toFixed(1)} L${end + (rightward ? -24 : 24)},${y} L${end},${y}`);
        dots[i].setAttribute('cx', point.x);
        dots[i].setAttribute('cy', point.y);
      });
    },
    dispose() { observer.disconnect(); window.removeEventListener('resize', measure); overlay.remove(); },
  };
}
