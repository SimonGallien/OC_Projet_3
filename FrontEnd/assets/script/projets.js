import {init, genererProjets, genererBtnFilters, genererHeader, genererFooter} from "./functions.js";

/**
 * Appelle des fonction pour récupérer les projets, les affichers et créer les btn de filtres
 */
init().then(projets => {
    genererProjets(projets);
    genererBtnFilters(projets);
})


document.addEventListener('DOMContentLoaded', () => {
    genererHeader();
    genererFooter();
});

document.addEventListener('DOMContentLoaded', function() {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        // Si le token n'est pas présent, rediriger vers la page de connexion
        //window.location.href = 'login.html';
        console.log("Tu n'est pas connecté")
    } else {
        // Charger les données utilisateur ou personnaliser l'interface
        // Par exemple, afficher le nom de l'utilisateur ou charger des ressources spécifiques
        console.log("Tu est connecté, bravo")
    }
});