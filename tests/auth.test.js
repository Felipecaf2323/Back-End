const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');

describe('Autenticação', () => {
    beforeAll(async () => {
        // Conecta ao banco de teste
        await mongoose.connect(process.env.MONGODB_URI);
    });

    afterAll(async () => {
        // Limpa e desconecta do banco
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Limpa a coleção de usuários antes de cada teste
        await User.deleteMany({});
    });

    describe('POST /auth/register', () => {
        it('deve registrar um novo usuário com dados válidos', async () => {
            const userData = {
                nome: 'João Silva',
                email: 'joao@teste.com',
                senha: '123456'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.mensagem).toBe('Usuário registrado com sucesso!');

            // Verifica se o usuário foi salvo no banco
            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
            expect(user.nome).toBe(userData.nome);
        });

        it('deve retornar erro quando campos obrigatórios estão faltando', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({ nome: 'João' })
                .expect(400);

            expect(response.body.erro).toBe('Nome, email e senha são obrigatórios.');
        });

        it('deve retornar erro quando email já está cadastrado', async () => {
            const userData = {
                nome: 'João Silva',
                email: 'joao@teste.com',
                senha: '123456'
            };

            // Registra o primeiro usuário
            await request(app)
                .post('/auth/register')
                .send(userData);

            // Tenta registrar o mesmo email novamente
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.erro).toBe('Email já cadastrado.');
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            // Registra um usuário para os testes de login
            const userData = {
                nome: 'João Silva',
                email: 'joao@teste.com',
                senha: '123456'
            };

            await request(app)
                .post('/auth/register')
                .send(userData);
        });

        it('deve fazer login com credenciais válidas', async () => {
            const loginData = {
                email: 'joao@teste.com',
                senha: '123456'
            };

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.mensagem).toBe('Login realizado com sucesso!');
        });

        it('deve retornar erro com credenciais inválidas', async () => {
            const loginData = {
                email: 'joao@teste.com',
                senha: 'senhaerrada'
            };

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.erro).toBe('Credenciais inválidas.');
        });

        it('deve retornar erro quando campos obrigatórios estão faltando', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({ email: 'joao@teste.com' })
                .expect(400);

            expect(response.body.erro).toBe('Email e senha são obrigatórios.');
        });
    });

    describe('GET /auth/session', () => {
        it('deve retornar false quando usuário não está logado', async () => {
            const response = await request(app)
                .get('/auth/session')
                .expect(401);

            expect(response.body.logado).toBe(false);
        });
    });

    describe('POST /auth/logout', () => {
        it('deve fazer logout com sucesso', async () => {
            const response = await request(app)
                .post('/auth/logout')
                .expect(200);

            expect(response.body.mensagem).toBe('Logout realizado com sucesso.');
        });
    });
}); 