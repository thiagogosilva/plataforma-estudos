const Flashcard = require('../models/flashcardsModels');

// GET /flashcards - Buscar todos os flashcards
exports.getFlashcards = async (req, res) => {
    try {
        const flashcards = await Flashcard.find();
        res.status(200).json(flashcards);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar flashcards' });
    }
};

// POST /flashcards - Criar um novo flashcard
exports.createFlashcard = async (req, res) => {
    try {
        const novoFlashcard = new Flashcard(req.body);
        await novoFlashcard.save();
        res.status(201).json(novoFlashcard);
    } catch (err) {
        res.status(400).json({ erro: 'Erro ao criar Flashcard' });
    }
};

// PUT /flashcards/:id - Atualizar um flashcard existente
exports.atualizarFlashcard = async (req, res) => {
    try {
        const { id } = req.params;

        const flashcardAtualizado = await Flashcard.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!flashcardAtualizado) {
            return res.status(404).json({ erro: 'Flashcard não encontrado' });
        }

        res.status(200).json(flashcardAtualizado);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar flashcard', detalhes: err.message });
    }
};

// DELETE /flashcards/:id - Deletar um flashcard existente
exports.deletarFlashcard = async (req, res) => {
    try {
        const { id } = req.params;

        const flashcardRemovido = await Flashcard.findByIdAndDelete(id);

        if (!flashcardRemovido) {
            return res.status(404).json({ erro: 'Flashcard não encontrado' });
        }

        res.status(200).json({ mensagem: 'Flashcard deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao deletar flashcard', detalhes: err.message });
    }
};
