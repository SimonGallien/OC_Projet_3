import {getProjects, setProjects, getCategories} from "../shared/state.js";
import {deleteProject, makeHttpRequest, postProject} from "../shared/api.js";
import {showProjets} from "../shared/utils.js";

export let modal = null;
const focusableSelector = 'button, a, input, textarea, select';
let focusables = [];
let previouslyFocusedElement = null;


/**
 * Cette fonction permet d'ouvrir la boîte modale
 * 
 * @param {Event} event - L'événement déclenché par l'utilisateur
 * @throws {Error} Rapporte une erreur si l'attribut 'href' ou la modale est non trouvé dans le DOM
 * @returns {Promise<void>} - Retourne une promesse qui se résout une fois que la modale est ouverte avec succès ou rejette en cas d'erreur.
 */
export const openModal = async function (event) {
    event.preventDefault();

    try {
        let target = event.target;

        // Si l'utilisateur clique sur l'icône, récupérer le lien parent
        if (target.tagName === 'I') target = event.target.closest('a');
    
        const href = target.getAttribute('href');
        if (!href) throw new Error("Attribut 'href' non trouvé");
    
        // Charger la modale si elle est interne ou externe
        if (href.startsWith('#')){
            modal = document.querySelector(href);
        } else {
            modal = await loadModal(href);
        }
    
        if (!modal) throw new Error("Modale introuvable dans le DOM.")
    
        // Charger le contenu de la modale
        loadImages();
        focusableElementVisible();
        loadSelectForm();
    
        // Gestion de l'accessibilité et du focus
        previouslyFocusedElement = document.querySelector(':focus');
        modal.style.display = null; //supprime le display:none dans le html et c'est le css qui prend le relai
        focusables[0].focus();
        modal.removeAttribute('aria-hidden');
        modal.setAttribute('aria-modal', 'true');
    
        // Gestion des événements dans la modale
        modal.querySelector('.modal-photos').addEventListener('click', deleteImage);
        modal.querySelector('#openAddPhotoView').addEventListener('click', showModalAddProjectView);
        modal.querySelector('#prevBtn-photoView').addEventListener('click', showModalDeleteProjectView);
        modal.querySelector('#uploadForm').addEventListener('change', checkFormCompletion);
        modal.querySelector('#uploadForm').addEventListener('submit', postNewProject);
        modal.addEventListener('click', closeModal);
        modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
        modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);

    } catch (error){
        console.error('Erreur lors de l\'ouverture de la modale :', error);
        // Optionnel : alerter l'utilisateur en cas d'erreur
        alert('Une erreur est survenue lors de l\'ouverture de la modale.');
    } 
}

/**
 * Cette fonction permet de fermer la boîte modale
 * 
 * @param {Event} event - L'événement déclenché par l'utilisateur
 * @returns {void} - La fonction ne retourne rien.
 */
export const closeModal = function(event) {
    if (modal === null) return;
    if (previouslyFocusedElement !== null) previouslyFocusedElement.focus()
    event.preventDefault();
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.querySelector('.modal-photos').removeEventListener('click', deleteProject);
    modal.querySelector('#openAddPhotoView').removeEventListener('click', showModalAddProjectView);
    modal.querySelector('#prevBtn-photoView').removeEventListener('click', showModalDeleteProjectView);
    modal.removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').removeEventListener('click', closeModal);
    modal.querySelector('#uploadForm').removeEventListener('submit', checkFormCompletion);
    modal.querySelector('#uploadForm').removeEventListener('change', postNewProject);
    // RESET LE FORMULAIRE
    const form = modal.querySelector('#uploadForm');
    form.reset();
    const containertxt = form.querySelector('.form-container-no-img-charge');
    const containerImg = form.querySelector('.form-container-img-preview');
    const image = form.querySelector('.form-img-preview');
    if (containerImg && image) {
        containertxt.style.display = null;
        image.src = ''; // Définir la source de l'image comme le résultat de la lecture
        containerImg.style.display = 'none'; // Affiche l'image
    }
    // Replacement sur la vue des images
    showModalDeleteProjectView(event);
    const hideModal =  function () {
        modal.style.display = 'none';
        modal.removeEventListener('animationend', hideModal);
        modal = null;
    }
    modal.addEventListener('animationend', hideModal);
}

/**
 * Est appelé pour stopper la propagation de closeModal lorsque l'utilisateur clique à l'intérieur de la modale
 * 
 * @param {Event} event - L'événement déclenché par l'utilisateur
 */
const stopPropagation = function(event){
    event.stopPropagation();
}

/**
 * Cette fonction est appelé à chaque fois que l'utilisateur appui sur TAB
 * 
 * @param {Event} event - L'événement déclenché par l'utilisateur
 */
export const focusInModal = function (event) {
    event.preventDefault();
   // Si aucun élément n'est focus, index sera = -1 donc avec le index ++ on démarre bien à 0
    let index = focusables.findIndex(f => f === modal.querySelector(':focus')); // Sinon, on passe à l'élément suivant

    if (event.shiftKey === true){
        index--;
    } else {
        index++;
    }

    if (index < 0){
        index = focusables.length - 1;
    }

    if (index >= focusables.length){
        index = 0;
    }

    if (focusables[index] && focusables[index].disabled !== true) {
        focusables[index].focus();
    } else {
        // Si élément disabled on focus le suivant ou le précédent si shiftKey = true
        if (event.shiftKey === true){
            index--;
            // On vérifie qu'il est bien un précédent sinon on reboucle au dernier de la liste
            if (index < 0){
                index = focusables.length -1;
            }
        } else {
            index++;
            // On vérifie qu'il est bien un suivant sinon on reboucle à 0
            if (index >= focusables.length){
                index = 0;
            }
        } 

        // On focus sur l'élément
        focusables[index].focus();
    }
}

/**
 * Cette fonction charge la modale dans le DOM à partir d'une URL.
 * 
 * @param {string} url - L'URL à partir de laquelle charger la modale.
 * @returns {Promise<HTMLElement>} - Retourne la modale chargée sous forme d'élément HTML.
 * @throws {Error} - Lance une erreur si l'élément de la modale n'est pas trouvé dans la page.
 */
const loadModal = async function (url){
    try {
        // A FAIRE : Afficher un loader
        const target = '#' + url.split('#')[1];
        const exitingModal = document.querySelector(target);

        // Si la modale existe déjà dans le DOM, la retourner directement
        if (exitingModal !== null) return exitingModal;

        // Récupérer le contenu HTML à partir de l'URL fournie
        const html = await fetch(url).then(response => {
            if (!response.ok) throw new Error(`Erreur lors du chargement de l'URL : ${url}`)
            return response.text();
        }) 

        // Créer un fragment DOM à partir du contenu HTML et chercher l'élément cible
        const element = document.createRange().createContextualFragment(html).querySelector(target);

        // Si l'élément n'est pas trouvé, lever une erreur
        if (!element) throw new Error(`L'élément ${target} n'a pas été trouvé dans la page ${url}`);

        // Ajouter l'élément au DOM
        document.body.append(element);

        return element;
    } catch (error){
        console.error('Erreur lors du chargement de la modale :', error);
    }
}

/**
 * Charge les images dans la boîte modale avec les icônes corbeilles
 * 
 * @throws {Error} - Lance une erreur si l'élément de la modale n'est pas trouvé dans la page.
 */
const loadImages = function (){
    try {
        // Récupérer tous les projets à partir de la fonction getProjects()
        const allProjects = getProjects();

        // Récupérer le conteneur de la modale où les images seront insérées
        const modalContainer = modal.querySelector(".modal-photos");
        if (!modalContainer) throw new Error(`L'élément ${modalContainer} n'a pas été trouvé dans la page`);

        // Vider le contenu existant pour éviter des duplications
        modalContainer.innerHTML = '';

        // Utiliser un fragment DOM pour améliorer les performances lors de l'insertion d'éléments
        const fragment = document.createDocumentFragment();
    
        // Parcourir tous les projets et créer les éléments DOM pour chaque image
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

    } catch (error){
        console.error("Erreur lors du chargement des images dans la boîte modale :", error);
    }
}

/**
 * Supprime une image lorsqu'un utilisateur clique sur l'icône corbeille.
 * 
 * @param {Event} event - L'événement déclenché par l'utilisateur lors d'un clique sur une icône corbeille
 */
export const deleteImage = async function(event) {
    event.preventDefault();
    try {
        if (event.target.classList.contains('fa-trash-can') || event.target.tagName === 'A'){
            let targetId ='';
            if (event.target.classList.contains('fa-trash-can')) targetId = event.target.getAttribute('data-img-id'); // On récupère l'ID de l'icone qui est le même que l'image
            if (event.target.tagName === 'A') {
                const trashIcone = event.target.querySelector('.fa-trash-can') 
                targetId = trashIcone.getAttribute('data-img-id'); // On récupère l'ID de l'icone qui est le même que l'image
            } 
    
            if (!targetId) {
                throw new Error('ID de l\'image non trouvé.');
            }

            const authToken = getAuthToken();
    
            await deleteProject(targetId, authToken);
    
            //  MAJ DES PROJETS ET DE LA MODALE
            // Appel API pour récupérer les projets
            const newProjects = await makeHttpRequest('works');
            setProjects(newProjects);
            await showProjets();
            loadImages();
            focusableElementVisible();
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'image :', error);
    }
}

/**
 * Fonction qui retourne le token d'identification s'il existe
 * 
 * @returns {string} - Le token d'identification
 */
const getAuthToken = function () {
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
 * Cette fonction met à jour le tableau d'éléments focusables entre les 2 vues de la modale
 */
const focusableElementVisible = function () {
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
}

/**
 * Cette fct cache dans la modale la div avec l'id galleryView et 
 * montre la div avec l'id addPhotoView + l'icone prevBtn-photoView
 * 
 * @param {Event}
 */
const showModalAddProjectView = function(event) {
    event.preventDefault();
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
 * Cette fct cache dans la modale la div avec l'id addPhotoView + l'icone prevBtn-photoView et 
 * montre la div avec l'id galleryView 
 * 
 * @param {Event}
 */
const showModalDeleteProjectView = function(event){
    event.preventDefault();
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
 * Fonction pour charger le contenu dynamique du formulaire de la modale
 */
const loadSelectForm = function () {
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
 * Fonction pour vérifier si tous les champs requis sont remplis
 * @param {form} - formulaire de la modale 
 */
const checkFormCompletion = function() {
    const form = modal.querySelector('#uploadForm');
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
 * Cette fonction post un nouveau projet vers l'APi
 * 
 * @param {Event} event 
 */
const postNewProject = async function(event){
    event.preventDefault();
    const myForm = modal.querySelector("#uploadForm");
    const formData = new FormData(myForm);

    // Récupération du token d'authentification
    const token = getAuthToken();

    // Envoyer la requête POST à l'API
    await postProject(formData, token);

    // Image reçu par l'API, MAJ des projets dynamiquement et de la modale
    const newProjects = await makeHttpRequest('works');
    setProjects(newProjects);
    await showProjets();
    loadImages();
    closeModal(event);
}