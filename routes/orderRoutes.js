// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const autenticar = require('../middlewares/authMiddleware');
const User = require('../models/User');

// Criar pedido (comprar produtos)
router.post('/', autenticar, async (req, res) => {
    const { produtos } = req.body;
    const userId = req.session.user && req.session.user.id;

    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return res.status(400).json({ erro: 'Produtos são obrigatórios.' });
    }
    if (!userId) {
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    try {
        // Buscar todos os produtos e calcular total
        let total = 0;
        const produtosDetalhados = [];
        for (const item of produtos) {
            const produto = await Product.findById(item.produto);
            if (!produto) {
                return res.status(404).json({ erro: `Produto não encontrado: ${item.produto}` });
            }
            if (produto.estoque !== undefined && produto.estoque < item.quantidade) {
                return res.status(400).json({ erro: `Estoque insuficiente para o produto: ${produto.nome}` });
            }
            total += produto.preco * item.quantidade;
            produtosDetalhados.push({ product: produto._id, quantity: item.quantidade });
        }

        // Criar pedido
        const novoPedido = new Order({
            user: userId,
            products: produtosDetalhados,
            total
        });
        await novoPedido.save();

        // Atualizar estoque dos produtos
        for (const item of produtos) {
            await Product.findByIdAndUpdate(item.produto, { $inc: { estoque: -item.quantidade } });
        }

        res.status(201).json({ mensagem: 'Pedido realizado com sucesso!', pedido: novoPedido });
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

// Listar todos os pedidos (apenas para admin)
router.get('/all', autenticar, async (req, res) => {
    try {
        // Verificar se o usuário é admin
        const usuario = await User.findById(req.session.user.id);
        if (!usuario || !usuario.admin) {
            return res.status(403).json({ erro: 'Acesso negado. Apenas administradores podem ver todos os pedidos.' });
        }

        // Buscar todos os pedidos com dados do usuário e produtos populados
        const pedidos = await Order.find()
            .populate('user', 'nome email')
            .populate('products.product', 'nome preco')
            .sort({ createdAt: -1 }); // Mais recentes primeiro

        res.json(pedidos);
    } catch (error) {
        console.error('Erro ao buscar todos os pedidos:', error);
        res.status(500).json({ erro: 'Erro interno ao listar todos os pedidos.' });
    }
});

// Excluir pedido por ID (usuário pode excluir o próprio, admin pode excluir qualquer)
router.delete('/:id', autenticar, async (req, res) => {
    const userId = req.session.user && req.session.user.id;
    try {
        const pedido = await Order.findById(req.params.id);
        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado.' });
        }
        // Buscar usuário logado
        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }
        // Permitir admin excluir qualquer pedido
        if (!usuario.admin && pedido.user.toString() !== userId) {
            return res.status(403).json({ erro: 'Você só pode excluir seus próprios pedidos.' });
        }
        await pedido.deleteOne();
        res.json({ mensagem: 'Pedido excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir pedido:', error);
        res.status(500).json({ erro: 'Erro ao excluir pedido.' });
    }
});

module.exports = router;