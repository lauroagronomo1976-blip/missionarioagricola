var marcadorAtual = null;
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
  var map = L.map('map', {
  zoomControl: false  // desliga o padrão (superior esquerdo)
}).setView([-15.0, -47.0], 13); // mantenha suas coords

  L.control.zoom({
  position: 'bottomright'
}).addTo(map);
  
  const street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap", maxZoom: 19 }
  );

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "© Esri", maxZoom: 21 }
  );

  street.addTo(map);

  L.control.layers({
    "Rua": street,
    "Satélite": satelite
  }).addTo(map);

  map.setView([-15.8, -47.9], 5);

  setTimeout(() => map.invalidateSize(), 300);

  map.scrollWheelZoom.disable();
  map.touchZoom.enable();
  
  // ===============================
  // BOTÃO MIRA PROFISSIONAL
  // ===============================
  document.getElementById("btnMira").addEventListener("click", function() {

  if (!navigator.geolocation) {
    alert("Geolocalização não suportada.");
    return;
  }

  navigator.geolocation.getCurrentPosition(function(position) {

    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    map.setView([lat, lon], 17);

    // remove marcador anterior se existir
    if (marcadorAtual) {
      map.removeLayer(marcadorAtual);
    }

    marcadorAtual = L.circleMarker([lat, lon], {
      radius: 10,
      color: "#1e88e5",
      fillColor: "#42a5f5",
      fillOpacity: 0.9
    }).addTo(map);

  });
});

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

            map.setView([lat, lng], 19, { animate: true });

            if (marcadorAtual) map.removeLayer(marcadorAtual);

            marcadorAtual = L.marker([lat, lng]).addTo(map);

            L.circle([lat, lng], {
              radius: accuracy,
              color: "#136aec",
              fillColor: "#136aec",
              fillOpacity: 0.15,
              weight: 1
            }).addTo(map);

          },
          () => alert("Erro ao obter localização.")
        );

      });

      return container;
    }
  });

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

          if (marcadorAtual) map.removeLayer(marcadorAtual);

          marcadorAtual = L.marker([lat, lng]).addTo(map);
          map.setView([lat, lng], 19);

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
