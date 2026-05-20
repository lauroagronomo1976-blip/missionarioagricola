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

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  map = L.map('map', {
    zoomControl:false
  }).setView([-15,-47],5)

  iconeGrade = L.icon({

  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

  iconSize: [25,41],
  iconAnchor: [12,41],
  popupAnchor: [1,-34],
  shadowSize: [41,41]

})
    // zoom correto
  L.control.zoom({ position:'bottomright' }).addTo(map)

  // mapa base
  const street = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 19 }
  ).addTo(map)

  setTimeout(() => {

  const layerControl =
    document.querySelector(
      '.leaflet-control-layers'
    )

  if(layerControl){

    layerControl.style.width = "260px"

    layerControl.style.minWidth = "260px"
  }

},1000)
  
  // camada satélite
const satelite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution:'Tiles © Esri',
    maxZoom:19
  }
)
  // botão camadas
  const baseMaps = {
  "Rua": street,
  "Satélite": satelite
}

const controleLayers = L.control.layers(
  {
    "Rua": street,
    "Satélite": satelite
  },
  {},
  {
    position:'topright',
    collapsed:false
  }
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
  const acc = pos.coords.accuracy

  // 🔥 filtro mais inteligente
  if(acc > 25) return

  // 🔵 marcador suavizado
  if(marcador){
    const atual = marcador.getLatLng()

    const latSuave = atual.lat + (lat - atual.lat) * 0.3
    const lngSuave = atual.lng + (lng - atual.lng) * 0.3

    marcador.setLatLng([latSuave, lngSuave])
  }else{
    marcador = L.circleMarker([lat,lng],{
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

    // 🔥 filtros mais profissionais
    if(dist < 0.002) return   // < 2m (ruído)
    if(dist > 0.5) return     // salto GPS

    distancia += dist
  }

  ultimoPonto = {lat,lng}
  pontos.push([lat,lng])

  if(linha) map.removeLayer(linha)

  linha = L.polyline(pontos,{
    color:"red",
    weight:4,
    smoothFactor:2
  }).addTo(map)
}

/* ================= FINALIZAR ================= */
function finalizar(){

  clearInterval(timer)

  if(watchId){
    navigator.geolocation.clearWatch(watchId)
  }

  // ================= ÁREA =================
  if(modo === "area" && pontos.length >= 3){

    // desenha polígono
    L.polygon(pontos,{
      color:"green"
    }).addTo(map)

    // calcula área  e (EU) SALVAR FEIÇÕES
    areaCalculada = calcularArea(pontos)

    feicoesSalvas.push({
      tipo:"area",
      pontos:[...pontos],
      area:areaCalculada,
      data:new Date()
    })
    
    // centraliza
    map.fitBounds(
      L.polygon(pontos).getBounds()
    )

    // atualiza painel
    atualizarPainel()

    // salva KML
    gerarKMLArea()

    // pergunta grade (funciona offline)
let respostaGrade = prompt(
  "Deseja gerar grade amostral?\nDigite SIM ou NÃO",
  "SIM"
)

if(
  respostaGrade &&
  respostaGrade.toUpperCase() === "SIM"
){

      let tamanhoGrade = prompt(
        "Tamanho da grade em hectares (0.1 até 100):",
        "1"
      )

      if(!tamanhoGrade){
        tamanhoGrade = 1
      }

      tamanhoGrade = parseFloat(tamanhoGrade)

      if(isNaN(tamanhoGrade)){
        tamanhoGrade = 1
      }

      if(tamanhoGrade < 0.01){
        tamanhoGrade = 0.01
      }

      if(tamanhoGrade > 100){
        tamanhoGrade = 100
      }

      gerarGrade(tamanhoGrade)
    }
  }

  // ================= RASTRO =================
  if(modo === "rastro"){

    feicoesSalvas.push({
  tipo:"rastro",
  pontos:[...pontos],
  distancia:distancia,
  data:new Date()
})
    
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

  clearInterval(timer)

  if(watchId){
    navigator.geolocation.clearWatch(watchId)
  }

  // remove linha
  if(linha){
    map.removeLayer(linha)
    linha = null
  }

  // remove marcador GPS
  if(marcador){
    map.removeLayer(marcador)
    marcador = null
  }

  // remove polígonos
  map.eachLayer(layer=>{

    if(layer instanceof L.Polygon){
      map.removeLayer(layer)
    }

  })

  // remove grade
  marcadoresGrade.forEach(m=>{
    map.removeLayer(m)
  })

  marcadoresGrade = []
  pontosGrade = []

  // reset
  pontos = []
  distancia = 0
  areaCalculada = null
  ultimoPonto = null
  modo = null
  pausado = false

  document.getElementById("infoRastro").innerHTML = ""

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

/* ================= GRADE ================= */

function gerarGrade(hectares){

  // remove grade antiga
  marcadoresGrade.forEach(m=>{
    map.removeLayer(m)
  })

  marcadoresGrade = []
  pontosGrade = []

  // polígono da área
  const polygon = L.polygon(pontos)

  // limites
  const bounds = polygon.getBounds()

  const norte = bounds.getNorth()
  const sul = bounds.getSouth()
  const leste = bounds.getEast()
  const oeste = bounds.getWest()

  // espaçamento mais denso
  const espacamento =
    Math.sqrt(hectares * 10000) * 0.25

  // metro -> grau
  const passoLat = espacamento / 111320

  const passoLng =
    espacamento /
    (
      111320 *
      Math.cos(
        ((norte+sul)/2) * Math.PI/180
      )
    )

  // offsets
  const offsetLat = passoLat / 2
  const offsetLng = passoLng / 2

  for(
    let lat = sul + offsetLat;
    lat <= norte;
    lat += passoLat
  ){

    for(
      let lng = oeste + offsetLng;
      lng <= leste;
      lng += passoLng
    ){

      const ponto = [lat,lng]

      // verifica se está dentro
      if(
        pontoDentroPoligono(
          ponto,
          pontos
        )
      ){

        pontosGrade.push(ponto)

        // marcador offline
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

  // ponto central se vazio
  if(pontosGrade.length === 0){

    const centro = bounds.getCenter()

    const marcadorCentral =
  L.marker(
    [centro.lat, centro.lng],
    {
      icon: iconeGrade
    }
  ).addTo(map)

    marcadorCentral.bindPopup(
      "Ponto Central"
    )

    marcadoresGrade.push(
      marcadorCentral
    )

    pontosGrade.push([
      centro.lat,
      centro.lng
    ])
  }

  alert(
    "Grade criada com " +
    pontosGrade.length +
    " pontos"
  )

  console.log(
    "Grade criada:",
    pontosGrade.length
  )
}

/* ================= PONTO DENTRO ================= */
function pontoDentroPoligono(ponto, poligono){

  const x = ponto[1]
  const y = ponto[0]

  let dentro = false

  for(
    let i = 0,
    j = poligono.length - 1;

    i < poligono.length;

    j = i++
  ){

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

    if(intersecta){
      dentro = !dentro
    }
  }

  return dentro
}
