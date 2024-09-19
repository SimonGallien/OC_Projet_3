/**
 * Gère l'affichage et les interaction de la page login
 */

import {genererHeader, genererFooter} from "../shared/utils.js";
import {checkEmail, checkPassword} from "./loginFunctions.js";
import { loginUser } from "../shared/api.js";

await genererHeader();
await genererFooter();

document.querySelector('#btn-login a').style.fontWeight ='bold';

let loginForm = document.querySelector(".formulaire-connection");
let emailElement = document.getElementById("email");
let passwordElement = document.getElementById("password");
let emailOk = false;
let passwordOk = false;


emailElement.addEventListener("change", () => {
    emailOk = checkEmail(emailElement);
})

passwordElement.addEventListener("change", () => {
    passwordOk = checkPassword(passwordElement);
})

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (emailOk === true){
        console.log(emailElement.value);
        loginUser(emailElement.value, passwordElement.value);
    } else {
        alert(`Le format de l'email ou du mot de passe n'est pas correct !!!`)
    }
});