// Configuração global para testes
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/ecommerce_test';
process.env.SESSION_SECRET = 'test-secret';

// Timeout global para testes
jest.setTimeout(10000); 