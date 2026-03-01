let map;
let coordenadaAtual = null;
let marcadorAtual = null;

document.addEventListener("DOMContentLoaded", () => {

  console.log("🟢 REGISTRO – MAPA ATIVO");

  /* =========================
     MAPA
  ========================== */

  map = L.map('map', {
    zoomControl: false
  }).setView([-15.0, -47.0], 5);

  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);

  const street = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 19 }
  ).addTo(map);

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "© Esri", maxZoom: 21 }
  );

  L.control.layers({
    "Rua": street,
    "Satélite": satelite
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 300);


  /* =========================
     BOTÃO 🎯 MIRA
  ========================== */

  document.getElementById("btnMira").addEventListener("click", () => {

    if (!navigator.geolocation) {
      alert("Geolocalização não suportada.");
      return;
    }

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

    }, () => {
      alert("Erro ao obter localização.");
    });

  });


  /* =========================
     BOTÃO MARCAR PONTO
  ========================== */

  let pontoAtual = null;
  let registrosDoPonto = [];

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

    // cria ponto atual
    pontoAtual = {
      ...dadosMissao,
      latitude: coordenadaAtual.lat,
      longitude: coordenadaAtual.lng,
      data: new Date().toISOString()
    };

    registrosDoPonto = [];

    // marca no mapa
    L.marker([coordenadaAtual.lat, coordenadaAtual.lng]).addTo(map);

    // mostra formulário
    document.getElementById("formMissaoContainer").style.display = "block";
    document.getElementById("tituloMissao").innerText = dadosMissao.missao;

});
      document.getElementById("btnConcluirPonto")
  .addEventListener("click", function() {

    if (!pontoAtual) return;

    pontoAtual.registros = registrosDoPonto;

    let pontos = JSON.parse(localStorage.getItem("pontosInspecao")) || [];
    pontos.push(pontoAtual);

    localStorage.setItem("pontosInspecao", JSON.stringify(pontos));

    alert("Ponto finalizado com sucesso!");

    document.getElementById("formMissaoContainer").style.display = "none";

});
      if (!coordenadaAtual) {
        alert("Clique na 🎯 para capturar sua posição primeiro.");
        return;
      }

      document.getElementById("modalInspecao").style.display = "flex";
  });
document.getElementById("btnSalvarRegistro")
  .addEventListener("click", function() {

    const ocorrencia = document.getElementById("ocorrenciaSelect").value;
    const especie = document.getElementById("especieInput").value;
    const fase = document.getElementById("faseSelect").value;
    const individuos = document.getElementById("individuosInput").value;
    const severidade = document.getElementById("severidadeInput").value;

    if (!ocorrencia || !especie) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const registro = {
      ocorrencia,
      especie,
      fase,
      individuos,
      severidade
    };

    registrosDoPonto.push(registro);
    renderizarLista()
});

  
function renderizarLista() {

  const lista = document.getElementById("listaRegistros");
  lista.innerHTML = "";

  if (registrosDoPonto.length === 0) return;

  registrosDoPonto.forEach((r, i) => {

    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${r.ocorrencia}</strong> - ${r.especie}<br>
      Fase: ${r.fase} | Ind: ${r.individuos} | Sev: ${r.severidade}%<br>
      <hr>
    `;

    lista.appendChild(div);

  });
}
/* =========================
   MODAL
========================== */

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

  L.marker([coordenadaAtual.lat, coordenadaAtual.lng])
    .addTo(map)
    .bindPopup(`
      <strong>${praga}</strong><br>
      Incidência: ${incidencia}%<br>
      ${new Date().toLocaleString()}
    `);

  fecharModal();

  alert("Ponto salvo com sucesso!");
}
