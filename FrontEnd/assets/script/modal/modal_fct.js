/*Ce fichier contient toutes les fonctions qui gère la boîte modal*/

import {loadConfig} from "../config.js";
import {getAllWorks, showProjets} from "../index/index_fct.js";
let modal = null; 

/**
 * Affichage de la boîte modale
 * @param {*} event : évènement suite au click sur le lien modifier
 * @returns modal
 */
export async function openModal (event) {
    console.log("Open modale");
    const target = event.target.getAttribute('href');
    console.log("Attribut href du boutton modifier: ", target);
    const targetId = '#' + target.split('#')[1]; // Extraire l'ID cible de l'URL
    console.log('Recherche de l\'élément avec un ID= ', targetId);
    if (document.querySelector(targetId)){
        modal = document.querySelector(targetId);
        console.log('Element trouvé dans le DOM : ', modal);
    } else {
        console.log("Element non trouvé, chargement de la modal.....");
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
 * @param {*} event 
 */
export async function closeModal (event){
    if (modal === null) return;

    event.preventDefault();

    // Nettoyer les événements
    await removeEventListeners();

    // Cacher la modale
    modal.style.display = "none";
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    //modal.innerHTML="";

    modal = null;
}

/**
 * Empèche la modale de se fermer sur un click sur la modale
 * @param {*} e 
 */
export function stopPropagation (event) {
    event.stopPropagation();
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
    console.log('Contenu html de la modale', html);

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

    // Ajout d'un listener pour chaque icone corbeille qui appelle la fct delteImage
    modal.querySelectorAll('.modal-photos .fa-trash-can').forEach(trashIcone => {
        trashIcone.addEventListener('click', trashIconeClick)
    });
}

/**
 * Call function deleteImage, showProjects(function getAllWorks)
 * Delete a projet and refresh dynamically the contents 
 * @param {*} event 
 */
async function trashIconeClick(event){
    event.preventDefault();
    await deleteImage(event);
    await showProjets(await getAllWorks());
}

/**
 * Affiche la liste des catégories dans le formulaire d'ajout de photo
 * La liste des catégories est reprise de la partie Filters
 * @param {*} modal 
 */
export async function loadFormModal() {
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
                //MAJ DES PROJETS ET DE LA MODALE
                const projets = await getAllWorks();
                await showProjets(projets);
                await loadImgModal();
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
export async function addImage(event){
    event.preventDefault();
    try {
        //Chargement de config.json
        const config = await loadConfig();
        if (!config){
            throw new Error("Problème avec le chargement du fichier config.json");
        };
        // On récupère les données du formulaire depuis
        // l'objet représentant l'évènement
        var myForm = modal.querySelector("#uploadForm");
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
                // Image reçu par l'API, MAJ des projets dynamiquement et de la modale
                const projets = await getAllWorks();
                await showProjets(projets);
                await loadImgModal();
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
    console.log("Changement de photo détectée previewImage");
    const file = event.target.files[0]; // Récupère le premier fichier sélectionné
    const preview = modal.querySelector('#imagePreview');
    if (file) {

        modal.querySelector('.fa-image').style.display = 'none';
        modal.querySelector('.modal-form-txt').style.display = 'none';
        modal.querySelector('.modal-form-txtFormat').style.display = 'none';

        const reader = new FileReader();
        reader.onload = function(event) {
            preview.src = event.target.result; // Définir la source de l'image comme le résultat de la lecture
            preview.style.display = 'block'; // Affiche l'image
        };

        reader.readAsDataURL(file); // Lire le fichier comme une URL de données
    } else {
        preview.style.display = 'none'; // Cache l'image si aucun fichier n'est sélectionné
        console.error("Pas d'image sélectionné");
    }
}

// Ajout des écouteurs d'événements
export function addEventListeners() {
    const openAddPhotoViewListener = modal.querySelector('#openAddPhotoView');
    const prevBtnPhotoViewListener = modal.querySelector('#prevBtn-photoView');
    const jsModalCloseListener = modal.querySelector(".js-modal-close");
    const jsModalStopListener = modal.querySelector(".js-modal-stop");
    const imageUploadListener = modal.querySelector("#imageUpload"); 
    const btnSendPhotoListener = modal.querySelector(".btn-Send-Photo");

    if (openAddPhotoViewListener) {
        openAddPhotoViewListener.addEventListener('click', showAddPhotoView);
    }
    if (prevBtnPhotoViewListener) {
        prevBtnPhotoViewListener.addEventListener('click', showGalleryView);
    }
    if (jsModalCloseListener) {
        jsModalCloseListener.addEventListener('click', closeModal);
    }
    if (jsModalStopListener) {
        jsModalStopListener.addEventListener('click', stopPropagation);
    }
    if (imageUploadListener) {
        imageUploadListener.addEventListener('change', previewImage);
    }
    if (btnSendPhotoListener) {
        btnSendPhotoListener.addEventListener('click', sendImageClick);
    }
    // Ajout de l'écouteur de clic pour fermer la modale
    modal.addEventListener('click', closeModal);
}

/**
 * Suppression des écouteurs d'événements
 */
async function removeEventListeners() {
    const openAddPhotoViewListener = modal.querySelector('#openAddPhotoView');
    const prevBtnPhotoViewListener = modal.querySelector('#prevBtn-photoView');
    const jsModalCloseListener = modal.querySelector(".js-modal-close");
    const jsModalStopListener = modal.querySelector(".js-modal-stop");
    const imageUploadListener = modal.querySelector("#imageUpload"); 
    const btnSendPhotoListener = modal.querySelector(".btn-Send-Photo");

    if (openAddPhotoViewListener) {
        openAddPhotoViewListener.removeEventListener('click', showAddPhotoView);
    }
    if (prevBtnPhotoViewListener) {
        prevBtnPhotoViewListener.removeEventListener('click', showGalleryView);
    }
    if (jsModalCloseListener) {
        jsModalCloseListener.removeEventListener('click', closeModal);
    }
    if (jsModalStopListener) {
        jsModalStopListener.removeEventListener('click', stopPropagation);
    }
    if (imageUploadListener) {
        imageUploadListener.removeEventListener('change', previewImage);
    }
    if (btnSendPhotoListener) {
        btnSendPhotoListener.removeEventListener('click', sendImageClick);
    }

    modal.querySelectorAll('.modal-photos .fa-trash-can').forEach(trashIcone => {
        trashIcone.removeEventListener('click', trashIconeClick);
    });

    modal.removeEventListener('click', closeModal);
    console.log("les écouteurs sont supprimés");
}

/**
 * Appel addImage() et rafraîchit dynamiquement la page sans la recharger
 * @param {*} event 
 */
async function sendImageClick(event) {
    event.preventDefault();
    await addImage(event);
    await showProjets(await getAllWorks());
    await loadImgModal();
}

/**
 * Fonction pour gérer la fermeture de la modale avec la touche Escape
 * @param {*} event 
 */
export function handleEscapeKey(event) {
    if ((event.key === "Escape" || event.key === "Esc") && modal) {
        event.preventDefault(); // Empêche d'autres actions par défaut liées à la touche Escape
        closeModal(event);

        // Supprimer l'écouteur 'keydown' une fois que la modale est fermée
        window.removeEventListener('keydown', handleEscapeKey);
    }
}