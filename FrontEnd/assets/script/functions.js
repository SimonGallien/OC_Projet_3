/**************************************************************
 * CE FICHIER CONTIENT TOUTES LES FONCTIONS   *
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

export async function genererHeader(){
    // Charger le header
    await fetch('header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
    });
}

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
            });
        };
    };
};

export async function ajoutListenerSeConnecter(){

    const config = await loadConfig();

    const formulaireSeConnecter = document.querySelector(".formulaire-connection");

    formulaireSeConnecter.addEventListener("submit", function (event) {

        event.preventDefault();

        // Création de l'objet connetion
        const connection = {
            email: event.target.querySelector('.formulaire-connection input[type="email"]').value,
            password: event.target.querySelector('.formulaire-connection input[type="password"]').value,
        };

        // Converstion de la charge utile en json
        const chargeUtile = JSON.stringify(connection);

        fetch(config.host + "/api/users/login",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: chargeUtile
        })

        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.token) { // Vérifier si le token est présent dans la réponse
                // Stocker l'ID de l'utilisateur et le token dans le localStorage
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('authToken', data.token);

                // Rediriger vers la page d'accueil
                window.location.href = 'index.html';
            } else {
                // Gérer les erreurs de connexion
                alert("Combinaison utilisateur/mot de passe incorrecte.");
            }
        })
    });
}

