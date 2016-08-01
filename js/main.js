'use strict';

var logger = new Logger("#logs-panel .card-content");
var socket_io;
var pokemonActions;

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

function loadJSON(path) {
    return new Promise(function (fulfill, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    fulfill(JSON.parse(xhr.responseText));
                } else {
                    reject(xhr);
                }
            }
        };
        xhr.open('GET', path + "?v=" + Date.now(), true);
        xhr.send();
    });
}

var mapView = {
    user_index: 0,
    emptyDex: [],
    forts: [],
    info_windows: [],
    numTrainers: [
        177,
        109
    ],
    minimumPointsForLevel: {
        1: 0,
        2: 2000,
        3: 4000,
        4: 8000,
        5: 12000,
        6: 16000,
        7: 20000,
        8: 30000,
        9: 40000,
        10: 50000
    },
    teams: [
        'TeamLess',
        'Mystic',
        'Valor',
        'Instinct'
    ],
    trainerSex: [
        'm',
        'f'
    ],
    pathColors: [
        '#A93226',
        '#884EA0',
        '#2471A3',
        '#17A589',
        '#229954',
        '#D4AC0D',
        '#CA6F1E',
        '#CB4335',
        '#7D3C98',
        '#2E86C1',
        '#138D75',
        '#28B463',
        '#D68910',
        '#BA4A00'
    ],
    playerInfo: {},
    user_data: {},
    pathcoords: {},
    settings: {},
    init: function () {
        var self = this;
        self.settings = $.extend(true, self.settings, userInfo);
        self.bindUi();

        for (var i = 0; i < self.settings.users.length; i++) {
            var username = self.settings.users[i];
            self.user_data[username] = new Player(username);
            self.pathcoords[username] = [];
        }
    },
    setBotPathOptions: function (checked) {
        var self = this;
        for (var i = 0; i < self.settings.users.length; i++) {
            self.user_data[self.settings.users[i]].trainerPath.setOptions({
                strokeOpacity: checked ? 1.0 : 0.0
            });
        }
    },
    bindUi: function () {
        var self = this;
        $('#switchPan').prop('checked', self.settings.userFollow);
        $('#switchZoom').prop('checked', self.settings.userZoom);
        $('#strokeOn').prop('checked', self.settings.botPath);

        $('#switchPan').change(function () {
            self.settings.userFollow = this.checked;
        });

        $('#switchZoom').change(function () {
            self.settings.userZoom = this.checked;
        });

        $('#strokeOn').change(function () {
            self.settings.botPath = this.checked;
            self.setBotPathOptions(this.checked);
        });

        $('#optionsButton').click(function () {
            $('#optionsList').toggle();
        });

        $('#logs-button').click(function () {
            $('#logs-panel').toggle();
        });
        // Init tooltip
        $(document).ready(function () {
            $('.tooltipped').tooltip({
                delay: 50
            });
        });

        // Bots list and menus
        var submenuIndex = 0,
            currentUserId;
        $('body').on('click', ".bot-user .bot-items .btn:not(.tFind)", function () {
            var itemIndex = $(this).parent().parent().find('.btn').index($(this)) + 1,
                userId = $(this).closest('ul').data('user-id');
            if ($('#submenu').is(':visible') && itemIndex == submenuIndex && currentUserId == userId) {
                $('#submenu').toggle();
            } else {
                submenuIndex = itemIndex;
                currentUserId = userId;
                self.buildMenu(userId, itemIndex);
            }
        });

        $('body').on('click', '#close', function () {
            $('#submenu').toggle();
        });

        $('body').on('click', '.tFind', function () {
            self.findBot($(this).closest('ul').data('user-id'));
        });

        // Binding sorts
        $('body').on('click', '.pokemon-sort a', function () {
            var item = $(this);
            self.sortAndShowBagPokemon(item.data('sort'), item.parent().parent().data('user-id'));
        });
        $('body').on('click', '.pokedex-sort a', function () {
            var item = $(this);
            self.sortAndShowPokedex(item.data('sort'), item.parent().parent().data('user-id'));
        });

    },
    initMap: function () {
        var self = this;
        self.map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 50.0830986,
                lng: 6.7613762
            },
            zoom: 8,
            mapTypeId: 'roadmap',
            styles: [
                {
                    "featureType": "road",
                    "elementType": "geometry.fill",
                    "stylers": [{"color": "#4f9f92"}, {"visibility": "on"}]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry.stroke",
                    "stylers": [{"color": "#feff95"}, {"visibility": "on"}, {"weight": 1.2}]
                },
                {
                    "featureType": "landscape",
                    "elementType": "geometry",
                    "stylers": [{"color": "#adff9d"}, {"visibility": "on"}]
                },
                {"featureType": "water", "stylers": [{"visibility": "on"}, {"color": "#147dd9"}]},
                {
                    "featureType": "poi",
                    "elementType": "geometry.fill",
                    "stylers": [{"color": "#d3ffcc"}]
                }, {"elementType": "labels", "stylers": [{"visibility": "off"}]}
            ]
        });
        self.placeTrainer();
        setInterval(self.placeTrainer, 1000);
        setInterval(self.addInventory, 5000);
    },
    addInventory: function () {
        var self = mapView;
        for (var i = 0; i < self.settings.users.length; i++) {
            var username = self.settings.users[i];
            loadJSON('inventory-' + username + '.json').then(function (data) {
                self.user_data[username].updateInventory(data);
            });
        }
    },
    buildMenu: function (user_id, menu) {
        var self = this,
            out = '';
        $("#submenu").show();
        switch (menu) {
            case 1:
                var player = self.user_data[self.settings.users[user_id]];
                var current_user_stats = self.user_data[self.settings.users[user_id]].stats;
                $('#subtitle').html('Trainer Info');
                $('#sortButtons').html('');

                out += '<div class="row"><div class="col s12"><h5>' +
                    self.settings.users[user_id] +
                    '</h5><br>Level: ' +
                    current_user_stats.level +
                    '<br><div class="progress botbar-' + user_id + '" style="height: 10px"> <div class="determinate bot-' + user_id + '" style="width: ' +
                    (player.xpToNextLevel() / player.totalXpToNextLevel()) * 100 +
                    '%"></div></div>Total Exp: ' + player.getExperience() +
                    '<br>Exp to Lvl ' + (player.getLevel() + 1) + ': ' +
                    (player.xpToNextLevel()) + ' / ' + player.totalXpToNextLevel() +
                    '<br>Pokemon Encountered: ' +
                    (current_user_stats.pokemons_encountered || 0) +
                    '<br>Pokeballs Thrown: ' +
                    (current_user_stats.pokeballs_thrown || 0) +
                    '<br>Pokemon Caught: ' +
                    (current_user_stats.pokemons_captured || 0) +
                    '<br>Small Ratata Caught: ' +
                    (current_user_stats.small_rattata_caught || 0) +
                    '<br>Pokemon Evolved: ' +
                    (current_user_stats.evolutions || 0) +
                    '<br>Eggs Hatched: ' +
                    (current_user_stats.eggs_hatched || 0) +
                    '<br>Unique Pokedex Entries: ' +
                    (current_user_stats.unique_pokedex_entries || 0) +
                    '<br>PokeStops Visited: ' +
                    (current_user_stats.poke_stop_visits || 0) +
                    '<br>Kilometers Walked: ' +
                    (parseFloat(current_user_stats.km_walked).toFixed(2) || 0) +
                    '</div></div>';

                $('#subcontent').html(out);
                break;
            case 2:
                var current_user_bag_items = self.user_data[self.settings.users[user_id]].bagItems;
                var total = 0;
                $('#sortButtons').html('');

                out = '<div class="items"><div class="row">';
                for (var i = 0; i < current_user_bag_items.length; i++) {
                    if (current_user_bag_items[i].inventory_item_data.item.count > 0) {
                        out += '<div class="col s12 m6 l3 center" style="float: left"><img src="image/items/' +
                            current_user_bag_items[i].inventory_item_data.item.item_id +
                            '.png" class="item_img"><br><b>' +
                            Item.getName(current_user_bag_items[i].inventory_item_data.item.item_id) +
                            '</b><br>Count: ' +
                            (current_user_bag_items[i].inventory_item_data.item.count || 0) +
                            '</div>';
                        total = total + (current_user_bag_items[i].inventory_item_data.item.count || 0);
                    }
                }
                $('#subtitle').html(total + " item" + (total !== 1 ? "s" : "") + " in Bag");
                out += '</div></div>';
                var nth = 0;
                out = out.replace(/<\/div><div/g, function (match, i, original) {
                    nth++;
                    return (nth % 4 === 0) ? '</div></div><div class="row"><div' : match;
                });
                $('#subcontent').html(out);
                break;
            case 3:
                var pkmnTotal = self.user_data[self.settings.users[user_id]].bagPokemon.length;
                $('#subtitle').html(pkmnTotal + " Pokemon");

                var sortButtons = '<div class="col s12 pokemon-sort" data-user-id="' + user_id + '">Sort : ';
                sortButtons += '<div class="chip"><a href="#" data-sort="cp">CP</a></div>';
                sortButtons += '<div class="chip"><a href="#" data-sort="iv">potential</a></div>';
                sortButtons += '<div class="chip"><a href="#" data-sort="name">Name</a></div>';
                sortButtons += '<div class="chip"><a href="#" data-sort="id">ID</a></div>';
                sortButtons += '<div class="chip"><a href="#" data-sort="time">Time</a></div>';
                sortButtons += '<div class="chip"><a href="#" data-sort="candy">Candy</a></div>';
                sortButtons += '</div>';

                $('#sortButtons').html(sortButtons);

                self.sortAndShowBagPokemon('cp', user_id);
                break;
            case 4:
                var pkmnTotal = self.user_data[self.settings.users[user_id]].pokedex.getNumEntries();
                $('#subtitle').html('Pokedex ' + pkmnTotal + ' / 151');

                var sortButtons = '<div class="col s12 pokedex-sort" dat-user-id="' + user_id + '">Sort : ';
                sortButtons += '<div class="chip"><a href="#" data-sort="id">ID</a></div>';
                sortButtons += '<div class="chip"><a href="#" data-sort="name">Name</a></div>';
                sortButtons += '<div class="chip"><a href="#" data-sort="enc">Seen</a></div>';
                sortButtons += '<div class="chip"><a href="#" data-sort="cap">Caught</a></div>';
                sortButtons += '</div>';

                $('#sortButtons').html(sortButtons);

                self.sortAndShowPokedex('id', user_id);
                break;
            default:
                break;
        }
    },
    buildTrainerList: function () {
        var self = this,
            users = self.settings.users;
        var out = '<div class="col s12"><ul id="bots-list" class="collapsible" data-collapsible="accordion"> \
              <li class="bots_head"><div class="collapsible-title"><i class="material-icons">people</i>Bots</div></li>';

        for (var i = 0; i < users.length; i++) {
            var content = '<li class="bot-user">\
            <div class="collapsible-header bot-name">{0}</div>\
                <div class="collapsible-body">\
                    <ul class="bot-items" data-user-id="{1}">\
                       <li><a class="bot-' + i + ' waves-effect waves-light btn tInfo">Info</a></li><br>\
                       <li><a class="bot-' + i + ' waves-effect waves-light btn tItems">Items</a></li><br>\
                       <li><a class="bot-' + i + ' waves-effect waves-light btn tPokemon">Pokemon</a></li><br>\
                       <li><a class="bot-' + i + ' waves-effect waves-light btn tPokedex">Pokedex</a></li><br>\
                       <li><a class="bot-' + i + ' waves-effect waves-light btn tFind">Find</a></li>\
                   </ul>\
               </div>\
           </li>';
            out += content.format(users[i], i);
        }
        out += "</ul></div>";
        $('#trainers').html(out);
        var bots_collapsed = 1;
        $(document).on('click', '.bots_head', function () {
            var crt_display = 'block';
            if (bots_collapsed == 0) {
                bots_collapsed = 1;
            } else {
                crt_display = 'none';
                bots_collapsed = 0;
            }
            $(this).parent().find('li').each(function () {
                if (!$(this).hasClass('bots_head')) {
                    $(this).css('display', crt_display);
                }
            });
        });
        $('.collapsible').collapsible();
    },
    findBot: function (user_index) {
        var self = this,
            username = self.settings.users[user_index],
            coords = self.pathcoords[username][self.pathcoords[username].length - 1];

        self.map.setZoom(self.settings.zoom);
        self.map.panTo({
            lat: parseFloat(coords.lat),
            lng: parseFloat(coords.lng)
        });
    },
    placeTrainer: function () {
        var self = mapView;
        for (var i = 0; i < self.settings.users.length; i++) {
            var username = self.settings.users[i];
            loadJSON('location-' + username + '.json').then(function (data) {
                self.trainerFunc(data, username);
            });
        }
    },
    sortAndShowBagPokemon: function (sortOn, user_id) {
        var self = this,
            eggs = 0,
            out = '',
            user_id = user_id || 0,
            user = self.user_data[self.settings.users[user_id]];

        if (!user.bagPokemon.length) return;

        var sortedPokemon = user.getSortedPokemon(sortOn);

        out = '<div class="items"><div class="row">';

        for (var i = 0; i < sortedPokemon.length; i++) {
            var myPokemon = sortedPokemon[i];
            var pkmnNum = myPokemon.pokemon_id,
                pkmnImage = myPokemon.getImage(),
                pkmnName = Pokemon.getNameById(pkmnNum),
                pkmnCP = myPokemon.combatPower,
                pkmnIV = myPokemon.getPotential(),
                pkmnIVA = myPokemon.attackPotential,
                pkmnIVD = myPokemon.defensePotential,
                pkmnIVS = myPokemon.speedPotential,
                pkmnHP = myPokemon.hp,
                candyNum = user.getCandy(pkmnNum);

            out += '<div class="col s12 m6 l3 center"><img src="image/pokemon/' +
                pkmnImage + '" class="png_img"><br><b>' +
                pkmnName +
                '</b><br><div class="progress pkmn-progress pkmn-' + pkmnNum + '"> <div class="determinate pkmn-' + pkmnNum + '" style="width: ' + (pkmnHP / pkmnMHP) * 100 + '%"></div> </div>' +
                '<b>HP:</b> ' + pkmnHP + ' / ' + pkmnMHP +
                '<br><b>CP:</b>' + pkmnCP +
                '<br><b>potential:</b> ' + (pkmnIV >= 0.8 ? '<span style="color: #039be5">' + pkmnIV + '</span>' : pkmnIV) +
                '<br><b>A/D/S:</b> ' + pkmnIVA + '/' + pkmnIVD + '/' + pkmnIVS +
                '<br><b>Candy: </b>' + candyNum
            ;

            if (Object.keys(pokemonActions).length) {
                var actionsOut = '';
                for (var pa in pokemonActions) {
                    var content = pokemonActions[pa].button(sortedPokemon[i], user_id);
                    if (content) {
                        actionsOut += '<li>' + pokemonActions[pa].button(sortedPokemon[i], user_id) + '</li>';
                    }
                }

                if (actionsOut) {
                    out +=
                        '<div>' +
                        '  <a class="dropdown-button btn"  href="#" data-activates="poke-actions-' + pkmnUnique + '">' +
                        '    Actions' +
                        '  </a>' +
                        '  <ul id="poke-actions-' + pkmnUnique + '" class="dropdown-content">' +
                        actionsOut +
                        '  </ul>' +
                        '</div><br>';
                } else {
                    out += '<div>' +
                        '  <a class="dropdown-button btn disabled" href="#">Actions</a>' +
                        '</div><br>';
                }
            }

            out += '</div>';
        }
        // Add number of eggs
        out += '<div class="col s12 m4 l3 center" style="float: left;"><img src="image/items/Egg.png" class="png_img"><br><b>You have ' + eggs + ' egg' + (eggs !== 1 ? "s" : "") + '</div>';
        for (var b = 0; b < user.eggs.length; b++) {
            var incubator = user.eggs[b].inventory_item_data.egg_incubators.egg_incubator;
            if (!incubator.item_id) {
                var incubator = user.eggs[b].inventory_item_data.egg_incubators.egg_incubator[0];
            }
            var current_user_stats = self.user_data[self.settings.users[user_id]].stats[0].inventory_item_data.player_stats;
            var totalToWalk = incubator.target_km_walked - incubator.start_km_walked;
            var kmsLeft = incubator.target_km_walked - current_user_stats.km_walked;
            var walked = totalToWalk - kmsLeft;
            var eggString = (parseFloat(walked).toFixed(1) || 0) + "/" + (parseFloat(totalToWalk).toFixed(1) || 0) + "km";
            if (incubator.item_id == 902) {
                var img = 'EggIncubator';
            } else {
                var img = 'EggIncubatorUnlimited';
            }
            out += '<div class="col s12 m4 l3 center" style="float: left;"><img src="image/items/' + img + '.png" class="png_img"><br>';
            out += eggString;
        }
        out += '</div></div>';
        var nth = 0;
        out = out.replace(/<\/div><div/g, function (match, i, original) {
            nth++;
            return (nth % 4 === 0) ? '</div></div><div class="row"><div' : match;
        });
        $('#subcontent').html(out);
        $('.dropdown-button').dropdown();
    },
    sortAndShowPokedex: function (sortOn, user_id) {
        var self = this,
            out = '',
            user_id = (user_id || 0),
            user = self.user_data[self.settings.users[user_id]];

        out = '<div class="items"><div class="row">';
        var sortedPokedex = user.pokedex.getAllEntriesSorted(sortOn);
        for (var i = 0; i < sortedPokedex.length; i++) {
            var entry = sortedPokedex[i];
            var candyNum = user.getCandy(entry.pokemon_id);
            out += '<div class="col s12 m6 l3 center"><img src="image/pokemon/' +
                entry.image +
                '" class="png_img"><br><b> ' +
                Pokemon.getPaddedId(entry.pokemon_id) +
                ' - ' +
                entry.name +
                '</b><br>Times Seen: ' +
                entry.encountered +
                '<br>Times Caught: ' +
                entry.captured +
                '<br>Candy: ' +
                candyNum +
                '</div>';
        }
        out += '</div></div>';
        var nth = 0;
        out = out.replace(/<\/div><div/g, function (match, i, original) {
            nth++;
            return (nth % 4 === 0) ? '</div></div><div class="row"><div' : match;
        });
        $('#subcontent').html(out);
    },
    trainerFunc: function (data, username) {
        var self = mapView,
            coords = self.pathcoords[username][self.pathcoords[username].length - 1];
        for (var i = 0; i < data.cells.length; i++) {
            var cell = data.cells[i];
            if (data.cells[i].forts != undefined) {
                for (var x = 0; x < data.cells[i].forts.length; x++) {
                    var fort = cell.forts[x];
                    if (!self.forts[fort.id]) {
                        if (fort.type === 1) {
                            self.forts[fort.id] = new google.maps.Marker({
                                map: self.map,
                                position: {
                                    lat: parseFloat(fort.latitude),
                                    lng: parseFloat(fort.longitude)
                                },
                                icon: 'image/forts/img_pokestop.png'
                            });
                        } else {
                            self.forts[fort.id] = new google.maps.Marker({
                                map: self.map,
                                position: {
                                    lat: parseFloat(fort.latitude),
                                    lng: parseFloat(fort.longitude)
                                },
                                icon: 'image/forts/' + self.teams[(fort.owned_by_team || 0)] + '.png'
                            });
                        }
                        var fortPoints = '',
                            fortTeam = '',
                            fortType = 'PokeStop',
                            pokemonGuard = '';
                        if (fort.guard_pokemon_id != undefined) {
                            fortPoints = 'Points: ' + fort.gym_points;
                            fortTeam = 'Team: ' + self.teams[fort.owned_by_team] + '<br>';
                            fortType = 'Gym';
                            pokemonGuard = 'Guard Pokemon: ' + (Pokemon.getPokemonById(fort.guard_pokemon_id).Name || "None") + '<br>' + 'Level: ' + self.getGymLevel(fort.gym_points || 0) + '<br>';
                        }
                        var contentString = 'Id: ' + fort.id + '<br>Type: ' + fortType + '<br>' + pokemonGuard + fortPoints;
                        self.info_windows[fort.id] = new google.maps.InfoWindow({
                            content: contentString
                        });
                        google.maps.event.addListener(self.forts[fort.id], 'click', (function (marker, content, infowindow) {
                            return function () {
                                infowindow.setContent(content);
                                infowindow.open(map, marker);
                            };
                        })(self.forts[fort.id], contentString, self.info_windows[fort.id]));
                    }
                }
            }
        }
        if (coords > 1) {
            var tempcoords = [{
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng)
            }];
            if (tempcoords.lat != coords.lat && tempcoords.lng != coords.lng || self.pathcoords[username].length === 1) {
                self.pathcoords[username].push({
                    lat: parseFloat(data.lat),
                    lng: parseFloat(data.lng)
                });
            }
        } else {
            self.pathcoords[username].push({
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng)
            });
        }
        if (self.user_data[username].hasOwnProperty('marker') === false) {
            self.buildTrainerList();
            self.addInventory();
            logger.log({
                message: "Trainer loaded: " + username,
                color: "blue-text"
            });
            var randomSex = Math.floor(Math.random() * 1);
            self.user_data[username].marker = new google.maps.Marker({
                map: self.map,
                position: {
                    lat: parseFloat(data.lat),
                    lng: parseFloat(data.lng)
                },
                icon: 'image/trainer/' + self.trainerSex[randomSex] + Math.floor(Math.random() * self.numTrainers[randomSex] + 1) + '.png',
                zIndex: 2,
                label: username,
                clickable: false
            });
        } else {
            self.user_data[username].marker.setPosition({
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng)
            });
            if (self.pathcoords[username].length === 2) {
                self.user_data[username].trainerPath = new google.maps.Polyline({
                    map: self.map,
                    path: self.pathcoords[username],
                    geodisc: true,
                    // Need to set proper stroke color
                    strokeColor: self.pathColors[0],
                    strokeOpacity: 0.0,
                    strokeWeight: 2
                });
            } else {
                self.user_data[username].trainerPath.setPath(self.pathcoords[username]);
            }
            self.setBotPathOptions(self.settings.botPath);
        }
        if (self.settings.users.length === 1 && self.settings.userZoom === true) {
            self.map.setZoom(self.settings.zoom);
        }
        if (self.settings.users.length === 1 && self.settings.userFollow === true) {
            self.map.panTo({
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng)
            });
        }
    },
    getGymLevel: function (gymPoints) {
        var self = mapView;
        var level = 1;
        for (var myLevel in self.minimumPointsForLevel) {
            var minimumPoints = self.minimumPointsForLevel[myLevel];
            if (minimumPoints < gymPoints) {
                level = myLevel;
            }
        }
        return level;
    }
};

Promise.all([
    loadJSON('data/pokemondata.json').then(Pokemon.setPokemonData),
    loadJSON('data/pokemoncandy.json').then(Pokemon.setPokemonCandyData),
    loadJSON('data/levelXp.json').then(Player.setXpLevelData)
]).then(function() {
    $.getScript('https://maps.googleapis.com/maps/api/js?key={0}&libraries=drawing'.format(userInfo.gMapsAPIKey), function () {
        mapView.init();
        mapView.initMap();

        $(document).ready(function () {
            socket_io = io.connect('http://' + document.domain + ':' + location.port + '/event');
            socket_io.on('connect', function () {
                console.log('connected!');
            });
            socket_io.on('logging', function (msg) {
                for (var i = 0; i < msg.length; i++) {
                    logger.log({
                        message: msg[i].output,
                        color: msg[i].color + "-text",
                        toast: msg[i].toast || false
                    });
                }
            });
            socket_io.on("nearby_pokemon", function(data) {
                var nearby_pokemon = data["nearby_pokemon"];
                var username = data["username"];
                var player = mapView.user_data[username];

                for (var i = 0; i < nearby_pokemon.length; i++) {
                    var encounter = new PokemonEncounter(nearby_pokemon[i]);
                    var pokemon_name = encounter.getSpeciesName();
                    logger.log({
                        message: "[" + username + "] " + pokemon_name + " appeared",
                        color: "green-text"
                    });

                    var spawn_point_id = data["spawn_point_id"];

                    var map_marker = player.getPokemonAtSpawnPoint(spawn_point_id);
                    if (encounter.getEncounterId() !== undefined && encounter.getSpeciesNum() !== undefined) {
                        if (map_marker === undefined) {
                            player.updatePokemonAtSpawnPoint(spawn_point_id, new google.maps.Marker({
                                map: mapView.map,
                                position: {
                                    lat: encounter.getLatitude(),
                                    lng: encounter.getLongitude()
                                },
                                icon: {
                                    url: 'image/pokemon/' + Pokemon.getImageById(encounter.getSpeciesNum()),
                                    scaledSize: new google.maps.Size(70, 70)
                                },
                                zIndex: 4,
                                optimized: false,
                                clickable: false
                            }));
                        } else {
                            map_marker.setPosition({
                                lat: encounter.getLatitude(),
                                lng: encounter.getLongitude()
                            });
                            map_marker.setIcon({
                                url: 'image/pokemon/' + Pokemon.getImageById(encounter.getSpeciesNum()),
                                scaledSize: new google.maps.Size(70, 70)
                            });
                        }
                    } else {
                        player.removePokemonAtSpawnPoint(spawn_point_id);
                    }
                }
            });

            pokemonActions = function (socket_io) {
                var actions = {
                    releasePokemon: {
                        button: function (pokemon, user_id) {
                            return '<a href="#!" onClick="pokemonActions.releasePokemon.action(\'' + pokemon.unique_id + '\')">Release</a>';
                        },
                        action: function (id) {
                            if (confirm("Are you sure you want to release this pokemon? THIS CANNOT BE UNDONE!")) {
                                socket_io.emit('user_action', {'event': 'release_pokemon', data: {'pokemon_id': id}});
                                mapView.sortAndShowBagPokemon(false, false);
                            }
                        }
                    },

                    evolvePokemon: {
                        button: function (pokemon, user_id) {
                            var user = mapView.user_data[mapView.settings.users[user_id]];
                            var pkmnData = mapView.pokemonArray[pokemon.pokemon_id - 1],
                                candy = user.getCandy(pokemon.pokemon_id),
                                canEvolve = false;
                            if ("undefined" != typeof pkmnData['Next evolution(s)'] && "undefined" != typeof pkmnData['Next Evolution Requirements']) {
                                canEvolve = (candy >= pkmnData['Next Evolution Requirements']['Amount'])
                            }
                            return (canEvolve ? '<a href="#!" onClick="pokemonActions.evolvePokemon.action(\'' + pokemon.unique_id + '\')">Evolve</a>' : false);
                        },
                        action: function (id) {
                            if (confirm("Are you sure you want to evolve this pokemon? THIS CANNOT BE UNDONE!")) {
                                socket_io.emit('user_action', {'event': 'evolve_pokemon', data: {'pokemon_id': id}});
                                mapView.sortAndShowBagPokemon(false, false);
                            }
                        }
                    }
                };

                var enabledActions = {};
                for (var i in actions) {
                    if (mapView.settings.actionsEnabled === true) {
                        enabledActions[i] = actions[i];
                    } else if (Array.isArray(mapView.settings.actionsEnabled)) {
                        if (mapView.settings.actionsEnabled.indexOf(i) !== -1) {
                            enabledActions[i] = actions[i];
                        }
                    }
                }

                return enabledActions;
            }(socket_io)
        });
    });
});