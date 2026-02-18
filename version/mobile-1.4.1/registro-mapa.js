document.addEventListener("DOMContentLoaded", () => {

  console.log("🟢 REGISTRO – MAPA ATIVO");

  // ===============================
  // VARIÁVEIS
  // ===============================
  let marcadorAtual = null;
  let pontoAtual = null;
  let registrosDoPonto = [];

  // ===============================
  // MAPA
  // ===============================
  const map = L.map('map', {
    zoomControl: false
  }).setView([-15.0, -47.0], 5);
  setTimeout(() => {
  window.addEventListener('load', function () {
  setTimeout(function () {
    map.invalidateSize();
  }, 100);
});
    map.invalidateSize(true);

  // Zoom inferior direito
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);
    
  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "© Esri", maxZoom: 21 }
  );

  street.addTo(map);

  L.control.layers({
    "Rua": street,
    "Satélite": satelite
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 300);

  map.scrollWheelZoom.disable();
  map.touchZoom.enable();

  // ===============================
  // BOTÃO MIRA (bolinha azul)
  // ===============================
  const btnMira = document.getElementById("btnMira");

  if (btnMira) {
    btnMira.addEventListener("click", () => {

      if (!navigator.geolocation) {
        alert("Geolocalização não suportada.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {

          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          map.setView([lat, lng], 17);

          if (marcadorAtual) {
            map.removeLayer(marcadorAtual);
          }

          marcadorAtual = L.circleMarker([lat, lng], {
            radius: 12,
            color: "#1e88e5",
            fillColor: "#42a5f5",
            fillOpacity: 0.9
          }).addTo(map);

        },
        () => alert("Erro ao obter localização.")
      );

    });
  }

  // ===============================
  // ELEMENTOS
  // ===============================
  const btnMarcar = document.getElementById("btnMarcar");
  const btnAddRegistro = document.getElementById("btnAddRegistro");
  const ocorrenciaSelect = document.getElementById("ocorrenciaSelect");
  const especieInput = document.getElementById("especieInput");
  const quantidadeInput = document.getElementById("quantidadeInput");
  const listaContainer = document.getElementById("listaRegistros");

  // ===============================
  // MARCAR PONTO (alfinete)
  // ===============================
  if (btnMarcar) {
    btnMarcar.addEventListener("click", () => {

      if (!navigator.geolocation) {
        alert("Geolocalização não suportada.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {

          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          pontoAtual = { lat, lng, data: new Date().toISOString() };
          registrosDoPonto = [];
          renderizarLista();

          if (marcadorAtual) {
            map.removeLayer(marcadorAtual);
          }

          marcadorAtual = L.marker([lat, lng]).addTo(map);
          map.setView([lat, lng], 19);

        },
        () => alert("Erro ao obter localização.")
      );

    });
  }

  // ===============================
  // ADICIONAR REGISTRO
  // ===============================
  if (btnAddRegistro) {
    btnAddRegistro.addEventListener("click", () => {

      if (!ocorrenciaSelect.value || !quantidadeInput.value) {
        alert("Preencha os campos obrigatórios.");
        return;
      }

      const registro = {
        ocorrencia: ocorrenciaSelect.value,
        especie: especieInput.value,
        quantidade: quantidadeInput.value,
        data: new Date().toLocaleString()
      };

      registrosDoPonto.push(registro);
      renderizarLista();

      quantidadeInput.value = "";
      especieInput.value = "";

    });
  }

  // ===============================
  // RENDER LISTA
  // ===============================
  function renderizarLista() {

    if (!listaContainer) return;

    listaContainer.innerHTML = "";

    if (registrosDoPonto.length === 0) {
      listaContainer.innerHTML = "<em>Nenhum registro ainda.</em>";
      return;
    }

    registrosDoPonto.forEach((r, i) => {

      const div = document.createElement("div");
      div.className = "registro-item";

      div.innerHTML = `
        <strong>${r.ocorrencia}</strong><br>
        Espécie: ${r.especie || "-"}<br>
        Qtde: ${r.quantidade}<br>
        <button onclick="excluirRegistro(${i})">Excluir</button>
      `;

      listaContainer.appendChild(div);
    });
  }

  window.excluirRegistro = function (index) {
    registrosDoPonto.splice(index, 1);
    renderizarLista();
  };

});
