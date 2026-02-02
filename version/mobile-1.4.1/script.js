document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ JS carregado sem erros");

  /* ================= MAPA ================= */
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

  /* ================= ESTADO ================= */
  let pontoAtual = null;
  let inicioPonto = null;
  let registrosDoPontoAtual = [];
  let modoCriarPonto = false;

  /* ================= ELEMENTOS ================= */
  const btnMarcar = document.getElementById("btnMarcarPonto");
  const btnGravar = document.getElementById("btnGravarPonto");
  const btnAdicionar = document.getElementById("btnAddRegistro");
  const btnExibir = document.getElementById("btnExibirRegistros");
  const btnLayers = document.getElementById("btnLayers");
  const btnLocate = document.getElementById("btnLocate");

  const registroArea = document.getElementById("registroIndividuos");
  const listaRegistros = document.getElementById("listaRegistros");

  const individuoInput = document.getElementById("individuoInput");
  const especieInput = document.getElementById("especieInput");
  const faseSelect = document.getElementById("faseSelect");
  const quantidadeInput = document.getElementById("quantidadeInput");
  const ocorrenciaSelect = document.getElementById("ocorrenciaSelect");

  /* ================= UI ================= */
  function mostrarFormulario() {
    registroArea.style.display = "block";
    listaRegistros.style.display = "block";
  }

  function esconderFormulario() {
    registroArea.style.display = "none";
    listaRegistros.style.display = "none";
  }

  /* ================= RENDER ================= */
  function renderizarRegistros() {
    listaRegistros.innerHTML = "";

    registrosDoPontoAtual.forEach((r, i) => {
      const div = document.createElement("div");
      div.style.borderBottom = "1px solid #ccc";
      div.style.padding = "6px";

      div.innerHTML = `
        <strong>${r.ocorrencia}</strong><br>
        ${r.individuo} – ${r.especie}<br>
        Fase: ${r.fase} | Qtde: ${r.quantidade}
      `;

      listaRegistros.appendChild(div);
    });
  }

  /* ================= MARCAR PONTO ================= */
  btnMarcar.addEventListener("click", () => {
    modoCriarPonto = true;
    map.locate({ enableHighAccuracy: true });
  });

  map.on("locationfound", (e) => {
    if (!modoCriarPonto) return;

    modoCriarPonto = false;

    if (pontoAtual) map.removeLayer(pontoAtual);

    pontoAtual = L.marker(e.latlng).addTo(map);
    pontoAtual.bindPopup("📍 Ponto marcado").openPopup();

    inicioPonto = new Date();
    registrosDoPontoAtual = [];

    mostrarFormulario();
    map.setView(e.latlng, 17);
  });

  /* ================= CAMADAS ================= */
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

  /* ================= REGISTROS ================= */
  btnAdicionar.addEventListener("click", () => {
    if (!pontoAtual) {
      alert("Marque um ponto antes");
      return;
    }

    const r = {
      ocorrencia: ocorrenciaSelect.value,
      individuo: individuoInput.value,
      especie: especieInput.value,
      fase: faseSelect.value,
      quantidade: quantidadeInput.value
    };

    registrosDoPontoAtual.push(r);
    renderizarRegistros();

    individuoInput.value = "";
    especieInput.value = "";
    quantidadeInput.value = "";
  });

  btnExibir.addEventListener("click", () => {
    listaRegistros.style.display =
      listaRegistros.style.display === "none" ? "block" : "none";
  });

  /* ================= GRAVAR ================= */
  btnGravar.addEventListener("click", () => {
    if (!pontoAtual) {
      alert("Nenhum ponto marcado");
      return;
    }

    const tempoMin = Math.round((new Date() - inicioPonto) / 60000);

    pontoAtual.bindPopup(
      `📍 Ponto gravado<br>
       📋 ${registrosDoPontoAtual.length} registros<br>
       ⏱ ${tempoMin} min`
    ).openPopup();

    pontoAtual = null;
    registrosDoPontoAtual = [];
    esconderFormulario();

    alert("Ponto gravado com sucesso!");
  });

});
