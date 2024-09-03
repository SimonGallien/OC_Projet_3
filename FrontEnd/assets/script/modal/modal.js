import {openModal, closeModal, loadImgModal, loadFormModal,showAddPhotoView, showGalleryView,stopPropagation, deleteImage, addImage, previewImage} from "./modal_fct.js";

const modalDemand = document.querySelector('.js-modal');
modalDemand.addEventListener('click', async (e) => {
    e.preventDefault();
    // Ouverture de la boîte modale
    let modal = await openModal(e);
    // chargement du contenu dynamique de la modale
    await loadImgModal(); // Chargement des photos avec l'icone corbeille
    await loadFormModal(modal); // Ici fonction qui charge le contenu dynamique formulaire, liste des catégories
    
    // Ajout des écouteurs d'évènements
    modal.querySelector('#openAddPhotoView').addEventListener('click', showAddPhotoView);// Ajout d'un listener pour ouvrir la 2nd page Ajout de photo
    modal.querySelector('#prevBtn-photoView').addEventListener('click', showGalleryView);// Ajout d'un listener pour revenir à la 1er page
    modal.addEventListener('click', closeModal);// Ajout des événements pour fermer la modale
    modal.querySelector(".js-modal-close").addEventListener('click', closeModal);// Ajout des événements pour fermer la modale
    modal.querySelector(".js-modal-stop").addEventListener('click', stopPropagation);// Ajout des événements pour fermer la modale
    modal.querySelector(".btn-Send-Photo").addEventListener('click', addImage);
    modal.querySelector("#imageUpload").addEventListener('change', previewImage);

    // Ajout d'un listener pour chaque icone corbeille qui appelle la fct delteImage
    modal.querySelectorAll('.modal-photos .fa-trash-can').forEach(a => {
        a.addEventListener('click', async (e) => {
            e.preventDefault();
            await deleteImage(e);
        });
    });
});

// Ferme la modal en appuyant sur la touche Escape du clavier
window.addEventListener('keydown', function(e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModal(e);
    }
});