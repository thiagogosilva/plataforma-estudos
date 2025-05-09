const express = require('express');
const router = express.Router();
const flashcardsController = require('../controllers/flashcardsController');

router.get('/', flashcardsController.getFlashcards);
router.post('/', flashcardsController.createFlashcard);

module.exports = router;
