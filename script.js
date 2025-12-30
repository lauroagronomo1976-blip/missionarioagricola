// ===== MAPA =====
const map = L.map("map").setView([-15.7801, -47.9292], 5);

// Camadas
const camadaRua = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { maxZoom: 19 }
).addTo(map);

const camadaSatelite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { maxZoom: 19 }
);

let usandoSatelite = false;

// ===== BOTÃO CAMADAS (DENTRO DO MAPA) =====
const controleCamadas = L.control({ position: "topright" });

controleCamadas.onAdd = function () {
  const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
  div.style.width = "48px";
div.style.height = "48px";
div.style.lineHeight = "48px";
div.style.fontSize = "22px";
div.style.textAlign = "center";
  div.innerHTML = "🗺️";
  div.title = "Alternar camadas";

  div.onclick = function (e) {
    L.DomEvent.stop(e);
    if (usandoSatelite) {
      map.removeLayer(camadaSatelite);
      map.addLayer(camadaRua);
      usandoSatelite = false;
    } else {
      map.removeLayer(camadaRua);
      map.addLayer(camadaSatelite);
      usandoSatelite = true;
    }
  };

  return div;
};

controleCamadas.addTo(map);

// ===== BOTÃO GPS (LOGO ABAIXO) =====
const controleGPS = L.control({ position: "topright" });

controleGPS.onAdd = function () {
  const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
  div.style.width = "48px";
div.style.height = "48px";
div.style.lineHeight = "48px";
div.style.fontSize = "22px";
div.style.textAlign = "center";
  div.innerHTML = "🎯";
  div.title = "Minha localização";

  div.onclick = function (e) {
    L.DomEvent.stop(e);

    if (!navigator.geolocation) {
      alert("GPS não disponível");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        map.setView([lat, lng], 18, { animate: true });

        L.marker([lat, lng]).addTo(map);
      },
      () => alert("Erro ao obter localização"),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  };

  return div;
};

controleGPS.addTo(map);


