// Función para mostrar/ocultar el menú
export function toggleDropdown(dropdown) {
    const currentDisplay = dropdown.style.display;
    dropdown.style.display = currentDisplay === 'block' ? 'none' : 'block';
  }
  
  // Función para cerrar el menú si se hace clic fuera
  export function closeDropdownOnClickOutside(event, menuBtn, dropdown) {
    if (!menuBtn.contains(event.target)) {
      if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
      }
    }
  }
  