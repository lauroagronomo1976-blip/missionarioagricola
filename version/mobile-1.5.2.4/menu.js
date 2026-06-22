console.log("menu.js carregado")

/* =========================
INICIALIZA MENU
========================= */

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
FECHAR MENU
========================= */

function fecharMenu(){

  const menu =
    document.getElementById(
      "menuLateral"
    )

  if(menu){

    menu.classList.remove(
      "aberto"
    )

  }

}

/* =========================
FEIÇÕES
========================= */

function abrirFeicoes(){

  fecharMenu()

  console.log(
    "Abrir Feições"
  )

  if(
    typeof carregarFeicoesSalvas ===
    "function"
  ){

    carregarFeicoesSalvas()

  }else{

    alert(
      "Módulo de feições ainda não implementado."
    )

  }

}

/* =========================
GRADES
========================= */

function abrirGrades(){

  fecharMenu()

  console.log(
    "Abrir Grades"
  )

  alert(
    "Grades salvas em desenvolvimento."
  )

}

/* =========================
RASTROS
========================= */

function abrirRastros(){

  fecharMenu()

  console.log(
    "Abrir Rastros"
  )

  alert(
    "Rastros salvos em desenvolvimento."
  )

}

/* =========================
EXPORTAR
========================= */

function exportarTudo(){

  fecharMenu()

  console.log(
    "Exportar Tudo"
  )

  alert(
    "Exportação geral em desenvolvimento."
  )

}
