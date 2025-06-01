require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const logger = require('./logger/Logger')

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const bcrypt = require('bcrypt');


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
  console.log('4. Consultar');
  console.log('5. Buscar Usuário por Nome');
  console.log('6. Buscar Produto por Nome');
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
            await editarPedido();
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
            await removerPedido();
            break;
          default:
            console.log('Entidade inválida');
        }
        break;
      }

      case '4': { // Consultar
        const entidade = await menuEntidade();
        switch (entidade) {
          case '1':
            console.log('\n-> Consultar Usuários');
            await consultarUsuarios();
            break;
          case '2':
            console.log('\n-> Consultar Produtos');
            await consultarProdutos();
            break;
          case '3':
            await consultarPedidos();
            break;
          default:
            console.log('Entidade inválida');
        }
        break;
      }

      case '5':
        console.log('\n-> Buscar Usuário por Nome');
        await buscarUsuarioPorNome();
      break;

      case '6':
        console.log('\n-> Buscar Produto por Nome');
        await buscarProdutoPorNome();
      break;

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

  if (!name || !email || !password) return console.log('Todos os campos são obrigatórios.');

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) return console.log('Email inválido.');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword });

  try {
    await user.save();
    console.log('Usuário cadastrado com sucesso!');
  } catch (err) {
    console.error('Erro ao salvar usuário:', err.message);
    logger.error(err);
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
    logger.error(err);
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
    logger.error(err);
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

  usuarios.forEach((u, i) => console.log(`${i + 1}. ${u.name} (${u.email})`));
  const userIndex = parseInt(await question('Escolha o número do usuário para editar: ')) - 1;
  const user = usuarios[userIndex];
  if (!user) return console.log('Usuário inválido.');

  const novoNome = await question(`Novo nome (${user.name}): `) || user.name;
  const novoEmail = await question(`Novo e-mail (${user.email}): `) || user.email;
  const novaSenha = await question('Nova senha (deixe em branco para manter): ');

  user.name = novoNome;
  user.email = novoEmail;
  if (novaSenha.trim()) {
    user.password = await bcrypt.hash(novaSenha, 10);
  }
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


//MÉTODOS PARA CONSULTA:
async function consultarUsuarios() {
  const usuarios = await User.find();
  if (usuarios.length === 0) return console.log('Nenhum usuário cadastrado.');

  console.log('\n=== Lista de Usuários ===');
  usuarios.forEach((u, i) => {
    console.log(`${i + 1}. Nome: ${u.name}, Email: ${u.email}`);
  });
}

async function consultarProdutos() {
  const produtos = await Product.find();
  if (produtos.length === 0) return console.log('Nenhum produto cadastrado.');

  console.log('\n=== Lista de Produtos ===');
  produtos.forEach((p, i) => {
    console.log(`${i + 1}. Nome: ${p.name}, Preço: R$${p.price.toFixed(2)}, Estoque: ${p.stock}`);
  });
}

//MÉTODOS PARA BUSCAR USUÁRIOS E PRODUTOS:
async function buscarUsuarioPorNome() {
  const termo = await question('Digite o nome do usuário para buscar: ');

  if (!termo.trim()) {
    console.log('Nome inválido.');
    return;
  }

  const usuarios = await User.find({
    name: { $regex: termo, $options: 'i' } // busca parcial e case-insensitive
  });

  if (usuarios.length === 0) {
    console.log('Nenhum usuário encontrado.');
    return;
  }

  console.log('\n=== Resultado da busca de usuários ===');
  usuarios.forEach((u, i) => {
    console.log(`${i + 1}. Nome: ${u.name}, Email: ${u.email}`);
  });
}

async function buscarProdutoPorNome() {
  const termo = await question('Digite o nome do produto para buscar: ');

  if (!termo.trim()) {
    console.log('Nome inválido.');
    return;
  }

  const produtos = await Product.find({
    name: { $regex: termo, $options: 'i' }
  });

  if (produtos.length === 0) {
    console.log('Nenhum produto encontrado.');
    return;
  }

  console.log('\n=== Resultado da busca de produtos ===');
  produtos.forEach((p, i) => {
    console.log(`${i + 1}. Nome: ${p.name}, Preço: R$${p.price.toFixed(2)}, Estoque: ${p.stock}`);
  });
}


//nova função de consultar por pedidos(order): - 01/06/2025
async function consultarPedidos() {
  const pedidos = await Order.find().populate('user').populate('products.product');
  if (pedidos.length === 0) return console.log('Nenhum pedido cadastrado.');

  pedidos.forEach((o, i) => {
    console.log(`\nPedido ${i + 1}:`);

    if (o.user) {
      console.log(`Usuário: ${o.user.name} (${o.user.email})`);
    } else {
      console.log('Usuário: [Usuário removido]');
    }

    o.products.forEach(p => {
      const nomeProduto = p.product ? p.product.name : '[Produto removido]';
      console.log(`- Produto: ${nomeProduto}, Quantidade: ${p.quantity}`);
    });

    console.log(`Total: R$${o.total.toFixed(2)}`);
    console.log(`Data: ${o.createdAt?.toLocaleString() || 'Data desconhecida'}`);
  });
}


//nova função de remover por pedidos(order): - 01/06/2025
async function removerPedido() {
  const pedidos = await Order.find().populate('user');
  if (pedidos.length === 0) return console.log('Nenhum pedido cadastrado.');

pedidos.forEach((p, i) => {
  const nomeUsuario = p.user?.name || 'Usuário removido';
  const data = p.createdAt?.toLocaleDateString() || 'Data desconhecida';
  console.log(`${i + 1}. Pedido de ${nomeUsuario} em ${data}`);
});  const index = parseInt(await question('Escolha o número do pedido para remover: ')) - 1;
  const pedido = pedidos[index];

  if (!pedido) return console.log('Pedido inválido.');

  await Order.deleteOne({ _id: pedido._id });
  console.log('Pedido removido com sucesso!');
}

//nova função de editar pedidos(order): - 01/06/2025
async function editarPedido() {
  const pedidos = await Order.find().populate('user').populate('products.product');
  if (pedidos.length === 0) return console.log('Nenhum pedido cadastrado.');

  console.log('\nPedidos disponíveis:');
  pedidos.forEach((p, i) => {
    const nomeUsuario = p.user?.name || 'Usuário removido';
    const data = p.createdAt?.toLocaleString() || 'Data desconhecida';
    console.log(`${i + 1}. Pedido de ${nomeUsuario} em ${data}`);
  });

  const pedidoIndex = parseInt(await question('Escolha o número do pedido para editar: ')) - 1;
  const pedido = pedidos[pedidoIndex];
  if (!pedido) return console.log('Pedido inválido.');

  // Restaurar estoque dos produtos anteriores
  for (const item of pedido.products) {
    if (item.product) {
      const produto = await Product.findById(item.product._id);
      if (produto) {
        produto.stock += item.quantity;
        await produto.save();
      }
    }
  }

  // Escolher novo usuário
  const usuarios = await User.find();
  usuarios.forEach((u, i) => console.log(`${i + 1}. ${u.name} (${u.email})`));
  const userIndex = parseInt(await question('Escolha o novo número do usuário: ')) - 1;
  const novoUsuario = usuarios[userIndex];
  if (!novoUsuario) return console.log('Usuário inválido.');

  // Escolher novo produto e quantidade
  const produtos = await Product.find();
  produtos.forEach((p, i) =>
    console.log(`${i + 1}. ${p.name} - R$${p.price.toFixed(2)} (Estoque: ${p.stock})`)
  );
  const productIndex = parseInt(await question('Escolha o novo número do produto: ')) - 1;
  const novoProduto = produtos[productIndex];
  if (!novoProduto) return console.log('Produto inválido.');

  const quantidade = parseInt(await question('Quantidade desejada: '));
  if (isNaN(quantidade) || quantidade <= 0 || quantidade > novoProduto.stock) {
    return console.log('Quantidade inválida ou maior que o estoque.');
  }

  // Atualiza estoque
  novoProduto.stock -= quantidade;
  await novoProduto.save();

  // Atualiza pedido
  pedido.user = novoUsuario._id;
  pedido.products = [{ product: novoProduto._id, quantity: quantidade }];
  pedido.total = novoProduto.price * quantidade;
  await pedido.save();

  console.log('Pedido editado com sucesso!');
}


main();
