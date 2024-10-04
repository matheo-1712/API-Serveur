// Description: Routes pour les investisseurs
const express = require('express');
const ServeurInvController = require('../controller/serveurInvController');

const router = express.Router();

// Affiche la liste des investisseurs
router.get('/', ServeurInvController.getInvestisseurs);

// Affiche un investisseur
router.get('/:id_discord', ServeurInvController.getInvestisseur);

// Ajoute un investisseur
router.post('/add', ServeurInvController.addInvestisseur);

// Supprime un investisseur
router.delete('/:id_discord', ServeurInvController.deleteInvestisseur);

// Ajoute l'id d'un serveur à un investisseur
router.post('/serveur/addServeur', ServeurInvController.addServeurInvestisseur);

// Supprime l'id d'un serveur à un investisseur
router.post('/serveur/deleteServeur', ServeurInvController.deleteServeurInvestisseur);

// Export du module
module.exports = router;
