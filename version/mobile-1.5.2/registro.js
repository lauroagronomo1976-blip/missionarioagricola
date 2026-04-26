console.log("JS carregou")

let map
let coordenadaAtual = null
let marcadorAtual = null

// ================= ESTADO GLOBAL =================
let modo = null // "rastro" ou "area"

// ================= RASTRO =================
let watchRastro = null
let pontosRastro = []
let linhaRastro = null
let marcadorRastro = null
let ultimoPonto = null
let distancia = 0
let inicioTempo = null
let timer = null
let pausado = false

// ================= ÁREA =================
let watchArea = null
let pontosArea = []
let linhaArea = null
let poligonoArea = null
let marcadorArea = null

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  map = L.map('map', { zoomControl:false }).setView([-15,-47],5)

  L.control.zoom({ position:'bottomright' }).addTo(map)

  const street = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  ).addTo(map)

  const satelite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  )

  L.control.layers(
    {"Rua":street,"Satélite":satelite},
    {},
    {position:'topright'}
  ).addTo(map)

  document.getElementById("btnMira").onclick = ativarMira
  document.getElementById("btnRastro").onclick = iniciarRastro
  document.getElementById("btnArea").onclick = iniciarArea

  document.getElementById("btnPausar").onclick = pausar
  document.getElementById("btnContinuar").onclick = continuar
  document.getElementById("btnFinalizar").onclick = finalizar

})

/* ================= 🎯 MIRA ================= */
function ativarMira(){
  navigator.geolocation.getCurrentPosition((pos)=>{
    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    coordenadaAtual = {lat,lng}
    map.setView([lat,lng],17)

    if(marcadorAtual) map.removeLayer(marcadorAtual)

    marcadorAtual = L.circleMarker([lat,lng],{
      radius:6,
      color:"#1e88e5",
      fillColor:"#1e88e5",
      fillOpacity:1
    }).addTo(map)
  })
}

/* ================= DISTÂNCIA ================= */
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

/* ================= RASTRO ================= */
function iniciarRastro(){

  limparTudo()

  modo = "rastro"
  pausado = false
  pontosRastro = []
  distancia = 0
  ultimoPonto = null
  inicioTempo = new Date()

  mostrarPainel()

  timer = setInterval(atualizarPainel,1000)

  watchRastro = navigator.geolocation.watchPosition((pos)=>{

    if(pausado) return
    if(pos.coords.accuracy > 15) return

    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    if(marcadorRastro){
      marcadorRastro.setLatLng([lat,lng])
    }else{
      marcadorRastro = L.circleMarker([lat,lng],{
        radius:6,color:"#2196f3",fillColor:"#2196f3"
      }).addTo(map)
    }

    if(ultimoPonto){
      const dist = calcularDistancia(
        ultimoPonto.lat, ultimoPonto.lng, lat, lng
      )

      if(dist < 0.002 || dist > 0.3) return
      distancia += dist
    }

    ultimoPonto = {lat,lng}
    pontosRastro.push([lat,lng])

    if(linhaRastro) map.removeLayer(linhaRastro)

    linhaRastro = L.polyline(pontosRastro,{
      color:"red", weight:4
    }).addTo(map)

  },{
    enableHighAccuracy:true,
    maximumAge:1000,
    timeout:15000
  })
}

/* ================= ÁREA ================= */
function iniciarArea(){

  limparTudo()

  modo = "area"
  pausado = false
  pontosArea = []
  distancia = 0
  ultimoPonto = null
  inicioTempo = new Date()

  mostrarPainel()

  timer = setInterval(atualizarPainel,1000)

  watchArea = navigator.geolocation.watchPosition((pos)=>{

    if(pausado) return
    if(pos.coords.accuracy > 20) return

    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    if(marcadorArea){
      marcadorArea.setLatLng([lat,lng])
    }else{
      marcadorArea = L.circleMarker([lat,lng],{
        radius:6,color:"#2196f3",fillColor:"#2196f3"
      }).addTo(map)
    }

    if(ultimoPonto){
      const dist = calcularDistancia(
        ultimoPonto.lat, ultimoPonto.lng, lat, lng
      )

      if(dist < 0.003 || dist > 0.3) return
      distancia += dist
    }

    ultimoPonto = {lat,lng}
    pontosArea.push([lat,lng])

    if(linhaArea) map.removeLayer(linhaArea)

    linhaArea = L.polyline(pontosArea,{
      color:"red", weight:4
    }).addTo(map)

  },{
    enableHighAccuracy:true,
    maximumAge:1000,
    timeout:15000
  })
}

/* ================= CONTROLES ================= */
function pausar(){
  pausado = true
}

function continuar(){
  pausado = false
}

function finalizar(){

  clearInterval(timer)

  if(modo === "rastro"){
    navigator.geolocation.clearWatch(watchRastro)
    gerarKMLRastro()
  }

  if(modo === "area"){
    navigator.geolocation.clearWatch(watchArea)

    if(pontosArea.length >= 3){
      if(poligonoArea) map.removeLayer(poligonoArea)

      poligonoArea = L.polygon(pontosArea,{
        color:"green"
      }).addTo(map)

      const area = calcularArea(pontosArea)
      alert("Área: " + area.toFixed(2) + " ha")

      gerarKMLArea()
    }
  }

  esconderPainel()
}

/* ================= PAINEL ================= */
function mostrarPainel(){
  document.getElementById("painelRastro").style.display = "block"
}

function esconderPainel(){
  document.getElementById("painelRastro").style.display = "none"
}

function atualizarPainel(){
  const tempo = Math.floor((new Date()-inicioTempo)/1000)
  const min = Math.floor(tempo/60)
  const seg = tempo%60

  document.getElementById("infoRastro").innerHTML =
    `Tempo: ${min}m ${seg}s<br>Distância: ${distancia.toFixed(3)} km`
}

/* ================= ÁREA CALC ================= */
function calcularArea(coords){
  let area = 0
  for(let i=0;i<coords.length;i++){
    const [lat1,lon1]=coords[i]
    const [lat2,lon2]=coords[(i+1)%coords.length]
    area += (lon2*lat1)-(lon1*lat2)
  }
  return Math.abs(area/2)*111139*111139/10000
}

/* ================= LIMPEZA ================= */
function limparTudo(){

  clearInterval(timer)

  if(watchRastro) navigator.geolocation.clearWatch(watchRastro)
  if(watchArea) navigator.geolocation.clearWatch(watchArea)

  pausado = false

  if(linhaRastro) map.removeLayer(linhaRastro)
  if(linhaArea) map.removeLayer(linhaArea)
  if(poligonoArea) map.removeLayer(poligonoArea)
  if(marcadorRastro) map.removeLayer(marcadorRastro)
  if(marcadorArea) map.removeLayer(marcadorArea)

  linhaRastro = null
  linhaArea = null
  poligonoArea = null
  marcadorRastro = null
  marcadorArea = null
}

/* ================= KML ================= */
function gerarKMLRastro(){
  let kml = `<?xml version="1.0"?><kml><Document><Placemark><LineString><coordinates>`
  pontosRastro.forEach(p=> kml += `${p[1]},${p[0]},0 `)
  kml += `</coordinates></LineString></Placemark></Document></kml>`

  baixar(kml,"rastro.kml")
}

function gerarKMLArea(){
  let kml = `<?xml version="1.0"?><kml><Document><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>`
  pontosArea.forEach(p=> kml += `${p[1]},${p[0]},0 `)
  kml += `${pontosArea[0][1]},${pontosArea[0][0]},0 `
  kml += `</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>`

  baixar(kml,"area.kml")
}

function baixar(kml,nome){
  const blob = new Blob([kml], {type:"application/vnd.google-earth.kml+xml"})
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = nome
  link.click()
}
