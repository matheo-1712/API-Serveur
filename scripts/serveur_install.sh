#!/bin/bash

# Récupération des arguments passés
id_discord=$1
modpack_url=$2
id_serv=$3
nom_serv=$4
jeu=$5
version_serv=$6
url_installeur=$7

# Affichage pour vérification
echo "ID Discord : $id_discord"
echo "Modpack URL : $modpack_url"
echo "ID Serveur : $id_serv"
echo "Nom Serveur : $nom_serv"
echo "Jeu : $jeu"
echo "Version Serveur : $version_serv"
echo "URL Installeur : $url_installeur"

# Création du dossier de l'utilisateur
# Vérifie si ce dossier n'existe pas
if [ ! -d /home/serveurs/minecraft/serveurs-investisseurs/$id_serv ]; then
    echo "Le dossier n'existe pas"
    mkdir /home/serveurs/minecraft/serveurs-investisseurs/$id_serv
fi

# Création du dossier du serveur
# Vérifie si ce dossier n'existe pas
if [ ! -d /home/serveurs/minecraft/serveurs-investisseurs/$id_serv/$nom_serv ]; then
    echo "Le dossier n'existe pas"
    mkdir /home/serveurs/minecraft/serveurs-investisseurs/$id_serv/$nom_serv
fi

# Mouvement dans le dossier du serveur
cd /home/serveurs/minecraft/serveurs-investisseurs/$id_serv/$nom_serv

# Téléchargement du modpack et extraction
wget $modpack_url

# Récupération du nom du fichier
nom_fichier=$(basename $modpack_url)

# Extraction du fichier
unzip $nom_fichier

# Vérifie si le contenu du zip est dans un dossier mods si c'est le cas ne rien faire sinon créer un dossier mods et déplacer les fichiers
# Si un autre dossier est présent, le renommé en mods
if [ -d mods ]; then
    echo "Le dossier mods existe"
else
    mkdir mods
    mv * mods
fi

# Installation de l'installeur du serveur
wget $url_installeur

# Récupération du nom du fichier
nom_installeur=$(basename $url_installeur)

# Renommage du fichier en serveur.jar
mv $nom_installeur serveur.jar

# Création du fichier eula.txt
echo "eula=true" > eula.txt

# Installation du serveur
java -jar serveur.jar nogui --installServer


