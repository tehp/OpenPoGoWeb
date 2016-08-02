class Player {
    constructor(name) {
        this.name = name;
        this.bagCandy = undefined;
        this.bagItems = undefined;
        this.bagPokemon = undefined;
        this.eggs = undefined;
        this.pokedex = undefined;
        this.stats = undefined;
        this.trainerPath = undefined;

        this._nearby_pokemon = {};
        this._marker = undefined;
    }

    updateInventory(data) {
        function filterInventory(arr, search) {
            var filtered = [];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].inventory_item_data[search] != undefined) {
                    filtered.push(arr[i]);
                }
            }
            return filtered;
        }

        this.bagCandy = filterInventory(data, 'candy');
        this.bagItems = filterInventory(data, 'item');
        //this.pokedex = new Pokedex(filterInventory(data, 'pokedex_entry'));
        this.stats = filterInventory(data, 'player_stats')[0].inventory_item_data.player_stats;
        this.eggs = filterInventory(data, 'egg_incubators');
        this.updatePokemon(filterInventory(data, 'pokemon_data'));
    }

    updatePokemon(data) {
        this.bagPokemon = [];
        for (var i = 0; i < data.length; i++) {
            var pokeData = data[i].inventory_item_data.pokemon_data;
            if (pokeData.is_egg) {
                continue;
            }
            this.bagPokemon.push(new Pokemon(pokeData));
        }
    }

    getMapMarker() {
        return this._marker;
    }

    setMapMarker(marker) {
        this._marker = marker;
    }

    getCandy(pokemon_num) {
        for (var i = 0; i < this.bagCandy.length; i++) {
            var checkCandy = this.bagCandy[i].inventory_item_data.pokemon_family.family_id;
            if (Pokemon.getCandyId(pokemon_num) === checkCandy) {
                return (this.bagCandy[i].inventory_item_data.pokemon_family.candy || 0);
            }
        }
        return 0
    }

    getSortedPokemon(sortKey) {
        var sortedPokemon = this.bagPokemon.slice();
        switch (sortKey) {
            case 'name':
                sortedPokemon.sort(function (a, b) {
                    if (a.getName() < b.getName()) return -1;
                    if (a.getName() > b.getName()) return 1;
                    if (a.getCombatPower() > b.getCombatPower()) return -1;
                    if (a.getCombatPower() < b.getCombatPower()) return 1;
                    return 0;
                });
                break;
            case 'id':
                sortedPokemon.sort(function (a, b) {
                    if (a.getSpeciesNum() < b.getSpeciesNum()) return -1;
                    if (a.getSpeciesNum() > b.getSpeciesNum()) return 1;
                    if (a.getCombatPower() > b.getCombatPower()) return -1;
                    if (a.getCombatPower() < b.getCombatPower()) return 1;
                    return 0;
                });
                break;
            case 'iv':
                sortedPokemon.sort(function (a, b) {
                    if (a.getPotential() > b.getPotential()) return -1;
                    if (a.getPotential() < b.getPotential()) return 1;
                    return 0;
                });
                break;
            case 'time':
                sortedPokemon.sort(function (a, b) {
                    if (a.getCreationTime() > b.getCreationTime()) return -1;
                    if (a.getCreationTime() < b.getCreationTime()) return 1;
                    return 0;
                });
                break;
            case 'candy':
                sortedPokemon.sort(function (a, b) {
                    var a_candy = this.getCandy(a.getSpeciesNum());
                    var b_candy = this.getCandy(b.getSpeciesNum());
                    if (a_candy > b_candy) return -1;
                    if (a_candy < b_candy) return 1;
                    return 0;
                });
                break;
            case 'cp':
            default:
                sortedPokemon.sort(function (a, b) {
                    if (a.getCombatPower() > b.getCombatPower()) return -1;
                    if (a.getCombatPower() < b.getCombatPower()) return 1;
                    return 0;
                });
                break;
        }
        return sortedPokemon;
    }

    getLevel() {
        return this.stats.level;
    }

    getExperience() {
        return this.stats.experience;
    }

    xpToNextLevel() {
        var expNeeded = this.totalXpToNextLevel();
        var currentExp = this.getExperience() - Player.xpLevelData[currentLevel - 1]["current_level_xp"];
        return expNeeded - currentExp;
    }

    totalXpToNextLevel() {
        return Player.xpLevelData[this.getLevel() - 1]["exp_to_next_level"];
    }

    static setXpLevelData(data) {
        Player.xpLevelData = data;
    }
}
