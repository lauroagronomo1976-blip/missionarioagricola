document.addEventListener("DOMContentLoaded", () => {

  console.log("🟢 REGISTRO – MAPA ATIVO");

  // ===============================
  // VARIÁVEIS
  // ===============================
  let marcadorAtual = null;
  let pontoAtual = null;
  let registrosDoPonto = [];

  // ===============================
  // MAPA
  // ===============================
  const mapa = L.map("map", {
    zoomControl: true,
    maxZoom: 21
  });

  const street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap", maxZoom: 19 }
  );

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "© Esri", maxZoom: 21 }
  );

  street.addTo(mapa);

  L.control.layers({
    "Rua": street,
    "Satélite": satelite
  }).addTo(mapa);

  mapa.setView([-15.8, -47.9], 5);

  setTimeout(() => mapa.invalidateSize(), 300);

  // ===============================
  // BOTÃO MIRA PROFISSIONAL
  // ===============================
  const ControleLocalizacao = L.Control.extend({
    options: { position: "topright" },

    onAdd: function () {
      const container = L.DomUtil.create("div", "leaflet-bar");
      container.style.cssText = `
        background:white;
        width:42px;
        height:42px;
        display:flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        border-radius:8px;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      `;

      container.innerHTML = `
        <div style="width:22px;height:22px;border:2px solid #222;border-radius:50%;position:relative;">
          <div style="position:absolute;top:-6px;left:9px;width:2px;height:34px;background:#222;"></div>
          <div style="position:absolute;left:-6px;top:9px;width:34px;height:2px;background:#222;"></div>
        </div>
      `;

      L.DomEvent.disableClickPropagation(container);

      container.addEventListener("click", () => {

        if (!navigator.geolocation) {
          alert("Geolocalização não suportada.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {

            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy;

            mapa.setView([lat, lng], 19, { animate: true });

            if (marcadorAtual) mapa.removeLayer(marcadorAtual);

            marcadorAtual = L.marker([lat, lng]).addTo(mapa);

            L.circle([lat, lng], {
              radius: accuracy,
              color: "#136aec",
              fillColor: "#136aec",
              fillOpacity: 0.15,
              weight: 1
            }).addTo(mapa);

          },
          () => alert("Erro ao obter localização.")
        );

      });

      return container;
    }
  });

  mapa.addControl(new ControleLocalizacao());

  // ===============================
  // ELEMENTOS
  // ===============================
  const btnMarcar = document.getElementById("btnMarcar");
  const btnAddRegistro = document.getElementById("btnAddRegistro");
  const ocorrenciaSelect = document.getElementById("ocorrenciaSelect");
  const especieInput = document.getElementById("especieInput");
  const quantidadeInput = document.getElementById("quantidadeInput");
  const listaContainer = document.getElementById("listaRegistros");

  // ===============================
  // MARCAR PONTO
  // ===============================
  if (btnMarcar) {
    btnMarcar.addEventListener("click", () => {

      if (!navigator.geolocation) {
        alert("Geolocalização não suportada.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {

          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          pontoAtual = { lat, lng, data: new Date().toISOString() };
          registrosDoPonto = [];
          renderizarLista();

          if (marcadorAtual) mapa.removeLayer(marcadorAtual);

          marcadorAtual = L.marker([lat, lng]).addTo(mapa);
          mapa.setView([lat, lng], 19);

        },
        () => alert("Erro ao obter localização.")
      );

    });
  }

  // ===============================
  // ADICIONAR REGISTRO
  // ===============================
  if (btnAddRegistro) {
    btnAddRegistro.addEventListener("click", () => {

      if (!ocorrenciaSelect.value || !quantidadeInput.value) {
        alert("Preencha os campos obrigatórios.");
        return;
      }

      const registro = {
        ocorrencia: ocorrenciaSelect.value,
        especie: especieInput.value,
        quantidade: quantidadeInput.value,
        data: new Date().toLocaleString()
      };

      registrosDoPonto.push(registro);
      renderizarLista();

      quantidadeInput.value = "";
      especieInput.value = "";

    });
  }

  // ===============================
  // RENDER LISTA
  // ===============================
  function renderizarLista() {

    listaContainer.innerHTML = "";

    if (registrosDoPonto.length === 0) {
      listaContainer.innerHTML = "<em>Nenhum registro ainda.</em>";
      return;
    }

    registrosDoPonto.forEach((r, i) => {

      const div = document.createElement("div");
      div.className = "registro-item";

      div.innerHTML = `
        <strong>${r.ocorrencia}</strong><br>
        Espécie: ${r.especie || "-"}<br>
        Qtde: ${r.quantidade}<br>
        <button onclick="excluirRegistro(${i})">Excluir</button>
      `;

      listaContainer.appendChild(div);
    });
  }

  window.excluirRegistro = function (index) {
    registrosDoPonto.splice(index, 1);
    renderizarLista();
  };

});
