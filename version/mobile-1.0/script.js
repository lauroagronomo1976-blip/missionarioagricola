document.addEventListener("DOMContentLoaded", function () {

  // ===== MAPA =====
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

  // ===== MENU DE CAMADAS =====
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

  // ===== MISSÕES (LOCAL STORAGE) =====
  const missaoInput = document.getElementById("missaoInput");

  if (missaoInput) {
    missaoInput.addEventListener("blur", () => {
      const valor = missaoInput.value.trim();
      if (!valor) return;

      let missoes = JSON.parse(localStorage.getItem("missoes")) || [];

      if (!missoes.includes(valor)) {
        missoes.push(valor);
        localStorage.setItem("missoes", JSON.stringify(missoes));
      }
    });
  }

  // ===== REGISTRAR PONTO =====
  const btnMarcarPonto = document.getElementById("btnMarcarPonto");
  let pontosRegistrados = [];

  if (btnMarcarPonto) {
    btnMarcarPonto.addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("GPS não disponível.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const marcador = L.marker([lat, lng]).addTo(map);

          pontosRegistrados.push({
            id: pontosRegistrados.length + 1,
            lat,
            lng,
            data: new Date().toLocaleString()
          });

          marcador.bindPopup(
            `<strong>Ponto ${pontosRegistrados.length}</strong><br>
             Lat: ${lat.toFixed(6)}<br>
             Lng: ${lng.toFixed(6)}`
          ).openPopup();
        },
        () => alert("Erro ao obter localização."),
        { enableHighAccuracy: true }
      );
    });
  }

});
