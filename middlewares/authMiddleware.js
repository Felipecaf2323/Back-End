// middlewares/authMiddleware.js
function autenticar(req, res, next) {
    if (req.session && req.session.user) {
        next(); // Usuário logado, pode continuar
    } else {
        res.status(401).json({ erro: 'Acesso não autorizado. Faça login primeiro.' });
    }
}

module.exports = autenticar;
