export function displayPlanetInfo(planet) {
  document.getElementById("planet-name").textContent = planet.name;
  document.getElementById("planet-distance").textContent = planet.distance;
  document.getElementById("planet-size").textContent = planet.size;
  document.getElementById("planet-moons").textContent = planet.moons;
  document.getElementById("planet-habitable").textContent = planet.habitable ? "Yes" : "No";
  document.getElementById("planet-popup").style.display = "block";
}
