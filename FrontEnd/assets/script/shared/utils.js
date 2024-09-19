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
 * Ajoute les projets au DOM 
 */
export function showProjets() {
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
        projets.forEach (projet => {
            // Création d’une balise dédiée à un projet
            const figureElement = document.createElement("figure");
            figureElement.setAttribute('figureId', projet.categoryId);
            // Création des balises 
            const imageElement = document.createElement("img");
            imageElement.src = projet.imageUrl;
            imageElement.alt = projet.title;
            imageElement.id = projet.id;
            const nomElement = document.createElement("figcaption");
            nomElement.innerText = projet.title;
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