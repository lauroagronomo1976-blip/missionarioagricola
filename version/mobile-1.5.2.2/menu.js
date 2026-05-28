function iniciarMenu(){

  const btn =
    document.getElementById("btnMenu")

  const menu =
    document.getElementById("menuLateral")

  btn.onclick = () => {

    menu.classList.toggle("aberto")

  }

}

console.log("menu.js carregado")

const btnMenu =
  document.getElementById("btnMenu")

const menuLateral =
  document.getElementById("menuLateral")

btnMenu.onclick = () => {

  menuLateral.classList.toggle("aberto")

}

/* =========================
FUNÇÕES MENU
========================= */

function abrirFeicoes(){

  alert("Abrir Feições")

}

function abrirGrades(){

  alert("Abrir Grades")

}

function abrirRastros(){

  alert("Abrir Rastros")

}

function exportarTudo(){

  alert("Exportar Tudo")

}
