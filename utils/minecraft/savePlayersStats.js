const fs = require('fs').promises;
const path = require('path');
const { listeServeurLink } = require('../../configLink.json');

async function savePlayersStats() {
    let fetch;
    try {
        fetch = (await import('node-fetch')).default;

        // Récupérer la liste des serveurs
        await fetch(listeServeurLink)
            .then(response => response.json())
            .then(async data => {
                for (const serveur of data) {
                    if (serveur.jeu.toLowerCase() === 'minecraft') {
                        // Lire les fichiers de stats pour chaque serveur
                        await inscriptionServeurMinecraft(serveur.nom_serv, serveur.id_serv, serveur.path_serv, serveur.nom_monde, serveur.version_serv);
                        console.log(`Les statistiques pour le serveur ${serveur.nom_serv} ont été sauvegardées.`);
                    } else {
                        console.log(`Le serveur ${serveur.nom_serv} n'est pas un serveur pris en compte pour la sauvegarde des statistiques`);
                    }
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération de la liste des serveurs :', error);
            });

    } catch (error) {
        console.error("Error importing node-fetch:", error);
    }
}

// Fonction pour lire les fichiers de stats pour chaque serveur
async function inscriptionServeurMinecraft(nomServeur, id_serv, path_serv, nomMonde, version) {
    const cheminServeur = path.join(path_serv, nomMonde, 'stats');

    try {
        const fichiersJoueurs = await fs.readdir(cheminServeur)

        for (const fichierJoueur of fichiersJoueurs) {
            const uuid = path.basename(fichierJoueur, '.json');
            const cheminJoueur = path.join(cheminServeur, fichierJoueur);
            const statsJoueur = JSON.parse(await fs.readFile(cheminJoueur, 'utf-8'));

            // Obtenir le pseudo du joueur à partir de l'UUID
            const pseudo = await getPseudoFromUUID(uuid);
            const nom_serv = nomServeur;

            // Calculer le temps de jeu
            const tempsJeuxPre113 = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:play_one_minute'] / 20 / 3600) || 0;
            const tempsJeuxAft113 = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:play_time'] / 20 / 3600) || 0;
            const tempsJeux = Math.max(tempsJeuxPre113, tempsJeuxAft113);

            // Calculer le nombre de morts
            const nbMorts = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:deaths']) || 0;

            // Calculer le nombre de saut
            const nbSauts = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:jump']) || 0;

            // Calculer le nombre de kill d'un joueur
            const nbKill = Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:player_kills']) || 0;

            // Calculer la distance parcourue
            const dist = {
                marche: Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:walk_one_cm'] / 100) || 0,
                sprint: Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:sprint_one_cm'] / 100) || 0,
                sneack: Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:crouch_one_cm'] / 100) || 0,
                cheval: Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:horse_one_cm'] / 100) || 0,
                minecart: Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:minecart_one_cm'] / 100) || 0,
                escalade: Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:climb_one_cm'] / 100) || 0,
                aviate: Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:aviate_one_cm'] / 100) || 0,
                bateau: Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:boat_one_cm'] / 100) || 0,
                marcheSurEau: Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:walk_on_water_one_cm'] / 100) || 0,
                marcheSousEau: Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:walk_under_water_one_cm'] / 100) || 0,
                nage: Math.floor(statsJoueur.stats['minecraft:custom']['minecraft:swim_one_cm'] / 100) || 0
            }

            const distTotale = Object.values(dist).reduce((total, dist) => total + dist, 0);

            // Calculer les blocs minés et placés
            const oresMined = {
                ironMined: statsJoueur.stats['minecraft:mined']['minecraft:iron_ore'] || 0,
                goldMined: statsJoueur.stats['minecraft:mined']['minecraft:gold_ore'] || 0,
                diamondMined: statsJoueur.stats['minecraft:mined']['minecraft:diamond_ore'] || 0,
                emeraldMined: statsJoueur.stats['minecraft:mined']['minecraft:emerald_ore'] || 0,
                lapisMined: statsJoueur.stats['minecraft:mined']['minecraft:lapis_ore'] || 0,
                redstoneMined: statsJoueur.stats['minecraft:mined']['minecraft:redstone_ore'] || 0,
                coalMined: statsJoueur.stats['minecraft:mined']['minecraft:coal_ore'] || 0,
                quartzMined: statsJoueur.stats['minecraft:mined']['minecraft:nether_quartz_ore'] || 0,
                ancientDebrisMined: statsJoueur.stats['minecraft:mined']['minecraft:ancient_debris'] || 0
            };
            
            let blocsMines = 0;
            let blocsPlaces = 0;

            if (statsJoueur.stats['minecraft:mined']) {
                for (const bloc in statsJoueur.stats['minecraft:mined']) {
                    blocsMines += statsJoueur.stats['minecraft:mined'][bloc] || 0;
                }
            }

            if (statsJoueur.stats['minecraft:used']) {
                for (const bloc in statsJoueur.stats['minecraft:used']) {
                    blocsPlaces += statsJoueur.stats['minecraft:used'][bloc] || 0;
                }
            }

            console.log(`Statistiques pour ${pseudo}: ${tempsJeux} heures de jeu, ${nbMorts} morts, ${distTotale} blocs parcourus sur le serveur ${nom_serv}`);

            const statsJoueurObj = {
                pseudo,
                uuid,
                nom_serv,
                id_serv,
                tempsJeux,
                nbMorts,
                nbSauts,
                nbKill,
                distTotale,
                blocsMines,
                blocsPlaces,
                dist,
                oresMined,
            };

            // Chemin vers le fichier du joueur (par UUID)
            const cheminStatsJoueur = path.join(__dirname, '..', '..', 'data', 'minecraft_stats', `${uuid}.json`);

            try {
                // Vérifier si le fichier existe
                await fs.access(cheminStatsJoueur)

                // Si le fichier existe, lire les données actuelles
                const fileContents = await fs.readFile(cheminStatsJoueur, 'utf-8');
                let existingStats = JSON.parse(fileContents); // Convertir le contenu du fichier en tableau

                // Rechercher les statistiques pour ce serveur (id_serv)
                const serverIndex = existingStats.findIndex(stat => stat.id_serv === id_serv);

                if (serverIndex !== -1) {
                    // Si les statistiques pour ce serveur existent, on les met à jour
                    existingStats[serverIndex] = statsJoueurObj;
                    // console.log(`Les statistiques pour le serveur ${nom_serv} ont été mises à jour.`);
                } else {
                    // Si les statistiques pour ce serveur n'existent pas, on les ajoute
                    existingStats.push(statsJoueurObj);
                    // console.log(`Statistiques pour ${nom_serv} ajoutées.`);
                }

                // Écrire le tableau mis à jour dans le fichier
                await fs.writeFile(cheminStatsJoueur, JSON.stringify(existingStats, null, 2));
            } catch (error) {
                // Si le fichier n'existe pas, le créer avec les stats actuelles
                await fs.writeFile(cheminStatsJoueur, JSON.stringify([statsJoueurObj], null, 2));
                // console.log(`Le fichier ${cheminStatsJoueur} a été créé avec les premières statistiques.`);
            }
        }
    } catch (erreur) {
        console.error(`Erreur lors de la lecture des stats du serveur ${nomServeur}:`, erreur);
    }
}

async function getPseudoFromUUID(uuid) {
    let fetch;
    try {
        fetch = (await import('node-fetch')).default;

        const apiUrl = `https://api.minetools.eu/uuid/${uuid}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            console.error(`La requête API Mojang a échoué avec le statut : ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data.hasOwnProperty('name')) {
            const pseudo = data.name;
            return pseudo;
        } else {
            console.error(`Aucun pseudo trouvé pour l'UUID ${uuid}`);
            return null;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des informations du joueur :', error);
        return null;
    }
}

module.exports = savePlayersStats;
