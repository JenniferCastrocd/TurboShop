localStorage["myUsername"]= ""
document.addEventListener('DOMContentLoaded', function() {
    console.log('login.js cargado');
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        console.log('Encontrado');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulario enviado');

            const userCredentials = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };

            console.log('Credenciales:', userCredentials);

            fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userCredentials)
            })
            .then(response => {
                console.log('Response recibido:', response);
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos:', data);
                localStorage["myUsername"]= userCredentials.username
                localStorage.removeItem('shoppingCart'); // Limpiar el carrito después de la compra
                if (data.success) {
                    if (data.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'client.html';
                    }
                } else {
                    alert('Credenciales incorrectas');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    } else {
        console.error('Formulario no encontrado');
    }

});
