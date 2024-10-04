const serveurInvestisseur = require('../model/serveurInvestisseur');
const { token } = require('../data/token.json');

const ServeurInvController = {

    // Affiche la liste des investisseurs
    getInvestisseurs: function (req, res) {
        let investisseurs = serveurInvestisseur.getInvestisseurs();
        res.json(investisseurs);
    },

    // Affiche un investisseur
    getInvestisseur: function (req, res) {
        let id_discord = req.params.id_discord;
        let investisseur = serveurInvestisseur.getInvestisseur(id_discord);
        if (investisseur) {
            res.json(investisseur);
        } else {
            res.status(404).json({ message: 'Investisseur non trouvé' });
        }
    },

    // Ajoute un investisseur
    addInvestisseur: function (req, res) {
        const { id_discord, client_token } = req.body;
        let response = serveurInvestisseur.addInvestisseur(id_discord, client_token);
        res.json(response);
    },

    // Supprime un investisseur
    deleteInvestisseur: function (req, res) {
        let id_discord = req.params.id_discord;
        let client_token = req.body.client_token;
        let response = serveurInvestisseur.deleteInvestisseur(id_discord, client_token);
        res.json(response);
    },

    // Ajoute l'id d'un serveur à un investisseur
    addServeurInvestisseur: function (req, res) {
        const { id_discord, id_serv, client_token } = req.body;
        if (token !== client_token) {
            res.json({ message: 'Token invalide', status: false });
            return;
        }

        let response = serveurInvestisseur.addServeurInvestisseur(id_discord, id_serv, client_token);
        res.json(response);
    },

    // Supprime l'id d'un serveur à un investisseur
    deleteServeurInvestisseur: function (req, res) {
        const { id_discord, id_serv, client_token } = req.body;
        if (token !== client_token) {
            res.json({ message: 'Token invalide', status: false });
            return;
        }

        let response = serveurInvestisseur.deleteServeurInvestisseur(id_discord, id_serv, client_token);
        res.json(response);
    }
};

module.exports = ServeurInvController;
