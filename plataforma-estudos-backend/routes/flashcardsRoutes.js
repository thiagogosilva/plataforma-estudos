const express = require('express');
const router = express.Router();
const flashcardsController = require('../controllers/flashcardsController');

// Rota para buscar todos os flashcards
router.get('/', flashcardsController.getFlashcards);

// Rota para criar um novo flashcard
router.post('/', flashcardsController.createFlashcard);

// Rota para atualizar um flashcard existente
router.put('/:id', flashcardsController.atualizarFlashcard);

// Rota para deletar um flashcard existente
router.delete('/:id', flashcardsController.deletarFlashcard);

module.exports = router;
