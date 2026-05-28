function iniciarMenu(){

  const btn =
    document.getElementById("btnMenu")

  const menu =
    document.getElementById("menuLateral")

  btn.onclick = () => {

    menu.classList.toggle("aberto")

  }

}
