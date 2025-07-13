// Basic setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 100, 0); // Camera high on Y-axis
camera.lookAt(0, 0, 0);         // Look toward the center (Sun)


const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solarCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting
const light = new THREE.PointLight(0xffffff, 1.5, 500);
light.position.set(0, 0, 0);
scene.add(light);

// Sun
const sunGeo = new THREE.SphereGeometry(4, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

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

const planetMeshes = [];
const planetSpeeds = {};
const planetAngles = {};
const controlPanel = document.getElementById("control-panel");

// Create planets
planets.forEach(p => {
  const geo = new THREE.SphereGeometry(p.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: p.color });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  planetMeshes.push({ name: p.name, mesh, distance: p.distance });
  planetSpeeds[p.name] = p.speed;
  planetAngles[p.name] = 0;
  const orbitGeo = new THREE.RingGeometry(p.distance - 0.05, p.distance + 0.05, 64);
  const orbitMat = new THREE.MeshBasicMaterial({
    color: 0x999999,
    side: THREE.DoubleSide
  });
  const orbit = new THREE.Mesh(orbitGeo, orbitMat);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

  // Slider
  const label = document.createElement('label');
  label.innerHTML = `${p.name}: `;
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0.001;
  slider.max = 0.1;
  slider.step = 0.001;
  slider.value = p.speed;
  slider.oninput = () => planetSpeeds[p.name] = parseFloat(slider.value);
  label.appendChild(slider);
  controlPanel.appendChild(label);
  controlPanel.appendChild(document.createElement('br'));
});

// Animation loop
let paused = false;
document.getElementById("toggle-animation").onclick = () => paused = !paused;

function animate() {
  requestAnimationFrame(animate);
  if (!paused) {
    planetMeshes.forEach(p => {
      planetAngles[p.name] += planetSpeeds[p.name];
      p.mesh.position.x = p.distance * Math.cos(planetAngles[p.name]);
      p.mesh.position.z = p.distance * Math.sin(planetAngles[p.name]);
    });
  }
  renderer.render(scene, camera);
}
animate();
