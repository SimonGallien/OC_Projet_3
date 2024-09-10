/**
 * Charge et retourne les données JSON du fichier de configuration `config.json`.
 * @async
 * @returns {Promise<object>} Une promesse résolue avec les données de configuration JSON.
 * @throws {Error} Lance une erreur si la requête échoue.
 */
export async function loadConfig(){
    try {
        const response = await fetch("/FrontEnd/config.json");
        if (!response.ok) {
            throw new Error(`Erreur lors du chargement du fichier de configuration : ${response.status}`);
        }
        return await response.json();
    } catch (error){
        console.error("Erreur lors du chargement de la configuration :", error);
        throw error;
    }
}