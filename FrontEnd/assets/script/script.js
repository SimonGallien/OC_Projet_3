import {init, genererProjets, genererBtnFilters} from "./projets.js";

/**
 * Appelle des fonction pour récupérer les projets, les affichers et créer les btn de filtres
 */
init().then(projets => {
    genererProjets(projets);
    genererBtnFilters(projets);
})