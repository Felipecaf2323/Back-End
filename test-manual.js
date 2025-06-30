// Script para testar a API manualmente
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 Iniciando testes manuais da API...\n');

    try {
        // Teste 1: Verificar se o servidor está rodando
        console.log('1️⃣ Testando se o servidor está rodando...');
        const response = await axios.get(BASE_URL);
        console.log('✅ Servidor funcionando:', response.data);
        console.log('');

        // Teste 2: Registrar um usuário
        console.log('2️⃣ Testando registro de usuário...');
        const userData = {
            nome: 'João Silva',
            email: 'joao@teste.com',
            senha: '123456'
        };

        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, userData);
        console.log('✅ Usuário registrado:', registerResponse.data);
        console.log('');

        // Teste 3: Fazer login
        console.log('3️⃣ Testando login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'joao@teste.com',
            senha: '123456'
        });
        console.log('✅ Login realizado:', loginResponse.data);
        console.log('');

        // Teste 4: Verificar sessão
        console.log('4️⃣ Testando verificação de sessão...');
        const sessionResponse = await axios.get(`${BASE_URL}/auth/session`);
        console.log('✅ Sessão verificada:', sessionResponse.data);
        console.log('');

        // Teste 5: Testar validação de campos obrigatórios
        console.log('5️⃣ Testando validação de campos obrigatórios...');
        try {
            await axios.post(`${BASE_URL}/auth/register`, { nome: 'João' });
        } catch (error) {
            console.log('✅ Validação funcionando:', error.response.data);
        }
        console.log('');

        console.log('🎉 Todos os testes passaram! A API está funcionando corretamente!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Erro: Servidor não está rodando. Execute: npm run dev');
        } else {
            console.log('❌ Erro:', error.message);
        }
    }
}

testAPI(); 