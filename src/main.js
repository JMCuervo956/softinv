document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevenir el envío del formulario

        const formData = new FormData(form);
        const data = {
            user: formData.get('user'),
            pass: formData.get('pass')
        };

        try {
            const response = await fetch('/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Manejar éxito (p. ej., redirigir al usuario)
                Swal.fire({
                    title: 'Éxito!',
                    text: 'Inicio de sesión exitoso',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                // Manejar error (p. ej., mostrar mensaje de error)
                Swal.fire({
                    title: 'Error!',
                    text: result.error,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Error interno del servidor',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
});
