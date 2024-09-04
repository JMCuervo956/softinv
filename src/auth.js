// auth.js
export function validateCredentials(username, password) {
    // Datos de ejemplo para autenticación
    const correctUsername = 'user123';
    const correctPassword = 'pass123';

    if (username === correctUsername && password === correctPassword) {
        return true; // Autenticación exitosa
    } else {
        return false; // Autenticación fallida
    }
}