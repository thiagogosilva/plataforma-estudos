const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
    pergunta: { type: String, required: true },
    resposta: { type: String, required: true },
    tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', FlashcardSchema);
