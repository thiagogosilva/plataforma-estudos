const mongoose = require('mongoose');

const ResumoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    conteudo: { type: String, required: true },
    tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Resumo', ResumoSchema);
