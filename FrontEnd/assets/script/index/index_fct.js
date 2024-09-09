/**************************************************************
 **** CE FICHIER CONTIENT LES FONCTIONS UTILE POUR INDEX   ****
 **************************************************************/

import {loadConfig} from "../config.js";

/**
 * Fonction asynchrone pour la récupération des projets depuis le localStorage sinon depuis l'API
 * @returns: promess projets('id', 'title', 'imageUrl', 'categoryId', 'userId', "'category':{'id', 'name'}"")
 */
export async function getAllWorks() {
    try {
        //Chargement de config.json
        const config = await loadConfig();
        if (!config){
            throw new Error("Problème avec le chargement du fichier config.json");
        }

        // Récupération des projets depuis l'API
        const reponse = await fetch(config.host + "works");
        switch (reponse.status){
            case 200:
                let projets = await reponse.json();        
                return projets;
            case 500:
                console.error('Unexpected Error');
                break;
        };
    } catch {
        console.error('Erreur réseau ou autre problème:', error);
    }
}

/**
 * Fonction asynchrone qui fait une requête HTTP à l'API pour récupérer la liste des catégories
 * @returns promess catégories ('id', 'name')
 */
export async function getCategories() {
    try{
        //Chargement de config.json
        const config = await loadConfig();
        if (!config){
            throw new Error("Problème avec le chargement du fichier config.json");
        };

        // Récupération des catégories depuis l'API
        const reponse = await fetch(config.host + "categories");
        switch(reponse.status){
            case 200:
                let categories = await reponse.json();
                // Transformation des categories en JSON
                const listeCategories = JSON.stringify(categories);
                // Stockage des informations dans le localStorage
                window.localStorage.setItem("categories", listeCategories);
                return categories;
            case 500:
                console.error('Unexpected Error');
                break;
        };
        
    } catch {
        console.error('Erreur réseau ou autre problème:', error);
    };
};

/**
 * Affiche le Header lorsque la fct est appelée
 */
export async function genererHeader(){
    try {
        // Charger le header
        await fetch('../partials/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        });
    }catch (error) {
        console.error('Erreur lors du chargement du header : ', error);
    }
}

/**
 * Affiche le Footer lorsque la fct est appelée
 */
export async function genererFooter(){
    try {
        // Charger le footer
        fetch('../partials/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
            });
    }catch (error) {
        console.error('Erreur lors du chargement du footer : ', error);
    }
}

/**
 * Ajoute les projets au DOM
 * @param {*} projets 
 */
export async function showProjets(projets) {
    try{
        // Récupération de l'élément du DOM qui accueillera les projets
        const sectionPortfolio = document.querySelector(".gallery");
        sectionPortfolio.innerHTML='';
        // S'assurer que la section existe avant de procéder
        if (!sectionPortfolio) {
            console.error("L'élément .gallery n'a pas été trouvé dans le DOM.");
            return;
        }
        projets.forEach (figure => {
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
            // On rattache les balises <img> et <figcaption> à la balise <figure>
            figureElement.appendChild(imageElement);
            figureElement.appendChild(nomElement);
            // On rattache la balise figure à la section Portfolio
            sectionPortfolio.appendChild(figureElement);
        })
    } catch (error) {
        console.error('Erreur lors du chargement des projets : ', error);
    }
}

/**
 * Affiche les options de filtres au dessus des projets
 * @param {*} listCategories : la promess que retourne la fct listeCatégories()
 */
export async function createBtnFilters(listCategories) {
    try{
        const divFilters = document.querySelector(".filters");

        // Création du bouton filtre "Tous"
        const buttonElement = document.createElement("button");
        buttonElement.innerText = `Tous`;
        buttonElement.setAttribute(`class`, `btnTous`);
        divFilters.appendChild(buttonElement);
    
        // Création des autres boutons filtre
        listCategories.forEach(category => {
            const buttonId = category.id;
            if (!document.querySelector(`[categoryId="${buttonId}"]`)) {
                // Création des balises boutons
                const buttonElement = document.createElement("button");
                buttonElement.innerText = category.name;
                buttonElement.setAttribute('categoryId', buttonId);
                //On rattache la balise button à la div filters
                divFilters.appendChild(buttonElement);
            }
        })
    } catch (error){
        console.error('Erreur lors de la création de options filtres : ', error);
    }
}

/**
 * Passe la page en mode édition si le token existe dans la session storage
 * Login devient Logout
 * Le lien modifier à côté du titre Mes Projets devient visible
 * La banderole mode-edition devient visible
 */
export function checkAuthentification() {
    try{
        const authToken = localStorage.getItem('authToken');
        const elements = {
            btnLogin: document.querySelector("#btn-login"),
            liFilters: document.querySelector(".filters"),
            btnLogout: document.querySelector("#btn-logout"),
            lienEdit: document.querySelector("#link-edit"),
            editHeader: document.querySelector("#edit-header"),
            editGlobal: document.querySelector(".header-global"),
            portfolioTitle: document.querySelector("#portfolioTitle")
        }
    
        // Si le token n'existe pas, on arrête l'exécution de la fonction
        if (!authToken) {
            return // Token non trouvé = utilisateur non connecté
        }
    
        // Vérification des éléments et affichage des erreurs si non trouvés
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`La balise correspondante à '${key}' n'a pas été trouvée dans le DOM`);
            }
        }

        // Afficher les boutons d'action du site, déjà dans le code HTML avec display:none
        elements.lienEdit.style.display = 'inherit';
        elements.editHeader.style.display = 'inherit';
        elements.editGlobal.style.marginTop = '38px';
        elements.btnLogin.style.display = 'none';
        elements.btnLogout.style.display = 'inherit';
        elements.liFilters.style.display = 'none';
        elements.portfolioTitle.style.marginBottom = "92px";

    } catch (error){
        console.error('Impossible de vérifier si l\'utilisateur est connecté : ', error);
    }
}

/**
 * Déconnecte l'utilisateur du mode édition et affichage en mode normal
 */
export function seDeconnecter(){
    try {
        const btnLogout = document.querySelector("#btn-logout");
        if(!btnLogout){
            console.error("La balise correspondante à '#btn-logout' n'a pas été trouvée dans le DOM");
            return
        }
    
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('userId');
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        })
    } catch {
        console.error('Problème de deconnection : ', error);
    }

}

/**
 * Filtre les projets en fonctions du paramètre reçu en entrée, 
 * cache ou affiche les projets présent dans le DOM
 * @param {*} button : btn du filtre cliqué par l'utilisateur
 */
export function filterByCategory(button){
    try {
        const buttonAttribute = button.getAttribute('categoryId');
        const galleryFigure = document.querySelectorAll(".gallery figure");// Récupération de toute les figures dans la div gallery
    
        if (buttonAttribute) {
            // On cache tout sauf les figures avec ${buttonAttribute}
            galleryFigure.forEach(figure => {
                const figureAttribute = figure.getAttribute('figureId');
                if (figureAttribute === buttonAttribute) {
                    figure.setAttribute("style", "display: null;"); // Affiche la figure
                } else {
                    figure.setAttribute("style", "display: none;"); // Cache la figure
                }
            })
    
        } else {
            // On affiche toute les figures display=null
            galleryFigure.forEach(figure => {
                figure.setAttribute("style", "display: null;");
            })
        }
    } catch (error){
        console.error('Erreur de la fonctions filtre : ', error);
    }
}

