// Définition de l'API
const express = require('express');
const app = express();

// Configuration du port d'écoute du serveur
const port = 3000;

app.use(express.json()); // Pour les données JSON
app.use(express.urlencoded({ extended: true })); // Pour les données URL encodées

// Définition des routes
const serveurRoutes = require('./routes/serveurRoutes');
app.use('/serveurs', serveurRoutes);

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

app.use((req, res) => {
    res.status(404).send('Page introuvable');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Une erreur est survenue sur le serveur');
});