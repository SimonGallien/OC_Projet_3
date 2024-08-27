/**
 * Cette fct récupère les données JSON de config.json
 * @returns l'url du projet
 */
export async function loadConfig(){
    let result = await fetch("/FrontEnd/config.json");
    return result.json();
}



  