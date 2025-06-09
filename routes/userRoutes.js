// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const autenticar = require('../middlewares/authMiddleware');

// Criar usuário (cadastro)
router.post('/', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

try {
    const novoUsuario = new User({ nome, email, senha });
    await novoUsuario.save();
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
} catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({
        erro: 'Erro interno ao cadastrar.',
        detalhe: error.message
    });
}
});

// Listar usuários (rota protegida)
router.get('/', autenticar, async (req, res) => {
    try {
        const usuarios = await User.findAll();
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ erro: 'Erro interno ao buscar usuários.' });
    }
});

// Deletar usuário por ID (rota protegida)
router.delete('/:id', autenticar, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await User.deleteById(id);
        res.json({ mensagem: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ erro: 'Erro ao deletar usuário.' });
    }
});

module.exports = router;
