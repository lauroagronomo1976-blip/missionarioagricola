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
  let registros = [];
  let criandoPonto = false;
  let localAtual = null;

  // ===============================
  // ELEMENTOS
  // ===============================
  const btnMarcar = document.getElementById("btnMarcarPonto");
  const btnGravar = document.getElementById("btnGravarPonto");
  const btnAdicionar = document.getElementById("btnAdicionarRegistro");
  const btnLayers = document.getElementById("btnLayers");
  const btnLocate = document.getElementById("btnLocate");

  const registroArea = document.getElementById("registroIndividuos");

  const individuoInput = document.getElementById("individuoInput");
  const especieInput = document.getElementById("especieInput");
  const faseSelect = document.getElementById("faseSelect");
  const quantidadeInput = document.getElementById("quantidadeInput");

  const lista = document.createElement("div");
  registroArea.appendChild(lista);

  // ===============================
  // EVENTO DE LOCALIZAÇÃO (ÚNICO)
  // ===============================
  map.on("locationfound", (e) => {

    // 🔵 posição atual (bolinha azul)
    if (localAtual) map.removeLayer(localAtual);

    localAtual = L.circleMarker(e.latlng, {
      radius: 6,
      color: "#005eff",
      fillColor: "#3399ff",
      fillOpacity: 0.9
    }).addTo(map);

    // 👉 só centraliza
    if (!criandoPonto) {
      map.setView(e.latlng, 17);
      return;
    }

    // 👉 cria ponto
    criandoPonto = false;

    if (pontoAtual) map.removeLayer(pontoAtual);

    pontoAtual = L.marker(e.latlng).addTo(map);
    pontoAtual.bindPopup("📍 Ponto marcado (não gravado)").openPopup();

    map.setView(e.latlng, 17);

    inicioPonto = new Date();
    registros = [];
    lista.innerHTML = "";

    registroArea.style.display = "block";
  });

  // ===============================
  // MARCAR PONTO
  // ===============================
  btnMarcar.addEventListener("click", () => {
    criandoPonto = true;
    map.locate({ enableHighAccuracy: true });
  });

  // ===============================
  // MIRA (SÓ LOCALIZA)
  // ===============================
  btnLocate.addEventListener("click", () => {
    criandoPonto = false;
    map.locate({ enableHighAccuracy: true });
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
  // ADICIONAR REGISTRO (EMPILHAR)
  // ===============================
  btnAdicionar.addEventListener("click", () => {

    const individuo = individuoInput.value.trim();
    const especie = especieInput.value.trim();
    const fase = faseSelect.value;
    const quantidade = quantidadeInput.value.trim();

    if (!individuo || !especie || !quantidade) {
      alert("Preencha todos os campos do registro técnico");
      return;
    }

    const registro = { individuo, especie, fase, quantidade };
    registros.push(registro);

    const item = document.createElement("div");
    item.style.borderBottom = "1px solid #ccc";
    item.style.padding = "6px 0";
    item.innerHTML = `
      <strong>${individuo}</strong> – ${especie}<br>
      Fase: ${fase || "-"} | Qtde: ${quantidade}
    `;

    lista.appendChild(item);

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
      alert("Marque um ponto primeiro");
      return;
    }

    const tempoMin = Math.round((new Date() - inicioPonto) / 60000);

    pontoAtual.bindPopup(
      `📍 Ponto gravado<br>
       Registros: ${registros.length}<br>
       ⏱ ${tempoMin} min`
    ).openPopup();

    alert("Ponto gravado com sucesso!");
    console.log("Registros:", registros);
  });

});
