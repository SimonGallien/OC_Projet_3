import {init, genererProjets, genererBtnFilters, genererHeader, genererFooter,checkAuthentification, seDeconnecter} from "./functions.js";

async function main() {
    
    // Appelle des fonction pour récupérer les projets, les affichers et créer les btn de filtres
    const projets = await init();
    genererProjets(projets);
    genererBtnFilters(projets);

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