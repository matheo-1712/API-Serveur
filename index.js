// Définition de l'API
const express = require('express');
const app = express();
const fs = require('fs');

// Configuration du port d'écoute du serveur
const port = 3000;

app.use(express.json()); // Pour les données JSON
app.use(express.urlencoded({ extended: true })); // Pour les données URL encodées

// Renvoie si l'API est en ligne
app.get('/', (req, res) => {
    res.json({ status: 'API en ligne' });
});

// Définition des routes
const serveurRoutes = require('./routes/serveurRoutes');
app.use('/serveurs', serveurRoutes);

const serveurInvRoutes = require('./routes/serveurInvRoutes');
app.use('/investisseurs', serveurInvRoutes);

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

// En cas de changement dans les JSON redémarre le serveur
fs.watchFile('./data/serveurs.json', (curr, prev) => {
    console.log('Le fichier serveurs.json a été modifié');
    delete require.cache[require.resolve('./data/serveurs.json')];
});

fs.watchFile('./data/actif.json', (curr, prev) => {
    console.log('Le fichier actif.json a été modifié');
    delete require.cache[require.resolve('./data/actif.json')];
});

fs.watchFile('./data/serveurInvestisseur.json', (curr, prev) => {
    console.log('Le fichier serveurInvestisseur.json a été modifié');
    delete require.cache[require.resolve('./data/serveurInvestisseur.json')];
});

