const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const autenticar = require('../middlewares/authMiddleware');

// Criar produto (requer login)
router.post('/', autenticar, async (req, res) => {
    const { nome, preco } = req.body;

    if (!nome || !preco) {
        return res.status(400).json({ erro: 'Nome e preço são obrigatórios.' });
    }

    try {
        const novoProduto = new Product({ nome, preco });
        await novoProduto.save();
        res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        res.status(500).json({ erro: 'Erro interno ao cadastrar produto.', detalhe: error.message });
    }
});

// Listar todos os produtos
router.get('/', async (req, res) => {
    try {
        const produtos = await Product.find();
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ erro: 'Erro interno ao buscar produtos.' });
    }
});

module.exports = router;