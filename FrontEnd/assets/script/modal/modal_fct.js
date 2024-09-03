/*Ce fichier contient toutes les fonctions qui gère la boîte modal*/

import {loadConfig} from "../config.js";
let modal = null; 

/**
 * Affichage de la boîte modale
 * @param {*} e : évènement suite au click sur le lien modifier
 * @returns modal
 */
export async function openModal (e) {
    const target = e.target.getAttribute('href');
    
    if (target.startsWith('#')){
        modal = document.querySelector(target);
    } else {
        modal = await loadModal(target);
    }

    if (!modal) {
        console.error("La modale n'a pas été trouvée dans le DOM.");
        return;
    }

    // Afficher la boîte modal
    modal.style.display = null;
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');

    return modal;
}

/**
 * Cache la modale et supprime tout les listener de cette modale, réinitialise le contenu de la galerie
 * @param {*} e 
 */
export function closeModal (e){
    if (modal === null) return;
    e.preventDefault();

    // Cacher la modale
    modal.style.display = "none";
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');

    // Réinitialiser le contenu de la galerie
    const modalPhoto = document.querySelector('.modal-photos');
    if (modalPhoto) {
        modalPhoto.innerHTML = '';  // Vider le contenu
    }

    // Nettoyer les événements
    modal.removeEventListener('click', closeModal);
    modal.querySelector(".js-modal-close").removeEventListener('click', closeModal);
    modal.querySelector(".js-modal-stop").removeEventListener('click', stopPropagation);
    modal.querySelector('#openAddPhotoView').removeEventListener('click', showAddPhotoView);
    modal.querySelector('#prevBtn-photoView').removeEventListener('click', showGalleryView);
    modal.querySelector(".btn-Send-Photo").removeEventListener('click', addImage);
    modal.querySelector("#imageUpload").removeEventListener('change', previewImage);
    modal.querySelectorAll('.modal-photos .fa-trash-can').forEach(a => {
        a.removeEventListener('click', async (e) => {
            e.preventDefault();
            await deleteImage(e);
        });
    });
    modal = null;
}

/**
 * Empèche la modale de se fermer sur un click sur la modale
 * @param {*} e 
 */
export function stopPropagation (e) {
    e.stopPropagation();
}

/**
 * Charge la modale dans le DOM
 * @param {*} url de la modale
 * @returns le code HTML de la modale
 */
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

/**
 * Chaque images dans la galerie est affichée dans la modale avec l'icone de corbeille
 * @returns End function en cas d'erreur
 */
export async function loadImgModal() {
    const modalContainer = modal.querySelector(".modal-photos");
    // Réinitialiser la galerie avant de la recharger
    if (modalContainer) {
        modalContainer.innerHTML = ''; // Vider le contenu existant pour éviter des duplications
    } else {
        console.error("L'élément .modal-photos n'a pas été trouvé dans la modale");
    }

    // Récupération des images dans la gallerie
    const galleryImages = document.querySelectorAll(".gallery figure img");
    if (!galleryImages) {
        return;
    }

    galleryImages.forEach(img => {
        const imageContainer = document.createElement("div");
        const imageElement = document.createElement("img");
        const iconeElement = document.createElement("i");
        const linkElement = document.createElement("a");

        imageElement.src = img.src;
        imageElement.alt = img.alt;
        imageElement.id = img.id;
        iconeElement.classList.add("fa-solid", "fa-trash-can");
        iconeElement.id = img.id;

        imageContainer.appendChild(imageElement);
        imageContainer.appendChild(linkElement);
        linkElement.appendChild(iconeElement);

        modalContainer.appendChild(imageContainer); // Ajouter les éléments dans le DOM
    });
}

/**
 * Affiche la liste des catégories dans le formulaire d'ajout de photo
 * La liste des catégories est reprise de la partie Filters
 * @param {*} modal 
 */
export async function loadFormModal(modal) {
    // Récupération des noms de catégories sur la page principal dans la partie Filtres
    const filtersButton = document.querySelectorAll(".filters button");
    // Récupération dans la modale de la balise <select>
    const selectForm = modal.querySelector("#category");
    // Pour chaque catégorie
    filtersButton.forEach (btn =>{
        if (btn.innerText !== "Tous") {
            // Création d'éléments <options> ayant pour valeur le nom de catégorie
            const option = document.createElement("option");
            const buttonAttribute = btn.getAttribute('categoryId');
            option.innerText = btn.innerText;
            option.value = buttonAttribute;
            // Ajout des éléments <option> au DOM
            selectForm.appendChild(option);
        }
    });
};

/**
 * Cette fct cache dans la modale la div avec l'id galleryView et 
 * montre la div avec l'id addPhotoView + l'icone prevBtn-photoView
 */
export function showAddPhotoView () {
    // On récupère les 2 id galleryView et addPhotoView et on cache galleryView et affiche addPhotoView
    modal.querySelector("#galleryView").style.display = "none";
    modal.querySelector("#addPhotoView").style.display = null;
    // On récupère l'id du btn flèche qui sert à retourner à galleryPhoto
    modal.querySelector("#prevBtn-photoView").style.display = null;
}

/**
 * Cette fct cache dans la modale la div avec l'id addPhotoView et l'icone prevBtn-photoView
 * et montre la div avec l'id galleryView
 */
export function showGalleryView () {
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
export async function deleteImage(e) {
    try {
        //Chargement de config.json
        const config = await loadConfig();
        if (!config){
            throw new Error("Problème avec le chargement du fichier config.json");
        };
        // On récupère l'ID de l'icone qui est le même que l'image
        const targetId = e.target.getAttribute('id');
        // Récupération du token dans le local storage
        const authToken = localStorage.getItem('authToken');
        // Si le token n'existe pas, on arrête l'exécution de la fonction
        if (!authToken) {
            console.error("Token d'identication abs, session expirée");
            return
        };
        const urlDelete = `${config.host}works/${targetId}`;

        // Envoi de la requête DELETE à l'API
        const response = await fetch(urlDelete, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${authToken}`,
            }
        });

        switch (response.status){
            case 200 && 204:
                // On supprime l'image de la modale
                const imageContainer = e.target.closest('div'); // Trouver le conteneur parent de l'image
                if (imageContainer) {
                    imageContainer.remove(); // Supprimer l'élément du DOM
                }
                // On supprime l'image de la page principal
                const imageProjet = document.querySelector(`figure img[id='${targetId}']`).closest('figure');
                if (imageProjet) {
                    imageProjet.remove(); // Supprimer l'élément du DOM
                }
                break
            case 401:
                console.error("Unauthorized");
                break
            case 500:
                console.error("Unexpected Behaviour");
                break
            default:
                console.error("Unexpected Behaviour: try to refresh the webpage");
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}

/**
 * Ajoute un projet à l'API et sur la page sans devoir recharger
 * @param {*} e 
 * @returns en cas d'erreur
 */
export async function addImage(e){
    e.preventDefault();
    try {
        //Chargement de config.json
        const config = await loadConfig();
        if (!config){
            throw new Error("Problème avec le chargement du fichier config.json");
        };
        // On récupère les données du formulaire depuis
        // l'objet représentant l'évènement
        var myForm = document.getElementById("uploadForm");
        var formData = new FormData(myForm);

        // Envoyer la requête POST à l'API
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Token d\'authentification manquant.');
            return;
        }

        const response = await fetch(config.host + "works", {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`,  // Si un token est nécessaire
            },
            body: formData  // Utiliser formData comme body
        });

        switch (response.status) {
            case 201:
                // Affichage de l'image sans rechargement de page
                // 1. On récupère dans la réponse de l'API l'attibut "imageUrl", "title" et "categoryId"(garder la partie filtres opérationnel)
                let apiResponse = await response.json();
                const imageUrl = apiResponse.imageUrl;
                const imageTitle = apiResponse.title;
                const categoryId = apiResponse.categoryId;

                // 2. On ajoute l'image au DOM
                // 2.1 Création d'une balise <figure>, <img> et <figcaption>
                const figureElement = document.createElement("figure");
                const imageElement = document.createElement("img");
                const nomElement = document.createElement("figcaption");
                // 2.2 On donne à la balise <img> l'URL et la paramètre Alt qui sera le titre
                //      et à la balise <figcaption> le titre, la categoryId à la figure
                imageElement.src = imageUrl;
                imageElement.alt = imageTitle;
                nomElement.innerText = imageTitle;
                figureElement.id = categoryId;
                // 2.3 Récupération de l'élément parent ou sera placer la figure
                const sectionPortfolio = document.querySelector(".gallery");
                // 2.4 On insert <img> et <figcaption> à l'intérieur de la balise <figure>
                //      et on rattache la balise <figure> dans l'élément parent récupérer à l'étape 2.3
                sectionPortfolio.appendChild(figureElement);
                figureElement.appendChild(imageElement);
                figureElement.appendChild(nomElement);
                break
            case 400:
                console.error('Bad Request');
                break
            case 401:
                console.error('Unauthorized');
                break
            case 500:
                console.error('Unexpected Error');
                break
        } 
    } catch (error) {
        console.error('Erreur réseau ou autre problème:', error);
    }
};

/**
 * Affiche l'image en preview dans le formulaire
 * @param {*} event 
 */
export function previewImage(event) {
    const file = event.target.files[0]; // Récupère le premier fichier sélectionné
    const preview = document.getElementById('imagePreview'); // Récupère l'élément img pour la prévisualisation
    if (file) {

        document.querySelector('.fa-image').style.display = 'none';
        document.querySelector('.modal-form-txt').style.display = 'none';
        document.querySelector('.modal-form-txtFormat').style.display = 'none';

        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result; // Définir la source de l'image comme le résultat de la lecture
            preview.style.display = 'block'; // Affiche l'image
        };

        reader.readAsDataURL(file); // Lire le fichier comme une URL de données
    } else {
        preview.style.display = 'none'; // Cache l'image si aucun fichier n'est sélectionné
    }
}