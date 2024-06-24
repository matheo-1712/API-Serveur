/* Structure JSON de la table serveur :

{
  "id_serv": "12345",
  "nom_serv": "Nom du Serveur",
  "modpack": "Nom du Modpack",
  "modpack_url": "http://example.com/modpack",
  "embedColor": "#FFFFFF",
  "embedImage": "http://example.com/image.png",
  "caption": "Description ou légende",
  "nom_monde": "Nom du Monde",
  "version_serv": "1.0.0",
  "path_serv": "/chemin/du/serveur",
  "actif": true,
  "nb_joueurs": 10
}

*/

// Dépendances
const e = require('express');

const Serveur = {
    // Récupére les données du serveur depuis le JSON

    // Affiche la liste des serveurs
    getServeurs: function() {
        let data = require('../data/serveurs.json');
        return data;
    },

    // Affiche un serveur par rapport à son ID
    getServeur: function(id_serv) {
        let data = require('../data/serveurs.json');
        let serveur = data.find(serveur => serveur.id_serv == id_serv);
        return serveur;
    },
}

module.exports = Serveur;