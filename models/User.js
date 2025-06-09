const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nome: { type: String, required: [true, 'Nome obrigatório'] },
    email: { type: String, required: [true, 'Email obrigatório'], unique: true },
    senha: { type: String, required: [true, 'Senha obrigatória'] }
});

const User = mongoose.model('User', userSchema);
module.exports = User;