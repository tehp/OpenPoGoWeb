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
    this.pokedex = new Pokedex(filterInventory(data, 'pokedex_entry'));
    this.stats = filterInventory(data, 'player_stats')[0].inventory_item_data.player_stats;
    this.eggs = filterInventory(data, 'egg_incubators')
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
        sortedPokemon.sort(function(a, b) {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          if (a.combatPower > b.combatPower) return -1;
          if (a.combatPower < b.combatPower) return 1;
          return 0;
        });
        break;
      case 'id':
        sortedPokemon.sort(function(a, b) {
          if (a.id < b.id) return -1;
          if (a.id > b.id) return 1;
          if (a.combatPower > b.combatPower) return -1;
          if (a.combatPower < b.combatPower) return 1;
          return 0;
        });
        break;
      case 'cp':
        sortedPokemon.sort(function(a, b) {
          if (a.combatPower > b.combatPower) return -1;
          if (a.combatPower < b.combatPower) return 1;
          return 0;
        });
        break;
      case 'iv':
        sortedPokemon.sort(function(a, b) {
          if (a.iv > b.iv) return -1;
          if (a.iv < b.iv) return 1;
          return 0;
        });
        break;
      case 'time':
        sortedPokemon.sort(function(a, b) {
          if (a.creationTime > b.creationTime) return -1;
          if (a.creationTime < b.creationTime) return 1;
          return 0;
        });
        break;
      case 'candy':
        sortedPokemon.sort(function(a, b) {
          if (this.getCandy(a.id) > this.getCandy(b.id)) return -1;
          if (this.getCandy(a.id) < this.getCandy(b.id)) return 1;
          return 0;
        });
        break;
      default:
        sortedPokemon.sort(function(a, b) {
          if (a.cp > b.cp) return -1;
          if (a.cp < b.cp) return 1;
          return 0;
        });
        break;
    }
    return sortedPokemon;
  }
}
