// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const autenticar = require('../middlewares/authMiddleware');

// Criar novo pedido (protegido)
router.post('/', autenticar, async (req, res) => {
    const { produtos, total } = req.body;

    if (!Array.isArray(produtos) || produtos.length === 0 || !total) {
        return res.status(400).json({ erro: 'Produtos e total do pedido são obrigatórios.' });
    }

    try {
        const novoPedido = new Order(null, req.session.user.id, produtos, total);
        await novoPedido.save();
        res.status(201).json({ mensagem: 'Pedido criado com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ erro: 'Erro interno ao criar pedido.' });
    }
});

// Listar pedidos do usuário logado
router.get('/', autenticar, async (req, res) => {
    try {
        const pedidos = await Order.findByUserId(req.session.user.id);
        res.json(pedidos);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ erro: 'Erro interno ao listar pedidos.' });
    }
});

// Deletar pedido por ID (protegido)
router.delete('/:id', autenticar, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await Order.deleteById(id);
        res.json({ mensagem: 'Pedido deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        res.status(500).json({ erro: 'Erro ao deletar pedido.' });
    }
});

module.exports = router;