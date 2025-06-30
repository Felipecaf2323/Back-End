# E-commerce Backend

Projeto 2 da disciplina Programação Web Back-End - Sistema de E-commerce

## Equipe
- Felipe Padovani Seugling - 2453487
- Antonio Marcos Fontes Darienço - 2454106

---

## Sobre o Projeto

Este projeto é uma **aplicação web completa** desenvolvida com **Express.js** (Node.js) e **MongoDB** (via Mongoose), seguindo todas as especificações do professor para a disciplina de Programação Web Back-End.

- **Temática:** E-commerce (MercadoLivre)
- **Framework:** Express.js
- **Banco de Dados:** MongoDB
- **Interface:** Web moderna (HTML/CSS/Bootstrap/JS) e API REST (JSON)
- **Autenticação:** Sessões com express-session e bcrypt
- **Regras de Negócio:** Implementadas conforme Projeto 1

---

## Especificações Atendidas

- ✅ **Uso do Express.js** para criação do servidor, rotas e middlewares
- ✅ **Integração com MongoDB** para persistência de dados (usuários, produtos, pedidos)
- ✅ **Implementação de rotas** para todos os casos de uso (CRUD de usuários, produtos, pedidos)
- ✅ **Recebimento de parâmetros via GET/POST** e uso de JSON nas respostas
- ✅ **Uso de sessões** para autenticação e autorização de usuários
- ✅ **Validação de campos obrigatórios** em todas as rotas
- ✅ **Mensagens de erro claras** para o usuário
- ✅ **Rotina de login** para identificar e permitir o uso do sistema
- ✅ **Interface web moderna** (ou uso via API REST)
- ✅ **Permissões administrativas** (admin pode promover, editar, excluir usuários e pedidos)
- ✅ **Testes automatizados** com Jest e Supertest

---

## Como Rodar o Projeto

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd Back-End
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env` na raiz do projeto:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
SESSION_SECRET=sua-chave-secreta-muito-segura
```

4. **Inicie o MongoDB**
- Instale e rode o serviço do MongoDB localmente (porta padrão 27017)

5. **Execute o servidor**
```bash
npm start
```

6. **Acesse a aplicação**
- Interface web: [http://localhost:3000](http://localhost:3000)
- Teste as rotas via Postman, Insomnia ou cURL (ver exemplos abaixo)

---

## Exemplos de Uso das Rotas (API REST)

### Autenticação
```http
POST /auth/register
POST /auth/login
GET  /auth/session
POST /auth/logout
```

### Usuários
```http
GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
PUT    /users/:id/admin   # Promover/demover admin (apenas admin)
```

### Produtos
```http
GET    /products
POST   /products
GET    /products/:id
PUT    /products/:id
DELETE /products/:id
```

### Pedidos
```http
GET    /orders           # Pedidos do usuário logado
GET    /orders/all       # Todos os pedidos (apenas admin)
POST   /orders           # Criar pedido
DELETE /orders/:id       # Excluir pedido
```

---

## Critérios do Professor Atendidos

- **Implementação dos casos de uso da temática selecionada** (e-commerce)
- **Verificação de preenchimento de campos obrigatórios** e mensagens de erro
- **Rotina de login e autenticação por sessão**
- **Rotas GET/POST/PUT/DELETE** para todos os recursos
- **Permissões administrativas** (admin pode promover, editar, excluir usuários e pedidos)
- **Interface web moderna** (ou uso via API REST)
- **Testes automatizados** (extra - não pediu no projeto mas resolvemos implementar para entender um pouco sobre o trabalho de QA (: )

---

## Tecnologias Utilizadas
- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **bcrypt**
- **express-session**
- **Jest**
- **Supertest**
- **Bootstrap** (interface web)

---

## Estrutura do Projeto

```
Back-End/
├── index.js                 # Servidor principal (Express)
├── package.json            # Dependências e scripts
├── .env                    # Variáveis de ambiente
├── models/                 # Modelos do MongoDB
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── routes/                 # Rotas da API (Express)
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── productRoutes.js
│   └── orderRoutes.js
├── middlewares/            # Middlewares
│   └── authMiddleware.js
├── services/               # Serviços auxiliares
│   └── Database.js
├── public/                 # Interface web (HTML/CSS/JS)
├── tests/                  # Testes automatizados
└── logs/                   # Logs da aplicação
```

---

## Observações Finais

- O projeto **não utiliza campos de estoque** nos produtos, conforme decisão de negócio.
- Todas as regras de negócio e critérios do professor foram seguidos.
- O sistema pode ser utilizado tanto via interface web quanto via API REST.