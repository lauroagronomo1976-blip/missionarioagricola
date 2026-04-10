console.log("JS carregou")
let intervaloTempo = null
let marcadorRastro = null
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
let distanciaTotal = 0
let ultimoPonto = null
let inicioTempo = null

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

function ativarMira(){
  navigator.geolocation.getCurrentPosition((pos)=>{
    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    coordenadaAtual = {lat,lng}
    map.setView([lat,lng],17)

    if(marcadorAtual) map.removeLayer(marcadorAtual)

    marcadorAtual = L.circleMarker([lat,lng],{
      radius:8,
      color:"#1e88e5",
      fillColor:"#1e88e5",
      fillOpacity:1
    }).addTo(map)
    if(marcadorAtual) map.removeLayer(marcadorAtual)

marcadorAtual = L.circleMarker([lat, lng], {
  radius: 6,
  color: "#1e88e5",
  fillColor: "#1e88e5",
  fillOpacity: 1
}).addTo(map)
  })
}

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

function salvarRegistro(){

  const ocorrencia = document.getElementById("ocorrenciaSelect").value
  const especie = document.getElementById("especieInput").value
  const fase = document.getElementById("faseSelect").value
  const individuos = document.getElementById("individuosInput").value
  const severidade = document.getElementById("severidadeInput").value

  if(!ocorrencia || !especie){
    alert("Preencha os campos obrigatórios")
    return
  }

  const registro = {
    ocorrencia,
    especie,
    fase,
    individuos,
    severidade,
    lat: coordenadaAtual.lat,
    lng: coordenadaAtual.lng,
    data: new Date().toISOString()
  }

  registrosDoPonto.push(registro)
  renderizarLista()
}

function renderizarLista(){

  const lista = document.getElementById("listaRegistros")
  lista.innerHTML = "<h4>Registros do ponto:</h4>"

  registrosDoPonto.forEach(r=>{

    const div = document.createElement("div")

    div.style.border = "1px solid #ddd"
    div.style.padding = "8px"
    div.style.marginBottom = "6px"
    div.style.borderRadius = "6px"

    div.innerHTML = `
      <strong>${r.ocorrencia}</strong> - ${r.especie}<br>
      Fase: ${r.fase} | Ind: ${r.individuos || 0} | Sev: ${r.severidade || 0}%
    `

    lista.appendChild(div)

  })
}

function concluirPonto(){

  let resumo = ""

  registrosDoPonto.forEach(r=>{
    resumo += `
      <b>${r.ocorrencia}</b> - ${r.especie}<br>
      Fase: ${r.fase} | Ind: ${r.individuos} | Sev: ${r.severidade}%<br><br>
    `
  })

  if(marcadorPonto){
    marcadorPonto.bindPopup(resumo).openPopup()
  }

  document.getElementById("formMissaoContainer").style.display = "none"
}

function calcularDistancia(lat1, lon1, lat2, lon2){

  const R = 6371
  const dLat = (lat2-lat1) * Math.PI/180
  const dLon = (lon2-lon1) * Math.PI/180

  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

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

  rastroAtivo = true
  rastroPausado = false
  pontosRastro = []
  distanciaTotal = 0
  ultimoPonto = null
  inicioTempo = new Date()

  watchId = navigator.geolocation.watchPosition((pos)=>{

    if(rastroPausado) return

    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    pontosRastro.push([lat,lng])

    if(ultimoPonto){
      const dist = calcularDistancia(
        ultimoPonto.lat,
        ultimoPonto.lng,
        lat,
        lng
      )
      distanciaTotal += dist
    }

    ultimoPonto = {lat,lng}

    if(linhaRastro) map.removeLayer(linhaRastro)

    linhaRastro = L.polyline(pontosRastro,{
      color:"red"
    }).addTo(map)

    atualizarPainelRastro()

  }, (erro)=>{
    console.log("Erro GPS:", erro)
  },{
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000
  })

  mostrarPainelRastro()
}

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

  gerarKML()
  esconderPainelRastro()

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

function gerarKML(){

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
  <Document><Placemark><LineString><coordinates>`

  pontosRastro.forEach(p=>{
    kml += `${p[1]},${p[0]},0 `
  })

  kml += `</coordinates></LineString></Placemark></Document></kml>`

  console.log("KML gerado:", kml)
}
