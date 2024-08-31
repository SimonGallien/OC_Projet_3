import {init, listeCategories, genererProjets, createBtnFilters, filterByCategory, genererHeader, genererFooter,checkAuthentification, seDeconnecter} from "./functions.js";

async function main() {
    
    // Appelle des fonction pour récupérer les projets, les affichers et créer les btn de filtres
    const listProjets = await init();
    const listCategories = await listeCategories();

    genererProjets(listProjets);

    // Création des filtres
    await createBtnFilters(listCategories);

    // Gestions des filtres
    const btnFilter = document.querySelectorAll(".filters button"); // Récupération de tout les bouttons de filtres
    btnFilter.forEach(button =>{
        button.addEventListener('click', () => {
           filterByCategory(button);
       });
    });

    // Afficher le Header et Footer
    await genererHeader();
    genererFooter();

    checkAuthentification();

    const btnLogout = document.querySelector("#btn-logout");
    btnLogout.addEventListener('click', () => {
         seDeconnecter();
    });
}

main();