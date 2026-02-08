console.log("🟢 REGISTRO – MISSÃO / PONTOS / REGISTROS ATIVO");

// =======================
// ESTADO GLOBAL
// =======================
let map;
let missaoAtiva = null;
let pontoAtivo = null;
let marcadorAtivo = null;

// =======================
// MAPA
// =======================
map = L.map("map").setView([-15.78, -47.93], 5);

const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
});

const satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "© Esri" }
);

street.addTo(map);

L.control.layers(
  { "Mapa": street, "Satélite": satellite },
  null,
  { position: "topright" }
).addTo(map);

setTimeout(() => map.invalidateSize(), 300);

// =======================
// ELEMENTOS
// =======================
const btnIniciarMissao = document.getElementById("btnIniciarMissao");
const btnFinalizarMissao = document.getElementById("btnFinalizarMissao");
const btnMarcar = document.getElementById("btnMarcar");

const blocoRegistros = document.getElementById("blocoRegistros");
const lista = document.getElementById("listaRegistros");

const ocorrencia = document.getElementById("ocorrencia");
const individuo = document.getElementById("individuo");
const especie = document.getElementById("especie");
const fase = document.getElementById("fase");
const quantidade = document.getElementById("quantidade");
const btnAddRegistro = document.getElementById("btnAddRegistro");

// =======================
// MISSÃO
// =======================
btnIniciarMissao.addEventListener("click", () => {
  if (missaoAtiva) {
    alert("Missão já está ativa");
    return;
  }

  missaoAtiva = {
    inicio: new Date(),
    pontos: []
  };

  alert("✅ Missão iniciada");
});

btnFinalizarMissao.addEventListener("click", () => {
  if (!missaoAtiva) {
    alert("Nenhuma missão ativa");
    return;
  }

  missaoAtiva.fim = new Date();

  console.log("📦 MISSÃO FINALIZADA:", missaoAtiva);

  alert(`Missão finalizada com ${missaoAtiva.pontos.length} ponto(s)`);

  missaoAtiva = null;
  pontoAtivo = null;
  lista.innerHTML = "";
});

// =======================
// MARCAR PONTO (GPS)
// =======================
btnMarcar.addEventListener("click", () => {
  if (!missaoAtiva) {
    alert("Inicie uma missão primeiro");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];

      if (marcadorAtivo) map.removeLayer(marcadorAtivo);

      marcadorAtivo = L.marker(latlng).addTo(map);
      marcadorAtivo.bindPopup("📍 Ponto ativo").openPopup();

      pontoAtivo = {
        lat: latlng[0],
        lng: latlng[1],
        inicio: new Date(),
        registros: []
      };

      missaoAtiva.pontos.push(pontoAtivo);
      map.setView(latlng, 17);
      renderizarLista();
    },
    () => alert("Erro ao obter GPS")
  );
});

// =======================
// REGISTROS
// =======================
btnAddRegistro.addEventListener("click", () => {
  if (!pontoAtivo) {
    alert("Marque um ponto primeiro");
    return;
  }

  if (!ocorrencia.value || !individuo.value || !especie.value || !quantidade.value) {
    alert("Preencha todos os campos");
    return;
  }

  pontoAtivo.registros.push({
    ocorrencia: ocorrencia.value,
    individuo: individuo.value,
    especie: especie.value,
    fase: fase.value,
    quantidade: quantidade.value
  });

  limparFormulario();
  renderizarLista();
});

function limparFormulario() {
  ocorrencia.value = "";
  individuo.value = "";
  especie.value = "";
  fase.value = "";
  quantidade.value = "";
}

// =======================
// LISTA ABAIXO DO MAPA
// =======================
function renderizarLista() {
  lista.innerHTML = "";

  if (!pontoAtivo || pontoAtivo.registros.length === 0) {
    lista.innerHTML = "<p>Sem registros neste ponto.</p>";
    return;
  }

  pontoAtivo.registros.forEach((r, i) => {
    const div = document.createElement("div");
    div.className = "registro-item";
    div.innerHTML = `
      <strong>${r.ocorrencia}</strong><br>
      ${r.individuo} – ${r.especie}<br>
      Fase: ${r.fase} | Qtde: ${r.quantidade}
      <div style="margin-top:6px">
        <button data-del="${i}">🗑</button>
      </div>
    `;
    lista.appendChild(div);
  });
}

lista.addEventListener("click", (e) => {
  if (e.target.dataset.del !== undefined) {
    pontoAtivo.registros.splice(e.target.dataset.del, 1);
    renderizarLista();
  }
});
