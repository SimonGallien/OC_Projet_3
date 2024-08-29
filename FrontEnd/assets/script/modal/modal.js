import {openModal, closeModal, chargerImgModal} from "./modal_fct.js";

document.querySelectorAll('.js-modal').forEach(a => {
    a.addEventListener('click', async (e) => {
        await openModal(e);
    });
});

// Ferme la modal en appuyant sur la touche Escape du clavier
window.addEventListener('keydown', function(e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModal(e);
    }
});
