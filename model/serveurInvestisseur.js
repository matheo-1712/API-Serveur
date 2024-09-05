const fs = require('fs');
const path = require('path');
const { token } = require('../data/token.json');

const serveurInvestisseur = {

    // Récupère la liste des investisseurs
    getInvestisseurs: function () {
        let data = require('../data/serveurInvestisseur.json');
        return data;
    },

    // Récupère un investisseur par rapport à son ID Discord
    getInvestisseur: function (id_discord) {
        let data = require('../data/serveurInvestisseur.json');
        let investisseur = data[id_discord];
        return investisseur || null;
    },

    // Ajoute un investisseur avec une liste vide de serveurs
    addInvestisseur: function (id_discord, client_token) {
        if (token !== client_token) {
            return { message: 'Token invalide', status: false };
        }

        let data = require('../data/serveurInvestisseur.json');
        if (!data[id_discord]) {
            data[id_discord] = []; // Crée une entrée avec une liste vide
        } else {
            return { message: 'Investisseur déjà existant', status: false };
        }

        fs.writeFileSync(path.resolve(__dirname, '../data/serveurInvestisseur.json'), JSON.stringify(data, null, 4));
        return { message: 'Investisseur ajouté', status: true };
    },

    // Supprime un investisseur
    deleteInvestisseur: function (id_discord, client_token) {
        if (token !== client_token) {
            return { message: 'Token invalide', status: false };
        }

        let data = require('../data/serveurInvestisseur.json');
        if (!data[id_discord]) {
            return { message: 'Investisseur non trouvé', status: false };
        }

        delete data[id_discord];
        fs.writeFileSync(path.resolve(__dirname, '../data/serveurInvestisseur.json'), JSON.stringify(data, null, 4));
        return { message: 'Investisseur supprimé', status: true };
    },

    // Ajoute un serveur à un investisseur
    addServeurInvestisseur: function (id_discord, id_serv, client_token) {
        if (token !== client_token) {
            return { message: 'Token invalide', status: false };
        }

        let data = require('../data/serveurInvestisseur.json');
        if (!data[id_discord]) {
            return { message: 'Investisseur non trouvé', status: false };
        }

        data[id_discord].push(id_serv);
        fs.writeFileSync(path.resolve(__dirname, '../data/serveurInvestisseur.json'), JSON.stringify(data, null, 4));
        return { message: 'Serveur ajouté à l\'investisseur', status: true };
    },

    // Supprime un serveur d'un investisseur
    deleteServeurInvestisseur: function (id_discord, id_serv, client_token) {
        if (token !== client_token) {
            return { message: 'Token invalide', status: false };
        }

        let data = require('../data/serveurInvestisseur.json');
        if (!data[id_discord]) {
            return { message: 'Investisseur non trouvé', status: false };
        }

        let index = data[id_discord].indexOf(id_serv);
        if (index > -1) {
            data[id_discord].splice(index, 1);
            fs.writeFileSync(path.resolve(__dirname, '../data/serveurInvestisseur.json'), JSON.stringify(data, null, 4));
            return { message: 'Serveur supprimé de l\'investisseur', status: true };
        } else {
            return { message: 'Serveur non trouvé', status: false };
        }
    }
};

module.exports = serveurInvestisseur;
