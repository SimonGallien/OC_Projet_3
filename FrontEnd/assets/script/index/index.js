import {initProjects, showFilters, filterByCategory,checkAuthentification, seDeconnecter} from "./indexFunctions.js";
import {genererHeader, genererFooter, showProjets} from "../shared/utils.js";

// Afficher le Header et Footer
await genererHeader();
await genererFooter();

document.querySelector('#btn-projets a').style.fontWeight ='bold';

// Initialiser les projets lorsque le script est chargé
await initProjects();

showProjets();

showFilters();
document.querySelectorAll(".filters button").forEach(buttonFilter =>{
    buttonFilter.addEventListener('click', filterByCategory);
});

checkAuthentification();

const btnLogout = document.querySelector("#btn-logout");
btnLogout.addEventListener('click', seDeconnecter);

const burgerMenu = document.getElementById('menu-toggle');
const navMenu = document.querySelector('.side-menu');
const closeMenu = document.querySelector('.side-menu-close');

burgerMenu.addEventListener('click', function() {
    navMenu.classList.toggle('open');  // Ouvre ou ferme le menu en ajoutant/retirant la classe "open"
});

closeMenu.addEventListener('click', function() {
    navMenu.classList.toggle('open');  // Ouvre ou ferme le menu en ajoutant/retirant la classe "open"
});