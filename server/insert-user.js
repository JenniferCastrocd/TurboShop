const User = require('./models/user'); // Ajusta la ruta según sea necesario

(async () => {
    try {
        const user = await User.authenticate('admin', 'adminpassword');
        console.log('Resultado de authenticate:', user);
    } catch (error) {
        console.error('Error durante la autenticación:', error);
    }
})();
