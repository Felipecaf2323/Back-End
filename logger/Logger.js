const fs = require('fs');
const path = require('path');

// Caminho para o arquivo de log (na raiz do projeto)
const logPath = path.join(__dirname, '..', 'error.log');

// Função para registrar erros
function error(err) {
  const mensagem =
    `[${new Date().toLocaleString()}] ${err.stack || err.message || err}\n`;

  fs.appendFile(logPath, mensagem, (fsErr) => {
    if (fsErr) {
      console.error('Erro ao escrever no arquivo de log:', fsErr.message);
    }
  });
}

module.exports = { error };
