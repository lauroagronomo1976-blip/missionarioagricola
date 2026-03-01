let map;
let coordenadaAtual = null;
let marcadorAtual = null;
let pontoAtual = null;
let registrosDoPonto = [];

document.addEventListener("DOMContentLoaded", () => {

  console.log("🟢 REGISTRO – MAPA ATIVO");

  /* ================= MAPA ================= */

  map = L.map('map', { zoomControl: false })
    .setView([-15.0, -47.0], 5);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  const street = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 19 }
  ).addTo(map);

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 21 }
  );

  L.control.layers({
    "Rua": street,
    "Satélite": satelite
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 300);


  /* ================= 🎯 MIRA ================= */

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

    });

  });


  /* ================= MARCAR PONTO ================= */

  document.getElementById("btnMarcarPontoInferior")
    .addEventListener("click", () => {

      const dadosMissao = JSON.parse(localStorage.getItem("dadosMissao"));

      if (!dadosMissao || dadosMissao.missao !== "Inspeção Fitossanitária") {
        alert("Missão atual não é Inspeção Fitossanitária.");
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

  });


  /* ================= SALVAR REGISTRO ================= */

  document.getElementById("btnSalvarRegistro")
    .addEventListener("click", () => {

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

  });


  /* ================= CONCLUIR PONTO ================= */

  document.getElementById("btnConcluirPonto")
    .addEventListener("click", () => {

      if (!pontoAtual) return;

      pontoAtual.registros = registrosDoPonto;

      let pontos = JSON.parse(localStorage.getItem("pontosInspecao")) || [];
      pontos.push(pontoAtual);

      localStorage.setItem("pontosInspecao", JSON.stringify(pontos));

      alert("Ponto finalizado!");

      document.getElementById("formMissaoContainer").style.display = "none";

  });

});


/* ================= RENDER LISTA ================= */

function renderizarLista() {

  const lista = document.getElementById("listaRegistros");
  lista.innerHTML = "";

  if (registrosDoPonto.length === 0) return;

  registrosDoPonto.forEach((r) => {

    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${r.ocorrencia}</strong> - ${r.especie}<br>
      Fase: ${r.fase} | Ind: ${r.individuos} | Sev: ${r.severidade}%<br>
      <hr>
    `;

    lista.appendChild(div);

  });
}
