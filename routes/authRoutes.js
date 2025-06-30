const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Registro de usuário
router.post('/register', async (req, res) => {
    console.log('Dados recebidos no registro:', req.body);
    
    // Verifica se req.body existe
    if (!req.body) {
        return res.status(400).json({ erro: 'Dados não fornecidos.' });
    }

    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

    try {
        // Verifica se o usuário já existe
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ erro: 'Email já cadastrado.' });
        }

        // Criptografa a senha
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoUsuario = new User({
            nome,
            email,
            senha: senhaCriptografada
        });

        await novoUsuario.save();

        res.status(201).json({ mensagem: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

router.post('/login', async (req, res) => {
    console.log('Dados recebidos no login:', req.body);
    console.log('Headers:', req.headers);
    
    // Verifica se req.body existe
    if (!req.body) {
        console.log('req.body está vazio');
        return res.status(400).json({ erro: 'Dados não fornecidos.' });
    }

    const { email, senha } = req.body;
    console.log('Email extraído:', email);
    console.log('Senha extraída:', senha ? '***' : 'undefined');

    if (!email || !senha) {
        console.log('Campos obrigatórios faltando - email:', !!email, 'senha:', !!senha);
        return res.status(400).json({ 
            erro: 'Email e senha são obrigatórios.',
            detalhes: {
                email: !!email,
                senha: !!senha
            }
        });
    }

    try {
        const usuario = await User.findOne({ email });
        console.log('Usuário encontrado:', usuario ? 'Sim' : 'Não');

        if (!usuario) {
            return res.status(401).json({ erro: 'Credenciais inválidas.' });
        }

        // Verifica a senha criptografada
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        console.log('Senha válida:', senhaValida);
        
        if (!senhaValida) {
            return res.status(401).json({ erro: 'Credenciais inválidas.' });
        }

        req.session.user = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email
        };

        console.log('Sessão criada:', req.session.user);
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
        res.status(500).json({ erro: 'Erro interno.', detalhe: error.message });
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
