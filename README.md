# API-Serveur
API-Serveur est une API qui permet de gérer les serveurs de jeux de l'Antre des Loutres.

Lien de l'API : https://api.antredesloutres.fr/

## Table of Contents

- [C'est quoi l'Antre des Loutres?](#Discord)
- [Fonctionnalités](#Fonctionnalités)
- [Fonctionnement](#Fonctionnement)
- [Contributions](#Contributions)
- [License](#license)

## Discord

[L'Antre des Loutres](https://discord.gg/k4ZBFVdntp) est un serveur Discord conçu pour rassembler des joueurs de jeux vidéo afin trouver des partenaires de parties mais aussi afin de discuter de nos jeux préférés.

Nous proposons également des services en hébergeant et en administrant nous-mêmes nos serveurs de jeux, sans passer par un tiers. Cela nous permet notamment une grande liberté quant aux fonctionnalités que nous offrons à nos utilisateurs. En effet, nos bots Discord, qui sont liés à nos serveurs, peuvent ouvrir, informer et interagir avec nos serveurs de jeux, ce qui nous permet de proposer à nos utilisateurs une grande liberté dans leurs actions via les commandes .


## Fonctionnalités

- Création, installation et configuration de serveurs de jeux Minecraft (pour le moment mais d'autres jeux pourront être ajoutés)
- Gestion des serveurs de jeux (démarrage, arrêt, redémarrage, etc.)
- Affichage des informations des serveurs de jeux (joueurs connectés, version, serveur actuellement actif, etc.)
- Affichage des statistiques des joueurs (temps de jeu, nombre de morts, etc.)

## Fonctionnement

- Cette API fonctionne donc logiquement avec des requêtes HTTP. Pour notre part, nous utilisons une application Discord nommée Mineotter qui permet de faire le lien entre l'API et les utilisateurs. N'importe qu'elle application qui peut envoyer des requêtes HTTP peut donc utiliser cette API tant qu'ellle possède le token de l'API pour les applications sensibles.

Il est prévu de mettre en place une interface web pour l'utilisation de l'API pour ceux n'utilisant pas discord.

## Contributions

[Corentin COTTEREAU](https://github.com/Corentin-cott) : Concepteur de Mineotter

[Mathéo PERODEAU](https://github.com/matheo-1712) : Concepteur de l'API Serveur


## License

[CC BY-NC-ND](https://creativecommons.org/licenses/by-nc-nd/4.0/)

