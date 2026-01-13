/*************************************************
 * VARIÁVEIS GLOBAIS
 *************************************************/
let map;
let rua, satelite;
let userMarker = null;
let contadorPontos = 0;

/*************************************************
 * INICIALIZAÇÃO DO MAPA
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {

  // ===== MAPA =====
  map = L.map("map").setView([-15.78, -47.93], 5);

  // ===== CAMADA RUA =====
  rua = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19 }
  ).addTo(map);

  // ===== CAMADA SATÉLITE =====
  satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 18 }
  );

  /*************************************************
   * BOTÃO CAMADAS
   *************************************************/
  let menuAtivo = false;

  const menu = document.createElement("div");
  menu.className = "layer-menu";
  menu.style.display = "none";
  menu.innerHTML = `
    <button id="optRua">Rua</button>
    <button id="optSat">Satélite</button>
  `;
  document.getElementById("map-container").appendChild(menu);

  document.getElementById("btnLayers").addEventListener("click", () => {
    menuAtivo = !menuAtivo;
    menu.style.display = menuAtivo ? "block" : "none";
  });

  document.getElementById("optRua").addEventListener("click", () => {
    map.removeLayer(satelite);
    rua.addTo(map);
    menu.style.display = "none";
    menuAtivo = false;
  });

  document.getElementById("optSat").addEventListener("click", () => {
    map.removeLayer(rua);
    satelite.addTo(map);
    menu.style.display = "none";
    menuAtivo = false;
  });

  /*************************************************
   * BOTÃO MIRA
   *************************************************/
  document.getElementById("btnLocate").addEventListener("click", () => {
    map.locate({
      setView: true,
      maxZoom: 17,
      enableHighAccuracy: true
    });
  });

  map.on("locationfound", (e) => {
    if (userMarker) map.removeLayer(userMarker);

    userMarker = L.circleMarker(e.latlng, {
      radius: 7,
      color: "#1e90ff",
      fillColor: "#1e90ff",
      fillOpacity: 0.9
    }).addTo(map);
  });

});

/*************************************************
 * BOTÃO MARCAR PONTO
 *************************************************/
document
  .getElementById("btnMarcarPonto")
  .addEventListener("click", () => {

    if (!navigator.geolocation) {
      alert("GPS não disponível");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        contadorPontos++;

        const missao =
          document.querySelector("input[placeholder='Missão']")?.value ||
          "Sem missão";

        const marker = L.marker([lat, lng]).addTo(map);
        map.setView([lat, lng], 17);

        marker.bindPopup(
          `📍 Ponto ${contadorPontos}<br>
           Missão: ${missao}<br>
           Lat: ${lat.toFixed(6)}<br>
           Lng: ${lng.toFixed(6)}`
        ).openPopup();
      },
      () => alert("Erro ao obter localização"),
      { enableHighAccuracy: true }
    );
  });
