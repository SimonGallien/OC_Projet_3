import {loadConfig} from "../config.js";

/**
 * Cette fct récupère les valeurs des inputs email et password  de l'utilisateur et envoi une requête au serveur
 * Si le serveur répond avec un token => connextion réussi
 */
export async function login(event){

    const config = await loadConfig();

    // Création de l'objet connexion
    const connection = {
        email: event.target.querySelector('.formulaire-connection input[type="email"]').value,
        password: event.target.querySelector('.formulaire-connection input[type="password"]').value,
    };

    // Converstion de la charge utile en json
    const chargeUtile = JSON.stringify(connection);

    fetch(config.host + "/api/users/login",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: chargeUtile
    })

    .then(response => response.json())
    .then(data => {
        console.log(data)
        if (data.token) { // Vérifier si le token est présent dans la réponse
            // Stocker l'ID de l'utilisateur et le token dans le localStorage
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('authToken', data.token);

            // Rediriger vers la page d'accueil
            window.location.href = 'index.html';
        } else {
            // Gérer les erreurs de connexion
            alert("Erreur dans l'identifiant ou le mot de passe");
        }
    })
}