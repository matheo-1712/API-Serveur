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
const fs = require('fs').promises;
const path = require('path');
const { Rcon } = require('rcon-client');
const { exec } = require('child_process');
const { token } = require('../data/token.json');

// Variables

const ipServPrimaire = '194.164.76.165';
const ipServSecondaire = '194.164.76.165';

const { rconPassword, serveurPrimairePort, serveurSecondairePort } = require('../data/rcon.json'); const { get } = require('http');

const Serveur = {

    // Récupére les données du serveur depuis le JSON

    // Affiche la liste des serveurs
    getServeurs: function () {
        let data = require('../data/serveurs.json');
        if (data.length === 0) {
            return { message: 'Aucun serveur trouvé', status: false };
        }
        return data;
    },

    // Affiche un serveur par rapport à son ID
    getServeur: function (id_serv) {
        let data = require('../data/serveurs.json');
        let serveur = data.find(serveur => serveur.id_serv == id_serv);
        if (!serveur) {
            return { message: 'Serveur non trouvé', status: false };
        }
        return serveur;
    },

    // Affiche les serveurs actifs
    getServeursActifs: function () {
        let data = require('../data/serveurs.json');
        let serveurs = data.filter(serveur => serveur.actif == true);
        if (serveurs.length === 0) {
            return { message: 'Aucun serveur actif trouvé', status: false };
        }
        return serveurs;
    },

    // Affiche les serveurs par rapport à un jeu
    getServeursByJeu: function (jeu) {
        let data = require('../data/serveurs.json');
        // Filtre les serveurs par rapport au jeu et gère la casse
        let serveurs = data.filter(serveur => serveur.jeu.toLowerCase() == jeu.toLowerCase());
        if (serveurs.length === 0) {
            return { message: 'Aucun serveur trouvé pour ce jeu', status: false };
        }
        return serveurs;
    },

    // Affiche les serveurs Actif par rapport à un jeu
    getServeursActifsByJeu: function (jeu) {
        let data = require('../data/serveurs.json');
        let serveurs = data.filter(serveur => serveur.jeu == jeu && serveur.actif == true);
        if (serveurs.length === 0) {
            return { message: 'Aucun serveur actif trouvé pour ce jeu', status: false };
        }
        return serveurs;
    },

    // Obtenir les statistiques des joueurs
    getAllStatsPlayer: async function () {
        const dossierStats = path.resolve(__dirname, '../data/minecraft_stats');
        try {
            // Lire tous les fichiers dans le dossier spécifié avec fs.promises.readdir
            const fichiers = await fs.readdir(dossierStats);

            // Filtrer uniquement les fichiers JSON
            const fichiersJson = fichiers.filter(fichier => fichier.endsWith('.json'));

            // Parcourir chaque fichier JSON et lire son contenu
            const donneesJoueurs = [];
            for (const fichier of fichiersJson) {
                const cheminFichier = path.join(dossierStats, fichier);

                // Lire le fichier JSON
                const contenu = await fs.readFile(cheminFichier, 'utf-8');

                // Convertir le contenu JSON en objet JavaScript
                const donnees = JSON.parse(contenu);

                // Ajouter les données à un tableau
                donneesJoueurs.push(donnees);
            }

            // Retourner toutes les données
            return donneesJoueurs;
        } catch (err) {
            console.error('Erreur lors de la lecture des fichiers JSON :', err);
            throw err;
        }
    },

    // Ajoute un serveur
    addServeur: function (serveur) {
        let data = require('../data/serveurs.json')
        data.push(serveur)

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
            serveur.modpack_url = `https://antredesloutres.fr/fichiers/${serveur.nom_serv}.zip`;

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

    },

    getServeurPrimaire: async function (client_token) {
        try {
            let data = require('../data/serveurs.json');
            let serveurActif = require('../data/actif.json');

            // Trouve le serveur actif
            let serveur = data.find(serveur => serveur.id_serv === serveurActif.primaire);

            if (!serveur) {
                throw new Error("Serveur principal non trouvé.");
            }

            // Vérification du token pour l'exécution la fonction
            if (token === client_token) {
                // Assurez-vous que ipServPrimaire, serveurPrimairePort et rconPassword sont définis ailleurs
                const players = await getListPlayer(ipServPrimaire, serveurPrimairePort, rconPassword);

                // Récupère le nombre de joueurs connectés et les joueurs connectés
                serveur.nb_joueurs = players.count;
                serveur.players = players.players;
                serveur.online = players.online;

                // Renvoie le serveur
                return serveur;
            } else {
                return serveur;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du serveur principal:", error.message);
            return null; // ou gérez l'erreur autrement
        }
    },

    // Affiche le serveur secondaire actuellement actif
    getServeurSecondaire: async function (client_token) {
        try {
            let data = require('../data/serveurs.json');
            let serveurActif = require('../data/actif.json');

            // Trouve le serveur actif
            let serveur = data.find(serveur => serveur.id_serv === serveurActif.secondaire);

            if (!serveur) {
                throw new Error("Serveur principal non trouvé.");
            }

            // Vérification du token pour l'exécution la fonction
            if (token === client_token) {
                // Assurez-vous que ipServPrimaire, serveurPrimairePort et rconPassword sont définis ailleurs
                const players = await getListPlayer(ipServSecondaire, serveurSecondairePort, rconPassword);

                // Récupère le nombre de joueurs connectés et les joueurs connectés
                serveur.nb_joueurs = players.count;
                serveur.players = players.players;
                serveur.online = players.online;

                // Renvoie le serveur
                return serveur;
            } else {
                return serveur;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du serveur principal:", error.message);
            return null; // ou gérez l'erreur autrement
        }
    },
}

// Fonction utilitaire 

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

        return playersInfo;
    } catch (error) {
        // console.error('Erreur lors de la récupération des données via RCON:', error);
        const playersInfo = { count: 0, players: [], online: false };
        return playersInfo;
    }
}

// Fonction utilitaire pour extraire les données de la réponse RCON
function parseRconListResponse(response) {
    // La réponse a le format : "There are X of a max of Y players online: player1, player2, ..."
    const match = response.match(/There are (\d+) of a max of \d+ players online: (.*)/);
    // Réponse alternative : "There are 1 of a max of 20 players online: QuingAngel"
    const match2 = response.match(/There are (\d+) of a max of \d+ players online: (.+)/);

    if (match) {
        const playerCount = parseInt(match[1], 10);
        const players = match[2] ? match[2].split(', ').filter(Boolean) : [];
        const online = true;
        return { count: playerCount, players, online };
    } else if (match2) {
        const playerCount = parseInt(match2[1], 10);
        const players = match2[2] ? match2[2].split(', ').filter(Boolean) : [];
        const online = true;
        return { count: playerCount, players, online };
    } else {
        const online = false;
        return { count: 0, players: [], online };
    }
}

// Export du module
module.exports = Serveur;