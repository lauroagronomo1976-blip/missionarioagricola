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
document.getElementById("btnMarcarPontoInferior")
.addEventListener("click", () => {

  if (!coordenadaAtual) {
    alert("Clique na 🎯 primeiro.");
    return;
  }

  pontoAtual = {
    latitude: coordenadaAtual.lat,
    longitude: coordenadaAtual.lng,
    data: new Date().toISOString()
  };

  registrosDoPonto = [];

  L.marker([coordenadaAtual.lat, coordenadaAtual.lng]).addTo(map);

  const form = document.getElementById("formMissaoContainer");
  form.style.display = "block";

  const mapContainer = document.getElementById("mapContainer");
  mapContainer.style.height = "35vh";

  setTimeout(() => {
    map.invalidateSize();
  }, 300);

});
    document.getElementById("btnConcluirPonto")
.addEventListener("click", () => {

  const form = document.getElementById("formMissaoContainer");
  form.style.display = "none";

  const mapContainer = document.getElementById("mapContainer");
  mapContainer.style.height = "60vh";

  setTimeout(() => {
    map.invalidateSize();
  }, 300);

});
    /* ================= MARCAR PONTO ================= */

document.getElementById("btnMarcarPontoInferior")
.addEventListener("click", () => {

  if (!coordenadaAtual) {
    alert("Clique na 🎯 primeiro.");
    return;
  }

  pontoAtual = {
    latitude: coordenadaAtual.lat,
    longitude: coordenadaAtual.lng,
    data: new Date().toISOString()
  };

  registrosDoPonto = [];

  L.marker([coordenadaAtual.lat, coordenadaAtual.lng]).addTo(map);

  const form = document.getElementById("formMissaoContainer");
  form.style.display = "block";

  const mapContainer = document.getElementById("mapContainer");
  mapContainer.style.height = "35vh";

  setTimeout(() => {
    map.invalidateSize();
  }, 300);

});
    document.getElementById("btnConcluirPonto")
.addEventListener("click", () => {

  const form = document.getElementById("formMissaoContainer");
  form.style.display = "none";

  const mapContainer = document.getElementById("mapContainer");
  mapContainer.style.height = "60vh";

  setTimeout(() => {
    map.invalidateSize();
  }, 300);

});
  });


  /* ================= MARCAR PONTO ================= */

  document.getElementById("btnMarcarPontoInferior")
    .addEventListener("click", function() {

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

      const form = document.getElementById("formMissaoContainer");
      document.getElementById("formMissaoContainer").style.maxHeight = "500px";
      setTimeout(() => map.invalidateSize(), 400);

      document.getElementById("formMissaoContainer").style.maxHeight = "0";
      setTimeout(() => map.invalidateSize(), 400);
      
      document.getElementById("tituloMissao").innerText = dadosMissao.missao;

      setTimeout(() => {
        map.invalidateSize();
      }, 400);

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

      const form = document.getElementById("formMissaoContainer");
      form.style.maxHeight = "0";

      setTimeout(() => {
        map.invalidateSize();
      }, 400);

  });

});


function renderizarLista() {

  const lista = document.getElementById("listaRegistros");
  lista.innerHTML = "";

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
