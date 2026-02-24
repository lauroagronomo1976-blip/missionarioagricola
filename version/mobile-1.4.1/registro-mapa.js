let map;
let coordenadaAtual = null;
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("btnMarcarPontoInferior")
  .addEventListener("click", function() {

    const dadosMissao = JSON.parse(localStorage.getItem("dadosMissao"));

    if (!dadosMissao || dadosMissao.missao !== "Inspeção Fitossanitária") {
      alert("Missão atual não é Inspeção Fitossanitária.");
      return;
    }

    if (!coordenadaAtual) {
      alert("Clique na 🎯 para capturar sua posição primeiro.");
      return;
    }

    document.getElementById("modalInspecao").style.display = "flex";
});

    const dadosMissao = JSON.parse(localStorage.getItem("dadosMissao"));
    
    if (dadosMissao.missao === "Inspeção Fitossanitária") {
      alert("Modo Inspeção Fitossanitária ativado.");
      // aqui futuramente abriremos formulário específico
    }

});
function fecharModal() {
  document.getElementById("modalInspecao").style.display = "none";
}

function salvarPonto() {

  const praga = document.getElementById("praga").value;
  const incidencia = document.getElementById("incidencia").value;

  if (!praga || !incidencia) {
    alert("Preencha todos os campos.");
    return;
  }

  const dadosMissao = JSON.parse(localStorage.getItem("dadosMissao"));

  const ponto = {
    ...dadosMissao,
    praga,
    incidencia,
    latitude: coordenadaAtual.lat,
    longitude: coordenadaAtual.lng,
    data: new Date().toISOString()
  };

  let pontosSalvos = JSON.parse(localStorage.getItem("pontosInspecao")) || [];
  pontosSalvos.push(ponto);

  localStorage.setItem("pontosInspecao", JSON.stringify(pontosSalvos));

  L.marker([coordenadaAtual.lat, coordenadaAtual.lng]).addTo(map);

  fecharModal();

  alert("Ponto salvo com sucesso!");
}
  console.log("🟢 REGISTRO – MAPA ATIVO");

  // ===============================
  // VARIÁVEIS
  // ===============================
  let marcadorAtual = null;
  let coordenadaAtual = null;
  let marcadores = [];

  // ===============================
  // MAPA
  // ===============================
  map = L.map
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
  document.getElementById("btnMira").addEventListener("click", () => {

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      coordenadaAtual = { lat, lng };

      map.setView([lat, lng], 17);

      if (marcadorAtual) {
        map.removeLayer(marcadorAtual);
      }

      marcadorAtual = L.circleMarker([lat, lng], {
        radius: 8,
        color: "#1e88e5",
        fillColor: "#1e88e5",
        fillOpacity: 1
      }).addTo(map);

    });
  }
});
    
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
