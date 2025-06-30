// index.js
const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const Database = require('./services/Database');

// Carrega variáveis de ambiente
dotenv.config();

// Inicia conexão com banco de dados (apenas se não estiver em teste)
if (process.env.NODE_ENV !== 'test') {
    Database.connect();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de sessões
app.use(session({
    secret: process.env.SESSION_SECRET || 'chave-secreta',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true em produção com HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuração CORS para desenvolvimento
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Rotas principais
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/orders', require('./routes/orderRoutes'));

// Rota de teste da API
app.get('/api/status', (req, res) => {
    res.json({ 
        mensagem: 'API E-commerce funcionando!',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Rota raiz - serve a página HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para qualquer outra requisição - serve a página HTML (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor apenas se não estiver em teste
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        console.log(`📱 Interface web disponível em http://localhost:${PORT}`);
        console.log(`🔧 API disponível em http://localhost:${PORT}/api/status`);
    });
}

module.exports = app;
