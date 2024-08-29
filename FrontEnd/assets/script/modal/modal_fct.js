/*Ce fichier contient toutes les fonctions qui gère la boîte modal*/
import {init} from "../functions.js";
let modal = null; 
const projets = await init();

export async function openModal (e) {
    e.preventDefault();
    const target = e.target.getAttribute('href');
    console.log("Cible de la modale", target);
    
    if (target.startsWith('#')){
        modal = document.querySelector(target);
    } else {
        modal = await loadModal(target);
        console.log("Etat de l'élément au début : ", modal.querySelector(".modal-photos"));
    }

    if (!modal) {
        console.error("La modale n'a pas été trouvée dans le DOM.");
        return;
    }

    // Réinitialiser la galerie avant de la recharger
    const modalPhoto = modal.querySelector(".modal-photos");
    console.log("Etat de l'élément au début : ", modalPhoto);
    if (modalPhoto) {
        modalPhoto.innerHTML = ''; // Vide la galerie avant de recharger les images
        console.log("Galerie vide");
    } else {
        console.error("L'élément .modal-photos n'a pas été trouvé dans la modale");
    }

    // Afficher la boîte modal
    modal.style.display = null;
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');

    // charger les images
    console.log("Chargement des images");
    chargerImgModal(modalPhoto);

    // Vérifier le DOM après le chargement
    console.log("État de la modale après le chargement des images:", modal.innerHTML);

    // Ajout des événements pour fermer la modale
    modal.addEventListener('click', closeModal);
    modal.querySelector(".js-modal-close").addEventListener('click', closeModal);
    modal.querySelector(".js-modal-stop").addEventListener('click', stopPropagation);
}

export function closeModal (e){
    if (modal === null) return;
    e.preventDefault();
    console.log("Fermeture de la modale déclenchée");

    // Cacher la modale
    modal.style.display = "none";
    console.log("La modale est cachée");
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');

    // Réinitialiser le contenu de la galerie
    const modalPhoto = document.querySelector('.modal-photos');
    if (modalPhoto) {
        modalPhoto.innerHTML = '';  // Vider le contenu
    }

    console.log("État du DOM après fermeture : ", document.querySelector('.modal-photos').innerHTML);

    // Nettoyer les événements
    modal.removeEventListener('click', closeModal);
    modal.querySelector(".js-modal-close").removeEventListener('click', closeModal);
    modal.querySelector(".js-modal-stop").removeEventListener('click', stopPropagation);

    // Libérer la référence à la modale
    modal = null;
}

function stopPropagation (e) {
    e.stopPropagation();
}

async function loadModal (url) {
    // Charger le contenu de modal.html via fetch
    const target = '#' + url.split('#')[1]; // Extraire l'ID cible de l'URL
    const html = await fetch(url).then(response => response.text()); // Charger le HTML

    // Créer un fragment de document et insérer le contenu dans le DOM
    const fragment = document.createRange().createContextualFragment(html);
    const element = fragment.querySelector(target);

    // Ajouter l'élément extrait au DOM
    document.body.append(element);

    return element;
}

export function chargerImgModal(modalContainer) {

    if (!modalContainer) {
        console.error("L'élément .modal-photos n'a pas été trouvé dans le DOM.");
        return;
    }

    modalContainer.innerHTML = ''; // Vider le contenu existant pour éviter des duplications

    projets.forEach(img => {
        console.log("Ajout d'une image à la galerie");

        const imageContainer = document.createElement("div");
        const imageElement = document.createElement("img");
        const iconeElement = document.createElement("i");
        const linkElement = document.createElement("a");

        imageElement.src = img.imageUrl;
        imageElement.alt = img.title;
        linkElement.href = "#";
        iconeElement.classList.add("fa-solid", "fa-trash-can");

        imageContainer.appendChild(imageElement);
        imageContainer.appendChild(linkElement);
        linkElement.appendChild(iconeElement);

        modalContainer.appendChild(imageContainer); // Ajouter les éléments dans le DOM
    });

    console.log("État de la galerie après ajout des images:", modalContainer.innerHTML);
}