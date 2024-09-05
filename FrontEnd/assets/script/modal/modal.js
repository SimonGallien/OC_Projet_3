import {openModal} from "./modal_fct.js";

const modalDemand = document.querySelector('.js-modal');

modalDemand.addEventListener('click', async (event) => {
    event.preventDefault();

    // Ouverture de la boîte modale
    await openModal(event);
})