const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    console.log('Solicitud de registro recibida:', username, password, role);
    const existingUser = User.findUser(username);
    if (existingUser) {
        res.status(400).send('El usuario ya existe');
    } else {
        const newUser = new User(username, password, role);
        User.addUser(newUser);
        res.status(201).send('Usuario registrado con éxito');
    }
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Solicitud de login recibida:', username, password);
    const user = User.authenticate(username, password);
    if (user) {
        res.json({ success: true, role: user.role });
    } else {
        res.json({ success: false });
    }
});

module.exports = router;
