/* 
{
    "idDiscord": "idMinecraft"
}
*/

// Dépendances
const e = require('express');
const fs = require('fs');
const path = require('path');

const EnregistrementMinecraft = {
    getEnregistrements: (req, res) => {
        let data = require('../data/mcAccountToIdDiscord.json');
        res.json(data);
    },

    getEnregistrementByIdDiscord: (idDiscord) => {
        let data = require('../data/mcAccountToIdDiscord.json');
        let enregistrement = data[idDiscord];
        res.json(enregistrement || null);
    },

    addEnregistrement: (idDiscord, idMinecraft) => {
        let data = require('../data/mcAccountToIdDiscord.json');

        // Vérifie si l'UID Minecraft est valide

        if (!idMinecraft) {
            return { message: 'UID Minecraft invalide', status: false };
        }

        // Vérifie si l'ID Discord  est déjà enregistré
        if (!data[idDiscord]) {

            // Vérifie si l'UID Minecraft est déjà enregistré dans le JSON
            for (let key in data) {
                if (data[key] === idMinecraft) {
                    return { message: 'UID Minecraft déjà enregistré par un autre joueur', status: false };
                }
            }
            // Ajoute l'enregistrement 
            data[idDiscord] = idMinecraft;
        } else {
            return { message: 'Vous avez déjà un enregistrement sur votre ID Discord', status: false };
        }

        fs.writeFileSync(path.resolve(__dirname, '../data/mcAccountToIdDiscord.json'), JSON.stringify(data, null, 4));
        return { message: 'Enregistrement ajouté', status: true };
    },

    deleteEnregistrement: (idDiscord) => {
        let data = require('../data/mcAccountToIdDiscord.json');
        if (!data[idDiscord]) {
            return { message: 'Enregistrement non trouvé', status: false };
        }
        delete data[idDiscord];
        fs.writeFileSync(path.resolve(__dirname, '../data/mcAccountToIdDiscord.json'), JSON.stringify(data, null, 4));
        return { message: 'Enregistrement supprimé', status: true };
    }
};

module.exports = EnregistrementMinecraft;