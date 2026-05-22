console.log("JS carregou")

/* =========================================
VARIÁVEIS GLOBAIS
========================================= */

let map

let coordenadaAtual = null
let marcadorAtual = null

let modo = null
let pausado = false

let watchId = null

let pontos = []
let linha = null
let marcador = null
let ultimoPonto = null

let distancia = 0
let inicioTempo = null
let timer = null

let areaCalculada = null

let pontosGrade = []
let pontosGradeOriginais = []

let marcadoresGrade = []

let feicoesSalvas = []

let iconeGrade

let anguloGrade = 0
let rotacaoAtiva = false

/* =========================================
INIT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  map = L.map("map", {
    zoomControl: false
  }).setView([-15, -47], 5)

  /* =========================================
  ÍCONE GRADE
  ========================================= */

  iconeGrade = L.icon({

    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]

  })

  /* =========================================
  CONTROLE ZOOM
  ========================================= */

  L.control.zoom({
    position: "bottomright"
  }).addTo(map)

  /* =========================================
  MAPA RUA
  ========================================= */

  const street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19
    }
  ).addTo(map)

  /* =========================================
  MAPA SATÉLITE
  ========================================= */

  const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Esri",
      maxZoom: 19
    }
  )

  /* =========================================
  CONTROLE DE CAMADAS
  ========================================= */

  L.control.layers(
    {
      "Rua": street,
      "Satélite": satelite
    },
    {},
    {
      position: "topright",
      collapsed: true
    }
  ).addTo(map)

  /* =========================================
  BOTÕES
  ========================================= */

  document.getElementById("btnMira").onclick =
    ativarMira

  document.getElementById("btnRastro").onclick =
    () => iniciar("rastro")

  document.getElementById("btnArea").onclick =
    () => iniciar("area")

  document.getElementById("btnPausar").onclick =
    () => pausado = true

  document.getElementById("btnContinuar").onclick =
    () => pausado = false

  document.getElementById("btnFinalizar").onclick =
    finalizar

  document.getElementById("btnLimpar").onclick =
    limparTudo

})

/* =========================================
MIRA
========================================= */

function ativarMira() {

  navigator.geolocation.getCurrentPosition(pos => {

    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    coordenadaAtual = { lat, lng }

    map.setView([lat, lng], 17)

    if (marcadorAtual) {
      map.removeLayer(marcadorAtual)
    }

    marcadorAtual = L.circleMarker([lat, lng], {
      radius: 6,
      color: "#1e88e5",
      fillColor: "#1e88e5",
      fillOpacity: 1
    }).addTo(map)

  })

}

/* =========================================
INICIAR
========================================= */

function iniciar(tipo) {

  limpar()

  modo = tipo

  pausado = false

  pontos = []

  distancia = 0

  ultimoPonto = null

  inicioTempo = new Date()

  areaCalculada = null

  mostrarPainel()

  timer = setInterval(
    atualizarPainel,
    1000
  )

  watchId = navigator.geolocation.watchPosition(

    pos => atualizarGPS(pos),

    erro => console.log("Erro GPS:", erro),

    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }

  )

}

/* =========================================
GPS
========================================= */

function atualizarGPS(pos) {

  if (pausado) return

  const lat = pos.coords.latitude
  const lng = pos.coords.longitude
  const acc = pos.coords.accuracy

  if (acc > 25) return

  /* =========================================
  MARCADOR GPS
  ========================================= */

  if (marcador) {

    const atual = marcador.getLatLng()

    const latSuave =
      atual.lat + (lat - atual.lat) * 0.3

    const lngSuave =
      atual.lng + (lng - atual.lng) * 0.3

    marcador.setLatLng([
      latSuave,
      lngSuave
    ])

  } else {

    marcador = L.circleMarker([lat, lng], {

      radius: 6,
      color: "#2196f3",
      fillColor: "#2196f3",
      fillOpacity: 1

    }).addTo(map)

  }

  /* =========================================
  DISTÂNCIA
  ========================================= */

  if (ultimoPonto) {

    const dist = calcularDistancia(
      ultimoPonto.lat,
      ultimoPonto.lng,
      lat,
      lng
    )

    if (dist < 0.002) return

    if (dist > 0.5) return

    distancia += dist

  }

  ultimoPonto = { lat, lng }

  pontos.push([lat, lng])

  if (linha) {
    map.removeLayer(linha)
  }

  linha = L.polyline(pontos, {

    color: "red",
    weight: 4,
    smoothFactor: 2

  }).addTo(map)

}

/* =========================================
FINALIZAR
========================================= */

function finalizar() {

  clearInterval(timer)

  if (watchId) {
    navigator.geolocation.clearWatch(watchId)
  }

  /* =========================================
  ÁREA
  ========================================= */

  if (modo === "area" && pontos.length >= 3) {

    L.polygon(pontos, {
      color: "green"
    }).addTo(map)

    areaCalculada = calcularArea(pontos)

    feicoesSalvas.push({

      tipo: "area",

      pontos: [...pontos],

      area: areaCalculada,

      data: new Date()

    })

    map.fitBounds(
      L.polygon(pontos).getBounds()
    )

    atualizarPainel()

    gerarKMLArea()

    let respostaGrade = prompt(
      "Deseja gerar grade amostral?\nDigite SIM ou NÃO",
      "SIM"
    )

    if (
      respostaGrade &&
      respostaGrade.toUpperCase() === "SIM"
    ) {

      let tamanhoGrade = prompt(
        "Tamanho da grade em hectares:",
        "1"
      )

      if (!tamanhoGrade) {
        tamanhoGrade = 1
      }

      tamanhoGrade = parseFloat(tamanhoGrade)

      if (isNaN(tamanhoGrade)) {
        tamanhoGrade = 1
      }

      gerarGrade(tamanhoGrade)

    }

  }

  /* =========================================
  RASTRO
  ========================================= */

  if (modo === "rastro") {

    feicoesSalvas.push({

      tipo: "rastro",

      pontos: [...pontos],

      distancia: distancia,

      data: new Date()

    })

    gerarKMLRastro()

  }

}

/* =========================================
PAINEL
========================================= */

function mostrarPainel() {

  document.getElementById(
    "painelRastro"
  ).style.display = "block"

}

function atualizarPainel() {

  const tempo =
    Math.floor(
      (new Date() - inicioTempo) / 1000
    )

  const min = Math.floor(tempo / 60)

  const seg = tempo % 60

  let texto =
    `Tempo: ${min}m ${seg}s<br>
     Distância: ${distancia.toFixed(3)} km`

  if (modo === "area" && areaCalculada) {

    texto +=
      `<br>
      <span style="color:#2e7d32;font-weight:bold">
      Área: ${areaCalculada.toFixed(2)} ha
      </span>`

  }

  document.getElementById(
    "infoRastro"
  ).innerHTML = texto

}

/* =========================================
DISTÂNCIA
========================================= */

function calcularDistancia(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R = 6371

  const dLat =
    (lat2 - lat1) * Math.PI / 180

  const dLon =
    (lon2 - lon1) * Math.PI / 180

  const a =

    Math.sin(dLat / 2) ** 2 +

    Math.cos(lat1 * Math.PI / 180) *

    Math.cos(lat2 * Math.PI / 180) *

    Math.sin(dLon / 2) ** 2

  return 2 * R *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

}

/* =========================================
ÁREA
========================================= */

function calcularArea(coords) {

  let area = 0

  for (let i = 0; i < coords.length; i++) {

    const [lat1, lon1] = coords[i]

    const [lat2, lon2] =
      coords[(i + 1) % coords.length]

    area +=
      (lon2 * lat1) -
      (lon1 * lat2)

  }

  return Math.abs(area / 2)
    * 111139
    * 111139
    / 10000

}

/* =========================================
LIMPAR
========================================= */

function limpar() {

  clearInterval(timer)

  if (watchId) {
    navigator.geolocation.clearWatch(watchId)
  }

  if (linha) {
    map.removeLayer(linha)
  }

  if (marcador) {
    map.removeLayer(marcador)
  }

  linha = null
  marcador = null

}

/* =========================================
LIMPAR TUDO
========================================= */

function limparTudo() {

  clearInterval(timer)

  if (watchId) {
    navigator.geolocation.clearWatch(watchId)
  }

  if (linha) {
    map.removeLayer(linha)
    linha = null
  }

  if (marcador) {
    map.removeLayer(marcador)
    marcador = null
  }

  map.eachLayer(layer => {

    if (layer instanceof L.Polygon) {
      map.removeLayer(layer)
    }

  })

  marcadoresGrade.forEach(m => {
    map.removeLayer(m)
  })

  marcadoresGrade = []

  pontosGrade = []

  pontosGradeOriginais = []

  distancia = 0

  areaCalculada = null

  ultimoPonto = null

  modo = null

  pausado = false

  anguloGrade = 0

  document.getElementById(
    "infoRastro"
  ).innerHTML = ""

  document.getElementById(
    "painelRastro"
  ).style.display = "none"

}

/* =========================================
KML RASTRO
========================================= */

function gerarKMLRastro() {

  const nome =
    "Rastro_" +
    new Date().toLocaleString()

  let kml =
`<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<Placemark>
<name>${nome}</name>
<LineString>
<coordinates>`

  pontos.forEach(p => {

    kml += `${p[1]},${p[0]},0 `

  })

  kml +=
`</coordinates>
</LineString>
</Placemark>
</Document>
</kml>`

  baixar(kml, nome + ".kml")

}

/* =========================================
KML ÁREA
========================================= */

function gerarKMLArea() {

  const nome =
    "Area_" +
    new Date().toLocaleString()

  let kml =
`<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<Placemark>
<name>${nome}</name>
<description>
Área: ${areaCalculada.toFixed(2)} ha
</description>
<Polygon>
<outerBoundaryIs>
<LinearRing>
<coordinates>`

  pontos.forEach(p => {

    kml += `${p[1]},${p[0]},0 `

  })

  kml += `${pontos[0][1]},${pontos[0][0]},0 `

  kml +=
`</coordinates>
</LinearRing>
</outerBoundaryIs>
</Polygon>
</Placemark>
</Document>
</kml>`

  baixar(kml, nome + ".kml")

}

/* =========================================
DOWNLOAD
========================================= */

function baixar(kml, nome) {

  const blob = new Blob(
    [kml],
    {
      type: "application/vnd.google-earth.kml+xml"
    }
  )

  const link =
    document.createElement("a")

  link.href =
    URL.createObjectURL(blob)

  link.download = nome

  link.click()

}

/* =========================================
GERAR GRADE
========================================= */

function gerarGrade(hectares) {

  marcadoresGrade.forEach(m => {
    map.removeLayer(m)
  })

  marcadoresGrade = []

  pontosGrade = []

  pontosGradeOriginais = []

  const polygon = L.polygon(pontos)

  const bounds = polygon.getBounds()

  const norte = bounds.getNorth()
  const sul = bounds.getSouth()
  const leste = bounds.getEast()
  const oeste = bounds.getWest()

  const espacamento =
    Math.sqrt(hectares * 10000) * 0.25

  const passoLat =
    espacamento / 111320

  const passoLng =
    espacamento /
    (
      111320 *
      Math.cos(
        ((norte + sul) / 2) * Math.PI / 180
      )
    )

  const offsetLat = passoLat / 2
  const offsetLng = passoLng / 2

  for (
    let lat = sul + offsetLat;
    lat <= norte;
    lat += passoLat
  ) {

    for (
      let lng = oeste + offsetLng;
      lng <= leste;
      lng += passoLng
    ) {

      const ponto = [lat, lng]

      if (
        pontoDentroPoligono(
          ponto,
          pontos
        )
      ) {

        pontosGrade.push(ponto)

        pontosGradeOriginais.push(ponto)

        const marcadorGrade =
          L.marker(
            ponto,
            {
              icon: iconeGrade
            }
          ).addTo(map)

        marcadorGrade.bindPopup(
          "Ponto Amostral"
        )

        marcadoresGrade.push(
          marcadorGrade
        )

      }

    }

  }

  habilitarRotacaoGrade()

}

/* =========================================
ROTACIONAR GRADE
========================================= */

function habilitarRotacaoGrade() {

  if (rotacaoAtiva) return

  rotacaoAtiva = true

  let toqueInicial = null
  let anguloInicial = 0

  map.getContainer().addEventListener(
    "touchstart",
    e => {

      if (e.touches.length === 2) {

        toqueInicial = calcularAnguloToque(
          e.touches[0],
          e.touches[1]
        )

        anguloInicial = anguloGrade

      }

    },
    { passive: false }
  )

  map.getContainer().addEventListener(
    "touchmove",
    e => {

      if (e.touches.length !== 2) return

      if (pontosGradeOriginais.length === 0) return

      e.preventDefault()

      const novoAngulo =
        calcularAnguloToque(
          e.touches[0],
          e.touches[1]
        )

      anguloGrade =
  anguloInicial +
  (toqueInicial - novoAngulo)

      requestAnimationFrame(atualizarRotacaoGrade)

    },
    { passive: false }
  )

}

/* =========================================
ÂNGULO TOQUE
========================================= */

function calcularAnguloToque(t1, t2) {

  return Math.atan2(
    t2.clientY - t1.clientY,
    t2.clientX - t1.clientX
  ) * 180 / Math.PI

}

/* =========================================
ATUALIZAR ROTAÇÃO GRADE
========================================= */

function atualizarRotacaoGrade() {

  marcadoresGrade.forEach(m => {
    map.removeLayer(m)
  })

  marcadoresGrade = []

  const polygon = L.polygon(pontos)

  const centro =
    polygon.getBounds().getCenter()

  pontosGrade = []

  pontosGradeOriginais.forEach(p => {

    const pontoRotacionado =
      rotacionarPonto(
        p[0],
        p[1],
        centro.lat,
        centro.lng,
        anguloGrade
      )

    if (
      pontoDentroPoligono(
        pontoRotacionado,
        pontos
      )
    ) {

      pontosGrade.push(
        pontoRotacionado
      )

      const marcador =
        L.marker(
          pontoRotacionado,
          {
            icon: iconeGrade
          }
        ).addTo(map)

      marcador.bindPopup(
        "Ponto Amostral"
      )

      marcadoresGrade.push(
        marcador
      )

    }

  })

}

/* =========================================
ROTACIONAR PONTO
========================================= */

function rotacionarPonto(
  lat,
  lng,
  centroLat,
  centroLng,
  angulo
) {

  const rad =
    angulo * Math.PI / 180

  const y = lat - centroLat
  const x = lng - centroLng

  const novoX =
    x * Math.cos(rad) -
    y * Math.sin(rad)

  const novoY =
    x * Math.sin(rad) +
    y * Math.cos(rad)

  return [
    centroLat + novoY,
    centroLng + novoX
  ]

}

/* =========================================
PONTO DENTRO POLÍGONO
========================================= */

function pontoDentroPoligono(
  ponto,
  poligono
) {

  const x = ponto[1]
  const y = ponto[0]

  let dentro = false

  for (
    let i = 0,
    j = poligono.length - 1;

    i < poligono.length;

    j = i++
  ) {

    const xi = poligono[i][1]
    const yi = poligono[i][0]

    const xj = poligono[j][1]
    const yj = poligono[j][0]

    const intersecta =

      (
        (yi > y) !== (yj > y)
      ) &&

      (
        x <
        (
          (xj - xi) *
          (y - yi)
        ) /
        (yj - yi) +
        xi
      )

    if (intersecta) {
      dentro = !dentro
    }

  }

  return dentro

}
