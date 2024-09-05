# Ce script sert à mettre à jour le fichier server.properties avec de nouvelles valeurs
allow_flight = &1 # bool
allow_nether = &2 # bool
difficulty = &3 # str
enforce_whitelist = &4 # bool
gamemode = &5 # str
hardcore = &6 # bool
max_players = &7 # int
pvp = &8 # bool
spawn_protection = &9 # int
level_type = &10 # str
online_mode = &11 # bool

discord_id = &12 # str
server_id = &13 # int
server_name = &14 # str

# On récupère le chemin du serveur avec l'API "api.antredesloutres.fr/serveurs/"
api_link="https://api.antredesloutres.fr/serveurs/$server_id"
server_path=$(curl -s $api_link | jq -r '.path')

# On se déplace dans le dossier du serveur
cd $server_path

# On regarde si le fichier server.properties existe
if [ -f server.properties ]; then
    # On met à jour les valeurs
    sed -i "s/allow-flight=.*/allow-flight=$allow_flight/g" server.properties
    sed -i "s/allow-nether=.*/allow-nether=$allow_nether/g" server.properties
    sed -i "s/difficulty=.*/difficulty=$difficulty/g" server.properties
    sed -i "s/enforce-whitelist=.*/enforce-whitelist=$enforce_whitelist/g" server.properties
    sed -i "s/gamemode=.*/gamemode=$gamemode/g" server.properties
    sed -i "s/hardcore=.*/hardcore=$hardcore/g" server.properties
    sed -i "s/max-players=.*/max-players=$max_players/g" server.properties
    sed -i "s/pvp=.*/pvp=$pvp/g" server.properties
    sed -i "s/spawn-protection=.*/spawn-protection=$spawn_protection/g" server.properties
    sed -i "s/level-type=.*/level-type=$level_type/g" server.properties
    sed -i "s/online-mode=.*/online-mode=$online_mode/g" server.properties
else
    echo "Le fichier server.properties n'existe pas, création du fichier..."
    echo "allow-flight=$allow_flight" >> server.properties
    echo "allow-nether=$allow_nether" >> server.properties
    echo "difficulty=$difficulty" >> server.properties
    echo "enforce-whitelist=$enforce_whitelist" >> server.properties
    echo "gamemode=$gamemode" >> server.properties
    echo "hardcore=$hardcore" >> server.properties
    echo "max-players=$max_players" >> server.properties
    echo "pvp=$pvp" >> server.properties
    echo "spawn-protection=$spawn_protection" >> server.properties
    echo "level-type=$level_type" >> server.properties
    echo "online-mode=$online_mode" >> server.properties
fi