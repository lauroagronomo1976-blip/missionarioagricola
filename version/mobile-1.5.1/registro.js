let map;
let coordenadaAtual = null;
let marcadorAtual = null;
let pontoAtual = null;
let registrosDoPonto = [];

document.addEventListener("DOMContentLoaded", () => {

  /* ================= MAPA ================= */
  map = L.map('map', { zoomControl: false })
    .setView([-15.0, -47.0], 5);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  setTimeout(() => map.invalidateSize(), 300);

  /* ================= 🎯 MIRA ================= */
  document.getElementById("btnMira").addEventListener("click", ativarMira);

  /* ================= MARCAR PONTO ================= */
  document.getElementById("btnMarcarPontoInferior")
    .addEventListener("click", marcarPonto);

  /* ================= SALVAR REGISTRO ================= */
  document.getElementById("btnSalvarRegistro")
    .addEventListener("click", salvarRegistro);

  /* ================= CONCLUIR ================= */
  document.getElementById("btnConcluirPonto")
    .addEventListener("click", concluirPonto);
});


/* ================= FUNÇÕES ================= */

function ativarMira() {
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

  });
}


function marcarPonto() {

  const dadosMissao = JSON.parse(localStorage.getItem("dadosMissao"));

  if (!dadosMissao) {
    alert("Nenhuma missão ativa.");
    return;
  }

  if (!coordenadaAtual) {
    alert("Clique na 🎯 primeiro.");
    return;
  }

  pontoAtual = {
    ...dadosMissao,
    latitude: coordenadaAtual.lat,
    longitude: coordenadaAtual.lng,
    data: new Date().toISOString()
  };

  registrosDoPonto = [];

  L.marker([coordenadaAtual.lat, coordenadaAtual.lng]).addTo(map);

  document.getElementById("formMissaoContainer").style.display = "block";

  document.getElementById("tituloMissao").innerText = dadosMissao.missao;

  document.getElementById("infoMissao").innerHTML = `
    <b>Missão:</b> ${dadosMissao.missao}<br>
    <b>Fazenda:</b> ${dadosMissao.fazenda}<br>
    <b>Talhão:</b> ${dadosMissao.talhao}
  `;
}


function salvarRegistro() {

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
  renderizarLista();
}


function concluirPonto() {
  document.getElementById("formMissaoContainer").style.display = "none";
}


function renderizarLista() {

  const lista = document.getElementById("listaRegistros");
  lista.innerHTML = "";

  registrosDoPonto.forEach((r) => {

    const div = document.createElement("div");
    div.className = "registro-item";

    div.innerHTML = `
      <strong>${r.ocorrencia}</strong> - ${r.especie}<br>
      Fase: ${r.fase} | Ind: ${r.individuos} | Sev: ${r.severidade}%
    `;

    lista.appendChild(div);
  });
}
