const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    try {
        const usuario = await User.findOne({ email });

        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({ erro: 'Credenciais inválidas.' });
        }

        req.session.user = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        res.json({ mensagem: 'Login realizado com sucesso!' });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

router.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ logado: true, usuario: req.session.user });
    } else {
        res.status(401).json({ logado: false });
    }
});







router.get('/login', async (req, res) => {
    const { email, senha } = req.query;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    try {
        const usuario = await User.findOne({ email });

        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({ erro: 'Credenciais inválidas.' });
        }

        req.session.user = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email
        };

        res.json({ mensagem: 'Login via GET realizado com sucesso!' });
    } catch (error) {
        console.error('Erro no login via GET:', error);
        res.status(500).json({ erro: 'Erro interno.', detalhe: error.message });
    }
});





// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao encerrar a sessão.' });
        }
        res.json({ mensagem: 'Logout realizado com sucesso.' });
    });
});

module.exports = router;
