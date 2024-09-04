const Serveur = require('../model/serveur');
const { token } = require('../data/token.json');
const e = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Définir un objet controller

const ServeurController = {

    // Affiche la liste des serveurs
    getServeurs: function (req, res) {
        let data = Serveur.getServeurs();
        res.json(data);
    },

    // Affiche un serveur
    getServeur: function (req, res) {
        let id_serv = req.params.id_serv;
        let data = Serveur.getServeur(id_serv);
        res.json(data);
    },

    // Affiche les serveurs actifs
    getServeursActifs: function (req, res) {
        let data = Serveur.getServeursActifs();
        res.json(data);
    },

    // Affiche les serveurs par rapport à un jeu
    getServeursByJeu: function (req, res) {
        let jeu = req.params.jeu;
        let data = Serveur.getServeursByJeu(jeu);
        res.json(data);
    },

    // Affiche les serveurs Actif par rapport à un jeu
    getServeursActifsByJeu: function (req, res) {
        let jeu = req.params.jeu;
        let data = Serveur.getServeursActifsByJeu(jeu);
        res.json(data);
    },

    // Affiche le serveur principal actuellement actif
    getServeurPrimaire: function (req, res) {
        let data = Serveur.getServeurPrimaire();
        res.json(data);
    },

    // Affiche le serveur secondaire actuellement actif
    getServeurSecondaire: function (req, res) {
        let data = Serveur.getServeurSecondaire();
        res.json(data);
    },

    // Reçoit une requête POST de lancement du serveur
    startServeur: function (req, res) {
        const { id_serv, client_token } = req.body;
        const data = Serveur.getServeur(id_serv);
        let screenName = '';

        // Récupère l'ID primaire dans le actif.json
        const idPrimaire = require('../data/actif.json').primaire;


        if (token !== client_token || !client_token) {
            console.log(`Token invalide : ${client_token}`);
            return res.status(401).json({ error: 'Token invalide' });
        } else {
            console.log(`Token client valide !`);
        }

        if (!data) {
            return res.status(404).json({ error: 'Serveur non trouvé' });
        }

        try {
            if (id_serv == idPrimaire) {
                screenName = 'serv-primaire';
            } else {
                // Nom du screen à utiliser
                screenName = 'serv-secondaire';
            }
            // Récupère le chemin du script de lancement du serveur
            const scriptPath = data.path_serv;
            const scriptName = data.start_script

            // Vérifie si le serveur est déjà démarré
            exec(`screen -list | grep "${screenName}"`, (error, stdout, stderr) => {
                if (stdout.includes(screenName)) {
                    console.log(`Le serveur ${data.nom_serv} est déjà démarré.`);
                    return res.status(200).json({ message: 'Serveur déjà démarré', status: '0' });
                } else {
                    // Exécution du script .sh dans un screen avec un nom spécifique
                    const command = `screen -S ${screenName} -d -m bash -c '${scriptPath}${scriptName}'`;

                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Erreur lors du lancement du serveur : ${error}`);
                            return res.status(500).json({ error: 'Erreur lors du lancement du serveur' });
                        }
                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);
                        return res.status(200).json({ message: 'Serveur démarré', status: '1' });
                    });

                    // Écrire l'ID du serveur dans le fichier actif.json et dans la données "secondaire": ""
                    try {

                        // Vérifie si l'id du serveur est le primaire et si c'est le cas, il ne faut pas écrire dans le secondaire
                        if (id_serv == idPrimaire) {
                            return console.log('Le serveur demandé est le serveur primaire, donc pas d\'écriture dans le secondaire');
                        }


                        const dirPath = path.join(__dirname, '../data');
                        const filePath = path.join(dirPath, 'actif.json');

                        // Check if directory exists, if not create it
                        if (!fs.existsSync(dirPath)) {
                            fs.mkdirSync(dirPath, { recursive: true });
                        }

                        // Check if file exists, if not create it
                        if (!fs.existsSync(filePath)) {
                            fs.writeFileSync(filePath, JSON.stringify({ secondaire: '' }, null, 2));
                        }

                        // Read the JSON file
                        const actif = require(filePath);
                        actif.secondaire = id_serv;

                        // Write back to the JSON file
                        fs.writeFileSync(filePath, JSON.stringify(actif, null, 2));
                    } catch (error) {
                        console.error(error);
                        return res.status(500).json({ error: "Erreur lors de l'écriture du serveur actif" });
                    }
                }
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erreur lors du lancement du serveur' });
        }
    },

    // Reçoit une requête POST d'arrêt du serveur
    stopServeur: function (req, res) {
        const { id_serv, client_token } = req.body;
        const data = Serveur.getServeur(id_serv);
        let screenName = '';

        // Récupère l'ID primaire dans le actif.json
        const idPrimaire = require('../data/actif.json').primaire;

        // récupère l'ID 

        if (token !== client_token || !client_token) {
            console.log(`Token invalide : ${client_token}`);
            return res.status(401).json({ error: 'Token invalide' });
        } else {
            console.log(`Token client valide !`);
        }

        if (!data) {
            return res.status(404).json({ error: 'Serveur non trouvé' });
        }

        try {
            if (id_serv == idPrimaire) {
                screenName = 'serv-primaire';
            } else {
                // Nom du screen à utiliser
                screenName = 'serv-secondaire';
            }
            // Vérifie si le serveur est déjà démarré
            exec(`screen -list | grep "${screenName}"`, (error, stdout, stderr) => {
                if (stdout.includes(screenName)) {
                    // Vérifie le type de jeu
                    if (data.jeu == 'Minecraft') {

                        // Envoie la commande stop au serveur
                        exec(`screen -S ${screenName} -X stuff 'stop^M'`, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Erreur lors de l'arrêt du serveur : ${error}`);
                                return res.status(500).json({ error: 'Erreur lors de l\'arrêt du serveur' });
                            }
                            console.log(`stdout: ${stdout}`);
                            console.error(`stderr: ${stderr}`);
                            return res.status(200).json({ message: 'Serveur arrêté' });
                        });
                    } else {
                        exec(`screen -S ${screenName} -X quit`, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Erreur lors de l'arrêt du serveur : ${error}`);
                                return res.status(500).json({ error: 'Erreur lors de l\'arrêt du serveur' });
                            }
                            console.log(`stdout: ${stdout}`);
                            console.error(`stderr: ${stderr}`);
                            return res.status(200).json({ message: 'Serveur arrêté' });
                        });
                    }
                } else {
                    console.log(`Le serveur ${data.nom_serv} n'est pas démarré.`);
                    return res.status(200).json({ message: 'Serveur non démarré' });
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erreur lors de l\'arrêt du serveur' });
        }
    },

    // Ajoute un serveur

    /* Typo d'un json de serveur 

    "id_serv": "0",
    "jeu": "Minecraft",
    "nom_serv": "La Vanilla",
    "modpack": "Minecraft Vanilla",
    "modpack_url": "https://www.minecraft.net/fr-fr",
    "embedColor": "#9adfba",
    "nom_monde": "world",
    "version_serv": "1.21",
    "path_serv": "/home/serveurs/minecraft/vanilla/",
    "start_script": "start.sh",
    "administrateur": "Azertor",
    "actif": true

    */

    addServeur: function (req, res) {
        try {
            // Destructuration des données envoyées dans la requête
            const {
                client_token,
                jeu,
                nom_serv,
                modpack,
                modpack_url,
                embedColor,
                version_serv,
                path_serv,
                administrateur,
            } = req.body;
    
            // Vérification des données obligatoires
            if (!jeu || !nom_serv || !modpack || !modpack_url || !embedColor || !version_serv || !path_serv || !administrateur) {
                return res.status(400).json({ error: 'Données manquantes' });
            }
            
            // Vérification du token client
            if (token !== client_token || !client_token) {
                console.log(`Token invalide : ${client_token}`);
                return res.status(401).json({ error: 'Token invalide' });
            } else {
                console.log(`Token client valide !`);
            }

            // Récupération des serveurs existants
            const data = Serveur.getServeurs();
            
            // Gestion du cas où il n'y a pas encore de serveurs
            const lastId = data.length > 0 ? data[data.length - 1].id_serv : 0;
            const newId = parseInt(lastId) + 1;

            // Données par défaut
            const defaultActif = true;
            const defaultStartScript = 'start.sh';
            const defaultNomMonde = 'world';
    
            // Création du nouvel objet serveur
            const serveur = {
                id_serv: newId,
                jeu,
                nom_serv,
                modpack,
                modpack_url,
                embedColor,
                nom_monde: defaultNomMonde,
                version_serv,
                path_serv,
                start_script: defaultStartScript,
                administrateur,
                actif: defaultActif
            };
    
            // Ajout du nouveau serveur
            Serveur.addServeur(serveur);

            // Réponse avec succès
            res.status(201).json({
                message: 'Serveur ajouté avec succès',
                serveur
            });
    
        } catch (error) {
            // Gestion des erreurs
            console.error('Erreur lors de l\'ajout du serveur :', error);
            res.status(500).json({
                message: 'Erreur serveur',
                error: error.message
            });
        }
    }
}

module.exports = ServeurController;
