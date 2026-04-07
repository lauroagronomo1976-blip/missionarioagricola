let rastroAtivo = false
let rastroPausado = false
let watchId = null
let pontosRastro = []
let linhaRastro = null
let distanciaTotal = 0
let ultimoPonto = null
let inicioTempo = null

let marcadorPonto = null
let map;
let coordenadaAtual = null;
let marcadorAtual = null;
let pontoAtual = null;
let registrosDoPonto = [];
let rastroAtivo = false
let linhaRastro = null
let pontosRastro = []

document.addEventListener("DOMContentLoaded", () => {
    
const form = document.getElementById("formMissaoContainer")

// trava escondido ao carregar
form.style.setProperty("display", "none", "important")    

// força esconder SEM depender do CSS
form.style.setProperty("display", "none", "important")
    
    // 👇 MOSTRA O FORMULÁRIO
  document.getElementById("formMissaoContainer").style.display = "none";

})

  /* ================= MAPA ================= */
  map = L.map('map', { zoomControl: false })
    .setView([-15.0, -47.0], 5);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  setTimeout(() => map.invalidateSize(), 300);

  /* ================= 🎯 MIRA ================= */
  document.getElementById("btnMira").onclick = ()=>{
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

  // 🔥 RASTRO
  if(rastroAtivo){
    pontosRastro.push([lat,lng])

    if(linhaRastro) map.removeLayer(linhaRastro)

    linhaRastro = L.polyline(pontosRastro,{
      color:"red"
    }).addTo(map)
  }

})
}

  /* ================= MARCAR PONTO ================= */
    if(!coordenadaAtual){
  alert("Clique na 🎯 primeiro.")
  return
}

if(marcadorPonto){
  map.removeLayer(marcadorPonto)
}

marcadorPonto = L.marker([coordenadaAtual.lat, coordenadaAtual.lng]).addTo(map)

marcadorPonto.bindPopup("📍 Ponto em registro...")

pontoAtual = {
  lat: coordenadaAtual.lat,
  lng: coordenadaAtual.lng,
  data: new Date().toISOString()
}

registrosDoPonto = []

document.getElementById("formMissaoContainer").hidden = false

  /* ================= SALVAR REGISTRO ================= */
  }

const registro = {
  ocorrencia,
  especie,
  fase,
  individuos: Number(individuos),
  severidade: Number(severidade),
  dataHora: new Date().toISOString(),
  lat: coordenadaAtual.lat,
  lng: coordenadaAtual.lng
}

try{

  const docRef = await db.collection("registros").add(registro)

  console.log("🔥 ID salvo:", docRef.id)

}catch(e){
  console.error("Erro ao salvar:", e)
}

  await db.collection("registros").add(registro)

  console.log("🔥 Salvo no Firebase")

  registrosDoPonto.push(registro)
  renderizarLista()

}catch(e){
  console.error("Erro ao salvar:", e)
  alert("Erro ao salvar no banco")
}

console.log("Enviando para Firebase:", registro)

document.getElementById("ocorrenciaSelect").value = ""
document.getElementById("especieInput").value = ""
document.getElementById("individuosInput").value = ""
document.getElementById("severidadeInput").value = ""
})
        
  /* ================= CONCLUIR ================= */
  if(!pontoAtual) return

pontoAtual.registros = registrosDoPonto

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

document.getElementById("formMissaoContainer").hidden = true

/* ================= FUNÇÕES ================= */

function ativarMira() {
  if (!navigator.geolocation) {
    alert("Geolocalização não suportada.");
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    coordenadaAtual = { lat, lng };

    map.setView([lat, lng], 17);

    if(marcadorPonto) map.removeLayer(marcadorPonto)

marcadorPonto = L.marker([coordenadaAtual.lat, coordenadaAtual.lng]).addTo(map)

marcadorPonto.bindPopup("📍 Ponto em registro...")

      
    marcadorAtual = L.circleMarker([lat, lng], {
      radius: 8,
      color: "#1e88e5",
      fillColor: "#1e88e5",
      fillOpacity: 1
    }).addTo(map);

      carregarPontosDoBanco()
  });
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2-lat1) * Math.PI/180
  const dLon = (lon2-lon1) * Math.PI/180

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function marcarPonto() {

  const dadosMissao = JSON.parse(localStorage.getItem("dadosMissao"));

  if (!dadosMissao) {
    alert("Nenhuma missão ativa.");
    return;
  }

  if (!coordenadaAtual) {
    alert("Clique na 🎯 primeiro.");
    return;
  }

  pontoAtual = {
    ...dadosMissao,
    latitude: coordenadaAtual.lat,
    longitude: coordenadaAtual.lng,
    data: new Date().toISOString()
  };

  registrosDoPonto = [];

  L.marker([coordenadaAtual.lat, coordenadaAtual.lng]).addTo(map);

 document.getElementById("formMissaoContainer").hidden = true;
form.classList.add("ativo");
  
  document.getElementById("tituloMissao").innerText = dadosMissao.missao;

  document.getElementById("infoMissao").innerHTML = `
    <b>Missão:</b> ${dadosMissao.missao}<br>
    <b>Fazenda:</b> ${dadosMissao.fazenda}<br>
    <b>Talhão:</b> ${dadosMissao.talhao}
  `;
    document.getElementById("btnRastro").onclick = ()=>{

  rastroAtivo = !rastroAtivo

  if(rastroAtivo){
    pontosRastro = []
    if(linhaRastro) map.removeLayer(linhaRastro)
    alert("Rastro ativado")
  }else{
    alert("Rastro pausado")
  }

}
}

function salvarRegistro() {

  const ocorrencia = document.getElementById("ocorrenciaSelect").value;
  const especie = document.getElementById("especieInput").value;
  const fase = document.getElementById("faseSelect").value;
  const individuos = document.getElementById("individuosInput").value;
  const severidade = document.getElementById("severidadeInput").value;

  if (!ocorrencia || !especie) {
    alert("Preencha os campos obrigatórios.");
    return;
  }

  const registro = {
    ocorrencia,
    especie,
    fase,
    individuos,
    severidade
  };

  registrosDoPonto.push(registro);
  renderizarLista();
}


function concluirPonto() {
  document.getElementById("formMissaoContainer").classList.remove("ativo")
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
  div.style.background = "#fafafa"

  div.innerHTML = `
  <strong>${r.ocorrencia}</strong> - ${r.especie}<br>
  Fase: ${r.fase} | Ind: ${r.individuos || 0} | Sev: ${r.severidade || 0}%
  `

  lista.appendChild(div)

})

}
function carregarPontosDoBanco(){

  db.collection("registros")
  .onSnapshot((snapshot)=>{

    snapshot.docChanges().forEach((change)=>{

      if(change.type === "added"){

        const r = change.doc.data()

        const marker = L.marker([coordenadaAtual.lat, coordenadaAtual.lng]).addTo(map)

        marker.bindPopup("📍 Ponto em registro...")

          <b>${r.ocorrencia}</b><br>
          ${r.especie}<br>
          Fase: ${r.fase}<br>
          Sev: ${r.severidade}%
        `)

      }

    })

  })

}
