const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nome: { type: String, required: [true, 'Nome do produto é obrigatório.'] },
    preco: { type: Number, required: [true, 'Preço é obrigatório.'] }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;