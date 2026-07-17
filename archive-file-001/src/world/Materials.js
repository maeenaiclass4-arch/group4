import * as THREE from 'three';

/**
 * Procedural canvas textures standing in for authored assets (GDD §14 —
 * this vertical slice proves the pipeline/mood before any art pipeline is
 * commissioned). Palette values are the material re-scoping of GDD §11's
 * dark wood / old brass / dark green / paper beige tokens.
 */

function canvas(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

function noiseFill(ctx, size, base, variance, alpha = 1) {
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * variance;
    img.data[i] = base[0] + n;
    img.data[i + 1] = base[1] + n;
    img.data[i + 2] = base[2] + n;
    img.data[i + 3] = 255 * alpha;
  }
  ctx.putImageData(img, 0, 0);
}

function woodTexture({ base = [58, 42, 28], stripe = [36, 25, 16], planks = 6 } = {}) {
  const size = 512;
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base.join(',')})`;
  ctx.fillRect(0, 0, size, size);
  noiseFill(ctx, size, base, 10);

  const plankH = size / planks;
  for (let i = 0; i < planks; i++) {
    ctx.strokeStyle = `rgba(${stripe.join(',')},0.6)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, i * plankH);
    ctx.lineTo(size, i * plankH);
    ctx.stroke();
    for (let g = 0; g < 40; g++) {
      const y = i * plankH + Math.random() * plankH;
      ctx.strokeStyle = `rgba(${stripe.join(',')},${0.05 + Math.random() * 0.08})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= size; x += 32) ctx.lineTo(x, y + (Math.random() - 0.5) * 6);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function marbleTexture({ base = [205, 195, 170], vein = [150, 138, 108] } = {}) {
  const size = 512;
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base.join(',')})`;
  ctx.fillRect(0, 0, size, size);
  noiseFill(ctx, size, base, 8);
  for (let i = 0; i < 14; i++) {
    ctx.strokeStyle = `rgba(${vein.join(',')},${0.15 + Math.random() * 0.2})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    let x = Math.random() * size;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < size) {
      x += (Math.random() - 0.5) * 60;
      y += 20 + Math.random() * 40;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function plasterTexture({ base = [70, 60, 48] } = {}) {
  const size = 256;
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base.join(',')})`;
  ctx.fillRect(0, 0, size, size);
  noiseFill(ctx, size, base, 14);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function paperTexture({ base = [222, 206, 168], lines = false } = {}) {
  const size = 512;
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base.join(',')})`;
  ctx.fillRect(0, 0, size, size);
  noiseFill(ctx, size, base, 6);
  ctx.fillStyle = 'rgba(120,95,60,0.08)';
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.ellipse(Math.random() * size, Math.random() * size, 30 + Math.random() * 60, 20 + Math.random() * 40, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  if (lines) {
    ctx.strokeStyle = 'rgba(80,60,40,0.25)';
    for (let y = 40; y < size; y += 34) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(size - 20, y);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function steelTexture({ base = [58, 62, 60] } = {}) {
  const size = 256;
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base.join(',')})`;
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 3) {
    ctx.strokeStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.05})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildMaterialLibrary() {
  const floorTex = marbleTexture();
  floorTex.repeat.set(6, 6);

  const woodPanelTex = woodTexture();
  woodPanelTex.repeat.set(2, 1.4);

  const plasterTex = plasterTexture();
  plasterTex.repeat.set(3, 2);

  const steelTex = steelTexture();
  steelTex.repeat.set(2, 2);

  return {
    floor: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.45, metalness: 0.05 }),
    woodPanel: new THREE.MeshStandardMaterial({ map: woodPanelTex, roughness: 0.7, metalness: 0.02 }),
    plaster: new THREE.MeshStandardMaterial({ map: plasterTex, roughness: 0.95, metalness: 0 }),
    steel: new THREE.MeshStandardMaterial({ map: steelTex, roughness: 0.55, metalness: 0.4, color: 0x565f5c }),
    brass: new THREE.MeshStandardMaterial({ color: 0xb98a44, roughness: 0.35, metalness: 0.85 }),
    brassDull: new THREE.MeshStandardMaterial({ color: 0x7a5c34, roughness: 0.55, metalness: 0.7 }),
    darkGreen: new THREE.MeshStandardMaterial({ color: 0x2c3826, roughness: 0.6, metalness: 0.05 }),
    paper: new THREE.MeshStandardMaterial({ map: paperTexture(), roughness: 0.9, metalness: 0, side: THREE.DoubleSide }),
    paperLined: new THREE.MeshStandardMaterial({ map: paperTexture({ lines: true }), roughness: 0.9, metalness: 0, side: THREE.DoubleSide }),
    glassFrosted: new THREE.MeshPhysicalMaterial({ color: 0xdfe6e0, roughness: 0.4, transmission: 0.55, thickness: 0.05, metalness: 0 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0x1c1712, roughness: 0.9 }),
    ink: new THREE.MeshStandardMaterial({ color: 0x14100b, roughness: 0.8 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x27301f, roughness: 0.55, metalness: 0.05 }),
  };
}
