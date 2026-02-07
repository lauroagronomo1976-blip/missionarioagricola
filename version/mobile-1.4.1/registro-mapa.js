console.log("🟢 REGISTRO – MAPA PURO ATIVO");

const map = L.map("map").setView([-15.78, -47.93], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);

let pontoAtual = null;

document.getElementById("btnMarcarPonto").addEventListener("click", () => {
  map.locate({ enableHighAccuracy: true });
});

map.on("locationfound", (e) => {
  if (pontoAtual) {
    map.removeLayer(pontoAtual);
  }

  map.setView(e.latlng, 17);

  pontoAtual = L.marker(e.latlng)
    .addTo(map)
    .bindPopup("📍 Ponto marcado")
    .openPopup();

  console.log("📍 Coordenadas:", e.latlng);
});

