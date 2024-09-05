#!/bin/bash

# Logs de lancement dans un dossier logs dans le dossier scripts
LOG_DIR="/home/serveurs/api_serveur/scripts/logs"

# Vérifie si le dossier logs existe
if [ ! -d "$LOG_DIR" ]; then
    echo "Le dossier logs n'existe pas, création..."
    mkdir -p "$LOG_DIR"
fi

# Création du fichier de log
# Récupération de la date
date=$(date '+%Y-%m-%d-%H-%M-%S')
log_file="$LOG_DIR/serveur_install_$date.log"
touch "$log_file"

# Redirection de la sortie standard et d'erreur vers le fichier de log
exec > "$log_file" 2>&1

# Affichage du lancement du script
echo "Lancement du script d'installation du serveur"

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

# Création du dossier de l'utilisateur et du serveur
if [ ! -d "/home/serveurs/minecraft/serveurs-investisseurs/$id_discord" ]; then
    echo "Le dossier utilisateur n'existe pas, création..."
    mkdir -p "/home/serveurs/minecraft/serveurs-investisseurs/$id_discord"
fi

if [ ! -d "/home/serveurs/minecraft/serveurs-investisseurs/$id_discord/$nom_serv" ]; then
    echo "Le dossier du serveur n'existe pas, création..."
    mkdir -p "/home/serveurs/minecraft/serveurs-investisseurs/$id_discord/$nom_serv"
fi

# Mouvement dans le dossier du serveur
cd "/home/serveurs/minecraft/serveurs-investisseurs/$id_discord/$nom_serv" || exit 1

# Téléchargement du modpack et extraction
echo "Téléchargement du modpack..."
if wget "$modpack_url"; then
    echo "Modpack téléchargé avec succès."
else
    echo "Erreur lors du téléchargement du modpack." >&2
    exit 1
fi

# Récupération du nom du fichier
nom_fichier=$(basename "$modpack_url")

# Extraction du fichier si c'est un zip
if [[ "$nom_fichier" == *.zip ]]; then
    if unzip "$nom_fichier"; then
        echo "Modpack extrait avec succès."
    else
        echo "Erreur lors de l'extraction du modpack." >&2
        exit 1
    fi
    rm "$nom_fichier"  # Supprimer le fichier zip après extraction
else
    echo "Le modpack téléchargé n'est pas un fichier zip."
fi

# Vérifie si un dossier mods existe, sinon le créer et déplacer les fichiers
if [ ! -d mods ]; then
    echo "Le dossier mods n'existe pas, création et déplacement des fichiers..."
    mkdir mods
    find . -maxdepth 1 -type f -exec mv {} mods/ \;
else
    echo "Le dossier mods existe déjà."
fi

# Installation de l'installeur du serveur
echo "Téléchargement de l'installeur du serveur..."
if wget "$url_installeur"; then
    echo "Installeur téléchargé avec succès."
else
    echo "Erreur lors du téléchargement de l'installeur." >&2
    exit 1
fi

# Récupération du nom du fichier installeur
nom_installeur=$(basename "$url_installeur")

# Renommage du fichier installeur en installer.jar
mv "$nom_installeur" installer.jar

# Création du fichier eula.txt
echo "eula=true" > eula.txt

# Installation du serveur
echo "Lancement de l'installation du serveur..."
if java -jar installer.jar nogui --installServer; then
    echo "Installation du serveur réussie."
    # Suppression de l'installeur après installation
    rm installer.jar
    echo "Suppression de l'installeur après installation."
else
    echo "Erreur lors de l'installation du serveur." >&2
    exit 1
fi

# Attendre la fin de l'installation
sleep 25

# Lister les fichiers après installation pour vérifier le contenu
echo "Contenu du répertoire après installation :"
ls -l

# Recherche du fichier .jar correspondant à Forge dans le répertoire actuel
nom_fichier_installe=$(find . -maxdepth 1 -name 'forge*.jar')
nom_fichier_installeFabric=$(find . -maxdepth 1 -name 'fabric*.jar')
vanilla=$(find . -maxdepth 1 -name 'minecraft_server*.jar')


# Vérifie si un fichier Forge .jar a été trouvé
if [ -n "$nom_fichier_installe" ]; then
    echo "Fichier Forge trouvé : $nom_fichier_installe"
    echo "Renommage du fichier $nom_fichier_installe en serveur.jar"
    mv "$nom_fichier_installe" serveur.jar
elif [ -n "$nom_fichier_installeFabric" ]; then
    echo "Fichier Fabric trouvé : $nom_fichier_installeFabric"
    echo "Renommage du fichier $nom_fichier_installeFabric en serveur.jar"
    mv "$nom_fichier_installeFabric" serveur.jar
elif [ -n "$vanilla" ]; then
    echo "Fichier Vanilla trouvé : $vanilla"
    echo "Renommage du fichier $vanilla en serveur.jar"
    mv "$vanilla" serveur.jar
else
    echo "Aucun fichier Forge ou Fabric ou Vanilla trouvé." >&2
    exit 1
fi

# Suppression des fichiers inutiles

# Suppression des fichiers .zip
rm -f *.zip

# Suppression des fichiers .jar autres que serveur.jar
find . -maxdepth 1 -name '*.jar' ! -name 'serveur.jar' -exec rm {} \;
echo "Suppression des fichiers .jar autres que serveur.jar."

echo "Installation du serveur terminée avec succès."

# Lancement du serveur

# Chemin vers la version spécifique de Java en fonction de la version du serveur Minecraft
if [[ "$version_serv" == "1.8"* ]]; then
    JAVA_PATH="/usr/lib/jvm/java-8-openjdk-amd64/bin/java"
elif [[ "$version_serv" == "1.12"* ]] || [[ "$version_serv" == "1.13"* ]] || [[ "$version_serv" == "1.14"* ]]; then
    JAVA_PATH="/usr/lib/jvm/java-8-openjdk-amd64/bin/java"
elif [[ "$version_serv" == "1.15"* ]] || [[ "$version_serv" == "1.16"* ]] || [[ "$version_serv" == "1.17"* ]]; then
    JAVA_PATH="/usr/lib/jvm/java-11-openjdk-amd64/bin/java"
elif [[ "$version_serv" == "1.18"* ]] || [[ "$version_serv" == "1.19"* ]] || [[ "$version_serv" == "1.20"* ]]; then
    JAVA_PATH="/usr/lib/jvm/java-17-openjdk-amd64/bin/java"
else
    # Version par défaut si aucune version de Minecraft spécifique n'est détectée
    JAVA_PATH="/usr/lib/jvm/java-8-openjdk-amd64/bin/java"
fi

# Affichage pour vérifier la version de Java sélectionnée
echo "Version du serveur Minecraft : $version_serv"
echo "Chemin vers Java sélectionné : $JAVA_PATH"

# Création du fichier de lancement
echo "Création du fichier de lancement du serveur..."
echo "#!/bin/bash" > start.sh
# Lancement du serveur dans un screen pour le premier lancement
echo "screen -dmS $nom_serv" >> start.sh
echo "$JAVA_PATH -Xmx4G -Xms1G -jar serveur.jar nogui" >> start.sh

# Donner les droits d'exécution au fichier de lancement
chmod +x start.sh

# Lancement du serveur pour la première fois
echo "Lancement du serveur..."
./start.sh

