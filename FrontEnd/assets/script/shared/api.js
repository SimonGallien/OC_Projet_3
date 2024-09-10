import {loadConfig} from "./config.js";

const config = await loadConfig();

/**
 * Effectue une requête HTTP vers l'API et retourne les données JSON
 * @async
 * @param {string} endUrl - L'URL vers laquelle la requête HTTP doit être effectué.
 * @returns {Promise<object>} Une promesse résolue avec les données JSON en réponse de l'API.
 * @throws {Error} Lance une erreur si la requête échoue ou si le code de statut n'est pas dans la plage 200-299.
 */
export async function makeHttpRequest(endUrl){
    try{
        // Attendre la réponse de la requête HTTP, fetch renvoie un objet response
        const response = await fetch(config.host + endUrl); 
        // La méthode .ok renvoie true si le code statut est dans la plage 200-299 sinon false
        if (!response.ok) { 
            throw new Error(`${response.status}`);
        }
        //  Lit le corps de la réponse et convertit les données JSON en objet JavaScript
        const data = await response.json(); 
        return data;
    } catch (error){
        console.error("Erreur lors de la requête :", error);
        // Propager l'erreur pour que l'appelant puisse la gérer
        throw error;
    }
}

/**
 * Effectu une requête HTTP avec la méthode DELETE vers l'API 
 * @param {number} targetId - Id du projet à supprimer
 * @param {string} authToken - Token d'identification de connexion
 * @throws {Error} Lance une erreur si la requête échoue ou si le code de statut n'est pas dans la plage 200-299.
 */
export async function deleteProject(targetId, authToken){
    try{
        // Vérifier si le token est fourni
        if (!authToken) {
            throw new Error("Le token d'authentification est manquant.");
        }

        const urlDelete = `${config.host}works/${targetId}`;

        // Envoi de la requête DELETE à l'API
        const response = await fetch(urlDelete, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${authToken}`,
            }
        });

        // Vérifier si la réponse est OK (statut 200-299)
        if (!response.ok){
            throw new Error(`Erreur lors de la requête HTTP : ${response.status}`);
        }
        return true;  // Retourner true pour indiquer que la suppression a réussi

    }catch (error){
        console.error("Erreur lors de la requête de suppression de projet :", error);
        throw error;
    }
}

export async function postProject(formData, authToken) {
    try {
        // Vérifier si le token est fourni
        if (!authToken) {
            throw new Error("Le token d'authentification est manquant.");
        }
        
        // Envoyer la requête POST à l'API
        const response = await fetch(config.host + "works", {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,  // Si un token est nécessaire
        },
        body: formData  // Utiliser formData comme body
    })

    if (!response.ok){
        throw new Error(`Erreur lors de la requête HTTP : ${response.status}`);
    }        
    } catch (error) {
        console.error("Erreur lors de la requête d'ajout de projet :", error);
        throw error;
    }
    return true;  // Retourner true pour indiquer que l'ajout a réussi
}