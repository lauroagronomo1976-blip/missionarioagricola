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

  // ===============================
  // ELEMENTOS (IDs EXATOS DO SEU HTML)
  // ===============================
  const btnMarcar = document.getElementById("btnMarcarPonto");
  const btnGravar = document.getElementById("btnGravarPonto");
  const btnFinalizar = document.getElementById("btnFinalizarMissao");
  const btnAdicionar = document.getElementById("btnAddRegistro");
  const btnLayers = document.getElementById("btnLayers");
  const btnLocate = document.getElementById("btnLocate");

  const registroArea = document.getElementById("registroIndividuos");
  const listaRegistros = document.getElementById("listaRegistros");

  const individuoInput = document.getElementById("individuoInput");
  const especieInput = document.getElementById("especieInput");
  const faseSelect = document.getElementById("faseSelect");
  const quantidadeInput = document.getElementById("quantidadeInput");

  // ===============================
  // STORAGE
  // ===============================
  function carregarMissao() {
    const dados = localStorage.getItem("missaoAtiva");
    return dados ? JSON.parse(dados) : { pontos: [] };
  }

  function salvarMissao(missao) {
    localStorage.setItem("missaoAtiva", JSON.stringify(missao));
  }

  // ===============================
  // RECARREGAR PONTOS SALVOS
  // ===============================
  function renderizarPontosSalvos() {
    const missao = carregarMissao();
    missao.pontos.forEach((p) => {
      const m = L.marker([p.lat, p.lng]).addTo(map);
      m.bindPopup(
        `📍 Ponto gravado<br>
         Registros: ${p.registros.length}<br>
         ⏱ ${p.tempoMin} min`
      );
    });
  }
  renderizarPontosSalvos();

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
    pontoAtual.bindPopup("📍 Ponto marcado (não gravado)").openPopup();

    inicioPonto = new Date();
    registrosDoPontoAtual = [];
    listaRegistros.innerHTML = "";
    registroArea.style.display = "block";

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
  // ADICIONAR REGISTRO (AGORA FUNCIONA)
  // ===============================
  btnAdicionar.addEventListener("click", () => {
    if (!pontoAtual) {
      alert("Marque um ponto antes de adicionar registros");
      return;
    }

    const individuo = individuoInput.value.trim();
    const especie = especieInput.value.trim();
    const fase = faseSelect.value;
    const quantidade = quantidadeInput.value.trim();

    if (!individuo || !especie || !quantidade) {
      alert("Preencha todos os campos do registro técnico");
      return;
    }

    const registro = { individuo, especie, fase, quantidade };
    registrosDoPontoAtual.push(registro);

    const item = document.createElement("div");
    item.style.borderBottom = "1px solid #ddd";
    item.style.padding = "6px 0";
    item.innerHTML = `
      <strong>${individuo}</strong> – ${especie}<br>
      Fase: ${fase || "-"} | Qtde: ${quantidade}
    `;

    listaRegistros.appendChild(item);

    individuoInput.value = "";
    especieInput.value = "";
    quantidadeInput.value = "";
    faseSelect.selectedIndex = 0;
  });

  // ===============================
  // GRAVAR PONTO
  // ===============================
  btnGravar.addEventListener("click", () => {
    if (!pontoAtual) {
      alert("Nenhum ponto marcado");
      return;
    }

    const tempoMin = Math.round((new Date() - inicioPonto) / 60000);

    const missao = carregarMissao();

    const pontoSalvo = {
      lat: pontoAtual.getLatLng().lat,
      lng: pontoAtual.getLatLng().lng,
      tempoMin,
      registros: registrosDoPontoAtual,
    };

    missao.pontos.push(pontoSalvo);
    salvarMissao(missao);

    pontoAtual.bindPopup(
      `📍 Ponto gravado<br>
       Registros: ${registrosDoPontoAtual.length}<br>
       ⏱ ${tempoMin} min`
    );

    pontoAtual = null;
    registrosDoPontoAtual = [];
    registroArea.style.display = "none";

    alert("Ponto gravado com sucesso!");
  });

  // ===============================
  // FINALIZAR MISSÃO (BASE)
  // ===============================
  btnFinalizar.addEventListener("click", () => {
    const missao = carregarMissao();
    alert(`Missão finalizada\nPontos registrados: ${missao.pontos.length}`);
    console.log("MISSÃO:", missao);
  });

});
