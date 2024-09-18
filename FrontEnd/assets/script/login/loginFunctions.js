import {loadConfig} from "../shared/config.js";

/**
 * Cette fct récupère les valeurs des inputs email et password  de l'utilisateur et envoi une requête au serveur
 * Si le serveur répond avec un token => connextion réussi
 * 
 * @param {Event} event - L'événement déclenché par l'utilisateur
 */
export async function login(event){
    try {
        //Chargement de config.json
        const config = await loadConfig();
        if (!config){
            throw new Error("Problème avec le chargement du fichier config.json");
        };

        // Création de l'objet connexion
        const connection = {
            email: event.target.querySelector('.formulaire-connection input[type="email"]').value,
            password: event.target.querySelector('.formulaire-connection input[type="password"]').value,
        };

        // Converstion de la charge utile en json
        const chargeUtile = JSON.stringify(connection);

        const response = await fetch(config.host + "users/login",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: chargeUtile
        })
        let data = await response.json();
        switch (response.status){
            case 200:
                if (data.token) { // Vérifier si le token est présent dans la réponse
                    // Stocker l'ID de l'utilisateur et le token dans le localStorage
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('authToken', data.token);
                    // Rediriger vers la page d'accueil
                    window.location.href = 'index.html';
                } else {
                    // Gérer les erreurs de connexion
                    alert("Erreur dans l'identifiant ou le mot de passe");
                };
                break
            case 401:
                console.error("Not Authorized");
                document.querySelector('.messageError').style.display = "flex";
                break
            case 404:
                console.error("User not found");
                document.querySelector('.messageError').style.display = "flex";
                break
            default:
                console.error(`Erreur inattendue : ${response.status}`);
                break;
        }; 
    } catch {
        console.error('Erreur réseau ou autre problème:', error);
    }; 
};