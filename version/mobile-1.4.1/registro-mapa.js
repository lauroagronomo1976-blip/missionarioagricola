document.addEventListener("DOMContentLoaded", () => {

  console.log("🟢 REGISTRO – MAPA ATIVO");

  // ===============================
  // VARIÁVEIS
  // ===============================
  let mapa = L.map("map", { zoomControl: true });
  let pontoAtual = null;
  let registrosDoPonto = [];
  let marcadorAtual = null;

  // Camada rua
const street = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { attribution: "© OpenStreetMap" }
);

// Camada satélite
const satelite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "© Esri" }
);

// Ativa rua por padrão
street.addTo(mapa);

// Controle de camadas
L.control.layers(
  {
    "Rua": street,
    "Satélite": satelite
  }
).addTo(mapa);
  mapa.setView([-15.8, -47.9], 5);

  setTimeout(() => mapa.invalidateSize(), 300);

  // ===============================
  // ELEMENTOS
  // ===============================
  const btnMarcar = document.getElementById("btnMarcar");
  const btnAddRegistro = document.getElementById("btnAddRegistro");
  const ocorrenciaSelect = document.getElementById("ocorrenciaSelect");
  const individuoInput = document.getElementById("individuoInput");
  const especieInput = document.getElementById("especieInput");
  const faseSelect = document.getElementById("faseSelect");
  const quantidadeInput = document.getElementById("quantidadeInput");
  const listaContainer = document.getElementById("listaRegistros");

  // ===============================
  // MARCAR PONTO
  // ===============================
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
          mapa.removeLayer(marcadorAtual);
        }

        marcadorAtual = L.marker([lat, lng]).addTo(mapa);
        mapa.setView([lat, lng], 18);
        L.control.locate = function(opts) {
        return new L.Control.Locate(opts);
}
      },
      () => alert("Erro ao obter localização.")
    );

  });
// ===============================
// BOTÃO MIRA CUSTOM
// ===============================
const controleMira = L.control({ position: "topright" });

controleMira.onAdd = function () {
  const div = L.DomUtil.create("div", "leaflet-bar leaf-control-custom");

  div.innerHTML = `
  <div style="
    width:20px;
    height:20px;
    border:2px solid black;
    border-radius:50%;
    position:relative;
  ">
    <div style="position:absolute;top:-6px;left:9px;width:2px;height:32px;background:black;"></div>
    <div style="position:absolute;left:-6px;top:9px;width:32px;height:2px;background:black;"></div>
  </div>
`;
  div.style.backgroundColor = "white";
  div.style.width = "40px";
  div.style.height = "40px";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.cursor = "pointer";
  div.style.fontSize = "18px";

  div.onclick = function () {

    if (!navigator.geolocation) {
      alert("Geolocalização não suportada.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        mapa.setView([lat, lng], 18);

        if (marcadorAtual) {
          mapa.removeLayer(marcadorAtual);
        }

        marcadorAtual = L.marker([lat, lng]).addTo(mapa);

      },
      () => alert("Erro ao obter localização.")
    );

  };

  return div;
};

controleMira.addTo(mapa);
  // ===============================
  // ADICIONAR REGISTRO
  // ===============================
  btnAddRegistro.addEventListener("click", () => {

    if (!ocorrenciaSelect.value || !quantidadeInput.value) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const registro = {
      ocorrencia: ocorrenciaSelect.value,
      individuo: individuoInput.value,
      especie: especieInput.value,
      fase: faseSelect.value,
      quantidade: quantidadeInput.value,
      data: new Date().toLocaleString()
    };

    registrosDoPonto.push(registro);
    renderizarLista();
    limparFormulario();

  });

  // ===============================
  // RENDERIZA LISTA
  // ===============================
  function renderizarLista() {

    listaContainer.innerHTML = "";

    if (registrosDoPonto.length === 0) {
      listaContainer.innerHTML = "<em>Nenhum registro técnico ainda.</em>";
      return;
    }

    registrosDoPonto.forEach((r, i) => {

      const div = document.createElement("div");
      div.className = "registro-item";
      div.innerHTML = `
        <strong>${r.ocorrencia}</strong><br>
        Espécie: ${r.especie || "-"}<br>
        Qtde: ${r.quantidade}
        <br><br>
        <button onclick="excluirRegistro(${i})">Excluir</button>
      `;

      listaContainer.appendChild(div);

    });
  }

  // ===============================
  // EXCLUIR
  // ===============================
  window.excluirRegistro = function (index) {
    registrosDoPonto.splice(index, 1);
    renderizarLista();
  };

  // ===============================
  // LIMPAR FORMULÁRIO
  // ===============================
  function limparFormulario() {
    individuoInput.value = "";
    especieInput.value = "";
    quantidadeInput.value = "";
  }

});
