const Serveur = require('../model/serveur');
const { token } = require('../data/token.json');
const e = require('express');
const { exec } = require('child_process');

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

    // Reçoit une requête POST de lancement du serveur
    startServeur: function (req, res) {
        const { id_serv, client_token } = req.body;
        const data = Serveur.getServeur(id_serv);

        if (token !== client_token || !client_token) {
            console.log(`Token invalide : ${token}`);
            return res.status(401).json({ error: 'Token invalide' });
        } else {
            console.log(`Token client valide !`);
        }

        if (!data) {
            return res.status(404).json({ error: 'Serveur non trouvé' });
        }

        try {
            // Nom du screen à utiliser
            const screenName = 'serveur';
            // Récupère le chemin du script de lancement du serveur
            const path = data.path_serv;
        
            // Vérifie si le serveur est déjà démarré
            exec(`screen -list | grep "${screenName}"`, (error, stdout, stderr) => {
                if (stdout.includes(screenName)) {
                    console.log(`Le serveur ${data.nom_serv} est déjà démarré.`);
                    return res.status(200).json({ message: 'Serveur déjà démarré' });
                } else {
                    // Exécution du script .sh dans un screen avec un nom spécifique
                    const command = `screen -S ${screenName} -d -m bash -c '${path}'`;
        
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Erreur lors du lancement du serveur : ${error}`);
                            return res.status(500).json({ error: 'Erreur lors du lancement du serveur' });
                        }
                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);
                        return res.status(200).json({ message: 'Serveur démarré' });
                    });
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erreur lors du lancement du serveur' });
        }
    }
}

module.exports = ServeurController;
