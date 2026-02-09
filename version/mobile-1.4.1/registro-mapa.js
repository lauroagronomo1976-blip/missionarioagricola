document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 REGISTRO – MAPA PURO ATIVO");

  /* =========================
     ESTADO GLOBAL
  ========================== */
  let pontoAtivo = null; // ponto atual
  let registrosPorPonto = new Map();

  /* =========================
     MAPA
  ========================== */
  const map = L.map("map").setView([-15.78, -47.93], 5);

  const osm = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19 }
  );

  osm.addTo(map);

  L.control.layers({ "OSM": osm }).addTo(map);

  setTimeout(() => {
    map.invalidateSize();
    console.log("🛡️ invalidateSize aplicado");
  }, 300);

  /* =========================
     ELEMENTOS UI
  ========================== */
  const btnMarcar = document.getElementById("btnMarcar");
  const btnAddRegistro = document.getElementById("btnAddRegistro");

  const ocorrenciaSelect = document.getElementById("ocorrenciaSelect");
  const individuoInput   = document.getElementById("individuoInput");
  const especieInput     = document.getElementById("especieInput");
  const faseSelect       = document.getElementById("faseSelect");
  const quantidadeInput  = document.getElementById("quantidadeInput");

  /* =========================
     DADOS FIXOS (mock)
  ========================== */
  ocorrenciaSelect.innerHTML = `
    <option value="">Ocorrência</option>
    <option>Praga</option>
    <option>Doença</option>
    <option>Daninha</option>
  `;

  faseSelect.innerHTML = `
    <option value="">Fase</option>
    <option>Inicial</option>
    <option>Intermediária</option>
    <option>Avançada</option>
  `;

  /* =========================
     MARCAR PONTO (GPS)
  ========================== */
  btnMarcar.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        pontoAtivo = {
          id: Date.now(),
          lat,
          lng,
          data: new Date().toLocaleString()
        };

        registrosPorPonto.set(pontoAtivo.id, []);

        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`
          <strong>Ponto Ativo</strong><br>
          ${pontoAtivo.data}
        `).openPopup();

        map.setView([lat, lng], 18);

        console.log("📍 PONTO ATIVO:", pontoAtivo);
      },
      () => alert("Erro ao obter localização")
    );
  });

  /* =========================
     ADICIONAR REGISTRO
  ========================== */
  btnAddRegistro.addEventListener("click", () => {

    if (!pontoAtivo) {
      alert("Marque um ponto antes de adicionar registro");
      return;
    }

    if (
      !ocorrenciaSelect.value ||
      !individuoInput.value ||
      !especieInput.value ||
      !faseSelect.value ||
      !quantidadeInput.value
    ) {
      alert("Preencha todos os campos");
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

    registrosPorPonto.get(pontoAtivo.id).push(registro);

    console.log("🧾 REGISTRO SALVO:", registro);
    console.log("📦 REGISTROS DO PONTO:", registrosPorPonto.get(pontoAtivo.id));

    limparFormulario();
    alert("Registro adicionado com sucesso ✔️");
  });

  /* =========================
     UTIL
  ========================== */
  function limparFormulario() {
    ocorrenciaSelect.value = "";
    individuoInput.value = "";
    especieInput.value = "";
    faseSelect.value = "";
    quantidadeInput.value = "";
  }

});
