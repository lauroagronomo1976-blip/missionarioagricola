document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // MAPA
  // ===============================
  const map = L.map("map").setView([-15.78, -47.93], 5);

  const camadaRua = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19 }
  ).addTo(map);

  const camadaSatelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19 }
  );

  let usandoSatelite = false;

  // ===============================
  // ESTADO
  // ===============================
  let pontoAtual = null;
  let inicioPonto = null;
  let registrosDoPontoAtual = [];
  let modoCriarPonto = false;
  let indiceEdicao = null;
  let formularioVisivel = false;

  // ===============================
  // ELEMENTOS
  // ===============================
  const btnMarcar = document.getElementById("btnMarcarPonto");
  const btnGravar = document.getElementById("btnGravarPonto");
  const btnAdicionar = document.getElementById("btnAddRegistro");
  const btnLayers = document.getElementById("btnLayers");
  const btnLocate = document.getElementById("btnLocate");
  const btnExibir = document.getElementById("btnExibirRegistros");

  const registroArea = document.getElementById("registroIndividuos");
  const listaRegistros = document.getElementById("listaRegistros");

  const individuoInput = document.getElementById("individuoInput");
  const especieInput = document.getElementById("especieInput");
  const faseSelect = document.getElementById("faseSelect");
  const quantidadeInput = document.getElementById("quantidadeInput");
  const ocorrenciaSelect = document.getElementById("ocorrenciaSelect");

  console.log("✅ JS carregado corretamente");

  // ===============================
  // STORAGE
  // ===============================
  function carregarMissao() {
    return JSON.parse(localStorage.getItem("missaoAtiva")) || { pontos: [] };
  }

  function salvarMissao(missao) {
    localStorage.setItem("missaoAtiva", JSON.stringify(missao));
  }

  // ===============================
  // FORMULÁRIO
  // ===============================
  function mostrarFormulario() {
    registroArea.style.display = "block";
    formularioVisivel = true;
  }

  function esconderFormulario() {
    registroArea.style.display = "none";
    formularioVisivel = false;
  }

  // ===============================
  // RENDER REGISTROS
  // ===============================
  function renderizarRegistros() {
    listaRegistros.innerHTML = "";

    registrosDoPontoAtual.forEach((r, index) => {
      const item = document.createElement("div");
      item.style.borderBottom = "1px solid #ddd";
      item.style.padding = "6px";

      item.innerHTML = `
        <strong>${r.ocorrencia}</strong><br>
        ${r.individuo} – ${r.especie}<br>
        Fase: ${r.fase || "-"} | Qtde: ${r.quantidade}
        <div style="margin-top:4px">
          <button data-edit="${index}">✏️</button>
          <button data-del="${index}">🗑</button>
        </div>
      `;
      listaRegistros.appendChild(item);
    });
  }

  // ===============================
  // MARCAR PONTO
  // ===============================
  btnMarcar.addEventListener("click", () => {
    modoCriarPonto = true;
    map.locate({ enableHighAccuracy: true });
  });

  btnLocate.addEventListener("click", () => {
    modoCriarPonto = false;
    map.locate({ enableHighAccuracy: true });
  });

  map.on("locationfound", (e) => {

    if (!modoCriarPonto) {
      map.setView(e.latlng, 17);
      return;
    }

    modoCriarPonto = false;

    if (pontoAtual) map.removeLayer(pontoAtual);

    pontoAtual = L.marker(e.latlng).addTo(map);
    pontoAtual.bindPopup("📍 Ponto marcado").openPopup();

    inicioPonto = new Date();
    registrosDoPontoAtual = [];
    indiceEdicao = null;

    mostrarFormulario();
    renderizarRegistros();
    map.setView(e.latlng, 17);
  });

  // ===============================
  // CAMADAS
  // ===============================
  btnLayers.addEventListener("click", () => {
    if (usandoSatelite) {
      map.removeLayer(camadaSatelite);
      camadaRua.addTo(map);
    } else {
      map.removeLayer(camadaRua);
      camadaSatelite.addTo(map);
    }
    usandoSatelite = !usandoSatelite;
  });

  // ===============================
  // ADICIONAR REGISTRO
  // ===============================
  btnAdicionar.addEventListener("click", () => {

    if (!pontoAtual) {
      alert("Marque um ponto antes");
      return;
    }

    const registro = {
      ocorrencia: ocorrenciaSelect.value,
      individuo: individuoInput.value.trim(),
      especie: especieInput.value.trim(),
      fase: faseSelect.value,
      quantidade: quantidadeInput.value
    };

    if (!registro.ocorrencia || !registro.individuo || !registro.especie || registro.quantidade === "") {
      alert("Preencha todos os campos");
      return;
    }

    if (indiceEdicao !== null) {
      registrosDoPontoAtual[indiceEdicao] = registro;
      indiceEdicao = null;
    } else {
      registrosDoPontoAtual.push(registro);
    }

    renderizarRegistros();

    individuoInput.value = "";
    especieInput.value = "";
    quantidadeInput.value = "";
    faseSelect.selectedIndex = 0;
    ocorrenciaSelect.selectedIndex = 0;
  });

  // ===============================
  // EDITAR / EXCLUIR
  // ===============================
  listaRegistros.addEventListener("click", (e) => {

    if (e.target.dataset.del !== undefined) {
      registrosDoPontoAtual.splice(e.target.dataset.del, 1);
      renderizarRegistros();
    }

    if (e.target.dataset.edit !== undefined) {
      const r = registrosDoPontoAtual[e.target.dataset.edit];
      ocorrenciaSelect.value = r.ocorrencia;
      individuoInput.value = r.individuo;
      especieInput.value = r.especie;
      faseSelect.value = r.fase;
      quantidadeInput.value = r.quantidade;
      indiceEdicao = e.target.dataset.edit;
      mostrarFormulario();
    }
  });

  // ===============================
  // EXIBIR / OCULTAR
  // ===============================
  if (btnExibir) {
  btnExibir.addEventListener("click", () => {
    if (formularioVisivel) {
      esconderFormulario();
    } else {
      mostrarFormulario();

      // 🔥 força exibir a lista sempre
      listaRegistros.style.display = "block";
      renderizarRegistros();
    }
  });
}
✅ O QUE I

  // ===============================
  // GRAVAR PONTO  ✅
  // ===============================
  btnGravar.addEventListener("click", () => {

    if (!pontoAtual) {
      alert("Nenhum ponto marcado");
      return;
    }

    const tempoMin = Math.round((new Date() - inicioPonto) / 60000);
    const missao = carregarMissao();

    missao.pontos.push({
      lat: pontoAtual.getLatLng().lat,
      lng: pontoAtual.getLatLng().lng,
      tempoMin,
      registros: [...registrosDoPontoAtual]
    });

    salvarMissao(missao);

    pontoAtual.bindPopup(
      `📍 Ponto gravado<br>
       ⏱ Duração: ${tempoMin} min<br>
       📋 Registros: ${registrosDoPontoAtual.length}`
    ).openPopup();

    pontoAtual = null;
    registrosDoPontoAtual = [];
    indiceEdicao = null;
    esconderFormulario();
    listaRegistros.innerHTML = "";

    alert("Ponto gravado com sucesso!");
  });

});
