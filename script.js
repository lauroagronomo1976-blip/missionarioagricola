// ================= MAPA =================

// Local inicial neutro (Brasil)
const mapaInicial = [-14.2, -51.9];

const map = L.map("map", {
  zoomControl: true,
  inertia: true,
  inertiaDeceleration: 3000,
  zoomAnimation: true,
  fadeAnimation: true
}).setView(mapaInicial, 4);

// ================= CAMADAS =================
const rua = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { maxZoom: 19 }
);

const satelite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/' +
  'World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom: 19 }
);

// inicia com rua
rua.addTo(map);

// função para trocar camada
function usarRua() {
  map.removeLayer(satelite);
  rua.addTo(map);
}

function usarSatelite() {
  map.removeLayer(rua);
  satelite.addTo(map);
}

// Rua
const rua = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }
);

// Satélite (com limite de zoom para NÃO quebrar imagem)
const satelite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 18,       // 👈 evita “Map data not yet available”
    maxNativeZoom: 17, // 👈 zoom real da imagem
    attribution: "© Esri"
  }
);

// Camada inicial
rua.addTo(map);

// ================= CONTROLE DE CAMADAS =================
L.control.layers(
  {
    "Rua": rua,
    "Satélite": satelite
  },
  null,
  {
    position: "topright",
    collapsed: true
  }
).addTo(map);

// ================= GPS ESTÁVEL =================

let localizacaoAtual = null;

// Controle da mira
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

  div.onclick = localizarComPrecisao;

  return div;
};

gpsControl.addTo(map);

// ================= FUNÇÃO GPS CORRETA =================
function localizarComPrecisao() {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];

      // Remove localização anterior
      if (localizacaoAtual) {
        map.removeLayer(localizacaoAtual);
      }

      // Bolinha azul (localização)
      localizacaoAtual = L.circleMarker(latlng, {
        radius: 7,
        color: "#1976d2",
        fillColor: "#1976d2",
        fillOpacity: 0.9
      }).addTo(map);

      // Zoom suave e inteligente
      map.flyTo(latlng, 16, {
        animate: true,
        duration: 1.2
      });
    },
    () => {
      alert("Não foi possível obter a localização GPS.");
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0
    }
  );
}


