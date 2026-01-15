document.addEventListener("DOMContentLoaded", () => {

  // ======================
  // MAPA (BLOCO SAGRADO)
  // ======================
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

  // ======================
  // CONTROLES DE CAMADA
  // ======================
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

  document.getElementById("optRua").onclick = () => {
    map.removeLayer(satelite);
    rua.addTo(map);
    menu.style.display = "none";
    menuVisible = false;
  };

  document.getElementById("optSat").onclick = () => {
    map.removeLayer(rua);
    satelite.addTo(map);
    menu.style.display = "none";
    menuVisible = false;
  };

  // ======================
  // LOCALIZAÇÃO (🎯)
  // ======================
  let userMarker = null;

  document.getElementById("btnLocate").addEventListener("click", () => {
    map.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true });
  });

  map.on("locationfound", (e) => {
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.circleMarker(e.latlng, {
      radius: 8,
      color: "#1e90ff",
      fillColor: "#1e90ff",
      fillOpacity: 0.9
    }).addTo(map);
  });

  map.on("locationerror", () => {
    alert("Não foi possível acessar o GPS.");
  });

  // ======================
  // PONTOS (1.2)
  // ======================
  let pontoTemp = null;
  let pontosGravados = [];

  const btnMarcar = document.getElementById("btnMarcarPonto");
  const btnGravar = document.getElementById("btnGravarPonto");
  const btnFinalizar = document.getElementById("btnFinalizarMissao");
  const registroArea = document.getElementById("registroIndividuos");

  // MARCAR → cria ponto temporário
  btnMarcar.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];

      if (pontoTemp) map.removeLayer(pontoTemp);

      pontoTemp = L.marker(latlng).addTo(map);
      pontoTemp.bindPopup("📍 Ponto marcado (não gravado)").openPopup();

      map.setView(latlng, 17);

      registroArea.style.display = "block";
    },
    () => alert("Erro ao obter localização."),
    { enableHighAccuracy: true });
  });

  // GRAVAR → transforma ponto temporário em definitivo
  btnGravar.addEventListener("click", () => {
    if (!pontoTemp) {
      alert("Marque um ponto antes de gravar.");
      return;
    }

    const missao = document.getElementById("missaoInput").value || "Sem missão";

    const latlng = pontoTemp.getLatLng();

    pontoTemp.bindPopup(
      `<strong>Missão:</strong> ${missao}<br>
       Lat: ${latlng.lat.toFixed(6)}<br>
       Lng: ${latlng.lng.toFixed(6)}`
    );

    pontosGravados.push({
      missao,
      lat: latlng.lat,
      lng: latlng.lng,
      data: new Date().toISOString()
    });

    pontoTemp = null;
    alert("Ponto gravado com sucesso!");
  });

  // FINALIZAR
  btnFinalizar.addEventListener("click", () => {
    alert(`Missão finalizada.\nPontos gravados: ${pontosGravados.length}`);
  });
// ======================
// REGISTROS TÉCNICOS POR PONTO (1.2.1)
// ======================
let registrosTemp = [];

const btnAddRegistro = document.getElementById("btnAddRegistro");
const listaRegistros = document.getElementById("listaRegistros");

btnAddRegistro.addEventListener("click", () => {
  const individuo = document.getElementById("individuoInput").value;
  const especie = document.getElementById("especieInput").value;
  const fase = document.getElementById("faseSelect").value;
  const quantidade = document.getElementById("quantidadeInput").value;

  if (!individuo || !quantidade) {
    alert("Informe ao menos o indivíduo e a quantidade.");
    return;
  }

  registrosTemp.push({ individuo, especie, fase, quantidade });

  renderListaRegistros();

  // limpa campos
  document.getElementById("individuoInput").value = "";
  document.getElementById("especieInput").value = "";
  document.getElementById("faseSelect").value = "";
  document.getElementById("quantidadeInput").value = "";
});

function renderListaRegistros() {
  listaRegistros.innerHTML = "<h4>Registros deste ponto</h4>";

  registrosTemp.forEach((r) => {
    const div = document.createElement("div");
    div.className = "registro-item";
    div.innerText = `${r.individuo} – ${r.especie || "-"} – ${r.fase || "-"} – ${r.quantidade}`;
    listaRegistros.appendChild(div);
  });
}

});
