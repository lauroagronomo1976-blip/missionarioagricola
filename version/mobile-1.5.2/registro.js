console.log("JS carregou")

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
let marcadoresGrade = []
let feicoesSalvas = []

let iconeGrade
let anguloGrade = 0
let touchInicial = null

/* =========================================
INIT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  map = L.map('map', {
    zoomControl:false
  }).setView([-15,-47],5)

  /* =========================================
  ÍCONE GRADE
  ========================================= */

  iconeGrade = L.icon({

    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',

    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

    iconSize:[25,41],
    iconAnchor:[12,41],
    popupAnchor:[1,-34],
    shadowSize:[41,41]

  })

  /* =========================================
  ZOOM
  ========================================= */

  L.control.zoom({
    position:'bottomright'
  }).addTo(map)

  /* =========================================
  MAPA RUA
  ========================================= */

  const street = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom:19
    }
  ).addTo(map)

  /* =========================================
  MAPA SATÉLITE
  ========================================= */

  const satelite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:'Esri',
      maxZoom:19
    }
  )

  /* =========================================
  LAYER CONTROL
  ========================================= */

  L.control.layers(
    {
      "Rua": street,
      "Satélite": satelite
    },
    {},
    {
      position:'topright',
      collapsed:true
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

function ativarMira(){

  navigator.geolocation.getCurrentPosition(pos=>{

    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    coordenadaAtual = {lat,lng}

    map.setView([lat,lng],17)

    if(marcadorAtual){
      map.removeLayer(marcadorAtual)
    }

    marcadorAtual = L.circleMarker([lat,lng],{
      radius:6,
      color:"#1e88e5",
      fillColor:"#1e88e5",
      fillOpacity:1
    }).addTo(map)

  })

}

/* =========================================
START
========================================= */

function iniciar(tipo){

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
      enableHighAccuracy:true,
      maximumAge:0,
      timeout:15000
    }

  )

}

/* =========================================
ROTACIONAR GRADE
========================================= */

let rotacaoAtiva = false

function habilitarRotacaoGrade(){

  if(rotacaoAtiva) return

  rotacaoAtiva = true

  let toqueInicial = null
  let anguloInicial = 0

  map.getContainer().addEventListener(
    "touchstart",
    e => {

      if(e.touches.length === 2){

        toqueInicial = calcularAnguloToque(
          e.touches[0],
          e.touches[1]
        )

        anguloInicial = anguloGrade
      }

    },
    { passive:false }
  )

  map.getContainer().addEventListener(
    "touchmove",
    e => {

      if(e.touches.length !== 2) return

      e.preventDefault()

      const novoAngulo =
        calcularAnguloToque(
          e.touches[0],
          e.touches[1]
        )

      anguloGrade =
        anguloInicial +
        (novoAngulo - toqueInicial)

      atualizarRotacaoGrade()

    },
    { passive:false }
  )

}

/* =========================================
ÂNGULO TOQUE
========================================= */

function calcularAnguloToque(t1,t2){

  return Math.atan2(
    t2.clientY - t1.clientY,
    t2.clientX - t1.clientX
  ) * 180 / Math.PI

}

/* =========================================
ATUALIZAR ROTAÇÃO
========================================= */

function atualizarRotacaoGrade(){

  marcadoresGrade.forEach(m=>{
    map.removeLayer(m)
  })

  marcadoresGrade = []

  const polygon = L.polygon(pontos)

  const bounds = polygon.getBounds()

  const centro = bounds.getCenter()

  pontosGrade.forEach(p=>{

    const pontoRotacionado =
      rotacionarPonto(
        p[0],
        p[1],
        centro.lat,
        centro.lng,
        anguloGrade
      )

    const marcador =
      L.marker(
        pontoRotacionado,
        {
          icon:iconeGrade
        }
      ).addTo(map)

    marcador.bindPopup(
      "Ponto Amostral"
    )

    marcadoresGrade.push(marcador)

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
){

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
