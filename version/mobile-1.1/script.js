document.addEventListener("DOMContentLoaded", function () {

  // ==========================
  // MAPA
  // ==========================
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

  // ==========================
  // ESTADO
  // ==========================
  let marcadorUsuario = null;
  let marcadorTemporario = null;
  let pontosRegistrados = [];

  // ==========================
  // BOTÃO MIRA (LOCALIZAÇÃO)
  // ==========================
  const btnLocate = document.getElementById("btnLocate");

  if (btnLocate) {
    btnLocate.addEventListener("click", () => {
      map.locate({
        setView: true,
        maxZoom: 17,
        enableHighAccuracy: true
      });
    });
  }

  map.on("locationfound", (e) => {
    if (marcadorUsuario) {
      map.removeLayer(marcadorUsuario);
    }

    marcadorUsuario = L.circleMarker(e.latlng, {
      radius: 8,
      color: "#1e90ff",
      fillColor: "#1e90ff",
      fillOpacity: 0.8
    }).addTo(map);
  });

  map.on("locationerror", () => {
    alert("Não foi possível acessar a localização.");
  });

  // ==========================
  // BOTÃO CAMADAS
  // ==========================
  let camadaAtual = "rua";

  const btnLayers = document.getElementById("btnLayers");

  if (btnLayers) {
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
  }

  // ==========================
  // BOTÃO MARCAR (TEMPORÁRIO)
  // ==========================
  const btnMarcarPonto = document.getElementById("btnMarcarPonto");

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

          if (marcadorTemporario) {
            map.removeLayer(marcadorTemporario);
          }

          marcadorTemporario = L.marker([lat, lng]).addTo(map);
          marcadorTemporario.bindPopup("📍 Ponto marcado (não gravado)");
        },
        () => {
          alert("Erro ao obter localização.");
        },
        { enableHighAccuracy: true }
      );
    });
  }

  // ==========================
  // BOTÃO GRAVAR PONTO
  // ==========================
  const btnGravarPonto = document.getElementById("btnGravarPonto");

  if (btnGravarPonto) {
    btnGravarPonto.addEventListener("click", () => {
      if (!marcadorTemporario) {
        alert("Marque um ponto antes de gravar.");
        return;
      }

      const missaoInput = document.getElementById("missaoInput");
      const missao = missaoInput ? missaoInput.value : "Sem missão";
      const latlng = marcadorTemporario.getLatLng();

      const ponto = {
        id: pontosRegistrados.length + 1,
        missao: missao,
        lat: latlng.lat,
        lng: latlng.lng,
        data: new Date().toLocaleString()
      };

      pontosRegistrados.push(ponto);

      marcadorTemporario.bindPopup(
        `<strong>Ponto ${ponto.id}</strong><br>
         Missão: ${ponto.missao}<br>
         Lat: ${ponto.lat.toFixed(6)}<br>
         Lng: ${ponto.lng.toFixed(6)}`
      ).openPopup();

      marcadorTemporario = null;

      alert("Ponto gravado com sucesso!");
    });
  }

});
