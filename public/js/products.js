// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Elementos do DOM
const addProductForm = document.getElementById('addProductForm');
const addProductAlert = document.getElementById('addProductAlert');
const productsList = document.getElementById('productsList');

// Carregar produtos ao iniciar a página
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

// Função para mostrar alertas
function showAlert(element, message, type = 'success') {
    element.className = `alert alert-${type}`;
    element.textContent = message;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Função para carregar produtos
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            credentials: 'include'
        });

        if (response.ok) {
            const products = await response.json();
            displayProducts(products);
        } else {
            const data = await response.json();
            productsList.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${data.erro || 'Erro ao carregar produtos'}
                </div>
            `;
        }
    } catch (error) {
        productsList.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-times-circle me-2"></i>
                Erro de conexão com o servidor
            </div>
        `;
    }
}

// Função para exibir produtos
function displayProducts(products) {
    if (products.length === 0) {
        productsList.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-box-open fa-3x mb-3"></i>
                <h5>Nenhum produto cadastrado</h5>
                <p>Adicione produtos usando o formulário ao lado</p>
            </div>
        `;
        return;
    }

    let html = '<div class="row">';
    products.forEach(product => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card product-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="card-title">${product.nome}</h6>
                                <p class="card-text text-muted small">${product.descricao || 'Sem descrição'}</p>
                                <div class="price mb-2">R$ ${product.preco.toFixed(2).replace('.', ',')}</div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="editProduct('${product._id}')">
                                        <i class="fas fa-edit me-2"></i>Editar
                                    </a></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="deleteProduct('${product._id}')">
                                        <i class="fas fa-trash me-2"></i>Excluir
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-sm w-100" onclick="addToCart('${product._id}')">
                            <i class="fas fa-shopping-cart me-1"></i>Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    productsList.innerHTML = html;
}

// Função para adicionar produto
async function addProduct(productData) {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            showAlert(addProductAlert, 'Produto adicionado com sucesso!', 'success');
            addProductForm.reset();
            loadProducts(); // Recarregar lista
        } else {
            showAlert(addProductAlert, data.erro || 'Erro ao adicionar produto', 'danger');
        }
    } catch (error) {
        showAlert(addProductAlert, 'Erro de conexão com o servidor', 'danger');
    }
}

// Função para editar produto (abrir modal e preencher dados)
window.editProduct = async function(productId) {
    try {
        // Buscar dados do produto
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        const product = products.find(p => p._id === productId);
        if (!product) {
            alert('Produto não encontrado!');
            return;
        }
        // Preencher campos do modal
        document.getElementById('editProductId').value = product._id;
        document.getElementById('editProductName').value = product.nome;
        document.getElementById('editProductPrice').value = product.preco;
        document.getElementById('editProductStock').value = product.estoque || 0;
        document.getElementById('editProductDescription').value = product.descricao || '';
        document.getElementById('editProductAlert').style.display = 'none';
        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    } catch (error) {
        alert('Erro ao buscar produto para edição.');
    }
};

// Função para enviar edição do produto
async function updateProduct(productId, productData) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
            credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
            showAlert(document.getElementById('editProductAlert'), 'Produto atualizado com sucesso!', 'success');
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
                modal.hide();
                loadProducts();
            }, 1000);
        } else {
            showAlert(document.getElementById('editProductAlert'), data.erro || 'Erro ao atualizar produto', 'danger');
        }
    } catch (error) {
        showAlert(document.getElementById('editProductAlert'), 'Erro de conexão com o servidor', 'danger');
    }
}

// Event listener para o formulário de edição
const editProductForm = document.getElementById('editProductForm');
if (editProductForm) {
    editProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const productId = document.getElementById('editProductId').value;
        const productData = {
            nome: document.getElementById('editProductName').value,
            preco: parseFloat(document.getElementById('editProductPrice').value),
            estoque: parseInt(document.getElementById('editProductStock').value),
            descricao: document.getElementById('editProductDescription').value
        };
        updateProduct(productId, productData);
    });
}

// Função para excluir produto
async function deleteProduct(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            showAlert(addProductAlert, 'Produto excluído com sucesso!', 'success');
            loadProducts(); // Recarregar lista
        } else {
            const data = await response.json();
            showAlert(addProductAlert, data.erro || 'Erro ao excluir produto', 'danger');
        }
    } catch (error) {
        showAlert(addProductAlert, 'Erro de conexão com o servidor', 'danger');
    }
}

// Função para adicionar ao carrinho
function addToCart(productId) {
    // Implementar adição ao carrinho
    alert(`Produto ${productId} adicionado ao carrinho - Funcionalidade em desenvolvimento`);
}

// Event Listeners
addProductForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productData = {
        nome: document.getElementById('productName').value,
        preco: parseFloat(document.getElementById('productPrice').value),
        estoque: parseInt(document.getElementById('productStock').value),
        descricao: document.getElementById('productDescription').value
    };

    addProduct(productData);
});

// Função para formatar preço
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Função para verificar se o usuário está logado
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/session`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.logado;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', async function() {
    const isLoggedIn = await checkAuth();
    if (!isLoggedIn) {
        // Redirecionar para login se não estiver autenticado
        window.location.href = 'index.html';
    }
}); 