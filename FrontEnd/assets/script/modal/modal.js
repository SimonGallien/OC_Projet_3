import {openModal, focusInModal, modal} from "./functions.js";

const modalDemand = document.querySelector('.js-modal');
modalDemand.addEventListener('click', async (event) => {
    // Ouverture de la boîte modale
    await openModal(event);
})

window.addEventListener('keydown', (event) => {
    if (event.key === "Escape" || event.key === "Esc") {
        closeModal(event);
    }
    if (event.key === "Tab" && modal !== null){
        focusInModal(event);
    }
})



