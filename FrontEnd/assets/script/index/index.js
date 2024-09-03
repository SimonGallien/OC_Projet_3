import {getAllWorks, listeCategories, genererProjets, createBtnFilters, filterByCategory, genererHeader, genererFooter,checkAuthentification, seDeconnecter} from "./index_fct.js";
    
// Appelle des fonction pour récupérer les projets, les affichers et créer les btn de filtres
const listProjets = await getAllWorks();
const listCategories = await listeCategories();

genererProjets(listProjets);

// Afficher le Header et Footer
await genererHeader();
await genererFooter();

// Création des filtres
await createBtnFilters(listCategories);

// Gestions des filtres
const btnFilter = document.querySelectorAll(".filters button"); // Récupération de tout les bouttons de filtres
btnFilter.forEach(button =>{
    button.addEventListener('click', () => {
        filterByCategory(button);
    });
});

checkAuthentification();

const btnLogout = document.querySelector("#btn-logout");
btnLogout.addEventListener('click', () => {
        seDeconnecter();
});