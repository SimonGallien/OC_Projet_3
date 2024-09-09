import {getAllWorks, getCategories, showProjets, createBtnFilters, filterByCategory, genererHeader, genererFooter,checkAuthentification, seDeconnecter} from "./functions.js";
    
// Appelle des fonction pour récupérer les projets, les affichers et créer les btn de filtres
const listProjets = await getAllWorks();
export const listCategories = await getCategories();

await showProjets(listProjets);

// Afficher le Header et Footer
await genererHeader();
await genererFooter();

document.querySelector('#btn-projets a').style.fontWeight ='bold';

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

document.getElementById('menu-toggle').addEventListener('click', function() {
    const navLinks = document.querySelector('nav ul');
    navLinks.classList.toggle('show'); // Bascule l'affichage du menu en mobile
});
