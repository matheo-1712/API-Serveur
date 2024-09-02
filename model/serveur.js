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
const { status } = require('minecraft-server-util'); // Module npm minecraft-server-util

// Variables

const ipServPrimaire = 'vanilla.antredesloutres.fr';
const portServPrimaire = 25565;

const ipServSecondaire = 'antredesloutres.fr';
const portServSecondaire = 25564;

const Serveur = {

    // Récupére les données du serveur depuis le JSON

    // Affiche la liste des serveurs
    getServeurs: function () {
        let data = require('../data/serveurs.json');
        return data;
    },

    // Affiche un serveur par rapport à son ID
    getServeur: function (id_serv) {
        let data = require('../data/serveurs.json');
        let serveur = data.find(serveur => serveur.id_serv == id_serv);
        return serveur;
    },

    // Affiche les serveurs actifs
    getServeursActifs: function () {
        let data = require('../data/serveurs.json');
        let serveurs = data.filter(serveur => serveur.actif == true);
        return serveurs;
    },

    // Affiche les serveurs par rapport à un jeu
    getServeursByJeu: function (jeu) {
        let data = require('../data/serveurs.json');
        let serveurs = data.filter(serveur => serveur.jeu == jeu);
        return serveurs;
    },

    // Affiche les serveurs Actif par rapport à un jeu
    getServeursActifsByJeu: function (jeu) {
        let data = require('../data/serveurs.json');
        let serveurs = data.filter(serveur => serveur.jeu == jeu && serveur.actif == true);
        return serveurs;
    },

    // Affiche le serveur principal actuellement actif
    getServeurPrimaire: function () {
        let data = require('../data/serveurs.json');
        let serveurActif = require('../data/actif.json');
        let serveur = data.find(serveur => serveur.id_serv == serveurActif.primaire);

        // Récupère le nombre de joueurs connectés
        getNbJoueurs(ipServPrimaire, portServPrimaire).then(nb_joueurs => {
            serveur.nb_joueurs = nb_joueurs;
            serveur.online = 1;
        }).catch((error) => {
            serveur.online = 0;
        });

        // Renvoie le serveur
        return serveur;
    },

    // Affiche le serveur secondaire actuellement actif
    getServeurSecondaire: function () {
        let data = require('../data/serveurs.json');
        let serveurActif = require('../data/actif.json');
        let serveur = data.find(serveur => serveur.id_serv == serveurActif.secondaire);

        // Récupère le nombre de joueurs connectés
        getNbJoueurs(ipServSecondaire, portServSecondaire).then(nb_joueurs => {
            serveur.nb_joueurs = nb_joueurs;
            serveur.online = 1;
        }).catch((error) => {
            serveur.online = 0;
        });

        // Renvoie le serveur
        return serveur;
    },

    // Inscrire des données dans le JSON

    // Ajoute un serveur
    addServeur: function (serveur) {
        let data = require('../data/serveurs.json');
        data.push(serveur);
        return data;
    },
}

async function getNbJoueurs(serverIP, serverPort) {
    try {
        // Interroger le serveur Minecraft
        const response = await status(serverIP, serverPort);

        // Afficher le nombre de joueurs connectés
        console.log(`Nombre de joueurs connectés : ${response.players.online}`);
        return response.players.online;
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return 0;
    }
}

module.exports = Serveur;