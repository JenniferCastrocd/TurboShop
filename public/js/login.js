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
            .then(async (response) => {
                console.log('Response recibido:', response);
            
                // Verifica si la respuesta es JSON
                try {
                    const data = await response.json();
                    console.log('Datos recibidos:', data);
            
                    if (data.success) {
                        localStorage["myUsername"] = userCredentials.username;
            
                        if (data.role === 'admin') {
                            window.location.href = 'admin.html';
                        } else {
                            window.location.href = 'client.html';
                        }
                    } else {
                        alert('Credenciales incorrectas');
                    }
                } catch (err) {
                    console.error('La respuesta no es JSON:', err);
                    alert('Error inesperado en el servidor');
                }
            })
            .catch(error => console.error('Error:', error));
            
        });
    } else {
        console.error('Formulario no encontrado');
    }

});
