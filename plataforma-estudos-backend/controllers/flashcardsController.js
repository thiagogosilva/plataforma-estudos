const Flashcard = require('../models/flashcardsModels');

exports.getFlashcards = async (req, res) => {
    try {
        const flashcards = await Flashcard.find();
        res.json(flashcards);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar flashcards' });
    }
};

exports.createFlashcard = async (req, res) => {
    try {
        const novoFlashcard = new Flashcard(req.body);
        await novoFlashcard.save();
        res.status(201).json(novoFlashcard);
    } catch (err) {
        res.status(400).json({ error: 'Erro ao criar Flashcard' });
    }
};