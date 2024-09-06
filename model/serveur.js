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
const fs = require('fs');
const path = require('path');
const { Rcon } = require('rcon-client');
const { exec } = require('child_process');
const { token } = require('../data/token.json');

// Variables

const ipServPrimaire = 'antredesloutres.fr';
const portServPrimaire = 25565;

const ipServSecondaire = 'antredesloutres.fr';
const portServSecondaire = 25564;

const { rconPassword, serveurPrimairePort, serveurSecondairePort } = require('../data/rcon.json');

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
            serveur.online = true;
        }).catch((error) => {
            serveur.online = false;
        });

        getListPlayer(ipServPrimaire, serveurPrimairePort, rconPassword).then(players => {
            serveur.players = players;
        }).catch((error) => {
            serveur.players = [];
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
            serveur.online = true;
        }).catch((error) => {
            serveur.online = false;
        });

        getListPlayer(ipServPrimaire, serveurSecondairePort, rconPassword).then(players => {
            serveur.players = players;
        }).catch((error) => {
            serveur.players = [];
        });

        // Renvoie le serveur
        return serveur;
    },

    // Ajoute un serveur
    addServeur: function (serveur) {
        let data = require('../data/serveurs.json');
        data.push(serveur);

        // Enregistre les données dans le fichier JSON
        fs.writeFileSync(path.resolve(__dirname, '../data/serveurs.json'), JSON.stringify(data, null, 4));

        return data;
    },

    // Supprime un serveur
    deleteServeur: function (id_serv) {
        let data = require('../data/serveurs.json');
        let index = data.findIndex(serveur => serveur.id_serv == id_serv);
        if (index != -1) {
            data.splice(index, 1);
            fs.writeFileSync(path.resolve(__dirname, '../data/serveurs.json'), JSON.stringify(data, null, 4));
            return { message: 'Serveur supprimé', status: true };
        } else {
            return { message: 'Serveur non trouvé', status: false };
        }
    },

    // Reçoit une requête POST d'instantiation d'un serveur
    installServeur: function (id_discord, id_serv, url_installeur) {
        let data = require('../data/serveurs.json');
        let serveur = data.find(serveur => serveur.id_serv == id_serv);

        // Vérifie si le serveur existe
        if (!serveur) {
            return false;
        }

        // Vérifie si le serveur est actif
        if (!serveur.actif) {
            return false;
        }

        // Execute le script d'installation du serveur en renvoyant l'id discord de l'utilisateur et les informations du serveur
        console.log(`Installation du serveur ${serveur.nom_serv} en cours...`);

        // Exécute le script d'installation Bash du serveur

        exec(`./scripts/serveur_install.sh ${id_discord} ${serveur.modpack_url} ${serveur.id_serv} ${serveur.nom_serv} ${serveur.jeu} ${serveur.version_serv} ${url_installeur} ${token}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erreur lors de l'installation: ${error.message}`);
                return false;
            }
            if (stderr) {
                console.error(`Erreur lors de l'installation: ${stderr}`);
                return false;
            }
            console.log(`Installation du serveur ${serveur.nom_serv} terminée`);

            // Met à jour l'url du modpack
            serveur.modpack_url=`https://antredesloutres.fr/fichiers/${serveur.nom_serv}.zip`;

            // Enregistre les données dans le fichier JSON
            fs.writeFileSync(path.resolve(__dirname, '../data/serveurs.json'), JSON.stringify(data, null, 4));
            console.log('Données crée par installServeur :', serveur);
        });


        return true;
    },

    // Reçoit une requête POST pour mettre à jour les server.properties

    modifServerProperties: function (id_serv, nom_serv, id_discord, serverProperties) {

        // Execute le script de modification du server.properties en renvoyant l'id discord de l'utilisateur et les informations du serveur
        console.log(`Modification du serveur ${nom_serv} avec l'id ${id_serv} en cours...`);

        /* Ordre des paramètres pour le script de modification du server.properties
        allow_flight = &1 # bool
        allow_nether = &2 # bool
        difficulty = &3 # str
        enforce_whitelist = &4 # bool
        gamemode = &5 # str
        hardcore = &6 # bool
        max_players = &7 # int
        pvp = &8 # bool
        spawn_protection = &9 # int
        level_type = &10 # str
        online_mode = &11 # bool

        discord_id = &12 # str
        server_id = &13 # int
        server_name = &14 # str
        */
        const { exec } = require('child_process');

        exec(`./scripts/update_server_properties.sh ${serverProperties.allow_flight} ${serverProperties.allow_nether} ${serverProperties.difficulty} ${serverProperties.enforce_whitelist} ${serverProperties.gamemode} ${serverProperties.hardcore} ${serverProperties.max_players} ${serverProperties.pvp} ${serverProperties.spawn_protection} ${serverProperties.level_type} ${serverProperties.online_mode} ${id_discord} ${id_serv} ${nom_serv}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erreur lors de la modification: ${error.message}`);
                return false;
            }
            if (stderr) {
                console.error(`Erreur lors de la modification: ${stderr}`);
                return false;
            }
            console.log(`Modification terminée: ${stdout} script executé`);
        });

        return true;

    }
}

async function getNbJoueurs(serverIP, serverPort) {
    try {
        // Interroger le serveur Minecraft
        const response = await status(serverIP, serverPort);

        // Afficher le nombre de joueurs connectés
        // console.log(`Nombre de joueurs connectés : ${response.players.online}`);
        return response.players.online;
    } catch (error) {
        // console.error('Erreur lors de la récupération des données:', error);
        return 0;
    }
}

// Fonction pour récupérer la liste des joueurs via RCON
async function getListPlayer(serverIP, serverPort, rconPassword) {
    try {
        // Connexion au serveur Minecraft via RCON
        const rcon = await Rcon.connect({
            host: serverIP,
            port: serverPort,
            password: rconPassword,
        });

        // Envoi de la commande 'list' pour obtenir la liste des joueurs
        const response = await rcon.send('list');

        // Fermeture de la connexion RCON
        await rcon.end();

        // La réponse contient le nombre de joueurs et leur nom
        // console.log(`Réponse RCON : ${response}`);

        // Extraction du nombre de joueurs et des noms
        const playersInfo = parseRconListResponse(response);

        // Affichage du nombre de joueurs connectés
        console.log(`[RCON] Nombre de joueurs connectés : ${playersInfo.count}`);

        // Retourne la liste des joueurs connectés
        return playersInfo.players;
    } catch (error) {
        // console.error('Erreur lors de la récupération des données via RCON:', error);
        return [];
    }
}

// Fonction utilitaire pour extraire les données de la réponse RCON
function parseRconListResponse(response) {
    // La réponse a le format : "There are X of a max of Y players online: player1, player2, ..."
    const match = response.match(/There are (\d+) of a max of \d+ players online: (.*)/);

    if (match) {
        const playerCount = parseInt(match[1], 10);
        const players = match[2] ? match[2].split(', ').filter(Boolean) : [];
        return { count: playerCount, players };
    } else {
        // Cas où il n'y a pas de joueurs en ligne ou réponse inattendue
        return { count: 0, players: [] };
    }
}


module.exports = Serveur;