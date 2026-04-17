console.log("JS carregou")

let map
let coordenadaAtual = null
let marcadorAtual = null
let marcadorPonto = null
let registrosDoPonto = []

// RASTRO
let rastroAtivo = false
let rastroPausado = false
let watchId = null
let pontosRastro = []
let linhaRastro = null
let marcadorRastro = null
let distanciaTotal = 0
let ultimoPonto = null
let inicioTempo = null
let intervaloTempo = null

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

  document.getElementById("formMissaoContainer").style.display = "none"

  document.getElementById("btnMira").onclick = ativarMira
  document.getElementById("btnMarcarPontoInferior").onclick = marcarPonto
  document.getElementById("btnSalvarRegistro").onclick = salvarRegistro
  document.getElementById("btnConcluirPonto").onclick = concluirPonto
  document.getElementById("btnRastro").onclick = controlarRastro

})

/* 🎯 MIRA */
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

/* 📍 MARCAR */
function marcarPonto(){

  if(!coordenadaAtual){
    alert("Clique na 🎯 primeiro.")
    return
  }

  if(marcadorPonto) map.removeLayer(marcadorPonto)

  marcadorPonto = L.marker([coordenadaAtual.lat, coordenadaAtual.lng]).addTo(map)
  marcadorPonto.bindPopup("📍 Ponto em registro...")

  registrosDoPonto = []

  document.getElementById("formMissaoContainer").style.display = "block"
}

/* 💾 SALVAR */
function salvarRegistro(){

  const ocorrencia = document.getElementById("ocorrenciaSelect").value
  const especie = document.getElementById("especieInput").value

  if(!ocorrencia || !especie){
    alert("Preencha os campos obrigatórios")
    return
  }

  registrosDoPonto.push({ocorrencia, especie})
  renderizarLista()
}

/* 📋 LISTA */
function renderizarLista(){

  const lista = document.getElementById("listaRegistros")
  lista.innerHTML = "<h4>Registros do ponto:</h4>"

  registrosDoPonto.forEach(r=>{
    const div = document.createElement("div")
    div.innerHTML = `<strong>${r.ocorrencia}</strong> - ${r.especie}`
    lista.appendChild(div)
  })
}

/* ✅ CONCLUIR */
function concluirPonto(){

  document.getElementById("formMissaoContainer").style.display = "none"
}

/* 📏 DISTÂNCIA */
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

/* 🛰️ RASTRO */
function controlarRastro(){

  if(!rastroAtivo){
    iniciarRastro()
  }else if(!rastroPausado){
    pausarRastro()
  }else{
    continuarRastro()
  }
}

function iniciarRastro(){
alert("Rastro iniciado")
  rastroAtivo = true
  rastroPausado = false
  pontosRastro = []
  distanciaTotal = 0
  ultimoPonto = null
  inicioTempo = new Date()

  intervaloTempo = setInterval(()=>{
    atualizarPainelRastro()
  }, 1000)

  watchId = navigator.geolocation.watchPosition(

  (pos)=>{

    if(rastroPausado) return

    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    console.log("GPS ativo:", lat, lng)

    // filtro leve
    if(pos.coords.accuracy > 50) return

    if(ultimoPonto){
      const dist = calcularDistancia(
        ultimoPonto.lat,
        ultimoPonto.lng,
        lat,
        lng
      )

      if(dist < 0.002) return
      if(dist > 0.5) return

      distanciaTotal += dist
    }

    ultimoPonto = {lat,lng}

    pontosRastro.push([lat,lng])

    if(linhaRastro) map.removeLayer(linhaRastro)

    linhaRastro = L.polyline(pontosRastro,{
      color:"red",
      weight:4,
      smoothFactor:3
    }).addTo(map)

  },

  (erro)=>{
    console.log("Erro GPS:", erro)
  },

  {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 15000
  }

)
  console.log("GPS ativo:", pos.coords.latitude, pos.coords.longitude)
    if(rastroPausado) return

    if(pos.coords.accuracy > 50) return

    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    // 🔵 bolinha do técnico
if(marcadorRastro){
  marcadorRastro.setLatLng([lat,lng])
}else{
  marcadorRastro = L.circleMarker([lat,lng],{
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

      if(dist < 0.002) return   // 2 metros
      if(dist > 0.5) return     // 500m (menos agressivo)

      distanciaTotal += dist
    }

    ultimoPonto = {lat,lng}

    pontosRastro.push([lat,lng])

    if(linhaRastro) map.removeLayer(linhaRastro)

    linhaRastro = L.polyline(pontosRastro,{
      color:"red",
      weight:4,
      smoothFactor:3
    }).addTo(map)

  },{
    enableHighAccuracy:true
    enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 15000
  })

  mostrarPainelRastro()
}

function pausarRastro(){ rastroPausado = true }
function continuarRastro(){ rastroPausado = false }

function finalizarRastro(){

  navigator.geolocation.clearWatch(watchId)
  clearInterval(intervaloTempo)

  rastroAtivo = false
  rastroPausado = false

  gerarKML()

  esconderPainelRastro()
}
// limpar linha
if(linhaRastro){
  map.removeLayer(linhaRastro)
  linhaRastro = null
}

// limpar bolinha
if(marcadorRastro){
  map.removeLayer(marcadorRastro)
  marcadorRastro = null
}

/* 📊 PAINEL */
function mostrarPainelRastro(){
  document.getElementById("painelRastro").style.display = "block"
}

function esconderPainelRastro(){
  document.getElementById("painelRastro").style.display = "none"
}

function atualizarPainelRastro(){

  const tempo = Math.floor((new Date() - inicioTempo)/1000)
  const min = Math.floor(tempo/60)
  const seg = tempo % 60

  document.getElementById("infoRastro").innerHTML =
    `Tempo: ${min}m ${seg}s <br> Distância: ${distanciaTotal.toFixed(3)} km`
}

/* 📁 KML */
function gerarKML(){

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
  <Document><Placemark><LineString><coordinates>`

  pontosRastro.forEach(p=>{
    kml += `${p[1]},${p[0]},0 `
  })

  kml += `</coordinates></LineString></Placemark></Document></kml>`

  const blob = new Blob([kml], {
    type: "application/vnd.google-earth.kml+xml"
  })

  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `rastro_${Date.now()}.kml`
  link.click()
}
