/**************************************************************
 **** CE FICHIER CONTIENT LES FONCTIONS UTILE POUR INDEX   ****
 **************************************************************/
 import {setProjects, setCategories} from "../shared/state.js";
 import {makeHttpRequest} from "../shared/api.js";

 /**
  * Enregistre les états des projets et catégories
  */
 export async function initProjects() {
    try {
        // Appel API pour récupérer tous les projets
        const allProjects = await makeHttpRequest("works");
        // Appel API pour récupérer toutes les catégories
        const allCategories = await makeHttpRequest("categories");

        // Stocker les projets dans l'état global
        setProjects(allProjects);
        setCategories(allCategories);
    } catch (error) {
        console.error('Erreur lors de la récupération des projets :', error);
    } 
}

 /**
  * 
  * @param {*} allCategories 
  */
 export async function initFilters(allCategories) {
    try{
        createBtnFilters(allCategories);
        // Gestions des filtres
        const AllButtonFilter = document.querySelectorAll(".filters button"); // Récupération de tout les bouttons de filtres
        AllButtonFilter.forEach(buttonFilter =>{
            buttonFilter.addEventListener('click', () => {
                filterByCategory(buttonFilter);
            });
        });
    }catch (error){
        console.error("Erreur lors de l'affichage des filtres :", error);
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