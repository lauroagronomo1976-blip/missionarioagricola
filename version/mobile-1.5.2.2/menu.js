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

function abrirFeicoes(){

  alert("Feições Salvas")

}

function abrirGrades(){

  alert("Grades Salvas")

}

function abrirRastros(){

  alert("Rastros Salvos")

}

function exportarTudo(){

  alert("Exportar Tudo")

}
