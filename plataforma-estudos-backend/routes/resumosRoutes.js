const express = require('express');
const router = express.Router();
const resumosController = require('../controllers/resumosController');

router.get('/', resumosController.getResumos);
router.post('/', resumosController.createResumo);

module.exports = router;