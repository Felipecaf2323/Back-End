// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginAlert = document.getElementById('loginAlert');
const registerAlert = document.getElementById('registerAlert');
const apiStatus = document.getElementById('apiStatus');

// Verificar status da API ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    checkApiStatus();
});

// Função para verificar status da API
async function checkApiStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
            apiStatus.innerHTML = '<span class="badge bg-success">Online</span>';
        } else {
            apiStatus.innerHTML = '<span class="badge bg-danger">Erro</span>';
        }
    } catch (error) {
        apiStatus.innerHTML = '<span class="badge bg-danger">Offline</span>';
    }
}

// Função para mostrar alertas
function showAlert(element, message, type = 'success') {
    element.className = `alert alert-${type}`;
    element.textContent = message;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Função para fazer login
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha: password }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            showAlert(loginAlert, 'Login realizado com sucesso!', 'success');
            setTimeout(() => {
                showDashboard();
            }, 1000);
        } else {
            showAlert(loginAlert, data.erro || 'Erro no login', 'danger');
        }
    } catch (error) {
        showAlert(loginAlert, 'Erro de conexão com o servidor', 'danger');
    }
}

// Função para fazer cadastro
async function register(name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome: name, email, senha: password }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            showAlert(registerAlert, 'Usuário cadastrado com sucesso!', 'success');
            // Limpar formulário
            registerForm.reset();
        } else {
            showAlert(registerAlert, data.erro || 'Erro no cadastro', 'danger');
        }
    } catch (error) {
        showAlert(registerAlert, 'Erro de conexão com o servidor', 'danger');
    }
}

// Função para verificar sessão
async function checkSession() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/session`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.logado) {
                return data.usuario;
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Função para mostrar dashboard
async function showDashboard() {
    const user = await checkSession();
    if (user) {
        // Verificar se o usuário é admin
        let isAdmin = false;
        try {
            const userInfoResponse = await fetch(`${API_BASE_URL}/users/${user.id}`, { credentials: 'include' });
            if (userInfoResponse.ok) {
                const userInfo = await userInfoResponse.json();
                isAdmin = userInfo.admin || false;
            }
        } catch (error) {
            console.error('Erro ao verificar status de admin:', error);
        }

        const userInfo = document.getElementById('userInfo');
        userInfo.innerHTML = `
            <div class="alert alert-info">
                <h6><i class="fas fa-user me-2"></i>Usuário Logado</h6>
                <p class="mb-1"><strong>Nome:</strong> ${user.nome}</p>
                <p class="mb-0"><strong>Email:</strong> ${user.email}</p>
                ${isAdmin ? '<p class="mb-0"><strong>Status:</strong> <span class="badge bg-warning">Administrador</span></p>' : ''}
            </div>
        `;
        
        // Mostrar/ocultar link de admin
        const adminLink = document.getElementById('adminPedidosLink');
        if (adminLink) {
            adminLink.style.display = isAdmin ? 'inline-block' : 'none';
        }
        
        const modal = new bootstrap.Modal(document.getElementById('dashboardModal'));
        modal.show();
    }
}

// Função para listar usuários
async function listUsers() {
    try {
        // Verificar se o usuário logado é admin
        let usuarioLogado = await checkSession();
        let isAdmin = false;
        if (usuarioLogado) {
            const userInfoResponse = await fetch(`${API_BASE_URL}/users/${usuarioLogado.id}`, { credentials: 'include' });
            if (userInfoResponse.ok) {
                const userInfo = await userInfoResponse.json();
                isAdmin = userInfo.admin || false;
            }
        }

        const response = await fetch(`${API_BASE_URL}/users`, {
            credentials: 'include'
        });

        if (response.ok) {
            const users = await response.json();
            const usersList = document.getElementById('usersList');
            
            if (users.length > 0) {
                let html = '<div class="list-group">';
                users.forEach(user => {
                    html += `
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-1">${user.nome}</h6>
                                    <small class="text-muted">${user.email}</small>
                                    ${user.admin ? '<span class="badge bg-warning ms-2">Admin</span>' : ''}
                                </div>
                                <div>
                                    <span class="badge bg-primary me-2">ID: ${user._id}</span>
                                    ${isAdmin && usuarioLogado.id !== user._id ? `
                                        <button class="btn btn-sm btn-${user.admin ? 'secondary' : 'success'} me-1" onclick="toggleAdmin('${user._id}', ${user.admin})">
                                            ${user.admin ? '<i class=\'fas fa-user-slash\'></i> Remover Admin' : '<i class=\'fas fa-user-shield\'></i> Tornar Admin'}
                                        </button>
                                        <button class="btn btn-sm btn-info me-1" onclick="editUser('${user._id}', '${user.nome}', '${user.email}')">
                                            <i class=\'fas fa-edit\'></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user._id}', '${user.nome}')">
                                            <i class=\'fas fa-trash\'></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                usersList.innerHTML = html;
            } else {
                usersList.innerHTML = '<p class="text-muted">Nenhum usuário encontrado</p>';
            }
        } else {
            const data = await response.json();
            document.getElementById('usersList').innerHTML = 
                `<div class="alert alert-danger">${data.erro}</div>`;
        }
    } catch (error) {
        document.getElementById('usersList').innerHTML = 
            '<div class="alert alert-danger">Erro ao carregar usuários</div>';
    }
}

// Função para promover/despromover admin
window.toggleAdmin = async function(userId, isAdmin) {
    if (!confirm(isAdmin ? 'Remover este usuário de admin?' : 'Tornar este usuário admin?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/admin`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin: !isAdmin }),
            credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
            showAlert(document.getElementById('usersList'), data.mensagem, 'success');
            listUsers();
        } else {
            showAlert(document.getElementById('usersList'), data.erro || 'Erro ao alterar admin', 'danger');
        }
    } catch (error) {
        showAlert(document.getElementById('usersList'), 'Erro de conexão com o servidor', 'danger');
    }
}

// Função para deletar usuário (apenas admin)
window.deleteUser = async function(userId, nome) {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}"? Esta ação não pode ser desfeita!`)) return;
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
            showAlert(document.getElementById('usersList'), data.mensagem, 'success');
            listUsers();
        } else {
            showAlert(document.getElementById('usersList'), data.erro || 'Erro ao excluir usuário', 'danger');
        }
    } catch (error) {
        showAlert(document.getElementById('usersList'), 'Erro de conexão com o servidor', 'danger');
    }
}

// Função para fazer logout
async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('dashboardModal'));
            modal.hide();
            
            // Mostrar alerta de sucesso
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success position-fixed';
            alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
            alertDiv.textContent = 'Logout realizado com sucesso!';
            document.body.appendChild(alertDiv);
            
            setTimeout(() => {
                alertDiv.remove();
            }, 3000);
        }
    } catch (error) {
        console.error('Erro no logout:', error);
    }
}

// Event Listeners
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    login(email, password);
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    register(name, email, password);
});

// Funções para mostrar/ocultar formulários
function showLoginForm() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('registerSection').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
}

// Verificar se o usuário já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', async function() {
    const user = await checkSession();
    if (user) {
        showDashboard();
    }
});

// Função para abrir modal de edição de usuário (admin)
window.editUser = function(userId, nome, email) {
    document.getElementById('editUserId').value = userId;
    document.getElementById('editUserName').value = nome;
    document.getElementById('editUserEmail').value = email;
    document.getElementById('editUserAlert').style.display = 'none';
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
}

// Lógica do formulário de edição de usuário
const editUserForm = document.getElementById('editUserForm');
if (editUserForm) {
    editUserForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const userId = document.getElementById('editUserId').value;
        const nome = document.getElementById('editUserName').value;
        const email = document.getElementById('editUserEmail').value;
        const alertDiv = document.getElementById('editUserAlert');
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email }),
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                alertDiv.className = 'alert alert-success';
                alertDiv.textContent = data.mensagem;
                alertDiv.style.display = 'block';
                setTimeout(() => {
                    alertDiv.style.display = 'none';
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
                    modal.hide();
                    listUsers();
                }, 1200);
            } else {
                alertDiv.className = 'alert alert-danger';
                alertDiv.textContent = data.erro || 'Erro ao editar usuário';
                alertDiv.style.display = 'block';
            }
        } catch (error) {
            alertDiv.className = 'alert alert-danger';
            alertDiv.textContent = 'Erro de conexão com o servidor';
            alertDiv.style.display = 'block';
        }
    });
} 