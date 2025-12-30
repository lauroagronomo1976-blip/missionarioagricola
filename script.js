// ===== MAPA =====
const map = L.map("map").setView([-15.7801, -47.9292], 5); // Brasil centro

let camadaAtual = "rua";

// Camadas
const camadaRua = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { maxZoom: 19 }
).addTo(map);

const camadaSatelite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { maxZoom: 19 }
);

// Botão Camadas
document.getElementById("btnCamadas").addEventListener("click", () => {
  if (camadaAtual === "rua") {
    map.removeLayer(camadaRua);
    map.addLayer(camadaSatelite);
    camadaAtual = "satelite";
  } else {
    map.removeLayer(camadaSatelite);
    map.addLayer(camadaRua);
    camadaAtual = "rua";
  }
});

// Botão GPS
document.getElementById("btnGps").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("GPS não disponível");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      map.setView([lat, lng], 17);
      L.marker([lat, lng]).addTo(map);
    },
    () => alert("Erro ao obter localização")
  );
});
