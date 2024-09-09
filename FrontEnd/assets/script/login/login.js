/**
 * Gère l'affichage et les interaction de la page login
 */

import {genererHeader, genererFooter} from "../index/index_fct.js";
import {login} from "./login_fct.js";

await genererHeader();
await genererFooter();

document.querySelector('#btn-login a').style.fontWeight ='bold';

const loginForm = document.querySelector(".formulaire-connection");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    login(event);
});