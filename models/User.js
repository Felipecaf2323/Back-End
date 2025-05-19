const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Nome obrigatório'] },
  email: { type: String, required: [true, 'Email obrigatório'], unique: true },
  password: { type: String, required: [true, 'Senha obrigatória'] }
});

module.exports = mongoose.model('User', userSchema);
