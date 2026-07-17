import * as THREE from 'three';

/**
 * The Case 001 clue (GDD §8): a pinned photograph showing the desk from a
 * fixed overhead vantage, chair in its correct place. This is the entire
 * puzzle's solution — nothing about it is written as a number or a code,
 * only a picture the player has to actually look at and match.
 */
export function buildReferencePhotoTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  // sepia photo stock
  ctx.fillStyle = '#d9c7a0';
  ctx.fillRect(0, 0, size, size);
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    img.data[i] = 217 + n;
    img.data[i + 1] = 199 + n;
    img.data[i + 2] = 160 + n;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  const pad = 40;
  ctx.strokeStyle = 'rgba(60,45,25,0.6)';
  ctx.lineWidth = 6;
  ctx.strokeRect(pad, pad, size - pad * 2, size - pad * 2);

  // top-down schematic: desk as a fixed rectangle, chair rotated/offset to
  // its correct (target) arrangement — the exact solution to CHAIR_SLOTS
  // index CHAIR_SOLUTION_SLOT, expressed only as a picture.
  ctx.save();
  ctx.translate(size / 2, size / 2 + 20);
  ctx.scale(1, 1);

  // desk
  ctx.fillStyle = 'rgba(58,42,28,0.85)';
  ctx.fillRect(-90, -40, 180, 80);

  // chair, offset up-right and rotated — mirrors CHAIR_TARGET's relationship to the desk
  ctx.save();
  ctx.translate(120, 110);
  ctx.rotate(2.35);
  ctx.fillStyle = 'rgba(39,48,31,0.85)';
  ctx.fillRect(-28, -28, 56, 56);
  ctx.fillStyle = 'rgba(39,48,31,0.6)';
  ctx.fillRect(-28, -34, 56, 10);
  ctx.restore();

  ctx.restore();

  ctx.fillStyle = 'rgba(40,30,18,0.7)';
  ctx.font = 'italic 22px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('— as it was left —', size / 2, size - 70);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
