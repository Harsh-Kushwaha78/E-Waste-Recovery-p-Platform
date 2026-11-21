// frontend/src/components/hero3d/proceduralAssets.js
// Procedural textures, materials, and geometries for the 3D E-Waste Motherboard & Components.
// Zero external asset downloads required — fast, lightweight, and reliable.

import * as THREE from "three";

// 1. Procedural Circuit Board Texture Generator
export function createCircuitTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Base PCB substrate (rich dark charcoal with subtle deep emerald hue)
  ctx.fillStyle = "#09120e";
  ctx.fillRect(0, 0, size, size);

  // Subtle fiberglass weave pattern
  ctx.strokeStyle = "rgba(16, 38, 28, 0.4)";
  ctx.lineWidth = 1;
  const step = 8;
  for (let x = 0; x < size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y < size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Circuit trace buses (gold and glowing lime-green traces)
  function drawTrace(points, strokeColor, width = 2) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();

    // Solder pads / vias at endpoints
    const end = points[points.length - 1];
    ctx.fillStyle = "#eab308"; // gold pad
    ctx.beginPath();
    ctx.arc(end[0], end[1], width * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#09120e"; // drill hole
    ctx.beginPath();
    ctx.arc(end[0], end[1], width * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw intricate data bus lines radiating from CPU area
  const goldColor = "rgba(234, 179, 8, 0.65)";
  const greenTrace = "rgba(163, 230, 53, 0.55)";
  const copperTrace = "rgba(180, 110, 50, 0.45)";

  const seedPoints = [
    // CPU to RAM bus lines
    [[512, 450], [512, 350], [680, 350], [680, 200]],
    [[525, 450], [525, 360], [700, 360], [700, 200]],
    [[538, 450], [538, 370], [720, 370], [720, 200]],
    [[500, 450], [500, 340], [660, 340], [660, 200]],
    // CPU to PCIe bus lines
    [[450, 550], [350, 650], [250, 650], [250, 750]],
    [[465, 550], [365, 650], [270, 650], [270, 750]],
    [[480, 550], [380, 650], [290, 650], [290, 750]],
    // Chipset / M.2 traces
    [[550, 550], [650, 650], [750, 650], [750, 800]],
    [[565, 550], [665, 650], [770, 650], [770, 800]],
    [[420, 500], [300, 500], [220, 420], [150, 420]],
    [[420, 480], [300, 480], [220, 400], [150, 400]],
    // Power delivery traces
    [[480, 400], [480, 300], [400, 220], [320, 220]],
    [[460, 400], [460, 300], [380, 220], [300, 220]],
    [[440, 400], [440, 300], [360, 220], [280, 220]],
  ];

  seedPoints.forEach((pts, i) => {
    const col = i % 3 === 0 ? greenTrace : i % 3 === 1 ? goldColor : copperTrace;
    drawTrace(pts, col, 2.5);
  });

  // Array of surface mount test points & solder pads
  ctx.fillStyle = "rgba(234, 179, 8, 0.8)";
  for (let i = 0; i < 90; i++) {
    const rx = (i * 73) % (size - 100) + 50;
    const ry = (i * 127) % (size - 100) + 50;
    ctx.fillRect(rx, ry, 3, 3);
  }

  // Silkscreen text
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.font = "bold 13px monospace";
  ctx.fillText("ECYCLE RECOVERY PLATFORM — PCB REV 3.8", 60, 80);
  ctx.fillText("CIRCULAR HARVESTING ARCHITECTURE", 60, 100);
  ctx.fillText("DDR5_SLOT_0", 670, 185);
  ctx.fillText("PCIe 4.0 x16 RECLAIM", 220, 740);
  ctx.fillText("NVMe M.2 RECOVERY BUS", 650, 640);
  ctx.fillText("GND", 950, 950);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
  return texture;
}

// 2. Chip / Integrated Circuit Texture
export function createChipTexture(title, subtitle) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Dark matte molded package
  ctx.fillStyle = "#141416";
  ctx.fillRect(0, 0, size, size);

  // Subtle beveled perimeter
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, size - 20, size - 20);

  // Center silicon die window (reflective dark slate)
  const dieSize = 260;
  const dieOffset = (size - dieSize) / 2;
  ctx.fillStyle = "#0c1813";
  ctx.fillRect(dieOffset, dieOffset, dieSize, dieSize);

  // Silver laser-etched markings
  ctx.fillStyle = "#a3e635";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title || "ECYCLE-X1", size / 2, dieOffset + 90);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "16px monospace";
  ctx.fillText(subtitle || "RECOVERABLE SILICON", size / 2, dieOffset + 130);

  ctx.fillStyle = "rgba(163, 230, 53, 0.6)";
  ctx.font = "12px monospace";
  ctx.fillText("DIAGNOSTIC PASSED · 98% HEALTH", size / 2, dieOffset + 165);

  // Gold pin 1 indicator circle
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.arc(36, 36, 10, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

// 3. Glowing Particle Texture
export function createGlowParticleTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(217, 249, 157, 1)"); // Bright lime center
  gradient.addColorStop(0.25, "rgba(163, 230, 53, 0.8)"); // Vivid green
  gradient.addColorStop(0.6, "rgba(16, 185, 129, 0.35)"); // Emerald glow
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)"); // Transparent edge

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 4. Central Motherboard Model Generator
export function createMotherboard() {
  const group = new THREE.Group();

  // Materials
  const pcbTexture = createCircuitTexture();
  const boardMaterial = new THREE.MeshStandardMaterial({
    map: pcbTexture,
    roughness: 0.55,
    metalness: 0.25,
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.25,
    metalness: 0.9,
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.3,
    metalness: 0.85,
  });

  const darkAlumMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e2923,
    roughness: 0.35,
    metalness: 0.75,
  });

  const blackPlasticMaterial = new THREE.MeshStandardMaterial({
    color: 0x111613,
    roughness: 0.7,
    metalness: 0.1,
  });

  const glowGreenMaterial = new THREE.MeshStandardMaterial({
    color: 0xa3e635,
    emissive: 0x84cc16,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.5,
  });

  // Main PCB Substrate (Scale: ~5.6 width x 0.12 thick x 5.6 depth)
  const boardGeo = new THREE.BoxGeometry(5.6, 0.12, 5.6);
  const boardMesh = new THREE.Mesh(boardGeo, boardMaterial);
  boardMesh.castShadow = true;
  boardMesh.receiveShadow = true;
  group.add(boardMesh);

  // 4 Corner Gold Mounting Rings
  const ringGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.14, 16);
  const ringOffsets = [
    [-2.5, -2.5],
    [2.5, -2.5],
    [-2.5, 2.5],
    [2.5, 2.5],
  ];
  ringOffsets.forEach(([rx, rz]) => {
    const ring = new THREE.Mesh(ringGeo, goldMaterial);
    ring.position.set(rx, 0, rz);
    group.add(ring);
  });

  // --- CPU Socket & Heatsink System ---
  const socketGeo = new THREE.BoxGeometry(1.9, 0.14, 1.9);
  const socketMesh = new THREE.Mesh(socketGeo, darkAlumMaterial);
  socketMesh.position.set(-0.4, 0.1, -0.4);
  group.add(socketMesh);

  // CPU Integrated Heat Spreader (IHS)
  const ihsGeo = new THREE.BoxGeometry(1.3, 0.18, 1.3);
  const ihsMesh = new THREE.Mesh(ihsGeo, metalMaterial);
  ihsMesh.position.set(-0.4, 0.18, -0.4);
  group.add(ihsMesh);

  // CPU Core Glowing Silicon Ring
  const coreRingGeo = new THREE.TorusGeometry(0.35, 0.04, 16, 32);
  const coreRing = new THREE.Mesh(coreRingGeo, glowGreenMaterial);
  coreRing.rotation.x = Math.PI / 2;
  coreRing.position.set(-0.4, 0.28, -0.4);
  group.add(coreRing);

  // Aluminum Cooling Fin Array (Heatsink on the power delivery VRM)
  const vrmHeatsinkGeo = new THREE.BoxGeometry(0.6, 0.55, 2.4);
  const vrmHeatsink = new THREE.Mesh(vrmHeatsinkGeo, darkAlumMaterial);
  vrmHeatsink.position.set(-1.8, 0.32, -0.4);
  group.add(vrmHeatsink);

  // Thin cooling fin ridges on the VRM
  for (let f = -1.0; f <= 1.0; f += 0.25) {
    const finGeo = new THREE.BoxGeometry(0.55, 0.08, 0.08);
    const fin = new THREE.Mesh(finGeo, metalMaterial);
    fin.position.set(-1.8, 0.55, -0.4 + f);
    group.add(fin);
  }

  // --- Dual RAM DIMM Slots ---
  const ramSlotOffsets = [1.2, 1.6];
  ramSlotOffsets.forEach((xPos) => {
    // Slot socket
    const slotGeo = new THREE.BoxGeometry(0.2, 0.22, 3.2);
    const slotMesh = new THREE.Mesh(slotGeo, blackPlasticMaterial);
    slotMesh.position.set(xPos, 0.14, -0.3);
    group.add(slotMesh);

    // Gold contact pins inside slot
    const contactsGeo = new THREE.BoxGeometry(0.04, 0.24, 2.9);
    const contacts = new THREE.Mesh(contactsGeo, goldMaterial);
    contacts.position.set(xPos, 0.16, -0.3);
    group.add(contacts);

    // White retention latch clips at each end
    [-1.6, 1.6].forEach((zEnd) => {
      const latchGeo = new THREE.BoxGeometry(0.22, 0.3, 0.16);
      const latch = new THREE.Mesh(latchGeo, metalMaterial);
      latch.position.set(xPos, 0.2, -0.3 + zEnd);
      group.add(latch);
    });
  });

  // --- PCIe x16 Steel-Shielded Expansion Slot ---
  const pcieSlotGeo = new THREE.BoxGeometry(3.6, 0.26, 0.28);
  const pcieSlot = new THREE.Mesh(pcieSlotGeo, metalMaterial);
  pcieSlot.position.set(-0.2, 0.16, 1.6);
  group.add(pcieSlot);

  // PCIe Gold Interior Contacts
  const pcieContactsGeo = new THREE.BoxGeometry(3.4, 0.28, 0.06);
  const pcieContacts = new THREE.Mesh(pcieContactsGeo, goldMaterial);
  pcieContacts.position.set(-0.2, 0.18, 1.6);
  group.add(pcieContacts);

  // --- M.2 NVMe Shield Slot ---
  const m2Geo = new THREE.BoxGeometry(2.0, 0.12, 0.65);
  const m2Mesh = new THREE.Mesh(m2Geo, darkAlumMaterial);
  m2Mesh.position.set(0.6, 0.12, 0.7);
  group.add(m2Mesh);

  // M.2 Standoff Screw
  const screwGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.18, 12);
  const screw = new THREE.Mesh(screwGeo, metalMaterial);
  screw.position.set(1.65, 0.15, 0.7);
  group.add(screw);

  // --- VRM Solid Capacitors Array ---
  const capGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.38, 16);
  for (let c = 0; c < 7; c++) {
    const cap = new THREE.Mesh(capGeo, metalMaterial);
    cap.position.set(-1.25, 0.24, -1.3 + c * 0.36);
    group.add(cap);

    // Glowing capacitor top indicator
    const capTopGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16);
    const capTop = new THREE.Mesh(capTopGeo, glowGreenMaterial);
    capTop.position.set(-1.25, 0.44, -1.3 + c * 0.36);
    group.add(capTop);
  }

  // --- Rear I/O Shield Connectors ---
  const ioBlockGeo = new THREE.BoxGeometry(0.8, 0.75, 2.2);
  const ioBlock = new THREE.Mesh(ioBlockGeo, metalMaterial);
  ioBlock.position.set(-2.4, 0.42, -1.1);
  group.add(ioBlock);

  // Southbridge / Chipset Heatsink (Bottom Right)
  const chipsetGeo = new THREE.BoxGeometry(1.3, 0.25, 1.3);
  const chipsetTexture = createChipTexture("ECYCLE", "CIRCULAR CORE");
  const chipsetMat = new THREE.MeshStandardMaterial({
    map: chipsetTexture,
    roughness: 0.3,
    metalness: 0.8,
  });
  const chipset = new THREE.Mesh(chipsetGeo, chipsetMat);
  chipset.position.set(1.5, 0.18, 1.5);
  group.add(chipset);

  return { group, coreRing };
}

// 5. Floating DDR5 RAM Module
export function createFloatingRam() {
  const group = new THREE.Group();

  const greenPcbMat = new THREE.MeshStandardMaterial({
    color: 0x0f291e,
    roughness: 0.5,
    metalness: 0.2,
  });
  const heatspreaderMat = new THREE.MeshStandardMaterial({
    color: 0x1f2923,
    roughness: 0.25,
    metalness: 0.85,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.2,
    metalness: 0.95,
  });
  const chipMat = new THREE.MeshStandardMaterial({
    color: 0x151515,
    roughness: 0.8,
    metalness: 0.1,
  });
  const ledGlowMat = new THREE.MeshStandardMaterial({
    color: 0xa3e635,
    emissive: 0xa3e635,
    emissiveIntensity: 0.9,
  });

  // PCB Board
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.65, 0.05), greenPcbMat);
  group.add(pcb);

  // Golden Edge Contacts (Pins)
  const pins = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.06), goldMat);
  pins.position.y = -0.32;
  group.add(pins);

  // Heat Spreader Shell
  const heatspreader = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.5, 0.08), heatspreaderMat);
  heatspreader.position.y = 0.04;
  group.add(heatspreader);

  // Memory Chips (4 in a row)
  for (let i = -3; i <= 3; i += 2) {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.1), chipMat);
    chip.position.set(i * 0.32, 0.04, 0);
    group.add(chip);
  }

  // Top RGB / Status Lightbar
  const bar = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.06, 0.1), ledGlowMat);
  bar.position.y = 0.33;
  group.add(bar);

  return group;
}

// 6. Floating NVMe M.2 SSD
export function createFloatingSsd() {
  const group = new THREE.Group();

  const pcbMat = new THREE.MeshStandardMaterial({
    color: 0x061e14,
    roughness: 0.45,
    metalness: 0.2,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.2,
    metalness: 0.95,
  });
  const controllerMat = new THREE.MeshStandardMaterial({
    map: createChipTexture("NVMe", "GEN4x4"),
    roughness: 0.3,
    metalness: 0.7,
  });
  const nandMat = new THREE.MeshStandardMaterial({
    color: 0x161616,
    roughness: 0.6,
    metalness: 0.2,
  });

  // PCB Stick (2280 form factor: ~2.4 x 0.04 x 0.75)
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 0.75), pcbMat);
  group.add(pcb);

  // Gold M.2 Connector notch & contacts
  const goldEdge = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.7), goldMat);
  goldEdge.position.x = -1.15;
  group.add(goldEdge);

  // Controller Chip
  const controller = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.45), controllerMat);
  controller.position.set(-0.55, 0.04, 0);
  group.add(controller);

  // 2x NAND Flash Memory Blocks
  [0.15, 0.72].forEach((xPos) => {
    const nand = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.07, 0.58), nandMat);
    nand.position.set(xPos, 0.04, 0);
    group.add(nand);
  });

  // Green LED Indicator
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.04, 0.06),
    new THREE.MeshStandardMaterial({
      color: 0xa3e635,
      emissive: 0xa3e635,
      emissiveIntensity: 1.2,
    })
  );
  led.position.set(-0.85, 0.04, 0.22);
  group.add(led);

  return group;
}

// 7. Floating Ceramic Silicon CPU Die
export function createFloatingCpu() {
  const group = new THREE.Group();

  const substrateMat = new THREE.MeshStandardMaterial({
    color: 0x12291d,
    roughness: 0.5,
    metalness: 0.2,
  });
  const dieMat = new THREE.MeshStandardMaterial({
    map: createChipTexture("ECYCLE AI", "3nm RECLAIMED"),
    roughness: 0.15,
    metalness: 0.9,
  });
  const goldPinsMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.25,
    metalness: 0.95,
  });

  // Ceramic carrier substrate
  const substrate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 1.2), substrateMat);
  group.add(substrate);

  // Polished Silicon Die
  const die = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 0.75), dieMat);
  die.position.y = 0.06;
  group.add(die);

  // Golden contact grid on underside
  const pinBed = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.03, 1.05), goldPinsMat);
  pinBed.position.y = -0.05;
  group.add(pinBed);

  return group;
}

// 8. Energy Particle System
export function createParticleSystem(count = 220) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Distribute in a spherical cylinder around the motherboard
    const radius = 2.0 + Math.random() * 5.5;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 6.0;

    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * radius;

    scales[i] = 0.4 + Math.random() * 0.8;
    speeds[i] = 0.002 + Math.random() * 0.006;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));

  const texture = createGlowParticleTexture();
  const material = new THREE.PointsMaterial({
    size: 0.35,
    map: texture,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  return { points, speeds };
}
