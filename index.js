require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function menuPrincipal() {
  console.log('\n===== MENU PRINCIPAL =====');
  console.log('1. Cadastrar');
  console.log('2. Editar');
  console.log('3. Remover');
  console.log('0. Sair');

  const opcao = await question('Escolha uma opção: ');
  return opcao;
}

async function menuEntidade() {
  console.log('\n-- Escolha uma entidade --');
  console.log('1. Usuário');
  console.log('2. Produto');
  console.log('3. Pedido');
  const opcao = await question('Escolha uma opção: ');
  return opcao;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado ao MongoDB');

  let continuar = true;

  while (continuar) {
    const opcao = await menuPrincipal();

    switch (opcao) {
      case '1': { // Cadastrar
        const entidade = await menuEntidade();
        switch (entidade) {
          case '1':
            console.log('\n-> Cadastrar Usuário');
            await cadastrarUsuario();
            break;
          case '2':
            console.log('\n-> Cadastrar Produto');
            await cadastrarProduto();
            break;
          case '3':
            console.log('\n-> Cadastrar Pedido');
            await cadastrarPedido();
            break;
          default:
            console.log('Entidade inválida');
        }
        break;
      }

      case '2': { // Editar
        const entidade = await menuEntidade();
        switch (entidade) {
          case '1':
            console.log('\n-> Editar Usuário');
            await editarUsuario();
            break;
          case '2':
            console.log('\n-> Editar Produto');
            await editarProduto();
            break;
          case '3':
            console.log('\n-> Não é possível editar ordens já cadastradas');
            break;
          default:
            console.log('Entidade inválida');
        }
        break;
      }

      case '3': { // Remover
        const entidade = await menuEntidade();
        switch (entidade) {
          case '1':
            console.log('\n-> Remover Usuário');
            await removerUsuario();
            break;
          case '2':
            console.log('\n-> Remover Produto');
            await removerProduto();
            break;
          case '3':
            console.log('\n-> Não é possível remover ordens já cadastradas');
            break;
          default:
            console.log('Entidade inválida');
        }
        break;
      }

      case '0':
        continuar = false;
        break;

      default:
        console.log('Opção inválida.');
    }
  }

  rl.close();
  mongoose.connection.close();
}


//funções de cadastro:
async function cadastrarUsuario() {
  const name = await question('Nome: ');
  const email = await question('Email: ');
  const password = await question('Senha: ');

  if (!name || !email || !password) {
    console.log('Todos os campos são obrigatórios.');
    return;
  }

  // Validação simples de email
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) {
    console.log('Email inválido.');
    return;
  }

  const user = new User({ name, email, password });

  try {
    await user.save();
    console.log('Usuário cadastrado com sucesso!');
  } catch (err) {
    console.error('Erro ao salvar usuário:', err.message);
  }
}

async function cadastrarProduto() {
  const name = await question('Nome do produto: ');
  const priceInput = await question('Preço: ');
  const stockInput = await question('Quantidade em estoque: ');

  const price = parseFloat(priceInput);
  const stock = parseInt(stockInput);

  if (!name || isNaN(price) || isNaN(stock)) {
    console.log('Todos os campos são obrigatórios e devem ser válidos.');
    return;
  }

  const product = new Product({ name, price, stock });

  try {
    await product.save();
    console.log('Produto cadastrado com sucesso!');
  } catch (err) {
    console.error('Erro ao salvar produto:', err.message);
  }
}

async function cadastrarPedido() {
  try {
    const usuarios = await User.find();
    const produtos = await Product.find();

    if (usuarios.length === 0 || produtos.length === 0) {
      console.log('É necessário ter ao menos um usuário e um produto cadastrados.');
      return;
    }

    console.log('\nUsuários disponíveis:');
    usuarios.forEach((u, i) => console.log(`${i + 1}. ${u.name} (${u.email})`));
    const userIndex = parseInt(await question('Escolha o número do usuário: ')) - 1;

    const user = usuarios[userIndex];
    if (!user) {
      console.log('Usuário inválido.');
      return;
    }

    console.log('\nProdutos disponíveis:');
    produtos.forEach((p, i) => console.log(`${i + 1}. ${p.name} - R$${p.price.toFixed(2)} (Estoque: ${p.stock})`));
    const productIndex = parseInt(await question('Escolha o número do produto: ')) - 1;

    const product = produtos[productIndex];
    if (!product) {
      console.log('Produto inválido.');
      return;
    }

    const quantity = parseInt(await question('Quantidade desejada: '));
    if (isNaN(quantity) || quantity <= 0 || quantity > product.stock) {
      console.log('Quantidade inválida ou maior que o estoque.');
      return;
    }

    const total = product.price * quantity;

    const order = new Order({
      user: user._id,
      products: [{ product: product._id, quantity }],
      total
    });

    // Atualizar estoque
    product.stock -= quantity;
    await product.save();
    await order.save();

    console.log('Pedido criado com sucesso!');
  } catch (err) {
    console.error('Erro ao criar pedido:', err.message);
  }
}




//FUNÇÕES DE REMOÇÃO:
async function removerUsuario() {
  const usuarios = await User.find();
  if (usuarios.length === 0) return console.log('Nenhum usuário cadastrado.');

  console.log('\nUsuários disponíveis:');
  usuarios.forEach((u, i) => console.log(`${i + 1}. ${u.name} (${u.email})`));
  const userIndex = parseInt(await question('Escolha o número do usuário para remover: ')) - 1;

  const user = usuarios[userIndex];
  if (!user) return console.log('Usuário inválido.');

  await User.deleteOne({ _id: user._id });
  console.log('Usuário removido com sucesso!');
}

async function removerProduto() {
  const produtos = await Product.find();
  if (produtos.length === 0) return console.log('Nenhum produto cadastrado.');

  console.log('\nProdutos disponíveis:');
  produtos.forEach((p, i) => console.log(`${i + 1}. ${p.name}`));
  const productIndex = parseInt(await question('Escolha o número do produto para remover: ')) - 1;

  const product = produtos[productIndex];
  if (!product) return console.log('Produto inválido.');

  await Product.deleteOne({ _id: product._id });
  console.log('Produto removido com sucesso!');
}



//MÉTODOS PARA EDIÇÃO DE REGISTROS:
async function editarUsuario() {
  const usuarios = await User.find();
  if (usuarios.length === 0) return console.log('Nenhum usuário cadastrado.');

  console.log('\nUsuários disponíveis:');
  usuarios.forEach((u, i) => console.log(`${i + 1}. ${u.name} (${u.email})`));
  const userIndex = parseInt(await question('Escolha o número do usuário para editar: ')) - 1;
  const user = usuarios[userIndex];
  if (!user) return console.log('Usuário inválido.');

  const novoNome = await question(`Novo nome (${user.name}): `) || user.name;
  const novoEmail = await question(`Novo e-mail (${user.email}): `) || user.email;
  const novaSenha = await question(`Nova senha (${user.password}): `) || user.password;

  user.name = novoNome;
  user.email = novoEmail;
  user.password = novaSenha;
  await user.save();

  console.log('Usuário editado com sucesso!');
}

async function editarProduto() {
  const produtos = await Product.find();
  if (produtos.length === 0) return console.log('Nenhum produto cadastrado.');

  console.log('\nProdutos disponíveis:');
  produtos.forEach((p, i) => console.log(`${i + 1}. ${p.name} - R$${p.price} - Estoque: ${p.stock}`));
  const productIndex = parseInt(await question('Escolha o número do produto para editar: ')) - 1;
  const product = produtos[productIndex];
  if (!product) return console.log('Produto inválido.');

  const novoNome = await question(`Novo nome (${product.name}): `) || product.name;
  const novoPreco = await question(`Novo preço (${product.price}): `) || product.price;
  const novoEstoque = await question(`Novo estoque (${product.stock}): `) || product.stock;

  product.name = novoNome;
  product.price = parseFloat(novoPreco);
  product.stock = parseInt(novoEstoque);
  await product.save();

  console.log('Produto editado com sucesso!');
}

main();
