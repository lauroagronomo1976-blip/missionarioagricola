document.addEventListener("DOMContentLoaded", () => {

  console.log("🟢 REGISTRO – MAPA PURO ATIVO");

  // ===============================
  // VARIÁVEIS DE CONTEXTO
  // ===============================
  let mapa;
  let pontoAtual = null;
  let registrosDoPonto = [];
  let marcadorAtual = null;

  // ===============================
  // INICIALIZA MAPA
  // ===============================
  mapa = L.map("map", {
    zoomControl: true
  });

  const street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap" }
  );

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "© Esri" }
  );

  street.addTo(mapa);

  L.control.layers(
    {
      "Rua": street,
      "Satélite": satelite
    }
  ).addTo(mapa);

  mapa.setView([-15.8, -47.9], 5);

  setTimeout(() => {
    mapa.invalidateSize();
    console.log("🛡️ invalidateSize aplicado");
  }, 300);

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

  // ⚠️ TODO O RESTANTE DO SEU CÓDIGO FICA AQUI DENTRO

});

// ===============================
// VARIÁVEIS DE CONTEXTO
// ===============================
let mapa;
let pontoAtual = null; // ponto ativo (lat, lng, data)
let registrosDoPonto = []; // registros técnicos vinculados ao ponto
let marcadorAtual = null;

// ===============================
// INICIALIZA MAPA
// ===============================
mapa = L.map("map", {
  zoomControl: true
});

// Camadas base
const street = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { attribution: "© OpenStreetMap" }
);

const satelite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "© Esri" }
);

// Ativa camada padrão
street.addTo(mapa);

// Controle de camadas
L.control.layers(
  {
    "Rua": street,
    "Satélite": satelite
  }
).addTo(mapa);

// Centralização inicial
mapa.setView([-15.8, -47.9], 5);

// Ajuste defensivo
setTimeout(() => {
  mapa.invalidateSize();
  console.log("🛡️ invalidateSize aplicado");
}, 300);

// ===============================
// ELEMENTOS DA INTERFACE
// ===============================
const btnMarcar = document.getElementById("btnMarcar");
const btnAddRegistro = document.getElementById("btnAddRegistro");

// Campos de registro técnico
const ocorrenciaSelect = document.getElementById("ocorrenciaSelect");
const individuoInput = document.getElementById("individuoInput");
const especieInput = document.getElementById("especieInput");
const faseSelect = document.getElementById("faseSelect");
const quantidadeInput = document.getElementById("quantidadeInput");

// Área da lista
const listaContainer = document.getElementById("listaRegistros");

// ===============================
// POPULA CAMPOS FIXOS (EXEMPLO)
// ===============================
if (ocorrenciaSelect) {
  ["Lagarta", "Percevejo", "Doença", "Planta Daninha"].forEach(o => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    ocorrenciaSelect.appendChild(opt);
  });
}

if (faseSelect) {
  ["Inicial", "Intermediária", "Avançada"].forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    faseSelect.appendChild(opt);
  });
}

// ===============================
// MARCAR PONTO (GEOLOCALIZAÇÃO)
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

      pontoAtual = {
        lat,
        lng,
        data: new Date().toISOString()
      };

      registrosDoPonto = []; // zera registros ao marcar novo ponto
      renderizarLista();

      if (marcadorAtual) {
        mapa.removeLayer(marcadorAtual);
      }

      marcadorAtual = L.marker([lat, lng]).addTo(mapa);
      mapa.setView([lat, lng], 18);
      
// ===============================
// ADICIONAR REGISTRO TÉCNICO
// ===============================

function adicionarRegistro() {

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

  console.log("📝 Registro técnico adicionado:", registro);
}

if (btnAddRegistro) {
  btnAddRegistro.addEventListener("click", adicionarRegistro);
}
function renderizarLista() {
  if (!listaContainer) return;

  listaContainer.innerHTML = "";

  if (registrosDoPonto.length === 0) {
    listaContainer.innerHTML = "<em>Nenhum registro técnico ainda.</em>";
    return;
  }

  registrosDoPonto.forEach((r, i) => {
    const div = document.createElement("div");
    div.className = "registro-item";

    window.editarRegistro = function (index) {
  const r = registrosDoPonto[index];

  ocorrenciaSelect.value = r.ocorrencia;
  individuoInput.value = r.individuo;
  especieInput.value = r.especie;
  faseSelect.value = r.fase;
  quantidadeInput.value = r.quantidade;

  registrosDoPonto.splice(index, 1);
  renderizarLista();
};

    listaContainer.appendChild(div);
  });
}

// ===============================
// EXCLUIR REGISTRO
// ===============================
window.excluirRegistro = function (index) {
  registrosDoPonto.splice(index, 1);
  renderizarLista();
};

// ===============================
// LIMPA FORMULÁRIO
// ===============================
function limparFormulario() {
  individuoInput.value = "";
  especieInput.value = "";
  quantidadeInput.value = "";
}

});
