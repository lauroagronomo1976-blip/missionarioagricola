/* 
MISSIONÁRIO AGRÍCOLA
versão 1.5.1
Controle da tela de Missões
*/

document.addEventListener("DOMContentLoaded", () => {

  console.log("📋 Tela de Missões carregada");


  const btnAvancar = document.getElementById("btnAvancarMissao");
  const btnSair = document.getElementById("btnSair");


  if(btnAvancar){

    btnAvancar.addEventListener("click", () => {

      const safra = document.getElementById("safraSelect").value;
      const empresa = document.getElementById("empresaInput").value;
      const fazenda = document.getElementById("fazendaInput").value;
      const gleba = document.getElementById("glebaInput").value;
      const talhao = document.getElementById("talhaoInput").value;
      const cultura = document.getElementById("culturaInput").value;
      const variedade = document.getElementById("variedadeInput").value;
      const missao = document.getElementById("missaoSelect").value;


      if(!safra || !empresa || !fazenda || !talhao || !cultura || !missao){

        alert("Preencha os campos obrigatórios.");
        return;

      }


      const dadosMissao = {

        safra,
        empresa,
        fazenda,
        gleba,
        talhao,
        cultura,
        variedade,
        missao,
        dataInicio: new Date().toISOString()

      };


      localStorage.setItem("dadosMissao", JSON.stringify(dadosMissao));


      console.log("Missão salva:", dadosMissao);


      window.location.href = "registro.html";

    });

  }


  if(btnSair){

    btnSair.addEventListener("click", () => {

      localStorage.removeItem("dadosMissao");

      window.location.href = "index.html";

    });

  }

});

