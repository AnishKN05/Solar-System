
export function displayPlanetInfo(planet) {
  // Update popup content
  document.getElementById("planet-name").textContent = planet.name;
  document.getElementById("planet-distance").textContent = planet.distanceFromSun || planet.distance || "N/A";
  document.getElementById("planet-size").textContent = planet.radius || planet.size || "N/A";
  document.getElementById("planet-moons").textContent = planet.moons ?? "N/A";
  document.getElementById("planet-habitable").textContent = planet.habitable ? "Yes" : "No";

  // Show the popup
  document.getElementById("planet-popup").style.display = "block";

  // Prepare narration text
  const narration = `
    ${planet.name}.
    Distance from the Sun: ${planet.distanceFromSun || planet.distance}.
    Size: ${planet.radius || planet.size}.
    Number of moons: ${planet.moons ?? "unknown"}.
    ${planet.habitable ? "This planet is habitable." : "This planet is not habitable."}
    ${planet.description ? planet.description : ""}
  `;

  // Stop ongoing speech
  window.speechSynthesis.cancel();

  // Create and speak utterance
  const utterance = new SpeechSynthesisUtterance(narration);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
