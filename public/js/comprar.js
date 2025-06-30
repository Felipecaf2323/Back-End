const API_BASE_URL = 'http://localhost:3000';

let produtosDisponiveis = [];
let carrinho = [];

// Carregar produtos ao iniciar a página
document.addEventListener('DOMContentLoaded', async function() {
    await carregarProdutos();
    renderizarCarrinho();
});

// Carregar produtos do backend
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, { credentials: 'include' });
        if (response.ok) {
            produtosDisponiveis = await response.json();
            renderizarProdutos();
        } else {
            document.getElementById('productsList').innerHTML = '<div class="alert alert-danger">Erro ao carregar produtos</div>';
        }
    } catch (error) {
        document.getElementById('productsList').innerHTML = '<div class="alert alert-danger">Erro de conexão com o servidor</div>';
    }
}

// Renderizar lista de produtos
function renderizarProdutos() {
    if (produtosDisponiveis.length === 0) {
        document.getElementById('productsList').innerHTML = '<div class="text-muted">Nenhum produto disponível</div>';
        return;
    }
    let html = '<div class="row">';
    produtosDisponiveis.forEach(produto => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${produto.nome}</h5>
                        <p class="card-text text-muted">${produto.descricao || ''}</p>
                        <div class="mb-2">Preço: <strong>R$ ${produto.preco.toFixed(2).replace('.', ',')}</strong></div>
                        <div class="input-group mb-2">
                            <span class="input-group-text">Qtd</span>
                            <input type="number" class="form-control" min="1" value="1" id="qtd_${produto._id}">
                        </div>
                        <button class="btn btn-primary w-100" onclick="adicionarAoCarrinho('${produto._id}')">
                            <i class="fas fa-cart-plus me-1"></i>Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    document.getElementById('productsList').innerHTML = html;
}

// Adicionar produto ao carrinho
window.adicionarAoCarrinho = function(produtoId) {
    const produto = produtosDisponiveis.find(p => p._id === produtoId);
    if (!produto) return;
    const qtdInput = document.getElementById(`qtd_${produtoId}`);
    const quantidade = parseInt(qtdInput.value);
    if (isNaN(quantidade) || quantidade < 1) return;
    // Se já existe no carrinho, soma a quantidade
    const itemExistente = carrinho.find(item => item.produto._id === produtoId);
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({ produto, quantidade });
    }
    renderizarCarrinho();
};

// Remover item do carrinho
window.removerDoCarrinho = function(produtoId) {
    carrinho = carrinho.filter(item => item.produto._id !== produtoId);
    renderizarCarrinho();
};

// Renderizar carrinho
function renderizarCarrinho() {
    const cartList = document.getElementById('cartList');
    if (carrinho.length === 0) {
        cartList.innerHTML = '<div class="text-muted">Carrinho vazio</div>';
        document.getElementById('cartTotal').textContent = '';
        return;
    }
    let html = '<table class="table cart-table"><thead><tr><th>Produto</th><th>Qtd</th><th>Preço</th><th></th></tr></thead><tbody>';
    let total = 0;
    carrinho.forEach(item => {
        const subtotal = item.produto.preco * item.quantidade;
        total += subtotal;
        html += `
            <tr>
                <td>${item.produto.nome}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
                <td><button class="btn btn-sm btn-danger" onclick="removerDoCarrinho('${item.produto._id}')"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    document.getElementById('cartTotal').textContent = 'Total: R$ ' + total.toFixed(2).replace('.', ',');
    cartList.innerHTML = html;
}

// Finalizar compra
const finalizarCompraBtn = document.getElementById('finalizarCompraBtn');
if (finalizarCompraBtn) {
    finalizarCompraBtn.addEventListener('click', finalizarCompra);
}

async function finalizarCompra() {
    if (carrinho.length === 0) return;
    const produtosParaPedido = carrinho.map(item => ({
        produto: item.produto._id,
        quantidade: item.quantidade
    }));
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ produtos: produtosParaPedido }),
            credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
            carrinho = [];
            renderizarCarrinho();
            showOrderAlert('Compra realizada com sucesso!', 'success');
            await carregarProdutos();
        } else {
            showOrderAlert(data.erro || 'Erro ao finalizar compra', 'danger');
        }
    } catch (error) {
        showOrderAlert('Erro de conexão com o servidor', 'danger');
    }
}

function showOrderAlert(message, type) {
    const alertDiv = document.getElementById('orderAlert');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 4000);
} 