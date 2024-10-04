// Dépendances
const express = require('express');
const EnregistrementMinecraftController = require('../controller/enregistrementController');

const router = express.Router();

// Route enregistrement Minecraft
router.get('/minecraft', EnregistrementMinecraftController.getEnregistrements);

// Affiche un enregistrement par rapport à l'ID Discord
router.get('/minecraft/:idDiscord', EnregistrementMinecraftController.getEnregistrementByIdDiscord);

// Ajoute un enregistrement
router.post('/minecraft/add', EnregistrementMinecraftController.addEnregistrement);

// Supprime un enregistrement
router.delete('/minecraft/:idDiscord', EnregistrementMinecraftController.deleteEnregistrement);

// Export du module

module.exports = router;
