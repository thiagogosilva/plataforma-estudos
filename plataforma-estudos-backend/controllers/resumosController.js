const Resumo = require('../models/resumosModels');

// GET /resumos - Buscar todos os resumos
exports.getResumos = async (req, res) => {
    try {
        const resumos = await Resumo.find();
        res.status(200).json(resumos);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar resumos', detalhes: err.message });
    }
};

// POST /resumos - Criar um novo resumo
exports.createResumo = async (req, res) => {
    try {
        const { titulo, conteudo } = req.body;

        // Validação básica
        if (!titulo || !conteudo) {
            return res.status(400).json({ erro: 'Título e conteúdo são obrigatórios' });
        }

        const novoResumo = new Resumo(req.body);
        await novoResumo.save();
        res.status(201).json(novoResumo);
    } catch (err) {
        res.status(400).json({ erro: 'Erro ao criar resumo', detalhes: err.message });
    }
};

// PUT /resumos/:id - Atualizar um resumo existente
exports.atualizarResumo = async (req, res) => {
    try {
        const { id } = req.params;

        const resumoAtualizado = await Resumo.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!resumoAtualizado) {
            return res.status(404).json({ erro: 'Resumo não encontrado' });
        }

        res.status(200).json(resumoAtualizado);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar resumo', detalhes: err.message });
    }
};

// DELETE /resumos/:id - Deletar um resumo existente
exports.deletarResumo = async (req, res) => {
    try {
        const { id } = req.params;

        const resumoRemovido = await Resumo.findByIdAndDelete(id);

        if (!resumoRemovido) {
            return res.status(404).json({ erro: 'Resumo não encontrado' });
        }

        res.status(200).json({ message: 'Resumo deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao deletar resumo', detalhes: err.message });
    }
};
