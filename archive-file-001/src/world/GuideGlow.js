import * as THREE from 'three';

const BREATHE_PERIOD = 2.6;
const FADE_SPEED = 1.5;

/**
 * A soft, slowly-breathing point light attached to whichever object matters
 * right now (GDD pillar: discoverable, not instructed) — the case room has
 * no arrows or glowing outlines, just a warm light quietly finding the next
 * thing worth touching. setActive() fades it in/out rather than snapping,
 * so a player who isn't looking that way never sees anything switch on.
 */
export function createGuideGlow(target, { color = 0xffcf94, peak = 2, distance = 1.3, offset = [0, 0.3, 0] } = {}) {
  const light = new THREE.PointLight(color, 0, distance, 2);
  light.position.set(...offset);
  target.add(light);

  let active = false;
  let level = 0;

  return {
    setActive(isActive) {
      active = isActive;
    },
    update(dt, elapsed) {
      const targetLevel = active ? 1 : 0;
      level += (targetLevel - level) * Math.min(1, dt * FADE_SPEED);
      if (level < 0.001) {
        light.intensity = 0;
        return;
      }
      const breathe = 0.55 + 0.45 * Math.sin((elapsed * Math.PI * 2) / BREATHE_PERIOD);
      light.intensity = level * breathe * peak;
    },
  };
}
