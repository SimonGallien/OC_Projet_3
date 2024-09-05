/*Ce fichier contient toutes les fonctions qui gère la boîte modal*/

import {loadConfig} from "../config.js";
import {getAllWorks, showProjets} from "../index/index_fct.js";
import {listCategories} from "../index/index.js";
let modal = null; 

/**
 * Affichage de la boîte modale à partir du DOM si elle a déjà été chargé 
 * sinon importation du code modale depuis modal.html
 * @param {event} : évènement suite au click sur le lien modifier sur index.html
 * La variable global modal prend pour valeur le contenu HTML de la modale
 */
export async function openModal (event) {
    try{
        event.preventDefault();
        // Extraire l'URL cible de l'événement
        const target = event.target.getAttribute('href');
        if (!target) {
            throw new Error("Aucun 'href' trouvé dans l'élément déclencheur.");
        }

        const url = target.split('#')[0]; // Extraire l'url de la modale
        const modalId = '#' + target.split('#')[1]; // Extraire l'ID de la modale
        
        modal = document.querySelector(modalId); // Vérifier si la modale existe déjà

        // Si la modale n'est pas dans le DOM, la charger dynamiquement  
        if (!modal) {
            // Charger le contenu de modal.html avec fetch
            const response = await fetch(url);
    
            // Vérifier si la réponse est correcte
            if (!response.ok) {
                throw new Error(`La modale avec l'URL ${url} n'a pas été trouvé.`);
            }
    
            // Extraire le texte HTML de la réponse
            const html = await response.text();
    
            // Créer un fragment de document à partir de la chaîne html
            const fragment = document.createRange().createContextualFragment(html); //fragment temporaire
            modal = fragment.querySelector(modalId);
    
            // Vérifier si l'élément de la modale a été trouvé
            if (!modal) {
                throw new Error(`L'élément avec l'ID ${modalId} n'a pas été trouvé dans ${url}.`);
            }
    
            // Ajouter l'élément extrait au DOM
            document.body.append(modal);
        }
    
        if (!modal) {
            throw new Error(`La modale avec l'ID ${modalId} n'a pas été trouvée ou chargée.`);
        }
    
        // Afficher la boîte modal
        modal.style.display = null;
        modal.removeAttribute('aria-hidden');
        modal.setAttribute('aria-modal', 'true');

        // chargement du contenu dynamique de la modale
        await loadImgModal(); // Chargement des photos avec l'icone corbeille
        
        // Charge le contenu dynamique du formulaire, liste des catégories
        const selectForm = modal.querySelector("#category");
        listCategories.forEach (category => {
            // Création d'éléments <options> ayant pour valeur le nom de catégorie
            const option = document.createElement("option");
            option.innerText = category.name;
            option.value = category.id;
            // Ajout des éléments <option> au DOM
            selectForm.appendChild(option);
        })
        // Ajout des écouteurs d'événements à chaque réouverture
        addEventListeners(); // Important : réattache les événements après chaque ouverture

        // Ajout de l'écouteur pour fermer la modale avec la touche Escape
        window.addEventListener('keydown', handleEscapeKey);

    } catch (error) {
        console.error('Erreur lors de l\'ouverture de la modale:', error.message);
    }
}

/**
 * Cache la modale et supprime tous les listeners de cette modale,
 * réinitialise la vue de la modale pour la prochaine ouverture.
 */
export function closeModal (){
    try {
         // Si aucune modale n'est ouverte, quitter la fonction immédiatement
        if (modal === null) return;
    
        // Supprimer les listeners
        removeEventListeners();
    
        // Cacher la modale
        modal.style.display = "none";
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
    
        // Réinitialise la vue de la modale pour la prochaine ouverture
        showGalleryView();
    
        modal = null;

    } catch (error) {
        console.error("Erreur lors de la fermeture de la modale :", error.message);
    }
}

/**
 * Empèche la modale de se fermer avec un click sur la modale
 * @param {event} : évènement lié au click de l'utilisateur
 */
export function stopPropagation (event) {
    event.stopPropagation();
}

/**
 * Chaque images dans la galerie est affichée dans la modale avec l'icone de corbeille
 * Les listeners des icones corbeilles sont ajoutés ici, cela évite le rechargement de tout 
 * les écouteurs de la modale lors d'ajout d'image
 */
export async function loadImgModal() {
    try {
        const modalContainer = modal.querySelector(".modal-photos");

        // Réinitialiser la galerie avant de la recharger
        if (modalContainer) {
            modalContainer.innerHTML = ''; // Vider le contenu existant pour éviter des duplications
        } else {
            throw new Error("L'élément .modal-photos n'a pas été trouvé dans la modale");
        }

        // Utiliser un fragment DOM pour améliorer les performances
        const fragment = document.createDocumentFragment();
    
        // Récupération des images dans la gallerie
        const galleryImages = document.querySelectorAll(".gallery figure img");
    
        galleryImages.forEach(img => {
            const imageContainer = document.createElement("div");
            const imageElement = document.createElement("img");
            const iconeElement = document.createElement("i");
            const linkElement = document.createElement("a");

            // Définir les attributs de l'image
            imageElement.src = img.src;
            imageElement.alt = img.alt;

            // Ajouter les classes et lier l'icône avec l'image via data-attribute
            iconeElement.classList.add("fa-solid", "fa-trash-can");
            iconeElement.dataset.imgId = img.id;// Utiliser data-img-id pour lier avec l'image

            imageContainer.appendChild(imageElement);
            imageContainer.appendChild(linkElement);
            linkElement.appendChild(iconeElement);

            fragment.appendChild(imageContainer); // Ajouter l'élément au fragment
        });

        // Ajouter tous les éléments dans le DOM en une fois
        modalContainer.appendChild(fragment);
    
        // Ajout d'un listener pour chaque icone corbeille qui appelle la fct delteImage
        modal.querySelectorAll('.modal-photos .fa-trash-can').forEach(trashIcone => {
            trashIcone.addEventListener('click', deleteImage);
        });

    } catch (error){
        console.error("Erreur lors du chargement des images dans la boîte modale :", error.message);
    }
}

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
    //     // On récupère les 2 id galleryView et addPhotoView et on cache addPhotoView et affiche galleryView
    modal.querySelector("#galleryView").style.display = null;
    modal.querySelector("#addPhotoView").style.display = "none";
    // On récupère l'id du btn flèche qui sert à retourner à galleryPhoto
    modal.querySelector("#prevBtn-photoView").style.display = "none";
}

/**
 * Cette fonction envoie une requête au serveur DELETE, si la réponse du serveur est correct
 * on supprime dynamiquement l'image dans la modale et sur la page projets du site
 * @param {event} : click sur une icone corbeille
 */
export async function deleteImage(event) {
    try {
        //Chargement de config.json
        const config = await loadConfig();
        if (!config){
            throw new Error("Problème avec le chargement du fichier config.json");
        };
        // On récupère l'ID de l'icone qui est le même que l'image
        const targetId = event.target.getAttribute('data-img-id');
        // Récupération du token dans le local storage
        const authToken = localStorage.getItem('authToken');
        // Si le token n'existe pas, on arrête l'exécution de la fonction
        if (!authToken) {
            console.error("Token d'identication abs, session expirée");
            return;
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
            case 204:
                //MAJ DES PROJETS ET DE LA MODALE
                const projets = await getAllWorks();
                await showProjets(projets);
                await loadImgModal();
                break;
            case 401:
                console.error("La session a expiré, veuillez vous reconnecter svp");
                break;
            case 500:
                console.error("Erreur serveur, veuillez réessayer plus tard.");
                break;
            default:
                console.error("Comportement inattendu, essayez de rafraîchir la page.");
                break;
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}

/**
 * Ajoute un projet à l'API et sur la page sans devoir recharger
 * @param {event} : click sur ajouter image 
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
        const myForm = modal.querySelector("#uploadForm");
        const formData = new FormData(myForm);

        // Validation du formulaire avant envoi
        const imageFile = formData.get('image');
        const title = formData.get('title');
        const category = formData.get('category');

        if (!imageFile || !title || !category) {
            console.error("Veuillez remplir tous les champs du formulaire.");
            return;
        }

        // Récupération du token d'authentification
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Token d\'authentification manquant.');
            return;
        }

        // Envoyer la requête POST à l'API
        const response = await fetch(config.host + "works", {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`,  // Si un token est nécessaire
            },
            body: formData  // Utiliser formData comme body
        })

        switch (response.status) {
            case 201:
                // Image reçu par l'API, MAJ des projets dynamiquement et de la modale
                const projets = await getAllWorks();
                await showProjets(projets);
                await loadImgModal();
                break;
            case 400:
                console.error('Erreur : Requête incorrecte. Vérifiez les données envoyées.');
                break;
            case 401:
                console.error('La session a expiré, veuillez vous reconnecter.');
                break;
            case 500:
                console.error('Erreur serveur, réessayez plus tard.');
                break;
            default:
                console.error(`Erreur inattendue : ${response.status}`);
                break;
        } 
    } catch (error) {
        console.error('Erreur lors de l\'envoi du formulaire :', error);
    }
}

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
        btnSendPhotoListener.addEventListener('click', addImage);
    }
    // Ajout de l'écouteur de clic pour fermer la modale
    modal.addEventListener('click', closeModal);
}

/**
 * Suppression des écouteurs d'événements
 */
function removeEventListeners() {
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
        btnSendPhotoListener.removeEventListener('click', addImage);
    }

    modal.querySelectorAll('.modal-photos .fa-trash-can').forEach(trashIcone => {
        trashIcone.removeEventListener('click', deleteImage);
    });

    modal.removeEventListener('click', closeModal);
    console.log("les écouteurs sont supprimés");
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