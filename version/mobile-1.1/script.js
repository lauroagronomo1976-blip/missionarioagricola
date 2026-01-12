document.addEventListener("DOMContentLoaded", function () {

  // ==========================
  // MAPA
  // ==========================
  const map = L.map("map").setView([-15.78, -47.93], 5);

  const rua = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19 }
  );

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 18 }
  );

  rua.addTo(map);

  // ==========================
  // MENU DE CAMADAS
  // ==========================
  let menuVisible = false;

  const menu = document.createElement("div");
  menu.className = "layer-menu";
  menu.innerHTML = `
    <div id="optRua">Rua</div>
    <div id="optSat">Satélite</div>
  `;
  document.getElementById("map-container").appendChild(menu);

  document.getElementById("btnLayers").addEventListener("click", () => {
    menuVisible = !menuVisible;
    menu.style.display = menuVisible ? "block" : "none";
  });

  document.getElementById("optRua").addEventListener("click", () => {
    map.removeLayer(satelite);
    rua.addTo(map);
    menu.style.display = "none";
    menuVisible = false;
  });

  document.getElementById("optSat").addEventListener("click", () => {
    map.removeLayer(rua);
    satelite.addTo(map);
    menu.style.display = "none";
    menuVisible = false;
  });

  // ==========================
  // LOCALIZAÇÃO (MIRA)
  // ==========================
  let userMarker;

  document.getElementById("btnLocate").addEventListener("click", () => {
    map.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true });
  });

  map.on("locationfound", (e) => {
    if (userMarker) map.removeLayer(userMarker);

    userMarker = L.circleMarker(e.latlng, {
      radius: 8,
      color: "#1e90ff",
      fillColor: "#1e90ff",
      fillOpacity: 0.8
    }).addTo(map);
  });

  // ==========================
  // REGISTRAR PONTO (MARCAR)
  // ==========================
  const btnMarcarPonto = document.getElementById("btnMarcarPonto");
  let pontosRegistrados = [];

  btnMarcarPonto.addEventListener("click", () => {

    navigator.geolocation.getCurrentPosition((pos) => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // dados da missão
      const ponto = {
        id: pontosRegistrados.length + 1,
        missao: document.getElementById("missaoInput").value,
        latitude: lat,
        longitude: lng
      };

      pontosRegistrados.push(ponto);

      const marcador = L.marker([lat, lng]).addTo(map);

      marcador.bindPopup(`
        <strong>📍 Ponto ${ponto.id}</strong><br>
        <strong>Missão:</strong> ${ponto.missao || "-"}<br><br>
        <strong>Lat:</strong> ${lat.toFixed(6)}<br>
        <strong>Lng:</strong> ${lng.toFixed(6)}
      `).openPopup();

    });

  });

});
