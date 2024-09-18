/************************************************************************************************/
/*** Ce fichier permet d'enregistrer l'état actuel de la liste des projets et des catégories  ***/
/*** afin de ne pas faire des requêtes http de manière abusive                                ***/
/*** il permet aussi de garder une indépendance des fichiers entre index et modal par exemple ***/
/************************************************************************************************/


let allProjects = [];
let allCategories = [];


/**
 * Enregistre les projets dans une variable qui pourra être récupérée avec la fonction getProjects()
 * 
 * @param {Array} projects 
 */
export function setProjects(projects) {
    allProjects = projects;
}

/**
 * Enregistre les categories dans une variable qui pourra être récupérée avec la fonction getCategories()
 * 
 * @param {Array} categories 
 */
export function setCategories(categories) {
    allCategories = categories;
}

/**
 * Cette fonction retounre tous les projets
 * 
 * @returns {Array} - Tous les projets
 */
export function getProjects() {
    return allProjects;
}

/**
 * Cette fonction retounre toutes les catégories
 * 
 * @returns {Array} - Toutes les catégories
 */
export function getCategories() {
    return allCategories;
}