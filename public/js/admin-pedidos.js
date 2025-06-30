const API_BASE_URL = 'http://localhost:3000';

// Checar se usuário é admin antes de mostrar a página
async function checkAdmin() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/session`, { credentials: 'include' });
        if (response.ok) {
            const data = await response.json();
            if (data.usuario && data.usuario.email) {
                // Buscar info completa do usuário
                const userInfo = await fetch(`${API_BASE_URL}/users/${data.usuario.id}`, { credentials: 'include' });
                if (userInfo.ok) {
                    const user = await userInfo.json();
                    if (user.admin) return true;
                }
            }
        }
    } catch (e) {}
    window.location.href = 'index.html';
    return false;
}

// Carregar pedidos ao iniciar a página
document.addEventListener('DOMContentLoaded', async function() {
    const isAdmin = await checkAdmin();
    if (isAdmin) carregarTodosPedidos();
});

async function carregarTodosPedidos() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/all`, { credentials: 'include' });
        if (response.ok) {
            const pedidos = await response.json();
            renderizarPedidos(pedidos);
        } else {
            document.getElementById('ordersList').innerHTML = '<div class="alert alert-danger">Erro ao carregar pedidos</div>';
        }
    } catch (error) {
        document.getElementById('ordersList').innerHTML = '<div class="alert alert-danger">Erro de conexão com o servidor</div>';
    }
}

function renderizarPedidos(pedidos) {
    if (!pedidos || pedidos.length === 0) {
        document.getElementById('ordersList').innerHTML = '<div class="text-muted">Nenhum pedido encontrado</div>';
        return;
    }
    let html = '<table class="table order-table"><thead><tr><th>Data</th><th>Usuário</th><th>Produtos</th><th>Total</th><th></th></tr></thead><tbody>';
    pedidos.forEach(pedido => {
        const data = pedido.createdAt ? new Date(pedido.createdAt).toLocaleString('pt-BR') : '-';
        // Usuário pode ser objeto, string ou undefined
        let nomeUsuario = '-';
        if (pedido.user) {
            if (typeof pedido.user === 'object') {
                nomeUsuario = pedido.user.nome || pedido.user.email || pedido.user._id || '-';
            } else {
                nomeUsuario = pedido.user;
            }
        }
        let produtosHtml = '<ul class="mb-0">';
        (pedido.products || []).forEach(item => {
            let nomeProduto = '-';
            if (item.product) {
                if (typeof item.product === 'object') {
                    nomeProduto = item.product.nome || item.product._id || '-';
                } else {
                    nomeProduto = item.product;
                }
            }
            produtosHtml += `<li>${nomeProduto} <span class="badge bg-secondary">x${item.quantity}</span></li>`;
        });
        produtosHtml += '</ul>';
        html += `
            <tr>
                <td>${data}</td>
                <td>${nomeUsuario}</td>
                <td>${produtosHtml}</td>
                <td>R$ ${(pedido.total ? pedido.total.toFixed(2).replace('.', ',') : '-')}</td>
                <td><button class="btn btn-sm btn-danger" onclick="excluirPedido('${pedido._id}')"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    document.getElementById('ordersList').innerHTML = html;
}

window.excluirPedido = async function(pedidoId) {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${pedidoId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
            showOrderAlert('Pedido excluído com sucesso!', 'success');
            carregarTodosPedidos();
        } else {
            showOrderAlert(data.erro || 'Erro ao excluir pedido', 'danger');
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