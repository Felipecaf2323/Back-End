const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function connect() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('[MongoDB] Conectado com sucesso.');
    } catch (error) {
        console.error('[MongoDB] Erro na conexão:', error);
    }
}

module.exports = { connect };