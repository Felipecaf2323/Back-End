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

// Excluir produto por ID (requer login)
router.delete('/:id', autenticar, async (req, res) => {
    try {
        const produto = await Product.findByIdAndDelete(req.params.id);
        if (!produto) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }
        res.json({ mensagem: 'Produto excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ erro: 'Erro ao excluir produto.' });
    }
});

// Editar produto por ID (requer login)
router.put('/:id', autenticar, async (req, res) => {
    const { nome, preco, estoque, descricao } = req.body;
    if (!nome || preco === undefined || estoque === undefined) {
        return res.status(400).json({ erro: 'Nome, preço e estoque são obrigatórios.' });
    }
    try {
        const produto = await Product.findByIdAndUpdate(
            req.params.id,
            { nome, preco, estoque, descricao },
            { new: true, runValidators: true }
        );
        if (!produto) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }
        res.json({ mensagem: 'Produto atualizado com sucesso.', produto });
    } catch (error) {
        console.error('Erro ao editar produto:', error);
        res.status(500).json({ erro: 'Erro ao editar produto.' });
    }
});

module.exports = router;