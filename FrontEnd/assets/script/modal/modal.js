import {openModal} from "./functions.js";

const modalDemand = document.querySelector('.js-modal');

modalDemand.addEventListener('click', async (event) => {
    // Ouverture de la boîte modale
    await openModal(event);
})