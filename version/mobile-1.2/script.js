console.log("script.js carregado");
document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     MAPA
  ========================== */
  const map = L.map("map", {
    zoomControl: true
  }).setView([-15.78, -47.93], 5);

  const rua = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19 }
  ).addTo(map);

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 18 }
  );

  let camadaAtual = "rua";

  /* =========================
     CAMADAS (🗺)
  ========================== */
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

  /* =========================
     LOCALIZAÇÃO (🎯)
  ========================== */
  let userLocation;

  const btnLocate = document.getElementById("btnLocate");

  btnLocate.addEventListener("click", () => {
    map.locate({ enableHighAccuracy: true, setView: true, maxZoom: 17 });
  });

  map.on("locationfound", (e) => {
    if (userLocation) map.removeLayer(userLocation);

    userLocation = L.circleMarker(e.latlng, {
      radius: 8,
      fillColor: "#1e90ff",
      color: "#1e90ff",
      fillOpacity: 0.8
    }).addTo(map);
  });

  map.on("locationerror", () => {
    alert("Não foi possível obter sua localização.");
  });

  /* =========================
     PONTOS
  ========================== */
  let pontoAtual = null;
  let pontosSalvos = [];

  const btnMarcar = document.getElementById("btnMarcarPonto");
  const btnGravar = document.getElementById("btnGravarPonto");
  const btnFinalizar = document.getElementById("btnFinalizarMissao");

  btnLocate.addEventListener("click", () => {
  map.locate({ enableHighAccuracy: true });
});

  map.on("locationfound", (e) => {

  // Se NÃO estiver em modo marcar, apenas centraliza
  if (!modoMarcarPonto) {
    map.setView(e.latlng, 17);
    return;
  }

  // Se estiver em modo marcar
  if (pontoAtual) {
    map.removeLayer(pontoAtual);
  }

  pontoAtual = L.marker(e.latlng).addTo(map);
  pontoAtual.bindPopup("📍 Ponto marcado (não gravado)").openPopup();

  modoMarcarPonto = false; // reseta o modo
});
