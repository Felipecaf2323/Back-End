# 📦 Projeto 1 — Sistema de E-commerce (Node.js + MongoDB)

## Alunos:
- Felipe Padovani Seugling - 2453487
- Antonio Marcos Fontes Darienço - 2454106

Repositório desenvolvido para o Projeto 1 da disciplina **Programação Web Back-End (EC48B-C71)**.

## 🧾 Descrição

Este projeto simula um sistema básico de e-commerce com cadastro, edição e exclusão de usuários, produtos e pedidos. É uma aplicação de linha de comando (CLI) escrita em **Node.js**, utilizando **MongoDB** como banco de dados.

Implementa um conjunto de classes de acesso ao banco de dados (MongoDB), com as seguintes funcionalidades:

- Cadastro, edição e remoção de:
  - Usuários
  - Produtos
  - Pedidos (Orders)
- Validações e campos obrigatórios
- Tratamento de exceções
- Geração de logs de erro

## 🛠️ Tecnologias utilizadas

- Node.js
- MongoDB + Mongoose
- Dotenv
- CLI interativo com `readline`
- Logger com gravação de exceções

## 📚 Classes implementadas

O projeto contempla as seguintes **coleções**:

### 👤 `User`

- Campos: `name`, `email`, `password`
- Validações:
  - Nome obrigatório com mínimo de 2 caracteres
  - Email obrigatório e válido
  - Senha obrigatória com mínimo de 6 caracteres

### 🛒 `Product`

- Campos: `name`, `price`, `stock`
- Validações:
  - Nome obrigatório
  - Preço obrigatório (> 0)
  - Estoque obrigatório (>= 0)

### 🧾 `Order`

- Campos: `user`, `products` (array com `product` e `quantity`), `total`, `createdAt`
- Validações:
  - Usuário e produtos obrigatórios
  - Quantidade mínima de 1
  - Total maior que 0

## ▶️ Como executar

1. Instale as dependências:
   ```bash
   npm install
