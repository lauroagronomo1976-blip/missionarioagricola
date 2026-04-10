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

/* ================= 📍 MARCAR ================= */

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

/* ================= 💾 SALVAR ================= */

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
    severidade
  }

  registrosDoPonto.push(registro)

  renderizarLista()
}

/* ================= 📋 LISTA ================= */

function renderizarLista(){

  const lista = document.getElementById("listaRegistros")
  lista.innerHTML = "<h4>Registros do ponto:</h4>"

  registrosDoPonto.forEach(r=>{

    const div = document.createElement("div")

    div.innerHTML = `
      <strong>${r.ocorrencia}</strong> - ${r.especie}<br>
      Fase: ${r.fase} | Ind: ${r.individuos || 0} | Sev: ${r.severidade || 0}%
    `

    lista.appendChild(div)

  })
}

/* ================= ✅ CONCLUIR ================= */

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

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/* ================= 🛰️ RASTRO ================= */

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

    let dist = 0

if(ultimoPonto){
  dist = calcularDistancia(
    ultimoPonto.lat,
    ultimoPonto.lng,
    lat,
    lng
  )

  // ignora ruído muito pequeno (menos de 2 metros)
  if(dist < 0.002) return

  // ignora salto absurdo de GPS
  if(dist > 0.1) return

  distanciaTotal += dist
}

ultimoPonto = {lat,lng}

pontosRastro.push([lat,lng])

    if(linhaRastro) map.removeLayer(linhaRastro)

    linhaRastro = L.polyline(pontosRastro,{
  color:"red",
  weight: 4,
  smoothFactor: 2
}).addTo(map)

    atualizarPainelRastro()

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

  rastroAtivo = false
  rastroPausado = false

  esconderPainelRastro()
}

/* ================= 📊 PAINEL ================= */

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
