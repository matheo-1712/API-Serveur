const express = require('express');
const ServeurController = require('../controller/serveurController');

const router = express.Router();

// Affiche la liste des serveurs
router.get('/', ServeurController.getServeurs);

// Affiche un serveur
router.get('/:id_serv', ServeurController.getServeur);

// Reçoit une requête POST de lancement du serveur
router.post('/start', ServeurController.startServeur);

// Export du module
module.exports = router;