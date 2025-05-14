const mongoose = require('mongoose');

const ResumoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'O título é obrigatório.'],
        trim: true,
        minlength: [5, 'O título deve ter no mínimo 5 caracteres.'],
        maxlength: [150, 'O título deve ter no máximo 150 caracteres.'],
    },
    conteudo: {
        type: String,
        required: [true, 'O conteúdo é obrigatório.'],
        trim: true,
        minlength: [10, 'O conteúdo deve ter no mínimo 10 caracteres.'],
        maxlength: [5000, 'O conteúdo deve ter no máximo 5000 caracteres.'],
    },
    tags: {
        type: [String],
        default: [],
    }, 
}, { timestamps: true });

module.exports = mongoose.model('Resumo', ResumoSchema);
