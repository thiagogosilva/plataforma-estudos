require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const resumosRoutes = require('./routes/resumosRoutes');
const flashcardsRoutes = require('./routes/flashcardsRoutes');

app.use('/resumos', resumosRoutes);
app.use('/flashcards', flashcardsRoutes);

app.get('/', (req, res) => {
    res.send('🚀 API da Plataforma de Estudos está online!');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ Conectado ao MongoDB com sucesso');
    app.listen(PORT, () =>
    console.log(`🚀 Servidor rodando na porta ${PORT}`)
    );
})
.catch((err) => {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    process.exit(1); // impede que o servidor suba sem o banco
});