// src/menu.js
export function toggleSubmenu() {
    document.querySelectorAll('.menu > li').forEach((menuItem) => {
      menuItem.addEventListener('mouseenter', () => {
        const submenu = menuItem.querySelector('.submenu');
        if (submenu) {
          submenu.style.display = 'block';
        }
      });
  
      menuItem.addEventListener('mouseleave', () => {
        const submenu = menuItem.querySelector('.submenu');
        if (submenu) {
          submenu.style.display = 'none';
        }
      });
    });
  }

  