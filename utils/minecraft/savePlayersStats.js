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
            const tempsJeuxPre113 = Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:play_one_minute'] / 20 / 3600) || 0;
            const tempsJeuxAft113 = Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:play_time'] / 20 / 3600) || 0;
            const tempsJeux = Math.max(tempsJeuxPre113, tempsJeuxAft113);

            // Calculer le nombre de morts
            const nbMorts = Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:deaths']) || 0;

            // Calculer le nombre de saut
            const nbSauts = Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:jump']) || 0;

            // Calculer le nombre de kill d'un joueur
            const nbKill = Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:player_kills']) || 0;

            // Calculer le nombre de mort par un joueur
            const nbDeathByPlayer = Math.floor(statsJoueur.stats['minecraft:killed_by']?.['minecraft:player']) || 0;

            // Calculer la distance parcourue
            const dist = {
                marche: Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:walk_one_cm'] / 100) || 0,
                sprint: Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:sprint_one_cm'] / 100) || 0,
                sneack: Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:crouch_one_cm'] / 100) || 0,
                cheval: Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:horse_one_cm'] / 100) || 0,
                minecart: Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:minecart_one_cm'] / 100) || 0,
                escalade: Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:climb_one_cm'] / 100) || 0,
                aviate: Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:aviate_one_cm'] / 100) || 0,
                bateau: Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:boat_one_cm'] / 100) || 0,
                marcheSurEau: Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:walk_on_water_one_cm'] / 100) || 0,
                marcheSousEau: Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:walk_under_water_one_cm'] / 100) || 0,
                nage: Math.floor(statsJoueur.stats['minecraft:custom']?.['minecraft:swim_one_cm'] / 100) || 0
            }

            const distTotale = Object.values(dist).reduce((total, dist) => total + dist, 0);

            // Calculer les blocs minés et placés et les items utilisés et cassés et les mobs tués et les crafts et les items drop  (si existent)
            let nbBlocMine = 0;
            let nbUseItem = 0;
            let nbKillMob = 0;
            let nbCraft = 0;
            let nbItemBreak = 0;
            let nbItemDrop = 0;
            let nbKillByMob = 0;

            // Tableaux pour stocker les blocs minés et placés et les items utilisés et cassés et les mobs tués et les crafts et les items drop
            let listeCustomStats = {};
            let listeBlocMine = {};
            let listeItemUse = {};
            let listeMobKill = {};
            let listeCraft = {};
            let listeItemBreak = {};
            let listeItemDrop = {};
            let listeKillByMob = {};

            // Met la valeur de jeu par défaut
            const jeu = 'minecraft'

            // Affiche les statistiques Custom
            if (statsJoueur.stats['minecraft:custom']) {
                for (const stat in statsJoueur.stats['minecraft:custom']) {
                    listeCustomStats[stat] = statsJoueur.stats['minecraft:custom'][stat];
                }
            }

            // Calculer le nombre de blocs minés
            if (statsJoueur.stats['minecraft:mined']) {
                for (const bloc in statsJoueur.stats['minecraft:mined']) {
                    nbBlocMine += statsJoueur.stats['minecraft:mined'][bloc] || 0;

                    // Ajoute le bloc et le nombre de fois miné au tableau listeBlocMine
                    listeBlocMine[bloc] = statsJoueur.stats['minecraft:mined'][bloc];
                }
            }

            // Calculer le nombre d'items utilisés
            if (statsJoueur.stats['minecraft:used']) {
                for (const bloc in statsJoueur.stats['minecraft:used']) {
                    nbUseItem += statsJoueur.stats['minecraft:used'][bloc] || 0;

                    // Ajoute le bloc et le nombre de fois placé au tableau listeBlocPlace
                    listeItemUse[bloc] = statsJoueur.stats['minecraft:used'][bloc];
                }
            }

            // Calculer le nombre de mobs tués
            if (statsJoueur.stats['minecraft:killed']) {
                for (const mobKill in statsJoueur.stats['minecraft:killed']) {
                    nbKillMob += statsJoueur.stats['minecraft:killed'][mobKill] || 0;

                    // Ajoute le mob et le nombre de kills au tableau listeMobKill
                    listeMobKill[mobKill] = statsJoueur.stats['minecraft:killed'][mobKill];
                }
            }

            // Calculer le nombre de fois qu'on est mort par un mob
            if (statsJoueur.stats['minecraft:killed_by']) {
                for (const mobKill in statsJoueur.stats['minecraft:killed_by']) {
                    nbKillByMob += statsJoueur.stats['minecraft:killed_by'][mobKill] || 0;

                    // Ajoute le mob et le nombre de kills au tableau listeMobKill
                    listeKillByMob[mobKill] = statsJoueur.stats['minecraft:killed_by'][mobKill];
                }
            }

            // Calculer le nombre d'items cassés
            if (statsJoueur.stats['minecraft:broken']) {
                for (const itemBreak in statsJoueur.stats['minecraft:broken']) {
                    nbItemBreak += statsJoueur.stats['minecraft:broken'][itemBreak] || 0;

                    // Ajoute l'item et le nombre de fois cassé au tableau listeItemBreak
                    listeItemBreak[itemBreak] = statsJoueur.stats['minecraft:broken'][itemBreak];
                }
            }

            // Calculer le nombre de crafts
            if (statsJoueur.stats['minecraft:crafted']) {
                for (const craft in statsJoueur.stats['minecraft:crafted']) {
                    nbCraft += statsJoueur.stats['minecraft:crafted'][craft] || 0;

                    // Ajoute l'item et le nombre de crafts au tableau listeCraft
                    listeCraft[craft] = statsJoueur.stats['minecraft:crafted'][craft];
                }
            }

            // Calculer le nombre d'item drop
            if (statsJoueur.stats['minecraft:dropped']) {
                for (const itemDrop in statsJoueur.stats['minecraft:dropped']) {
                    nbItemDrop += statsJoueur.stats['minecraft:dropped'][itemDrop] || 0;

                    // Ajoute l'item et le nombre de fois drop au tableau listeItemDrop
                    listeItemDrop[itemDrop] = statsJoueur.stats['minecraft:dropped'][itemDrop];
                }
            }

            // Calculer le nombre d'item récupéré
            if (statsJoueur.stats['minecraft:picked_up']) {
                for (const itemPickUp in statsJoueur.stats['minecraft:picked_up']) {
                    nbItemDrop += statsJoueur.stats['minecraft:picked_up'][itemPickUp] || 0;

                    // Ajoute l'item et le nombre de fois récupéré au tableau listeItemDrop
                    listeItemDrop[itemPickUp] = statsJoueur.stats['minecraft:picked_up'][itemPickUp];
                }
            }

            // Afficher les statistiques
            //console.log(`Statistiques pour ${pseudo}: ${tempsJeux} heures de jeu, ${nbMorts} morts, ${distTotale} blocs parcourus sur le serveur ${nom_serv}`);

            // Créer un objet avec les statistiques du joueur
            const statsJoueurObj = {
                pseudo,
                uuid,
                nom_serv,
                jeu,
                id_serv,
                tempsJeux,
                nbMorts,
                nbSauts,
                nbKill,
                nbDeathByPlayer,
                nbKillMob,
                nbBlocMine,
                nbKillByMob,
                nbUseItem,
                nbCraft,
                nbItemDrop,
                distTotale,
                nbItemBreak,
                dist,
                listeCustomStats,
                listeMobKill,
                listeKillByMob,
                listeBlocMine,
                listeItemUse,
                listeCraft,
                listeItemBreak,
                listeItemDrop
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
