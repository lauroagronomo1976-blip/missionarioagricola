document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 REGISTRO – MAPA PURO ATIVO");

  let map;
  let modoCriarPonto = false;

  /* ========= MAPA ========= */
  map = L.map("map").setView([-15.78, -47.93], 5);

  /* ========= CAMADAS ========= */
  const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "© Esri" }
  );

  L.control.layers(
    { "Mapa": street, "Satélite": satelite },
    {}
  ).addTo(map);

  /* ========= BLINDAGEM TAMANHO ========= */
  setTimeout(() => {
    map.invalidateSize();
    console.log("🛡️ invalidateSize aplicado");
  }, 200);

  /* ========= BOTÃO ========= */
  const btnMarcarPonto = document.getElementById("btnMarcarPonto");

  btnMarcarPonto.addEventListener("click", () => {
    if (modoCriarPonto) return;

    modoCriarPonto = true;
    map.locate({ enableHighAccuracy: true });

    console.log("📍 Modo marcar ponto ATIVO");
  });

  /* ========= EVENTO LEAFLET ========= */
  map.on("locationfound", (e) => {
    if (!modoCriarPonto) return;

    modoCriarPonto = false;

    map.setView(e.latlng, 17);

    L.marker(e.latlng)
      .addTo(map)
      .bindPopup("📍 Ponto marcado")
      .openPopup();

    console.log("✅ Ponto criado");
  });

});
