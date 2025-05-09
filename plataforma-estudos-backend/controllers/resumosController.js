const Resumo = require('../models/resumosModels');

exports.getResumos = async (req, res) => {
    try {
        const resumos = await Resumo.find();
        res.json(resumos);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar resumos' });
    }
};

exports.createResumo = async (req, res) => {
    try {
        const novoResumo = new Resumo(req.body);
        await novoResumo.save();
        res.status(201).json(novoResumo);
    } catch (err) {
        res.status(400).json({ error: 'Erro ao criar Resumo' });
    }
};