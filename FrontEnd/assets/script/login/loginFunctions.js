
/**
 * Cette fonction test le format de l'email avec une expression régulière
 * 
 * @param {HTMLElement} emailInput 
 * @returns {Boolean}
 */
export function checkEmail(emailInput) {
    let emailRegExp = new RegExp("[a-z0-9._-]+@[a-z0-9._-]+\\.[a-z0-9._-]+");
    if (emailRegExp.test(emailInput.value)){
        return true;
    } else {
        return false;
    }
}

/**
 * Cette fonction test le format du mot de passe avec une expresison régulière
 * 
 * @param {HTMLElement} passwordInput 
 * @returns {Boolean}
 */
export function checkPassword(passwordInput) {
    let passwordRegExp = new RegExp("^(?=.*[A-Z]).{6,}$");
    if (passwordRegExp.test(passwordInput.value)){
        return true;
    } else {
        return false;
    }
}