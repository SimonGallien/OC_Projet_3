import { getProjects } from './state.js';


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
 * Effectue une requête HTTP vers l'API et retourne les données JSON
 * @async
 * @param {string} url - L'URL vers laquelle la requête HTTP doit être effectué.
 * @returns {Promise<object>} Une promesse résolue avec les données JSON en réponse de l'API.
 * @throws {Error} Lance une erreur si la requête échoue ou si le code de statut n'est pas dans la plage 200-299.
 */
export async function makeHttpRequest(url){
    try{
        // Attendre la réponse de la requête HTTP, fetch renvoie un objet response
        const response = await fetch(url); 
        // La méthode .ok renvoie true si le code statut est dans la plage 200-299 sinon false
        if (!response.ok) { 
            throw new Error(`Erreur lors de la requête HTTP : ${response.status}`);
        }
        //  Lit le corps de la réponse et convertit les données JSON en objet JavaScript
        const data = await response.json(); 
        return data;
    } catch (error){
        console.error("Erreur lors de la requête :", error);
        // Propager l'erreur pour que l'appelant puisse la gérer
        throw error;
    }
}

/**
 * Ajoute les projets au DOM
 * @param {*} projets 
 */
export async function showProjets() {
    try{
        const projets = getProjects();  // Récupérer les projets
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