document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 REGISTRO – MAPA PURO ATIVO");

  let map;
  let modoCriarPonto = false;

  /* ========= MAPA ========= */
  map = L.map("map").setView([-15.78, -47.93], 5);

  let registros = [];

const campoPraga = document.getElementById("campoPraga");
const campoObs = document.getElementById("campoObs");
const btnAdicionar = document.getElementById("btnAdicionarRegistro");
const listaRegistros = document.getElementById("listaRegistros");

btnAdicionar.addEventListener("click", () => {
  if (!campoPraga.value.trim()) {
    alert("Informe a praga ou ocorrência.");
    return;
  }

  const registro = {
    praga: campoPraga.value,
    obs: campoObs.value,
    data: new Date().toLocaleString()
  };

  registros.push(registro);
  atualizarLista();

  campoPraga.value = "";
  campoObs.value = "";
});

function atualizarLista() {
  listaRegistros.innerHTML = "";

  registros.forEach((r, i) => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "6px";
    div.style.marginBottom = "6px";

    div.innerHTML = `
      <strong>${r.praga}</strong><br>
      ${r.obs}<br>
      <small>${r.data}</small><br>
      <button onclick="editarRegistro(${i})">✏️ Editar</button>
      <button onclick="excluirRegistro(${i})">🗑️ Excluir</button>
    `;

    listaRegistros.appendChild(div);
  });
}

window.excluirRegistro = function(i) {
  registros.splice(i, 1);
  atualizarLista();
};

window.editarRegistro = function(i) {
  campoPraga.value = registros[i].praga;
  campoObs.value = registros[i].obs;
  registros.splice(i, 1);
  atualizarLista();
};

  /* ========= CAMADAS ========= */
  const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "© Esri" }
  );

  L.control.layers(
    { "Mapa": street, "Satélite": satelite },
    {}
  ).addTo(map);

  /* ========= BLINDAGEM TAMANHO ========= */
  setTimeout(() => {
    map.invalidateSize();
    console.log("🛡️ invalidateSize aplicado");
  }, 200);

  /* ========= BOTÃO ========= */
  const btnMarcarPonto = document.getElementById("btnMarcar");

  btnMarcarPonto.addEventListener("click", () => {
    if (modoCriarPonto) return;

    modoCriarPonto = true;
    map.locate({ enableHighAccuracy: true });

    console.log("📍 Modo marcar ponto ATIVO");
  });

  /* ========= EVENTO LEAFLET ========= */
  map.on("locationfound", (e) => {
    if (!modoCriarPonto) return;

    modoCriarPonto = false;

    map.setView(e.latlng, 17);

    L.marker(e.latlng)
      .addTo(map)
      .bindPopup("📍 Ponto marcado")
      .openPopup();

    console.log("✅ Ponto criado");
  });

});
