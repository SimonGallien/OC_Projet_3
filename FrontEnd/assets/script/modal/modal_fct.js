/*Ce fichier contient toutes les fonctions qui gère la boîte modal*/
import {init} from "../functions.js";
import {loadConfig} from "../config.js";
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

    // Ajout d'un listener pour chaque icone corbeille qui appelle la fct delteImage
    modal.querySelectorAll('.modal-photos .fa-trash-can').forEach(a => {
        a.addEventListener('click', async (e) => {
            deleteImage(e);
        });
    });

    // Ajout d'un listener pour ouvrir la 2nd page Ajout de photo
    modal.querySelector('#openAddPhotoView').addEventListener('click', showAddPhotoView);
    // Ajout d'un listener pour revenir à la 1er page
    modal.querySelector('#prevBtn-photoView').addEventListener('click', showGalleryView);

    // Ajout des événements pour fermer la modale
    modal.addEventListener('click', closeModal);
    modal.querySelector(".js-modal-close").addEventListener('click', closeModal);
    modal.querySelector(".js-modal-stop").addEventListener('click', stopPropagation);

    return modal;
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
    modal.querySelector('#openAddPhotoView').removeEventListener('click', showAddPhotoView);
    modal.querySelector('#prevBtn-photoView').removeEventListener('click', showGalleryView);

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
        imageElement.id = img.id;
        iconeElement.classList.add("fa-solid", "fa-trash-can");
        iconeElement.id = img.id;

        imageContainer.appendChild(imageElement);
        imageContainer.appendChild(linkElement);
        linkElement.appendChild(iconeElement);

        modalContainer.appendChild(imageContainer); // Ajouter les éléments dans le DOM
    });

    console.log("État de la galerie après ajout des images:", modalContainer.innerHTML);
}

/**
 * Cette fct cache dans la modale la div avec l'id galleryView et 
 * montre la div avec l'id addPhotoView + l'icone prevBtn-photoView
 */
function showAddPhotoView () {
    console.log("Ouverture de Ajout Photo");

    // On récupère les 2 id galleryView et addPhotoView et on cache galleryView et affiche addPhotoView
    modal.querySelector("#galleryView").style.display = "none";
    modal.querySelector("#addPhotoView").style.display = null;
    // On récupère l'id du btn flèche qui sert à retourner à galleryPhoto
    modal.querySelector("#prevBtn-photoView").style.display = null;
}

/**
 * Cette fct cache dans la modale la div avec l'id addPhotoView et + l'icone prevBtn-photoView
 * et montre la div avec l'id galleryView
 */
function showGalleryView () {
    console.log("Ouverture de Galerie Photo");

    // On récupère les 2 id galleryView et addPhotoView et on cache addPhotoView et affiche galleryView
    modal.querySelector("#galleryView").style.display = null;
    modal.querySelector("#addPhotoView").style.display = "none";
    // On récupère l'id du btn flèche qui sert à retourner à galleryPhoto
    modal.querySelector("#prevBtn-photoView").style.display = "none";
}

/**
 * Cette fonction envoie une requête au serveur DELETE, si la réponse du serveur est correct
 * on supprime dynamiquement l'image dans la modale et sur la page projets du site
 * @param {*} e 
 * @returns 
 */
async function deleteImage(e) {
    e.preventDefault();
    console.log("clique sur icone corbeille");

    // On récupère l'ID de l'icone qui est le même que l'image
    const targetId = e.target.getAttribute('id');
    console.log("Id to delete", targetId);

    // Envoie du requête de suppression à l'API 
    //       curl -X 'DELETE' \
    //      'http://localhost:5678/api/works/{id' \
    //      -H 'accept: */*' \
    //      -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcyNTEwMjM3NSwiZXhwIjoxNzI1MTg4Nzc1fQ.bxOsafIFD5CPVS92qjNWWkc2UaljVNNlrQcHCGHq8C4'

    const config = await loadConfig();

    const token = localStorage.getItem('authToken');
    const urlDelete = `${config.host}/api/works/${targetId}`;

    console.log(`Token : ${token}`);
    console.log(`request URL : ${urlDelete}`);

    // Envoi de la requête DELETE à l'API
    try {
        const response = await fetch(urlDelete, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
            }
        });

        console.log('Response status:', response.status);

        /************************************************************************************/
        // Utilisé les cases à la place des if imbriqué pour gérer les erreurs côté backend
        /************************************************************************************/

        if (response.status === 204) {
            // Pas de contenu à traiter, retournez simplement un objet vide
            console.log('Suppression réussie, aucun contenu renvoyé.');

            // On supprime l'image de la modale
            const imageContainer = e.target.closest('div'); // Trouver le conteneur parent de l'image
            if (imageContainer) {
                imageContainer.remove(); // Supprimer l'élément du DOM
            }
            // On supprime l'image de la page principal
            /************************************************************************************/
            //Mettre une condition if id image trouvé alors closest
            /************************************************************************************/
            const imageProjet = document.querySelector(`figure img[id='${targetId}']`).closest('figure');
            if (imageProjet) {
                console.log('Figure trouvée:', imageProjet);
                imageProjet.remove(); // Supprimer l'élément du DOM
            } else {
                console.log('Aucune figure trouvée pour cet ID d\'image.');
            }
            return;
        }

        // Traitement du contenu de la réponse, s'il existe
        const text = await response.text();
        if (text) {
            const data = JSON.parse(text);
            console.log('Données:', data);
        } else {
            console.log('Réponse vide reçue.');
        }

    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}