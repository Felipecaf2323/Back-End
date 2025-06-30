// Script para testar o login
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testLogin() {
    console.log('🧪 Testando login...\n');

    try {
        // 1. Primeiro, vamos registrar um usuário
        console.log('1️⃣ Registrando usuário de teste...');
        const userData = {
            nome: 'João Silva',
            email: 'joao@teste.com',
            senha: '123456'
        };

        const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        console.log('✅ Usuário registrado:', registerResponse.data);
        console.log('');

        // 2. Agora vamos testar o login
        console.log('2️⃣ Testando login...');
        const loginData = {
            email: 'joao@teste.com',
            senha: '123456'
        };

        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData, {
            withCredentials: true
        });
        console.log('✅ Login realizado:', loginResponse.data);
        console.log('');

        // 3. Verificar sessão
        console.log('3️⃣ Verificando sessão...');
        const sessionResponse = await axios.get(`${API_BASE_URL}/auth/session`, {
            withCredentials: true
        });
        console.log('✅ Sessão verificada:', sessionResponse.data);
        console.log('');

        console.log('🎉 Todos os testes passaram! O login está funcionando corretamente!');

    } catch (error) {
        if (error.response) {
            console.log('❌ Erro na resposta:', error.response.status, error.response.data);
        } else {
            console.log('❌ Erro de conexão:', error.message);
        }
    }
}

testLogin(); 