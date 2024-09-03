/*Ce fichier contient toutes les fonctions qui gère la boîte modal*/

import {loadConfig} from "../config.js";
let modal = null; 

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

    // Afficher la boîte modal
    modal.style.display = null;
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');

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
    modal.querySelector(".btn-Send-Photo").removeEventListener('click', addImage);
    modal = null;
}

export function stopPropagation (e) {
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

export async function loadImgModal() {
    const modalContainer = modal.querySelector(".modal-photos");
    // Réinitialiser la galerie avant de la recharger
    console.log("Etat de l'élément au début : ", modalContainer);
    if (modalContainer) {
        modalContainer.innerHTML = ''; // Vider le contenu existant pour éviter des duplications
        console.log("Galerie vide");
    } else {
        console.error("L'élément .modal-photos n'a pas été trouvé dans la modale");
    }

    // Récupération des images dans la gallerie
    const galleryImages = document.querySelectorAll(".gallery figure img");
    if (!galleryImages) {
        console.log("Aucune images n'a été trouvé dans le DOM.");
        return;
    }

    galleryImages.forEach(img => {
        console.log("Ajout d'une image à la galerie");

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
            console.log(`Ajout de la catégorie : "${btn.innerText}"`);
            // Création d'éléments <options> ayant pour valeur le nom de catégorie
            const option = document.createElement("option");
            const buttonAttribute = btn.getAttribute('categoryId');
            option.innerText = btn.innerText;
            option.value = buttonAttribute;
            // Ajout des éléments <option> au DOM
            selectForm.appendChild(option);
        }
    });
}

/**
 * Cette fct cache dans la modale la div avec l'id galleryView et 
 * montre la div avec l'id addPhotoView + l'icone prevBtn-photoView
 */
export function showAddPhotoView () {
    console.log("Ouverture de Ajout Photo");

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

export async function addImage(e){
    e.preventDefault();
    console.log("formdata déclenché");
    // On récupère les données du formulaire depuis
    // l'objet représentant l'évènement
    var myForm = document.getElementById("uploadForm");
    var formData = new FormData(myForm);

    for (const value of formData.values()) {
        console.log(value);
    };

    // Envoyer la requête POST à l'API
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error('Token d\'authentification manquant.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`,  // Si un token est nécessaire
            },
            body: formData  // Utiliser formData comme body
        });

        if (response.ok) {
            console.log('Image envoyée avec succès');

            // Affichage de l'image sans rechargement de page
            // 1. On récupère dans la réponse de l'API l'attibut "imageUrl", "title" et "categoryId"(garder la partie filtres opérationnel)
            let apiResponse = await response.json();
            console.log('API response: ', apiResponse);
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
        
        } else {
            console.error('Erreur lors de l\'envoi de l\'image');
        }
    } catch (error) {
        console.error('Erreur réseau ou autre problème:', error);
    }
}