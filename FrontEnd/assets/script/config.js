export async function loadConfig(){
    let result = await fetch("/FrontEnd/config.json");
    return result.json();
}