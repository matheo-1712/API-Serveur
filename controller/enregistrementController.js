// Dépendances
const EnregistrementMinecraft = require('../model/enregistrement');
const e = require('express');
const { token } = require('../data/token.json');

const apiUID = "https://api.mojang.com/users/profiles/minecraft/";


const EnregistrementMinecraftController = {
    
    
    // Enregistrement MineCraft
    getEnregistrements: (req, res) => {
        const { client_token } = req.params;

        // Vérifie si le token est valide
        if (token !== client_token) {
            res.json({ message: 'Token invalide', status: false });
            return;
        } else {
            console.log('[TOKEN] getEnregistrements (Minecraft) : Token valide');
        }

        EnregistrementMinecraft.getEnregistrements(req, res);
    },

    getEnregistrementByIdDiscord: (req, res) => {
        const { idDiscord, client_token } = req.params;

        // Vérifie si le token est valide
        if (token !== client_token) {
            res.json({ message: 'Token invalide', status: false });
            return;
        } else {
            console.log('[TOKEN] getEnregistrementByIdDiscord (Minecraft) : Token valide');
        }
        // Vérifie si l'ID Discord est valide
        if (!idDiscord) {
            res.json({ message: 'ID Discord invalide', status: false });
            return;
        }

        EnregistrementMinecraft.getEnregistrementByIdDiscord(idDiscord, res);
    },

    addEnregistrement: async (req, res) => {
        const { idDiscord, pseudoMinecraft, client_token } = req.body;

        // Vérifie si le token est valide
        if (token !== client_token) {
            res.json({ message: 'Token invalide', status: false });
            return;
        } else {
            console.log('[TOKEN] addEnregistrement (Minecraft) : Token valide');
        }

        // Vérifie si l'ID Discord est valide
        if (!idDiscord) {
            res.json({ message: 'ID Discord invalide', status: false });
            return;
        }

        // Vérifie si le pseudo Minecraft est valide
        if (!pseudoMinecraft) {
            res.json({ message: 'Pseudo Minecraft invalide', status: false });
            return;
        }

        // Récupère l'UUID Minecraft
        const idMinecraft = await getUUID(pseudoMinecraft);

        // Vérifie si l'UUID Minecraft est valide
        if (!idMinecraft) {
            res.json({ message: 'Pseudo Minecraft invalide', status: false });
            return;
        }

        // Ajoute l'enregistrement
        let result = EnregistrementMinecraft.addEnregistrement(idDiscord, idMinecraft);

        res.json(result);
    },

    deleteEnregistrement: (req, res) => {
        const { idDiscord, client_token } = req.body;

        // Vérifie si le token est valide
        if (token !== client_token) {
            res.json({ message: 'Token invalide', status: false });
            return;
        } else {
            console.log('[TOKEN] deleteEnregistrement (Minecraft) : Token valide');
        }

        // Vérifie si l'ID Discord est valide
        if (!idDiscord) {
            res.json({ message: 'ID Discord invalide', status: false });
            return;
        }
        
        let result = EnregistrementMinecraft.deleteEnregistrement(idDiscord);
        res.json(result);
    }
};


async function getUUID(pseudoMinecraft) {
    try {
        // Await the fetch to resolve the promise
        const response = await fetch(`${apiUID}${pseudoMinecraft}`);

        // Check if the response is ok (status 2xx)
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }

        // Await the JSON parsing since it also returns a promise
        const data = await response.json();

        // Extract the Minecraft ID from the response
        const idMinecraft = data.id;

        return idMinecraft;  // Return the UUID directly
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'UUID pour ${pseudoMinecraft}: ${error.message}`);
        return null;
    }
}

module.exports = EnregistrementMinecraftController;