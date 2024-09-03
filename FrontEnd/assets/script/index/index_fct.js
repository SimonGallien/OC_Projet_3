/**************************************************************
 * CE FICHIER CONTIENT TOUTES LES FONCTIONS   *
 **************************************************************/
import {loadConfig} from "../config.js";
/**
 * Fonction asynchrone pour la récupération des projets depuis le localStorage sinon depuis l'API
 * @returns: retourne une promesse
 */
export async function init() {
    
        //Chargement de config.json
        const config = await loadConfig();

        // Récupération des projets depuis l'API
        const reponse = await fetch(config.host + "/api/works");
        let projets = await reponse.json();

        // Transformation des projets en JSON
        const valeurProjets = JSON.stringify(projets);

        // Stockage des informations dans le localStorage
        window.localStorage.setItem("projets", valeurProjets);

        return projets;
}

/**
 * Fonction asynchrone qui fait une requête HTTP à l'API pour récupérer la liste des catégories
 * @returns la liste des catégories (id, name)
 */
export async function listeCategories() {
    
    //Chargement de config.json
    const config = await loadConfig();

    // Récupération des catégories depuis l'API
    const reponse = await fetch(config.host + "/api/categories");
    let categories = await reponse.json();

    // Transformation des categories en JSON
    const listeCategories = JSON.stringify(categories);

    // Stockage des informations dans le localStorage
    window.localStorage.setItem("categories", listeCategories);

    return categories;
}

/**
 * Affiche le Header lorsque la fct est appelée
 */
export async function genererHeader(){
    // Charger le header
    await fetch('header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
    });
}

/**
 * Affiche le Footer lorsque la fct est appelée
 */
export function genererFooter(){
    // Charger le header
    fetch('footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
    });
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
        figureElement.setAttribute('figureId', figure.category.id);

        // Création des balises 
        const imageElement = document.createElement("img");
        imageElement.src = figure.imageUrl;
        imageElement.alt = figure.title;
        imageElement.id = figure.id;
        const nomElement = document.createElement("figcaption");
        nomElement.innerText = figure.title;

        // On rattache la balise figure a la section Portfolio
        sectionPortfolio.appendChild(figureElement);
        figureElement.appendChild(imageElement);
        figureElement.appendChild(nomElement);
    }
}

/**
 * Affiche les options de filtres en prenant en paramètre la liste des catégories
 * @param {*} listCategories 
 */
export async function createBtnFilters(listCategories) {
    //Création de l'élément DOM qui accuiellera les boutons de filtres
    const divFilters = document.querySelector(".filters");

    // Création du bouton "Tous"
    const buttonElement = document.createElement("button");
    buttonElement.innerText = `Tous`;
    buttonElement.setAttribute(`class`, `btnTous`);
    divFilters.appendChild(buttonElement);

    for (let i = 0; i < listCategories.length; i++) {
        const category = listCategories[i];
        const buttonId = category.id;
    
        if (!document.querySelector(`[categoryId="${buttonId}"]`)) {

            // Création des balises button
            const buttonElement = document.createElement("button");
            buttonElement.innerText = category.name;

            // buttonElement.id = buttonId;
            buttonElement.setAttribute('categoryId', buttonId);

            //On rattache la balise button à la div filters
            divFilters.appendChild(buttonElement);
        };
    };
};

/**
 * Passe la page en mode édition si le token existe dans le local storage
 */
export function checkAuthentification(){
    const authToken = localStorage.getItem('authToken');
    const btnLogin = document.querySelector("#btn-login");
    const liFilters = document.querySelector(".filters");
    const btnLogout = document.querySelector("#btn-logout");
    
    if (!authToken) {
        // Si le token n'est pas présent, rediriger vers la page de connexion
        //window.location.href = 'login.html';
        console.log("Tu n'est pas connecté");
    } else {
        console.log("Tu est connecté, bravo");
        // Afficher les boutons d'action du site, déjà dans le code HTML avec display:none
        const lienEdit = document.querySelector("#link-edit");
        const editHeader = document.querySelector("#edit-header");
        lienEdit.setAttribute('style', 'display : inherit');
        editHeader.setAttribute('style', 'display : inherit');

        // En +, changer Login par LogOut pour permettre à l'utilisateur de se déconnecter
        btnLogin.setAttribute('style', 'display : none');
        btnLogout.setAttribute('style', 'display : inherit');
        liFilters.setAttribute('style', 'display : none');
    }
    
}

/**
 * Déconnecte l'utilisateur du mode édition et affichage en mode normal
 */
export function seDeconnecter(){
    const btnLogout = document.querySelector("#btn-logout");
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    })
}

/**
 * Filtre les projets en fonctions du paramètre reçu en entrée, 
 * cache ou affiche les projets présent dans le DOM
 * @param {*} button : btn du filtre cliqué par l'utilisateur
 */
export function filterByCategory(button){
    console.log("Clique btn filtre");
    const buttonAttribute = button.getAttribute('categoryId');
    const galleryFigure = document.querySelectorAll(".gallery figure");// Récupération de toute les figures dans la div gallery
    console.log(buttonAttribute);

    if (buttonAttribute) {
        console.log(`Filtre par catégorie ${buttonAttribute}`);
        // On cache tout sauf les figures avec ${buttonAttribute}
        galleryFigure.forEach(figure => {
            const figureAttribute = figure.getAttribute('figureId');
            if (figureAttribute === buttonAttribute) {
                figure.setAttribute("style", "display: null;"); // Affiche la figure
            } else {
                figure.setAttribute("style", "display: none;"); // Cache la figure
            }
        });

    } else {
        console.log("Filtre TOUS");
        // On affiche toute les figures display=null
        galleryFigure.forEach(figure => {
            figure.setAttribute("style", "display: null;");
        });
    }
};

