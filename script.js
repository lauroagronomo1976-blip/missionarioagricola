document.addEventListener("DOMContentLoaded", function () {

  const map = L.map("map", {
    zoomControl: true,
    attributionControl: false
  }).setView([-15.7801, -47.9292], 5);

  // ===== CAMADAS =====
  const rua = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19 }
  );

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19 }
  );

  let camadaAtual = "rua";
  rua.addTo(map);

  // ===== BOTÃO CAMADAS (CUSTOM) =====
  const btnLayers = document.getElementById("btnLayers");
  btnLayers.addEventListener("click", () => {
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

  // ===== LOCALIZAÇÃO (BOLINHA AZUL) =====
  let userCircle;

  const btnLocate = document.getElementById("btnLocate");
  btnLocate.addEventListener("click", () => {
    map.locate({
      setView: true,
      maxZoom: 18,
      enableHighAccuracy: true
    });
  });

  map.on("locationfound", (e) => {
    if (userCircle) {
      map.removeLayer(userCircle);
    }

    userCircle = L.circleMarker(e.latlng, {
      radius: 8,
      color: "#1e90ff",
      fillColor: "#1e90ff",
      fillOpacity: 0.8
    }).addTo(map);
  });

  map.on("locationerror", () => {
    alert("Não foi possível obter a localização.");
  });

});
