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

    // Affiche les serveurs actifs
    getServeursActifs: function() {
        let data = require('../data/serveurs.json');
        let serveurs = data.filter(serveur => serveur.actif == true);
        return serveurs;
    },

    // Affiche les serveurs par rapport à un jeu
    getServeursByJeu: function(jeu) {
        let data = require('../data/serveurs.json');
        let serveurs = data.filter(serveur => serveur.jeu == jeu);
        return serveurs;
    },

    // Affiche les serveurs Actif par rapport à un jeu
    getServeursActifsByJeu: function(jeu) {
        let data = require('../data/serveurs.json');
        let serveurs = data.filter(serveur => serveur.jeu == jeu && serveur.actif == true);
        return serveurs;
    },

    // Affiche le serveur principal actuellement actif
    getServeurPrimaire: function() {
        let data = require('../data/serveurs.json');
        let serveurActif = require('../data/actif.json');
        let serveur = data.find(serveur => serveur.id_serv == serveurActif.primaire);
        return serveur;
    },

    // Affiche le serveur secondaire actuellement actif
    getServeurSecondaire: function() {
        let data = require('../data/serveurs.json');
        let serveurActif = require('../data/actif.json');
        let serveur = data.find(serveur => serveur.id_serv == serveurActif.secondaire);
        return serveur;
    },

    // Inscrire des données dans le JSON

    // Ajoute un serveur
    addServeur: function(serveur) {
        let data = require('../data/serveurs.json');
        data.push(serveur);
        return data;
    },
}

module.exports = Serveur;