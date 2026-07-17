/**
 * Subtle intensity flicker for practical lamps — layered sine waves rather
 * than pure noise, so it reads as an old, slightly unsteady electric bulb
 * rather than a strobing effect. Sunlight/skylight and the deliberate
 * world-response lamp are intentionally left untagged (steady = "on").
 */
export function tagFlicker(light, { amount = 0.1, speed = 1 } = {}) {
  light.userData.flicker = true;
  light.userData.baseIntensity = light.intensity;
  light.userData.flickerAmount = amount;
  light.userData.flickerSpeed = speed;
  light.userData.flickerSeed = Math.random() * Math.PI * 2;
  return light;
}

export function updateFlicker(root, t) {
  root.traverse((obj) => {
    if (!obj.userData?.flicker) return;
    const { baseIntensity, flickerAmount, flickerSpeed, flickerSeed } = obj.userData;
    const wobble =
      Math.sin(t * 1.7 * flickerSpeed + flickerSeed) * 0.6 +
      Math.sin(t * 4.3 * flickerSpeed + flickerSeed * 2) * 0.3 +
      Math.sin(t * 11 * flickerSpeed + flickerSeed * 3) * 0.1;
    obj.intensity = Math.max(0, baseIntensity * (1 + wobble * flickerAmount));
  });
}
