const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Ruta para registrar usuarios
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    console.log('Solicitud de registro recibida:', username, password, role);

    try {
        const existingUser = await User.findUser(username);
        if (existingUser) {
            return res.status(400).send('El usuario ya existe');
        }

        const newUser = await User.addUser({ username, password, role });
        res.status(201).send(`Usuario ${newUser.username} registrado con éxito`);
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Solicitud de login recibida:', username, password);

    try {
        const user = await User.authenticate(username, password);
        console.log('Resultado de authenticate:', user); // Agrega este log

        if (user) {
            res.json({ success: true, role: user.user_role });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Error durante el login:', error);
        res.status(500).send('Error interno del servidor');
    }
});



module.exports = router;
