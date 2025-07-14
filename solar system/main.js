
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Angled camera view
camera.position.set(50, 60, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("solarCanvas"), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Starfield
const starGeometry = new THREE.BufferGeometry();
const starCount = 2000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 1000;
}
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
scene.add(new THREE.Points(starGeometry, starMaterial));

// Label creator
function createLabel(text, color = "#ffffff") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(10, 2.5, 1);
  return sprite;
}

// Create glow sprite for Sun
function createSunGlow() {
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 256;
  glowCanvas.height = 256;
  const ctx = glowCanvas.getContext("2d");

  const gradient = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255,255,0,1)");
  gradient.addColorStop(0.2, "rgba(255,255,0,0.4)");
  gradient.addColorStop(1, "rgba(255,255,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(glowCanvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(20, 20, 1);
  return sprite;
}

// Sun + Glow
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(4, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
scene.add(sun);

const sunGlow = createSunGlow();
sun.add(sunGlow);

const sunLabel = createLabel("Sun", "#ffaa00");
sunLabel.position.set(0, 6, 0);
scene.add(sunLabel);

// Planet Data
const planets = [
  { name: "Mercury", color: "#888888", size: 0.5, distance: 7, speed: 0.04, tilt: 0 },
  { name: "Venus", color: "#d18f61", size: 0.8, distance: 10, speed: 0.03, tilt: Math.PI },
  { name: "Earth", color: "#3399ff", size: 1, distance: 13, speed: 0.02, tilt: 23.5 * Math.PI / 180 },
  { name: "Mars", color: "#cc3300", size: 0.7, distance: 16, speed: 0.018, tilt: 25.2 * Math.PI / 180 },
  { name: "Jupiter", color: "#d1a64b", size: 2.5, distance: 21, speed: 0.01, tilt: 3.1 * Math.PI / 180 },
  { name: "Saturn", color: "#c79f68", size: 2.2, distance: 26, speed: 0.009, tilt: 26.7 * Math.PI / 180 },
  { name: "Uranus", color: "#33ccff", size: 1.5, distance: 30, speed: 0.008, tilt: 97.8 * Math.PI / 180 },
  { name: "Neptune", color: "#3333ff", size: 1.5, distance: 34, speed: 0.007, tilt: 28.3 * Math.PI / 180 }
];

const planetMeshes = [];
const planetAngles = {};
const planetSpeeds = {};
const controlPanel = document.getElementById("control-panel");

planets.forEach(p => {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(p.size, 32, 32),
    new THREE.MeshStandardMaterial({ color: p.color })
  );
  mesh.rotation.z = p.tilt; // axial tilt
  scene.add(mesh);

  const orbit = new THREE.Mesh(
    new THREE.RingGeometry(p.distance - 0.05, p.distance + 0.05, 64),
    new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide })
  );
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

  if (p.name === "Saturn") {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(p.size * 1.3, p.size * 2, 64),
      new THREE.MeshBasicMaterial({ color: 0xd2b48c, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
    );
    ring.rotation.x = Math.PI / 2;
    mesh.add(ring);
  }

  const label = createLabel(p.name, p.color);
  scene.add(label);

  planetMeshes.push({ name: p.name, mesh, distance: p.distance, label });
  planetAngles[p.name] = 0;
  planetSpeeds[p.name] = p.speed;

  const lbl = document.createElement("label");
  lbl.innerHTML = `${p.name}: `;
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0.001;
  slider.max = 0.1;
  slider.step = 0.001;
  slider.value = p.speed;
  slider.oninput = () => (planetSpeeds[p.name] = parseFloat(slider.value));
  lbl.appendChild(slider);
  controlPanel.appendChild(lbl);
  controlPanel.appendChild(document.createElement("br"));
});

let paused = false;
document.getElementById("toggle-animation").onclick = () => (paused = !paused);

function animate() {
  requestAnimationFrame(animate);
  if (!paused) {
    planetMeshes.forEach(p => {
      planetAngles[p.name] += planetSpeeds[p.name];
      const x = p.distance * Math.cos(planetAngles[p.name]);
      const z = p.distance * Math.sin(planetAngles[p.name]);
      p.mesh.position.set(x, 0, z);
      p.label.position.set(x, 4, z);
      p.mesh.rotation.y += 0.01; // planet axial spin
    });
  }
  renderer.render(scene, camera);
}
animate();