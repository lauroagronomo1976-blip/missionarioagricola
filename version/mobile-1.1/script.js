document.addEventListener("DOMContentLoaded", function () {
console.log("JS carregado");
 console.log("Marcar:", document.getElementById("btnMarcarPonto"));
 console.log("Gravar:", document.getElementById("btnGravarPonto"));
 console.log("Finalizar:", document.getElementById("btnFinalizarMissao")); 
 
  /************** MAPA **************/
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

  /************** BOTÕES DO MAPA **************/
  document.getElementById("btnLayers").onclick = () => {
    if (map.hasLayer(rua)) {
      map.removeLayer(rua);
      satelite.addTo(map);
    } else {
      map.removeLayer(satelite);
      rua.addTo(map);
    }
  };

  document.getElementById("btnLocate").onclick = () => {
    map.locate({ setView: true, maxZoom: 17 });
  };

  /************** PONTOS **************/
  let ultimoPonto = null;

  const btnMarcar = document.getElementById("btnMarcarPonto");
  const btnGravar = document.getElementById("btnGravarPonto");
  const btnFinalizar = document.getElementById("btnFinalizarMissao");

  btnMarcar.onclick = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (ultimoPonto) map.removeLayer(ultimoPonto);

      ultimoPonto = L.marker([lat, lng]).addTo(map)
        .bindPopup("📍 Ponto temporário")
        .openPopup();

    });
  };

  btnGravar.onclick = () => {
    if (!ultimoPonto) {
      alert("Marque um ponto antes.");
      return;
    }

    ultimoPonto.bindPopup("📌 Ponto gravado");
    ultimoPonto = null;

    alert("Ponto salvo com sucesso!");
  };

  btnFinalizar.onclick = () => {
    alert("🏁 Missão finalizada");
  };

});
