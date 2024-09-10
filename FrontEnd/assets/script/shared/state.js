let allProjects = [];
let allCategories = [];

export function setProjects(projects) {
    allProjects = projects;
}

export function setCategories(categories) {
    allCategories = categories;
}

export function getProjects() {
    return allProjects;
}

export function getCategories() {
    return allCategories;
}