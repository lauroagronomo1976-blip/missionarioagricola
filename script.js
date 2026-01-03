let marcadorLocalizacao = null;
const map = L.map('map', {
  zoomControl: true,
  maxZoom: 19
}).setView([-15.8, -47.9], 5);

const rua = L.tileLayer(
const satelite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/' +
  'World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    maxZoom: 22,          // permite mais zoom
    maxNativeZoom: 19,    // limite real da imagem
    zoomOffset: 0
  }
);
const satelite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom: 17 } // evita estouro
);

rua.addTo(map);

function usarRua() {
  map.removeLayer(satelite);
  rua.addTo(map);
}

function usarSatelite() {
  map.removeLayer(rua);
  satelite.addTo(map);
}

function toggleCamadas() {
  document.getElementById('menu-camadas').classList.toggle('hidden');
}

function localizarUsuario() {
  if (!navigator.geolocation) {
    alert("Geolocalização não suportada no dispositivo.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // cria ou atualiza a bolinha azul
      if (marcadorLocalizacao) {
        marcadorLocalizacao.setLatLng([lat, lng]);
      } else {
        marcadorLocalizacao = L.circleMarker([lat, lng], {
          radius: 8,
          color: "#1e88e5",
          fillColor: "#1e88e5",
          fillOpacity: 0.8
        }).addTo(map);
      }

      // zoom suave e controlado (não estoura satélite)
      map.flyTo([lat, lng], 16, {
        animate: true,
        duration: 1.2
      });
    },
    (error) => {
      alert("Não foi possível obter a localização.");
    },
    {
      enableHighAccuracy: true,
      timeout: 5000
    }
  );
}
map.on('locationfound', e => {
  L.circleMarker(e.latlng, {
    radius: 8,
    color: '#136AEC',
    fillColor: '#2A93EE',
    fillOpacity: 0.8
  }).addTo(map);
});


