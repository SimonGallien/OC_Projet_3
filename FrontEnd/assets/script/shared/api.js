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
        document.querySelector('#messageErreurBackEnd').style.display = null;
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

/**
 * Cette fonction permet d'envoyer un nouveau projet vers l'API
 * 
 * @param {formData} formData 
 * @param {string} authToken 
 * @returns {Boolean} - true si l'APi à bien enregistrer le nouveau projet
 */
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


/**
 * Cette fonction établie la connection de l'utilisateur pour passer en mode éditeur
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Boolean}
 */
export async function loginUser(email, password){
    try {
        // Création de l'objet connexion
        const connection = {
            email: email,
            password: password,
        };

        // Converstion de la charge utile en json
        const chargeUtile = JSON.stringify(connection);

        const response = await fetch(config.host + "users/login",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: chargeUtile
        })
        let data = await response.json();
        if(response.ok){
            if (data.token) { // Vérifier si le token est présent dans la réponse
                // Stocker l'ID de l'utilisateur et le token dans le localStorage
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('authToken', data.token);
                // Rediriger vers la page d'accueil
                window.location.href = 'index.html';
            } else {
                // Gérer les erreurs de connexion
                alert("Erreur dans la récupération du token.");
            };
        } else {
            // throw new Error("Echec de la connection.");
            const errorMessage = document.querySelector('.messageError');
            errorMessage.style.display = 'flex';
        }
    } catch (error) {
        console.error('Erreur réseau ou autre problème:', error);
    }; 
    return true;
}