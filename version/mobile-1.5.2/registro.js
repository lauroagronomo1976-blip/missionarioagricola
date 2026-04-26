console.log("JS carregou")

let map
let coordenadaAtual = null
let marcadorAtual = null

// ================= RASTRO =================
let watchId = null
let pontosRastro = []
let linhaRastro = null
let marcadorRastro = null
let ultimoPonto = null
let distanciaTotal = 0
let inicioTempo = null
let intervaloTempo = null
let rastroAtivo = false
let rastroPausado = false

// ================= ÁREA =================
let modoArea = false
let areaPausada = false
let watchAreaId = null
let pontosArea = []
let linhaArea = null
let poligonoArea = null
let marcadorArea = null
let tempoAreaInicio = null
let intervaloArea = null

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
  document.getElementById("btnRastro").onclick = controlarRastro
  document.getElementById("btnArea").onclick = iniciarArea
  document.getElementById("btnMarcarPontoInferior").onclick = marcarPonto

  document.getElementById("btnPausar").onclick = pausarRastro
  document.getElementById("btnContinuar").onclick = continuarRastro
  document.getElementById("btnFinalizar").onclick = finalizarRastro
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

/* ================= 📏 DISTÂNCIA ================= */

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

/* ================= 🛰️ RASTRO ================= */

function controlarRastro(){
  if(!rastroAtivo){
    iniciarRastro()
  }else if(!rastroPausado){
    rastroPausado = true
  }else{
    rastroPausado = false
  }
}

function iniciarRastro(){

  console.log("Rastro iniciado")

  rastroAtivo = true
  rastroPausado = false
  pontosRastro = []
  distanciaTotal = 0
  ultimoPonto = null
  inicioTempo = new Date()

  mostrarPainel()

  intervaloTempo = setInterval(atualizarPainelRastro,1000)

  watchId = navigator.geolocation.watchPosition((pos)=>{

    if(rastroPausado) return
    if(pos.coords.accuracy > 20) return

    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    if(marcadorRastro){
      marcadorRastro.setLatLng([lat,lng])
    }else{
      marcadorRastro = L.circleMarker([lat,lng],{
        radius:6,color:"#2196f3",fillColor:"#2196f3",fillOpacity:1
      }).addTo(map)
    }

    if(ultimoPonto){
      const dist = calcularDistancia(
        ultimoPonto.lat,ultimoPonto.lng,lat,lng
      )
      if(dist < 0.002 || dist > 0.3) return
      distanciaTotal += dist
    }

    ultimoPonto = {lat,lng}
    pontosRastro.push([lat,lng])

    if(linhaRastro) map.removeLayer(linhaRastro)

    linhaRastro = L.polyline(pontosRastro,{
      color:"red",weight:4
    }).addTo(map)

  })
}

/* =================  Marcar Ponto ================= */
function marcarPonto(){

  if(!coordenadaAtual){
    alert("Clique na 🎯 primeiro.")
    return
  }

  if(marcadorPonto) map.removeLayer(marcadorPonto)

  marcadorPonto = L.marker([
    coordenadaAtual.lat,
    coordenadaAtual.lng
  ]).addTo(map)

  marcadorPonto.bindPopup("📍 Ponto marcado").openPopup()
}
/* ================= 📐 ÁREA ================= */

function iniciarArea(){

  console.log("Modo área iniciado")

  modoArea = true

  pontosArea = []
  distanciaTotal = 0
  ultimoPonto = null
  inicioTempo = new Date()

  intervaloTempo = setInterval(()=>{
    atualizarPainelRastro()
  }, 1000)

  watchAreaId = navigator.geolocation.watchPosition(

    (pos)=>{

      if(!modoArea || rastroPausado) return

      const lat = pos.coords.latitude
      const lng = pos.coords.longitude

      if(pos.coords.accuracy > 20) return

      // bolinha
      if(marcadorArea){
        marcadorArea.setLatLng([lat,lng])
      }else{
        marcadorArea = L.circleMarker([lat,lng],{
          radius:6,
          color:"#2196f3",
          fillColor:"#2196f3",
          fillOpacity:1
        }).addTo(map)
      }

      if(ultimoPonto){
        const dist = calcularDistancia(
          ultimoPonto.lat,
          ultimoPonto.lng,
          lat,
          lng
        )

        if(dist < 0.002) return
        if(dist > 0.3) return

        distanciaTotal += dist
      }

      ultimoPonto = {lat,lng}
      pontosArea.push([lat,lng])

      if(linhaArea) map.removeLayer(linhaArea)

      linhaArea = L.polyline(pontosArea,{
        color:"red",
        weight:4,
        smoothFactor:2
      }).addTo(map)

    },

    (erro)=> console.log("Erro GPS área:", erro),

    {
      enableHighAccuracy:true,
      maximumAge:1000,
      timeout:15000
    }

  )

  mostrarPainelRastro()
}

function fecharArea(){

  modoArea = false

  navigator.geolocation.clearWatch(watchAreaId)
  clearInterval(intervaloTempo)

  esconderPainelRastro()

  if(pontosArea.length < 3){
    alert("Área inválida")
    return
  }

  if(poligonoArea) map.removeLayer(poligonoArea)

  poligonoArea = L.polygon(pontosArea,{
    color:"green"
  }).addTo(map)

  const area = calcularAreaHectares(pontosArea)

  alert("Área total: " + area.toFixed(2) + " ha")

  gerarKMLArea()

  console.log("Área finalizada")
}

function calcularAreaHectares(coords){

  let area = 0

  for(let i=0; i < coords.length; i++){
    const [lat1, lon1] = coords[i]
    const [lat2, lon2] = coords[(i+1) % coords.length]

    area += (lon2 * lat1) - (lon1 * lat2)
  }

  return Math.abs(area / 2) * 111139 * 111139 / 10000
}
/* ================= ⏸️ ÁREA CONTROLE ================= */

function pausarRastro(){
  rastroPausado = true
}

function continuarRastro(){
  rastroPausado = false
}

function finalizarRastro(){

  navigator.geolocation.clearWatch(watchId)
  clearInterval(intervaloTempo)

  rastroAtivo = false
  rastroPausado = false

  esconderPainelRastro()

  gerarKML()

  if(linhaRastro){
    map.removeLayer(linhaRastro)
    linhaRastro = null
  }

  if(marcadorRastro){
    map.removeLayer(marcadorRastro)
    marcadorRastro = null
  }

  console.log("Rastro finalizado")
}
/* ================= 📊 PAINEL ================= */
function mostrarPainel(){
  document.getElementById("painelRastro").style.display = "block"
}

function esconderPainel(){
  document.getElementById("painelRastro").style.display = "none"
}
function atualizarPainelRastro(){
  const tempo = Math.floor((new Date()-inicioTempo)/1000)
  const min = Math.floor(tempo/60)
  const seg = tempo%60
  document.getElementById("infoRastro").innerHTML =
    `Tempo: ${min}m ${seg}s<br>Distância: ${distanciaTotal.toFixed(3)} km`
}

function atualizarPainelArea(){
  const tempo = Math.floor((new Date()-tempoAreaInicio)/1000)
  const min = Math.floor(tempo/60)
  const seg = tempo%60
  document.getElementById("infoRastro").innerHTML =
    `Área<br>Tempo: ${min}m ${seg}s<br>Distância: ${distanciaTotal.toFixed(3)} km`
}

/* ================= 📐 ÁREA CÁLCULO ================= */

function calcularAreaHectares(coords){
  let area = 0
  for(let i=0;i<coords.length;i++){
    const [lat1,lon1]=coords[i]
    const [lat2,lon2]=coords[(i+1)%coords.length]
    area += (lon2*lat1)-(lon1*lat2)
  }
  return Math.abs(area/2)*111139*111139/10000
}
