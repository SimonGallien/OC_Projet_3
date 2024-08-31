import {init,listeCategories, genererProjets, genererBtnFilters, genererHeader, genererFooter,checkAuthentification, seDeconnecter} from "./functions.js";

async function main() {
    
    // Appelle des fonction pour récupérer les projets, les affichers et créer les btn de filtres
    const listProjets = await init();
    const listCategories = await listeCategories();

    genererProjets(listProjets);
    await genererBtnFilters(listCategories);

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