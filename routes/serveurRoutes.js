const express = require('express');
const ServeurController = require('../controller/serveurController');

const router = express.Router();

// Affiche la liste des serveurs
router.get('/', ServeurController.getServeurs);

// Affiche un serveur
router.get('/infos/:id_serv', ServeurController.getServeur);

router.get('/actifs', ServeurController.getServeursActifs);

// Affiche les serveurs par rapport à un jeu
router.get('/jeu/:jeu', ServeurController.getServeursByJeu);

// Affiche les serveurs Actifs par rapport à un jeu
router.get('/actifs/jeu/:jeu', ServeurController.getServeursActifsByJeu);

// Affiche toutes les statistiques des serveurs
router.get('/stats', ServeurController.getAllStatsPlayer);

// Affiche les statistiques d'un serveur par rapport à son ID ou son nom
router.get('/stats/:id_serv', ServeurController.getStatsPlayerByServeur);

// Affiche les statistiques d'un joueur par rapport à son pseudo ou son UUID  
router.get('/stats/player/:pseudo', ServeurController.getStatsPlayer);

// Reçoit une requête POST de lancement du serveur
router.post('/start', ServeurController.startServeur);

// Reçoit une requête POST d'arrêt du serveur
router.post('/stop', ServeurController.stopServeur);

// Reçoit une requête POST d'ajout d'un serveur dans le JSON
router.post('/add', ServeurController.addServeur);

// Reçoit une requête de suppression d'un serveur
router.delete('/delete', ServeurController.deleteServeur);

// Reçoit une requête POST avec l'id du serveur et l'ID discord de l'utilisateur, url_Installateur qu'il faut installer
router.post('/installation', ServeurController.installServeur);

// Reçoit une requête POST pour mettre à jour les server.properties
router.post('/properties', ServeurController.modifServerProperties);

// Reçoit une requête affichant le serveur principal actuellement actif
router.post('/primaire', ServeurController.getServeurPrimaire);

// Reçoit une requête affichant le serveur secondaire actuellement actif
router.post('/secondaire', ServeurController.getServeurSecondaire);

// Export du module
module.exports = router;