import { toggleDropdown, closeDropdownOnClickOutside } from './dropdownModule.js';

const menuBtn = document.getElementById('menuBtn');
const dropdown = document.getElementById('dropdown');

// Asociar la función de toggle al botón de menú
menuBtn.addEventListener('click', () => toggleDropdown(dropdown));

// Cerrar el menú si se hace clic fuera de él
window.addEventListener('click', (event) => closeDropdownOnClickOutside(event, menuBtn, dropdown));

