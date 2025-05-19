const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Nome do produto é obrigatório'] },
  price: { type: Number, required: [true, 'Preço obrigatório'] },
  stock: { type: Number, required: [true, 'Estoque obrigatório'] }
});

module.exports = mongoose.model('Product', productSchema);
