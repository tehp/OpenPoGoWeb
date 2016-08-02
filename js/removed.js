function trainerFunc (data, username) {
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
    
}