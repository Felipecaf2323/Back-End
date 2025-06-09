// index.js
const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const Database = require('./services/Database');

// Carrega variáveis de ambiente
dotenv.config();

// Inicia conexão com banco de dados
Database.connect();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de sessões
app.use(session({
    secret: 'chave-secreta', // idealmente, usar algo seguro no .env
    resave: false,
    saveUninitialized: false
}));

// Rotas principais
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/orders', require('./routes/orderRoutes'));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${3000}`);
});
