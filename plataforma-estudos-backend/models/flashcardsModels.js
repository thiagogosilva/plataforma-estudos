const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
    pergunta: { 
        type: String, 
        required: [true, 'A pergunta é obrigatória.'],
        trim: true,
        minlength: [5, 'A pergunta deve ter no mínimo 5 caracteres.'],
        maxlength: [200, 'A pergunta deve ter no máximo 200 caracteres.'],
    },
    resposta: { 
        type: String,
        required: [true, 'A resposta é obrigatória.'],
        trim: true,
        minlength: [5, 'A resposta deve ter no mínimo 5 caracteres.'],
        maxlength: [1000, 'A resposta deve ter no máximo 1000 caracteres.'], 
    },
    tags: {
        type: [String],
        default: [],
    },
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', FlashcardSchema);
