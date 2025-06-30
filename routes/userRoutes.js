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
        const usuarios = await User.find({}, '-senha'); // Exclui a senha do resultado
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ erro: 'Erro interno ao buscar usuários.' });
    }
});

// Buscar usuário por ID (rota protegida)
router.get('/:id', autenticar, async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id, '-senha');
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }
        res.json(usuario);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ erro: 'Erro interno ao buscar usuário.' });
    }
});

// Atualizar usuário (rota protegida)
router.put('/:id', autenticar, async (req, res) => {
    const { nome, email } = req.body;
    if (!nome || !email) {
        return res.status(400).json({ erro: 'Nome e email são obrigatórios.' });
    }
    try {
        const usuarioLogado = await User.findById(req.session.user.id);
        if (!usuarioLogado) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }
        // Admin pode editar qualquer usuário, usuário comum só pode editar a si mesmo
        if (!usuarioLogado.admin && req.params.id !== req.session.user.id) {
            return res.status(403).json({ erro: 'Você só pode editar sua própria conta.' });
        }
        const usuario = await User.findByIdAndUpdate(
            req.params.id,
            { nome, email },
            { new: true, runValidators: true }
        );
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }
        res.json({ mensagem: 'Usuário atualizado com sucesso!', usuario });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ erro: 'Erro interno ao atualizar usuário.' });
    }
});

// Deletar usuário por ID (rota protegida)
router.delete('/:id', autenticar, async (req, res) => {
    try {
        const usuarioLogado = await User.findById(req.session.user.id);
        if (!usuarioLogado) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }
        // Admin pode deletar qualquer usuário (exceto a si mesmo, se quiser)
        // Usuário comum só pode deletar a si mesmo
        if (!usuarioLogado.admin && req.params.id !== req.session.user.id) {
            return res.status(403).json({ erro: 'Você só pode deletar sua própria conta.' });
        }
        // (Opcional) Impedir que admin delete a si mesmo:
        // if (usuarioLogado.admin && req.params.id === req.session.user.id) {
        //     return res.status(403).json({ erro: 'Admin não pode deletar a si mesmo.' });
        // }
        const usuario = await User.findByIdAndDelete(req.params.id);
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }
        res.json({ mensagem: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ erro: 'Erro ao deletar usuário.' });
    }
});

// Promover ou despromover usuário para admin (apenas admin pode)
router.put('/:id/admin', autenticar, async (req, res) => {
    try {
        const usuarioLogado = await User.findById(req.session.user.id);
        if (!usuarioLogado || !usuarioLogado.admin) {
            return res.status(403).json({ erro: 'Apenas administradores podem alterar permissões de admin.' });
        }
        const { admin } = req.body;
        if (typeof admin !== 'boolean') {
            return res.status(400).json({ erro: 'Campo "admin" deve ser booleano.' });
        }
        const usuario = await User.findByIdAndUpdate(
            req.params.id,
            { admin },
            { new: true, runValidators: true, select: '-senha' }
        );
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }
        res.json({ mensagem: `Usuário ${admin ? 'promovido a' : 'removido de'} admin com sucesso!`, usuario });
    } catch (error) {
        console.error('Erro ao alterar admin:', error);
        res.status(500).json({ erro: 'Erro interno ao alterar admin.' });
    }
});

module.exports = router;
