// config.js
// Usa la IP desde donde se accede (automático)
const hostname = window.location.hostname;
export const API_URL = `http://${hostname}:3000/api`;