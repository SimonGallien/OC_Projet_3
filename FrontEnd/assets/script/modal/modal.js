import {openModal, closeModal, loadImgModal, loadFormModal,addEventListeners,handleEscapeKey,} from "./modal_fct.js";

const modalDemand = document.querySelector('.js-modal');

modalDemand.addEventListener('click', async (event) => {
    event.preventDefault();

    // Ouverture de la boîte modale
    await openModal(event);

    // chargement du contenu dynamique de la modale
    await loadImgModal(); // Chargement des photos avec l'icone corbeille
    await loadFormModal(); // Ici fonction qui charge le contenu dynamique formulaire, liste des catégories

    // Ajout des écouteurs d'événements à chaque réouverture
    addEventListeners(); // Important : réattache les événements après chaque ouverture
    
    // Ajout de l'écouteur pour fermer la modale avec la touche Escape
    window.addEventListener('keydown', handleEscapeKey);
})