document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newUser = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            role: 'client'
        };

        fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            window.location.href = 'login.html';
        })
        .catch(error => console.error('Error:', error));
    });
});
