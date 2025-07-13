
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 100, 0); // Top-down view
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solarCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting
const light = new THREE.PointLight(0xffffff, 1.5, 500);
light.position.set(0, 0, 0);
scene.add(light);

// Label creator with color support
function createLabel(text, color = 'white') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.font = 'bold 120px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 10;
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = color;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(14, 4, 1);
  return sprite;
}

// Sun
const sunGeo = new THREE.SphereGeometry(4, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

const sunLabel = createLabel("Sun", '#ffaa00');
sunLabel.position.set(0, 5, 0);
scene.add(sunLabel);

// Planet Data
const planets = [
  { name: 'Mercury', color: 0xaaaaaa, size: 0.5, distance: 7, speed: 0.04 },
  { name: 'Venus', color: 0xffcc99, size: 0.8, distance: 10, speed: 0.03 },
  { name: 'Earth', color: 0x3399ff, size: 1, distance: 13, speed: 0.02 },
  { name: 'Mars', color: 0xff6600, size: 0.7, distance: 16, speed: 0.018 },
  { name: 'Jupiter', color: 0xffcc66, size: 2.5, distance: 21, speed: 0.01 },
  { name: 'Saturn', color: 0xffcc99, size: 2.2, distance: 26, speed: 0.009 },
  { name: 'Uranus', color: 0x66ffff, size: 1.5, distance: 30, speed: 0.008 },
  { name: 'Neptune', color: 0x6666ff, size: 1.5, distance: 34, speed: 0.007 }
];

// Font colors for planet labels
const labelColors = {
  Mercury: '#888888',
  Venus: '#d18f61',
  Earth: '#0066cc',
  Mars: '#cc3300',
  Jupiter: '#d1a64b',
  Saturn: '#c79f68',
  Uranus: '#33ccff',
  Neptune: '#3333ff'
};

const planetMeshes = [];
const planetSpeeds = {};
const planetAngles = {};
const controlPanel = document.getElementById("control-panel");

// Create planets
planets.forEach(p => {
  // Planet sphere
  const geo = new THREE.SphereGeometry(p.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: p.color });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Orbit ring
  const orbitGeo = new THREE.RingGeometry(p.distance - 0.05, p.distance + 0.05, 64);
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
  const orbit = new THREE.Mesh(orbitGeo, orbitMat);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

  // Label
  const label = createLabel(p.name, labelColors[p.name] || 'white');
  scene.add(label);
  p.label = label;

  planetMeshes.push({ name: p.name, mesh, distance: p.distance, label });
  planetSpeeds[p.name] = p.speed;
  planetAngles[p.name] = 0;

  // Slider control
  const labelEl = document.createElement('label');
  labelEl.innerHTML = `${p.name}: `;
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0.001;
  slider.max = 0.1;
  slider.step = 0.001;
  slider.value = p.speed;
  slider.oninput = () => planetSpeeds[p.name] = parseFloat(slider.value);
  labelEl.appendChild(slider);
  controlPanel.appendChild(labelEl);
  controlPanel.appendChild(document.createElement('br'));
});

// Pause/Resume toggle
let paused = false;
document.getElementById("toggle-animation").onclick = () => paused = !paused;

// Animation
function animate() {
  requestAnimationFrame(animate);
  if (!paused) {
    planetMeshes.forEach(p => {
      planetAngles[p.name] += planetSpeeds[p.name];
      const x = p.distance * Math.cos(planetAngles[p.name]);
      const z = p.distance * Math.sin(planetAngles[p.name]);

      p.mesh.position.set(x, 0, z);
      p.label.position.set(x, 4, z);
    });
  }
  renderer.render(scene, camera);
}
animate();
