console.log("menu.js carregado")

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const btnMenu =
      document.getElementById("btnMenu")

    const menuLateral =
      document.getElementById("menuLateral")

    if(btnMenu && menuLateral){

      btnMenu.addEventListener(
        "click",
        () => {

          menuLateral.classList.toggle(
            "aberto"
          )

        }
      )

    }

  }
)

/* =========================
MENU
========================= */

function fecharMenu(){

  const menu =
    document.getElementById("menuLateral")

  document.getElementById(
  "btnFecharMenu"
).onclick = () => {

  document
    .getElementById("menuLateral")
    .classList.remove("aberto")

}
  
  menu.classList.remove("aberto")

}

function abrirFeicoes(){

  fecharMenu()

  alert("Abrir Feições")

}

function abrirGrades(){

  fecharMenu()

  alert("Abrir Grades")

}

function abrirRastros(){

  fecharMenu()

  alert("Abrir Rastros")

}

function exportarTudo(){

  fecharMenu()

  alert("Exportar Tudo")

}

function abrirFeicoes(){

  fecharMenu()

  carregarFeicoesSalvas()

}
