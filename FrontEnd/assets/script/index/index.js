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

const burgerMenu = document.getElementById('menu-toggle');
const navMenu = document.querySelector('.side-menu');
const closeMenu = document.querySelector('.side-menu-close');

burgerMenu.addEventListener('click', function() {
    navMenu.classList.toggle('open');  // Ouvre ou ferme le menu en ajoutant/retirant la classe "open"
});

closeMenu.addEventListener('click', function() {
    navMenu.classList.toggle('open');  // Ouvre ou ferme le menu en ajoutant/retirant la classe "open"
});


