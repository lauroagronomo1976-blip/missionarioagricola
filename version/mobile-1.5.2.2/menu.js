console.log("menu.js carregado")

document.addEventListener(
  "DOMContentLoaded",
  () => {

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

  if(menu){
    menu.classList.remove("aberto")
  }

}

function abrirFeicoes(){

  fecharMenu()

}

function abrirGrades(){

  fecharMenu()

}

function abrirRastros(){

  fecharMenu()

}

function exportarTudo(){

  fecharMenu()

}

function abrirFeicoes(){

  fecharMenu()

  carregarFeicoesSalvas()

}


window.onload = () => {

  const btn =
    document.getElementById("btnMenu")

  const menu =
    document.getElementById("menuLateral")

  btn.onclick = () => {

    menu.classList.toggle("aberto")

  }

}
