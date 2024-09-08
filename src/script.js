// Importar funciones específicas si es necesario (ESM)
import { adjustContent } from './utils.js';

// Ajustar el contenido en función del tamaño de la ventana
function adjustScreenSize() {
    const width = window.innerWidth;
    const content = document.getElementById('content');

    if (width <= 600) {
        content.style.backgroundColor = '#d1e7dd'; // Color diferente en pantallas pequeñas
        content.style.fontSize = '14px';
    } else {
        content.style.backgroundColor = '#ffffff'; // Color por defecto
        content.style.fontSize = '16px';
    }
}

// Llamar a la función al cargar y al redimensionar
window.addEventListener('load', adjustScreenSize);
window.addEventListener('resize', adjustScreenSize);
