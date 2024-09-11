import {openModal, modal, closeModal, focusInModal, deleteImage} from "./modalFunctions.js";

document.querySelectorAll('.js-modal').forEach(a => {
    a.addEventListener('click', openModal)
})

window.addEventListener('keydown', function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
        closeModal(event);
    }
    if (event.key === "Tab" && modal !== null){
        focusInModal(event);
    }

    if (event.key === 'Enter') {
        const focusedElement = document.activeElement;
        console.log(focusedElement.tagName);
        if (focusedElement && focusedElement.tagName === 'A') {
            // Simuler un clic lorsque la touche Entrée est pressée
            console.log("bip");
            deleteImage(event);
        }
    }
})