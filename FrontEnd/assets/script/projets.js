/**************************************************************
 * CE FICHIER CONTIENT TOUTES LES FONCTIONS POUR LES PROJETS  *
 **************************************************************/
import {loadConfig} from "./config.js";
/**
 * Fonction asynchrone pour la récupération des projets depuis le localStorage sinon depuis l'API
 * @returns: retourne une promesse
 */
export async function init() {
    
        const config = await loadConfig();

        //Récupération des projets eventuellement stockées dans le localStorage
        let projets = window.localStorage.getItem('projets');

        if (projets === null) {
            // Récupération des projets depuis l'API
            const reponse = await fetch(config.host + "/api/works");
            projets = await reponse.json();
            // Transformation des projets en JSON
            const valeurProjets = JSON.stringify(projets);
            // Stockage des informations dans le localStorage
            window.localStorage.setItem("projets", valeurProjets);
        } else {
            projets = JSON.parse(projets);
        }
        // Vous pouvez maintenant utiliser 'projets' comme vous le souhaitez
        //console.log(projets);
        return projets;
}


/**
 * Ajoute les projets au DOM
 * @param {*} projets 
 */
export function genererProjets(projets) {
    for (let i = 0; i < projets.length; i++) {

        const figure = projets[i];

        // Récupération de l'élément du DOM qui accueillera les projets
        const sectionPortfolio = document.querySelector(".gallery");

        // Création d’une balise dédiée à un projet
        const figureElement = document.createElement("figure");

        // Création des balises 
        const imageElement = document.createElement("img");
        imageElement.src = figure.imageUrl;
        imageElement.alt = figure.title;
        const nomElement = document.createElement("figcaption");
        nomElement.innerText = figure.title;

        // On rattache la balise figure a la section Portfolio
        sectionPortfolio.appendChild(figureElement);
        figureElement.appendChild(imageElement);
        figureElement.appendChild(nomElement);
    }
}

/**
 * Génère les bouttons de filtres en fonction du nbr de catégories
 * @param {*} projets 
 */
export function genererBtnFilters(projets) {
    //Création de l'élément DOM qui accuiellera les boutons de filtres
    const divFilters = document.querySelector(".filters");
    // Création du bouton "Tous"
    const buttonElement = document.createElement("button");
    buttonElement.innerText = `Tous`;
    buttonElement.setAttribute(`class`, `btnTous`);
    divFilters.appendChild(buttonElement);
    const btnTous = document.querySelector(".btnTous");
    btnTous.addEventListener("click", () => {
        document.querySelector(".gallery").innerHTML = "";
        genererProjets(projets);
    });

    for (let i = 0; i < projets.length; i++) {
        const projet = projets[i];
        const buttonId = projet.categoryId;

        if (!document.getElementById(buttonId)) {
            // Création des balises button
            const buttonElement = document.createElement("button");
            buttonElement.innerText = projet.category.name;
            buttonElement.id = buttonId;
            //On rattache la balise button à la div filters
            divFilters.appendChild(buttonElement);
            buttonElement.addEventListener("click", () => {
                const projetFiltres = projets.filter(function (projet) {
                    return projet.categoryId === buttonId;
                });
                document.querySelector(".gallery").innerHTML = "";
                genererProjets(projetFiltres);
            })
        }
    }
}