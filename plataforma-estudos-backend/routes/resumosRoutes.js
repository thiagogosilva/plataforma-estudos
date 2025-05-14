const express = require('express');
const router = express.Router();
const resumosController = require('../controllers/resumosController');


// Rota para buscar todos os resumos
router.get('/', resumosController.getResumos);

// Rota para criar um novo resumo
router.post('/', resumosController.createResumo);

// Rota para atualizar um resumo existente
router.put('/:id', resumosController.atualizarResumo);

// Rota para deletar um resumo existente
router.delete('/:id', resumosController.deletarResumo);

module.exports = router;