document.addEventListener("DOMContentLoaded", function () {

  // ===== MAPA =====
  const map = L.map("map").setView([-15.78, -47.93], 5);

  // CAMADAS
  const rua = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19 }
  );

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 18 }
  );

  rua.addTo(map);

  let camadaAtual = "rua";

  // ===== BOTÃO CAMADAS =====
  document.getElementById("btnLayers").addEventListener("click", () => {
    if (camadaAtual === "rua") {
      map.removeLayer(rua);
      satelite.addTo(map);
      camadaAtual = "satelite";
    } else {
      map.removeLayer(satelite);
      rua.addTo(map);
      camadaAtual = "rua";
    }
  });

  // ===== LOCALIZAÇÃO =====
  let userMarker;

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
      radius: 8,
      color: "#1e90ff",
      fillColor: "#1e90ff",
      fillOpacity: 0.8
    }).addTo(map);
  });

  map.on("locationerror", () => {
    alert("Não foi possível acessar a localização.");
  });

});
