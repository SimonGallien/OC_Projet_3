/*Ce fichier contient toutes les fonctions qui gère la boîte modal*/

import {loadConfig} from "../shared/config.js";
import {makeHttpRequest, deleteProject, postProject} from "../shared/api.js";
import {showProjets} from "../shared/utils.js";
import {getProjects, getCategories, setProjects} from "../shared/state.js";

export let modal = null; 
const focusableSelector = 'button, a, input, textarea, select';
let focusables = [];

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
        const triggerElement = getTriggerElement(event); // Gérer le trigger, lien "modifier" ou "icone" édition
        const {url, modalId} = getModalTarget(triggerElement); // Extraire l'URL et l'ID
        
        // Charger ou récupérer la modale
        modal = await loadOrFetchModal(url, modalId);
        
        // Afficher la boîte modal
        modal.style.display = null; //supprime le display:none dans le html et c'est le css qui prend le relai
        modal.removeAttribute('aria-hidden');
        modal.setAttribute('aria-modal', 'true');

        // Charger le contenu dynamique
        await loadDynamicContent(modal);

        // Ajout des écouteurs d'événements à chaque réouverture
        addEventListeners(); // Important : réattache les événements après chaque ouverture
        const form = modal.querySelector('#uploadForm');
        checkFormCompletion(form);  // Vérifier l'état du formulaire à l'ouverture
        focusableElementVisible();
    } catch (error) {
        console.error('Erreur lors de l\'ouverture de la modale:', error.message);
    }
    return modal;
}

// Fonction pour obtenir l'élément déclencheur de l'événement
function getTriggerElement(event) {
    let triggerElement = event.target;
    if (triggerElement.tagName === 'I') {
        triggerElement = triggerElement.closest('a');
    }
    return triggerElement;
}

// Fonction pour extraire l'URL et l'ID de la modale
function getModalTarget(triggerElement) {
    const target = triggerElement.getAttribute('href');
    if (!target) throw new Error("Aucun 'href' trouvé dans l'élément déclencheur.");
    
    const url = target.split('#')[0];
    const modalId = '#' + target.split('#')[1];
    return {url, modalId};
}

// Fonction pour charger la modale depuis le serveur si elle n'existe pas encore dans le DOM
async function loadOrFetchModal(url, modalId) {
    let modal = document.querySelector(modalId);
    if (!modal) {
        const response = await fetch(`../partials/${url}`);
        if (!response.ok) throw new Error(`La modale avec l'URL ${url} n'a pas été trouvée: ${response.status}`);

        const html = await response.text();
        const fragment = document.createRange().createContextualFragment(html);
        modal = fragment.querySelector(modalId);
        if (!modal) throw new Error(`L'élément avec l'ID ${modalId} n'a pas été trouvé dans ${url}.`);

        document.body.append(modal);
    }
    return modal;
}

// Fonction pour charger le contenu dynamique de la modale
async function loadDynamicContent() {
    console.log('Load Dynamic Content');
    await loadImgModal();

    const selectForm = modal.querySelector("#category");
    const existOption = modal.querySelectorAll("#category option");
    const allCategories = getCategories();
    if (existOption.length <= 1) {
        allCategories.forEach(category => {
            const option = document.createElement("option");
            option.innerText = category.name;
            option.value = category.id;
            selectForm.appendChild(option);
        });
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
    
        // Réinitialise la vue de la modale pour la prochaine ouverture
        showGalleryView();

        // Réinitialiser le formulaire et masquer la prévisualisation de l'image
        const myForm = document.getElementById('uploadForm');
        const preview = document.getElementById('imagePreview');
        const previewContainer = document.getElementById('divImagePreview');
        // Réinitialiser le formulaire
        myForm.reset();
        // Réinitialiser l'image de prévisualisation
        preview.src = '';
        previewContainer.style.display = 'none';
        // Réafficher les icônes et textes cachés
        document.querySelector('.fa-image').style.display = 'block';
        document.querySelector('.modal-form-txt').style.display = 'block';
        document.querySelector('.modal-form-txtFormat').style.display = 'block';
        modal.querySelector('#modalContainerPreviewTxt').style.display = 'flex';
        // Cacher la modale
        window.setTimeout(()=>{
            modal.style.display = "none";
            modal = null;
        }, 500)
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        

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
async function loadImgModal() {
    try {
        console.log('load image modale');
        const allProjects = getProjects();
        console.log(allProjects);
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
        //const galleryImages = document.querySelectorAll(".gallery figure img");
        allProjects.forEach(element => {
            console.log(element);
        });
        allProjects.forEach(projet => {
            const imageContainer = document.createElement("div");
            const imageElement = document.createElement("img");
            const iconeElement = document.createElement("i");
            const linkElement = document.createElement("a");

            // Définir les attributs de l'image
            imageElement.src = projet.imageUrl;
            imageElement.alt = projet.title;

            // Définir les attributs de a
            linkElement.setAttribute('tabindex', '0');

            // Ajouter les classes et lier l'icône avec l'image via data-attribute
            iconeElement.classList.add("fa-solid", "fa-trash-can");
            iconeElement.dataset.imgId = projet.id;// Utiliser data-img-id pour lier avec l'image

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
    document.getElementById('modalNav').classList.add('icone-modal-addView');
    document.getElementById('modalNav').classList.remove('icone-modal-deleteView');
    focusableElementVisible();
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
    document.getElementById('modalNav').classList.remove('icone-modal-addView');
    document.getElementById('modalNav').classList.add('icone-modal-deleteView');
    focusableElementVisible();
}

/**
 * Cette fonction envoie une requête au serveur DELETE, si la réponse du serveur est correct
 * on supprime dynamiquement l'image dans la modale et sur la page projets du site
 * @param {event} : click sur une icone corbeille
 */
export async function deleteImage(event) {
    try {
        // On récupère l'ID de l'icone qui est le même que l'image
        const targetId = event.target.getAttribute('data-img-id');
        const authToken = getAuthToken();

        await deleteProject(targetId, authToken);
         
        //MAJ DES PROJETS ET DE LA MODALE
        updateProjects();
        focusableElementVisible();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}

async function updateProjects(){
    // Appel API pour récupérer les projets
    const newProjects = await makeHttpRequest('works');
    setProjects(newProjects);
    await showProjets();
    await loadImgModal();
}

//Fonction qui retourne le token d'identification s'il existe
function getAuthToken(){
    // Récupération du token dans le local storage
    const authToken = localStorage.getItem('authToken');
    // Si le token n'existe pas, on arrête l'exécution de la fonction
    if (!authToken) {
        console.error("Token d'identication abs, session expirée");
        return;
    };
    return authToken;
}

/**
 * Ajoute un projet à l'API et sur la page sans devoir recharger
 * @param {event} : click sur ajouter image, possible si tout le formulaire est correctement rempli
 * @returns en cas d'erreur
 */
async function addImage(event){
    event.preventDefault();
    try {
        // On récupère les données du formulaire depuis
        // l'objet représentant l'évènement
        const myForm = modal.querySelector("#uploadForm");
        const formData = new FormData(myForm);

        // Récupération du token d'authentification
        const token = getAuthToken();

        // Envoyer la requête POST à l'API
        await postProject(formData, token);

        // Image reçu par l'API, MAJ des projets dynamiquement et de la modale
        updateProjects();
        closeModal();

    } catch (error) {
        console.error('Erreur lors de l\'envoi du formulaire :', error);
    }
}

// Ajout des écouteurs d'événements
export function addEventListeners() {
    try {
        const openAddPhotoViewListener = modal.querySelector('#openAddPhotoView');
        const prevBtnPhotoViewListener = modal.querySelector('#prevBtn-photoView');
        const jsModalCloseListener = modal.querySelector(".js-modal-close");
        const jsModalStopListener = modal.querySelector(".js-modal-stop"); 
        const btnSendPhotoListener = modal.querySelector(".btn-Send-Photo");
    
        openAddPhotoViewListener.addEventListener('click', showAddPhotoView);
        prevBtnPhotoViewListener.addEventListener('click', showGalleryView);
        jsModalCloseListener.addEventListener('click', closeModal);
        jsModalStopListener.addEventListener('click', stopPropagation);
        btnSendPhotoListener.addEventListener('click', addImage);

        const form = modal.querySelector('#uploadForm');
        form.querySelectorAll('input[required],select').forEach(input => {
            input.addEventListener('input', handleInput);
            // `change` événement pour le champ select
            if (input.tagName === 'SELECT') {
                input.addEventListener('change', handleInput);
            }
        });
    
        // Ajout de l'écouteur de clic pour fermer la modale
        modal.addEventListener('click', closeModal);
    } catch (error){
        console.error('Erreur lors des ajouts des écouteurs :', error);
    }
}

/**
 * Suppression des écouteurs d'événements
 */
function removeEventListeners() {
    try {
        const openAddPhotoViewListener = modal.querySelector('#openAddPhotoView');
        const prevBtnPhotoViewListener = modal.querySelector('#prevBtn-photoView');
        const jsModalCloseListener = modal.querySelector(".js-modal-close");
        const jsModalStopListener = modal.querySelector(".js-modal-stop");
        const btnSendPhotoListener = modal.querySelector(".btn-Send-Photo");
    
        openAddPhotoViewListener.removeEventListener('click', showAddPhotoView);
        prevBtnPhotoViewListener.removeEventListener('click', showGalleryView);
        jsModalCloseListener.removeEventListener('click', closeModal);
        jsModalStopListener.removeEventListener('click', stopPropagation);
        btnSendPhotoListener.removeEventListener('click', addImage);
        
        modal.querySelectorAll('.modal-photos .fa-trash-can').forEach(trashIcone => {
            trashIcone.removeEventListener('click', deleteImage);
        });

        const form = modal.querySelector('#uploadForm');
        form.querySelectorAll('input[required]').forEach(input => {
            input.removeEventListener('input', handleInput);
        });
    
        modal.removeEventListener('click', closeModal);

    } catch (error){
        console.error('Erreur lors de la suppression des écouteurs :', error);
    }
}

/**
 * Fonction pour gérer la fermeture de la modale avec la touche Escape
 * @param {*} event 
 */
export function handleEscapeKey(event) {
    if ((event.key === "Escape" || event.key === "Esc") && modal) {
        //event.preventDefault(); // Empêche d'autres actions par défaut liées à la touche Escape
        closeModal(event);

        // Supprimer l'écouteur 'keydown' une fois que la modale est fermée
        window.removeEventListener('keydown', handleEscapeKey);
    }
}

/**
 * Fonction pour vérifier si tous les champs requis sont remplis
 * @param {*} form 
 */
function checkFormCompletion(form) {
    // On récupère tout les champs du du formulaires
    const formData = new FormData(form);
    let allFilled = true;

    // Parcourt les champs du formulaire via FormData
    formData.forEach((value, key) => {
        // Vérifie si la valeur est une chaîne de caractères avant d'utiliser trim()
        if (typeof value === 'string') {
            if (value.trim() === '') {
                allFilled = false; // Si un champ est vide, on marque allFilled à false
            }
        } else if (value === null || value === '') {
            allFilled = false; // Pour les autres types, on vérifie simplement s'ils sont vides ou nuls
        } else if (key === 'image') {
            // Vérifie si le fichier est vide ou non
            if (value.size === 0) {
                allFilled = false;
            // Vérifie si l'image est supérieur à 4mo   
            } else if (value.size > 4 * 1024 * 1024) {
                allFilled = false;
                alert('L\'image sélectionnée dépasse 4 Mo. Veuillez sélectionner une image plus petite.');
            // Si il y a une image, on l'affiche en prévisualisation
            } else if (value.size > 0) {
                const containertxt = form.querySelector('.form-container-no-img-charge');
                const containerImg = form.querySelector('.form-container-img-preview');
                const image = form.querySelector('.form-img-preview');
                if (containerImg && image) {
                    containertxt.style.display = 'none';
                    const reader = new FileReader();
                    reader.onload = function(event) {
                    image.src = event.target.result; // Définir la source de l'image comme le résultat de la lecture
                    containerImg.style.display = 'flex'; // Affiche l'image
                    }
                    reader.readAsDataURL(value); // Lire le fichier comme une URL de données
                }  
            }
        }
    })

    // Gérer l'état du bouton de soumission
    const submitBtn = form.querySelector('input[type="submit"]');
    submitBtn.disabled = !allFilled; 

    // Si le bouton est activé (non désactivé), on supprime son background
    if (allFilled) {
        submitBtn.classList.add('enabled'); // Ajoute la classe pour enlever le background
    } else {
        submitBtn.classList.remove('enabled'); // Remet le background s'il est désactivé
    }
}

/**
 * Fonction de rappel pour la vérification du formulaire
 * @param {*} event 
 */
function handleInput(event) {
    checkFormCompletion(event.target.form); // Appelle la fonction de vérification du formulaire
}

/**
 * Cette fonction met à jour le tableau d'éléments focusables entre les 2 vues de la modale
 */
function focusableElementVisible() {
    const galleryView = modal.querySelector('#galleryView');
    const addPhotoView = modal.querySelector('#addPhotoView');
    focusables = [];
    if (galleryView.style.display === 'none'){
        focusables.push(document.querySelector('#btn-xmark-close'));
        focusables.push(document.querySelector('#prevBtn-photoView'));
        focusables = focusables.concat(Array.from(addPhotoView.querySelectorAll(focusableSelector)));
    } else {
        focusables.push(document.querySelector('#btn-xmark-close'));
        focusables = focusables.concat(Array.from(galleryView.querySelectorAll(focusableSelector)));
    }
    console.log("Tableau focusables :", focusables);
}

/**
 * Cette fonction est appelé à chaque fois que l'utilisateur appui sur TAB
 * @param {*} event 
 */
export function focusInModal(event) {
    event.preventDefault();
   // Si aucun élément n'est focus, index sera = -1 donc avec le index ++ on démarre bien à 0
    let index = focusables.findIndex(f => f === modal.querySelector(':focus')); // Sinon, on passe à l'élément suivant
    if (event.shiftKey === true){
        index--;
    } else {
        index++;
    }

    if (index < 0){
        console.log('remise à zéro de index focus')
        index = focusables.length - 1;
    }

    if (index >= focusables.length){
        index = 0;
    }

    console.log(`${index} / ${focusables.length}`);
    if (focusables[index] && focusables[index].disabled !== true) {
        focusables[index].focus();
    } else {
        console.log("simuler index++")
        // Si élément disabled on focus le suivant ou le précédent si shiftKey = true
        if (event.shiftKey === true){
            index--;
            // On vérifie qu'il est bien un précédent sinon on reboucle au dernier de la liste
            if (index < 0){
                console.log('remise à zéro de index focus')
                index = focusables.length -1;
            }
        } else {
            index++;
            // On vérifie qu'il est bien un suivant sinon on reboucle à 0
            if (index >= focusables.length){
                console.log('remise à zéro de index focus')
                index = 0;
            }
        } 

        // On focus sur l'élément
        focusables[index].focus();
    }
}