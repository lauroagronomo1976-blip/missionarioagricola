console.log("🟢 REGISTRO – MISSÃO / MAPA ATIVO");

// ===============================
// STORAGE (MISSÃO = PAI)
// ===============================
function carregarMissao() {
  return JSON.parse(localStorage.getItem("missaoAtiva")) || {
    inicio: new Date().toISOString(),
    pontos: []
  };
}

function salvarMissao(missao) {
  localStorage.setItem("missaoAtiva", JSON.stringify(missao));
}

// ===============================
// DOM READY
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // ELEMENTOS
  // ===============================
  const btnMarcar = document.getElementById("btnMarcar");
  const btnAdicionarRegistro = document.getElementById("btnAdicionarRegistro");

  const ocorrenciaSelect = document.getElementById("ocorrenciaSelect");
  const individuoInput = document.getElementById("individuoInput");
  const especieInput = document.getElementById("especieInput");
  const faseSelect = document.getElementById("faseSelect");
  const quantidadeInput = document.getElementById("quantidadeInput");

  const listaRegistros = document.getElementById("listaRegistros");

  // ===============================
  // MAPA (NUNCA SOME)
  // ===============================
  const map = L.map("map").setView([-15.78, -47.93], 5);

  const camadaRua = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19 }
  ).addTo(map);

  const camadaSat = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19 }
  );

  const layers = {
    "Rua": camadaRua,
    "Satélite": camadaSat
  };

  L.control.layers(layers).addTo(map);

  setTimeout(() => map.invalidateSize(), 300);

  // ===============================
  // ESTADO DO APP
  // ===============================
  let pontoAtual = null;
  let registrosDoPonto = [];
  let indiceEdicao = null;

  // ===============================
  // MARCAR PONTO (LOCALIZAÇÃO REAL)
  // ===============================
  btnMarcar.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        if (pontoAtual) map.removeLayer(pontoAtual);

        pontoAtual = L.marker(latlng).addTo(map);
        map.setView(latlng, 18);

        pontoAtual.bindPopup("📍 Ponto em registro").openPopup();

        registrosDoPonto = [];
        indiceEdicao = null;
        renderizarRegistros();
      },
      () => alert("Não foi possível obter localização")
    );
  });

  // ===============================
  // ADICIONAR / EDITAR REGISTRO
  // ===============================
  btnAddRegistro.addEventListener("click", () => {
    if (!pontoAtual) {
      alert("Marque um ponto primeiro");
      return;
    }

    if (
      !ocorrenciaSelect.value ||
      !individuoInput.value ||
      !especieInput.value ||
      !faseSelect.value ||
      quantidadeInput.value === ""
    ) {
      alert("Preencha todos os campos");
      return;
    }

    const registro = {
      ocorrencia: ocorrenciaSelect.value,
      individuo: individuoInput.value.trim(),
      especie: especieInput.value.trim(),
      fase: faseSelect.value,
      quantidade: quantidadeInput.value
    };

    if (indiceEdicao !== null) {
      registrosDoPonto[indiceEdicao] = registro;
      indiceEdicao = null;
    } else {
      registrosDoPonto.push(registro);
    }

    limparFormulario();
    renderizarRegistros();
  });

  // ===============================
  // RENDERIZAR REGISTROS
  // ===============================
  function renderizarRegistros() {
    listaRegistros.innerHTML = "";

    if (!registrosDoPonto.length) {
      listaRegistros.innerHTML = "<p>Nenhum registro neste ponto.</p>";
      return;
    }

    registrosDoPonto.forEach((r, i) => {
      const div = document.createElement("div");
      div.className = "registro-item";

      div.innerHTML = `
        <strong>${r.ocorrencia}</strong><br>
        ${r.individuo} – ${r.especie}<br>
        Fase: ${r.fase} | Qtde: ${r.quantidade}
        <div style="margin-top:6px">
          <button data-edit="${i}">✏️</button>
          <button data-del="${i}">🗑</button>
        </div>
      `;

      listaRegistros.appendChild(div);
    });
  }

  // ===============================
  // EDITAR / EXCLUIR
  // ===============================
  listaRegistros.addEventListener("click", (e) => {
    if (e.target.dataset.del !== undefined) {
      registrosDoPonto.splice(e.target.dataset.del, 1);
      renderizarRegistros();
    }

    if (e.target.dataset.edit !== undefined) {
      const r = registrosDoPonto[e.target.dataset.edit];

      ocorrenciaSelect.value = r.ocorrencia;
      individuoInput.value = r.individuo;
      especieInput.value = r.especie;
      faseSelect.value = r.fase;
      quantidadeInput.value = r.quantidade;

      indiceEdicao = e.target.dataset.edit;
    }
  });

  function limparFormulario() {
    ocorrenciaSelect.selectedIndex = 0;
    individuoInput.value = "";
    especieInput.value = "";
    faseSelect.selectedIndex = 0;
    quantidadeInput.value = "";
  }

});
