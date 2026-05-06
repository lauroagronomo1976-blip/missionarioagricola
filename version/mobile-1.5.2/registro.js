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

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  map = L.map('map', { zoomControl:false }).setView([-15,-47],5)

  // zoom correto
  L.control.zoom({ position:'bottomright' }).addTo(map)

  // mapa base
  const street = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 19 }
  ).addTo(map)

  const satelite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  )

  // botão camadas
  L.control.layers(
    {"Rua": street, "Satélite": satelite},
    {},
    { position: 'topright' }
  ).addTo(map)

  // botões
  document.getElementById("btnMira").onclick = ativarMira
  document.getElementById("btnRastro").onclick = () => iniciar("rastro")
  document.getElementById("btnArea").onclick = () => iniciar("area")

  document.getElementById("btnPausar").onclick = () => pausado = true
  document.getElementById("btnContinuar").onclick = () => pausado = false
  document.getElementById("btnFinalizar").onclick = finalizar
  document.getElementById("btnLimpar").onclick = limparTudo
})

/* ================= 🎯 ================= */
function ativarMira(){
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    coordenadaAtual = {lat,lng}
    map.setView([lat,lng],17)

    if(marcadorAtual) map.removeLayer(marcadorAtual)

    marcadorAtual = L.circleMarker([lat,lng],{
      radius:6,color:"#1e88e5",fillColor:"#1e88e5",fillOpacity:1
    }).addTo(map)
  })
}

/* ================= START ================= */
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
  timer = setInterval(atualizarPainel,1000)

  watchId = navigator.geolocation.watchPosition(
    pos => atualizarGPS(pos),
    erro => console.log("Erro GPS:", erro),
    { enableHighAccuracy:true, maximumAge:0, timeout:15000 }
  )
}

/* ================= GPS ================= */
function atualizarGPS(pos){

  if(pausado) return

  const lat = pos.coords.latitude
  const lng = pos.coords.longitude

  if(pos.coords.accuracy > 30) return

  // bolinha
  if(marcador){
    marcador.setLatLng([lat,lng])
  }else{
    marcador = L.circleMarker([lat,lng],{
      radius:6,color:"#2196f3",fillColor:"#2196f3",fillOpacity:1
    }).addTo(map)
  }

  if(ultimoPonto){
    const dist = calcularDistancia(
      ultimoPonto.lat, ultimoPonto.lng, lat, lng
    )

    if(dist < 0.001 || dist > 1) return

    distancia += dist
  }

  ultimoPonto = {lat,lng}
  pontos.push([lat,lng])

  // linha
  if(linha) map.removeLayer(linha)

  linha = L.polyline(pontos,{
    color:"red",
    weight:4
  }).addTo(map)
}

/* ================= FINALIZAR ================= */
function finalizar(){

  clearInterval(timer)
  if(watchId) navigator.geolocation.clearWatch(watchId)

  // AREA
  if(modo === "area" && pontos.length >= 3){

    L.polygon(pontos,{color:"green"}).addTo(map)

    areaCalculada = calcularArea(pontos)

    atualizarPainel()

    gerarKMLArea()
  }

  // RASTRO
  if(modo === "rastro"){
    gerarKMLRastro()
  }
}

/* ================= PAINEL ================= */
function mostrarPainel(){
  document.getElementById("painelRastro").style.display = "block"
}

function atualizarPainel(){

  const tempo = Math.floor((new Date()-inicioTempo)/1000)
  const min = Math.floor(tempo/60)
  const seg = tempo%60

  let texto = `Tempo: ${min}m ${seg}s<br>Distância: ${distancia.toFixed(3)} km`

  if(modo === "area" && areaCalculada){
    texto += `<br><span style="color:#2e7d32;font-weight:bold">Área: ${areaCalculada.toFixed(2)} ha</span>`
  }

  document.getElementById("infoRastro").innerHTML = texto
}

/* ================= DIST ================= */
function calcularDistancia(lat1, lon1, lat2, lon2){
  const R = 6371
  const dLat = (lat2-lat1) * Math.PI/180
  const dLon = (lon2-lon1) * Math.PI/180

  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

/* ================= AREA ================= */
function calcularArea(coords){
  let area = 0
  for(let i=0;i<coords.length;i++){
    const [lat1,lon1]=coords[i]
    const [lat2,lon2]=coords[(i+1)%coords.length]
    area += (lon2*lat1)-(lon1*lat2)
  }
  return Math.abs(area/2)*111139*111139/10000
}

/* ================= LIMPAR ================= */
function limpar(){

  clearInterval(timer)

  if(watchId) navigator.geolocation.clearWatch(watchId)

  if(linha) map.removeLayer(linha)
  if(marcador) map.removeLayer(marcador)

  linha = null
  marcador = null
}

/* ================= LIMPAR TUDO ================= */
function limparTudo(){

  // para tudo
  clearInterval(timer)
  if(watchId) navigator.geolocation.clearWatch(watchId)

  // remove linha
  if(linha){
    map.removeLayer(linha)
    linha = null
  }

  // remove marcador
  if(marcador){
    map.removeLayer(marcador)
    marcador = null
  }

  // remove polígono (área)
  map.eachLayer(layer=>{
    if(layer instanceof L.Polygon){
      map.removeLayer(layer)
    }
  })

  // reset geral
  pontos = []
  distancia = 0
  areaCalculada = null
  ultimoPonto = null
  modo = null
  pausado = false

  // limpa painel
  document.getElementById("infoRastro").innerHTML = ""

  // 🔥 ESCONDE painel (remove botões)
  document.getElementById("painelRastro").style.display = "none"
}

/* ================= KML ================= */
function gerarKMLRastro(){

  const nome = "Rastro_" + new Date().toLocaleString()

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
  <Document><Placemark>
  <name>${nome}</name>
  <LineString><coordinates>`

  pontos.forEach(p=>{
    kml += `${p[1]},${p[0]},0 `
  })

  kml += `</coordinates></LineString>
  </Placemark></Document></kml>`

  baixar(kml, nome + ".kml")
}

function gerarKMLArea(){

  const nome = "Area_" + new Date().toLocaleString()

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
  <Document><Placemark>
  <name>${nome}</name>
  <description>Área: ${areaCalculada.toFixed(2)} ha</description>
  <Polygon><outerBoundaryIs><LinearRing><coordinates>`

  pontos.forEach(p=>{
    kml += `${p[1]},${p[0]},0 `
  })

  kml += `${pontos[0][1]},${pontos[0][0]},0 `

  kml += `</coordinates></LinearRing></outerBoundaryIs></Polygon>
  </Placemark></Document></kml>`

  baixar(kml, nome + ".kml")
}

function baixar(kml,nome){
  const blob = new Blob([kml], {type:"application/vnd.google-earth.kml+xml"})
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = nome
  link.click()
}
