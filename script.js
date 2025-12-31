// ================= MAPA =================
const map = L.map("map").setView([-15.78, -47.93], 13);

// ================= CAMADAS BASE =================
const rua = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution: "OpenStreetMap"
  }
);

const satelite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 19,
    attribution: "Esri World Imagery"
  }
);

// camada inicial
rua.addTo(map);

// ================= CONTROLE DE CAMADAS (IMPORTANTE) =================
L.control.layers(
  {
    "Rua": rua,
    "Satélite": satelite
  },
  null,
  {
    position: "topright",
    collapsed: false   // <<< ISSO é essencial no mobile
  }
).addTo(map);

// ================= BOTÃO MIRA (GPS) =================
const gpsControl = L.control({ position: "topright" });

gpsControl.onAdd = function () {
  const div = L.DomUtil.create("div", "gps-button leaflet-bar");

  div.innerHTML = "📍";
  div.style.background = "#fff";
  div.style.width = "42px";
  div.style.height = "42px";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.cursor = "pointer";
  div.style.fontSize = "20px";

  L.DomEvent.disableClickPropagation(div);

  div.onclick = () => {
    map.locate({ setView: true, maxZoom: 17 });
  };

  return div;
};

gpsControl.addTo(map);

// ================= LOCALIZAÇÃO =================
map.on("locationfound", e => {
  L.circleMarker(e.latlng, {
    radius: 6,
    color: "#1976d2",
    fillColor: "#1976d2",
    fillOpacity: 0.9
  }).addTo(map);
});
