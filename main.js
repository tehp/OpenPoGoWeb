var i;
var map;
var menu;
var out1;
var out;
var user_index;

var emptyDex = [];
var forts = [];
var info_windows = [];
var outArray = [];
var numTrainers = [
  177, 
  109
];
var teams = [
  'TeamLess',
  'Mystic',
  'Valor',
  'Instinct'
];
var trainerSex = [
  'm',
  'f'
];

var bagCandy = {};
var bagItems = {};
var bagPokemon = {};
var inventory = {};
var playerInfo = {};
var pokedex = {};
var pokemonArray = {};
var stats = makeArrays();
var user_data = {};
var itemsArray = {
  '0': 'Unknown',
  '1': 'Pokeball',
  '2': 'Greatball',
  '3': 'Ultraball',
  '4': 'Masterball',
  '101': 'Potion',
  '102': 'Super Potion',
  '103': 'Hyper Potion',
  '104': 'Max Potion',
  '201': 'Revive',
  '202': 'Max Revive',
  '301': 'Lucky Egg',
  '401': 'Incense',
  '402': 'Spicy Incense',
  '403': 'Cool Incense',
  '404': 'Floral Incense',
  '501': 'Troy Disk',
  '602': 'X Attack',
  '603': 'X Defense',
  '604': 'X Miracle',
  '701': 'Razz Berry',
  '702': 'Bluk Berry',
  '703': 'Nanab Berry',
  '704': 'Wepar Berry',
  '705': 'Pinap Berry',
  '801': 'Special Camera',
  '901': 'Incubator (Unlimited)',
  '902': 'Incubator',
  '1001': 'Pokemon Storage Upgrade',
  '1002': 'Item Storage Upgrade'
};

$(document).ready(function() {
  loadScript("https://maps.googleapis.com/maps/api/js?key=" + gMapsAPIKey + "&libraries=drawing&callback=initMap");
});

function loadScript(src) {
  var element = document.createElement("script");
  element.src = src;
  document.body.appendChild(element);
}

function initMap() {
  loadJSON('pokemondata.json', function(data, successData) {
    console.log('Loaded pokemon data..');
    pokemonArray = data;
  }, errorFunc, 'pokemonData');
  for (var i = 0; i < users.length; i++) {
    user_data[users[i]] = {};
  }
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 50.0830986, lng: 6.7613762},
    zoom: 8
  });

  document.getElementById('switchPan').checked = userFollow;
  document.getElementById('switchZoom').checked = userZoom;
  document.getElementById('imageType').checked = (imageExt != '.png');
  setTimeout(function(){
    placeTrainer();
    addCatchable();
    addInventory();
    setTimeout(function(){
      setInterval(updateTrainer, 1000);
      setInterval(addCatchable, 1000);
    }, 5000);
  }, 5000);
}

$('#switchPan').change(function(){
    if (this.checked) {
      userFollow = true;
    } else {
      userFollow = false;
    }
});

$('#switchZoom').change(function(){
    if (this.checked) {
      userZoom = true;
    } else {
      userZoom = false;
    }
});

$('#imageType').change(function(){
    if (this.checked) {
      imageExt = '.gif';
    } else {
      imageExt = '.png';
    }
});

$('#optionsButton').click(function(){
    $('#optionsList').toggle();
});

$('#trainerButton').click(function(){
    $('#trainerList').toggle();
});

$('#tInfo').click(function(){
    if (menu == undefined || menu == 1) {
      $('#submenu').toggle();
    }
    if (menu != 1 && $('#submenu').is(':hidden')) {
      $('#submenu').toggle();
    }
    menu = 1;
    buildMenu();
});

$('#tItems').click(function(){
    if (menu == undefined || menu == 2) {
      $('#submenu').toggle();
    }
    if (menu != 2 && $('#submenu').is(':hidden')) {
      $('#submenu').toggle();
    }
    menu = 2;
    buildMenu();
});

$('#tPokemon').click(function(){
    if (menu == undefined || menu == 3) {
      $('#submenu').toggle();
    }
    if (menu != 3 && $('#submenu').is(':hidden')) {
      $('#submenu').toggle();
    }
    menu = 3;
    buildMenu();
});

$('#tPokedex').click(function(){
    if (menu == undefined || menu == 4) {
      $('#submenu').toggle();
    }
    if (menu != 4 && $('#submenu').is(':hidden')) {
      $('#submenu').toggle();
    }
    menu = 4;
    buildMenu();
});


var errorFunc = function(xhr) {
  console.error(xhr);
};

function makeArrays() {
  var tempArr = {};
  for(i = 0; i < users.length; i ++) {
    tempArr[users[i]] = {};
  }
  return tempArr;
}

var invSuccess = function(data, user_index) {
  bagCandy[users[user_index]] = filter(data, 'pokemon_family');
  bagItems[users[user_index]] = filter(data, 'item');
  bagPokemon[users[user_index]] = filter(data, 'pokemon_data');
  pokedex[users[user_index]] = filter(data, 'pokedex_entry');
  stats[users[user_index]] = filter(data, 'player_stats');
};

var trainerFunc = function(data, user_index) {
  for (var i = 0; i < data.cells.length; i++) {
    cell = data.cells[i];
    if (data.cells[i].forts != undefined) {
      for (var x = 0; x < data.cells[i].forts.length; x++) {
        var fort = cell.forts[x];
        if (!forts[fort.id]) {
          if (fort.type === 1 ) {
            forts[fort.id] = new google.maps.Marker({
              map: map,
              position: {
                lat: parseFloat(fort.latitude),
                lng: parseFloat(fort.longitude)
              },
              icon: 'image/forts/img_pokestop.png'
            });
          } else {
            forts[fort.id] = new google.maps.Marker({
              map: map,
              position: {
                lat: parseFloat(fort.latitude),
                lng: parseFloat(fort.longitude)
              },
              icon: 'image/forts/' + teams[fort.owned_by_team] + '.png'
            });
          }
          fortPoints = '';
          fortTeam = '';
          fortType = 'PokeStop';
          pokemonGuard = '';
          if (fort.guard_pokemon_id != undefined) {
            fortPoints = 'Points: ' + fort.gym_points;
            fortTeam = 'Team: ' + teams[fort.owned_by_team] + '<br>';
            fortType = 'Gym';
            pokemonGuard = 'Guard Pokemon: ' + pokemonArray[fort.guard_pokemon_id-1].Name + '<br>';
          }
          var contentString = 'Id: ' + fort.id + '<br>Type: ' + fortType + '<br>' + pokemonGuard + fortPoints;
          info_windows[fort.id] = new google.maps.InfoWindow({
            content: contentString
          });
          google.maps.event.addListener(forts[fort.id], 'click', (function(marker, content, infowindow) {
            return function() {
              infowindow.setContent(content);
              infowindow.open(map, marker);
            };
          })(forts[fort.id], contentString, info_windows[fort.id]));
        }
      }
    }
  }
  if (user_data[users[user_index]].hasOwnProperty('marker') === false) {
    Materialize.toast('New Marker: Trainer - ' + data.lat + ', ' + data.lng + users[user_index], 3000, 'rounded');
    randomSex = Math.floor(Math.random() * 1);
    user_data[users[user_index]].marker = new google.maps.Marker({
      map: map,
      position: {lat: parseFloat(data.lat), lng: parseFloat(data.lng)},
      icon: 'image/trainer/' + trainerSex[randomSex] + Math.floor(Math.random() * numTrainers[randomSex]) + '.png',
      zIndex: 2,
      label: users[user_index]
    });
  } else {
    user_data[users[user_index]].marker.setPosition({lat: parseFloat(data.lat), lng: parseFloat(data.lng)});
  }
  if (users.length === 1 && userZoom === true) {
    map.setZoom(16);
  }
  if (users.length === 1 && userFollow === true) {
    map.panTo({
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng)
    });
  }
};

function placeTrainer() {
  for (var i = 0; i < users.length; i++) {
    loadJSON('location-' + users[i] + '.json', trainerFunc, errorFunc, i);
  }
}
function updateTrainer() {
  for (var i = 0; i < users.length; i++) {
    loadJSON('location-' + users[i] + '.json', trainerFunc, errorFunc, i);
  }
}

var catchSuccess = function(data, user_index) {
  if (data !== undefined && Object.keys(data).length > 0) {
    if (user_data[users[user_index]].catchables === undefined) {
      user_data[users[user_index]].catchables = {};
    }
    if (data.latitude !== undefined) {
      if (user_data[users[user_index]].catchables.hasOwnProperty(data.spawnpoint_id) === false) {
        poke_name = pokemonArray[data.pokemon_id-1].Name;
        Materialize.toast(poke_name + ' appeared near trainer: ' + users[user_index], 3000, 'rounded');
        user_data[users[user_index]].catchables[data.spawnpoint_id] = new google.maps.Marker({
          map: map,
          position: {lat: parseFloat(data.latitude), lng: parseFloat(data.longitude)},
          icon: 'image/pokemon/' + pad_with_zeroes(data.pokemon_id, 3) + imageExt,
          zIndex: 4,
          optimized: false
        });
          if (userZoom === true) {
            map.setZoom(16);
          }
          if (userFollow === true) {
            map.panTo({
              lat: parseFloat(data.latitude),
              lng: parseFloat(data.longitude)
            });
          }
      } else {
        user_data[users[user_index]].catchables[data.spawnpoint_id].setPosition({
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude)
        });
        user_data[users[user_index]].catchables[data.spawnpoint_id].setIcon('image/pokemon/' + pad_with_zeroes(data.pokemon_id, 3) + imageExt);
      }
    }
  } else {
    if (user_data[users[user_index]].catchables !== undefined && Object.keys(user_data[users[user_index]].catchables).length > 0) {
      Materialize.toast('The Pokemon has been caught or fled' + users[user_index], 3000, 'rounded');
      for (var key in user_data[users[user_index]].catchables) {
        user_data[users[user_index]].catchables[key].setMap(null);
      }
      user_data[users[user_index]].catchables = undefined;
    }
  }
};

function addCatchable() {
  for (var i = 0; i < users.length; i++) {
    loadJSON('catchable-' + users[i] + '.json', catchSuccess, errorFunc, i);
  }
}
function addInventory() {
  for (var i = 0; i < users.length; i++) {
    loadJSON('inventory-' + users[i] + '.json', invSuccess, errorFunc, i);
  }
}

function pad_with_zeroes(number, length) {
  var my_string = '' + number;
  while (my_string.length < length) {
      my_string = '0' + my_string;
  }
  return my_string;
}

function filter(arr, search) {
  var filtered = [];
  for(i=0; i < arr.length; i++) {
    if(arr[i].inventory_item_data[search] != undefined) {
      filtered.push(arr[i]);
    }
  }
  return filtered;
}

function loadJSON(path, success, error, successData) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          success(JSON.parse(xhr.responseText.replace(/\bNaN\b/g, 'null')), successData);
      } else {
        if (error)
        error(xhr);
      }
    }
  };
xhr.open('GET', path, true);
xhr.send();
}

$(document).ready(function(){
  $('.tooltipped').tooltip({delay: 50});
});

function buildMenu() {
  addInventory();
  if (menu == 1) {
    document.getElementById('subtitle').innerHTML = 'Trainer Info';
    out = '<div class="row"><div class="col s12"><ul class="tabs">';
    for (i = 0; i < users.length; i++) {
      out += '<li class="tab col s3"><a href="#tabI' +
              users[i] +
              '">' +
              users[i] +
              '</a></li>';
    }
    out += '</ul></div>';
    for (i = 0; i < users.length; i++) {
      out += '<div id="tabI' +
              users[i] +
              '" class="col s12"><h5>' +
              users[i] +
              '</h5><br>Level: ' +
              stats[users[i]][0].inventory_item_data.player_stats.level +
              '<br>Exp: ' +
              stats[users[i]][0].inventory_item_data.player_stats.experience +
              '<br>Exp to Lvl ' +
              ( parseInt(stats[users[i]][0].inventory_item_data.player_stats.level, 10) + 1 ) +
              ': ' +
              (parseInt(stats[users[i]][0].inventory_item_data.player_stats.next_level_xp, 10) - stats[users[i]][0].inventory_item_data.player_stats.experience) +
              '<br>Pokemon Encountered: ' +
              stats[users[i]][0].inventory_item_data.player_stats.pokemons_encountered +
              '<br>Pokeballs Thrown: ' +
              stats[users[i]][0].inventory_item_data.player_stats.pokeballs_thrown +
              '<br>Pokemon Caught: ' +
              stats[users[i]][0].inventory_item_data.player_stats.pokemons_captured +
              '<br>Small Ratata Caught: ' +
              stats[users[i]][0].inventory_item_data.player_stats.small_rattata_caught +
              '<br>Pokemon Evolved: ' +
              stats[users[i]][0].inventory_item_data.player_stats.evolutions +
              '<br>Eggs Hatched: ' +
              stats[users[i]][0].inventory_item_data.player_stats.eggs_hatched +
              '<br>Unique Pokedex Entries: ' +
              stats[users[i]][0].inventory_item_data.player_stats.unique_pokedex_entries +
              '<br>PokeStops Visited: ' +
              stats[users[i]][0].inventory_item_data.player_stats.poke_stop_visits +
              '<br>Kilometers Walked: ' +
              parseFloat(stats[users[i]][0].inventory_item_data.player_stats.km_walked).toFixed(2) +
              '</div>';
    }
    out += '</div>';
    document.getElementById('subcontent').innerHTML = out;
    $('ul.tabs').tabs();
  }
  if (menu == 2) {
    document.getElementById('subtitle').innerHTML = "Items in Bag";
    out = '<div class="row"><div class="col s12"><ul class="tabs">';
    for (i = 0; i < users.length; i++) {
      out += '<li class="tab col s3"><a href="#tabB' +
              users[i] +
              '">' +
              users[i] +
              '</a></li>';
    }
    out += '</ul></div>';
    for (i = 0; i < users.length; i++) {
      out += '<div id="tabB' +
                users[i] +
                '" class="col s12 items"><h5>' + users[i] + '</h5>';
      for (x = 0; x < bagItems[users[i]].length; x++) {
        out += '<table><tr><td><img src="image/items/' +
                bagItems[users[i]][x].inventory_item_data.item.item_id +
                '.png" class="item_img"></td><td>Item: ' +
                itemsArray[bagItems[users[i]][x].inventory_item_data.item.item_id] +
                '<br>Count: ' +
                bagItems[users[i]][x].inventory_item_data.item.count +
                '</td>';
      }
      out += '</tr></table></div>';
    }
    out += '</div>';
    document.getElementById('subcontent').innerHTML = out;
    $('ul.tabs').tabs();
  }
  if (menu == 3) {
    document.getElementById('subtitle').innerHTML = "Pokemon in Bag";
    out = '<div class="col s12"><ul class="tabs">';
    for (i = 0; i < users.length; i++) {
      out += '<li class="tab col s3"><a href="#tabBP' +
              users[i] +
              '">' +
              users[i] +
              '</a></li>';
    }
    out += '</ul></div>';
    for (i = 0; i < users.length; i++) {
      pkmnTotal = bagPokemon[users[i]].length;
      out += '<div id="tabBP' +
            users[i] +
            '" class="col s12 items"><h5>' +
            users[i] +
            ' | ' +
            pkmnTotal +
            ' Pokemon</h5><table>';
      for (x = 0; x < bagPokemon[users[i]].length; x++) {
        if (bagPokemon[users[i]][x].inventory_item_data.pokemon_data.is_egg) {
          pkmnNum = '???';
          pkmnImage = 'Egg.png';
          pkmnName = 'Egg';
          pkmnCP = '';
          pkmnMove1 = '';
          pkmnMove2 = '';
          ivList = '<td></td>';
          pokeballUsed + '<td></td>';
        } else {
          pkmnNum = bagPokemon[users[i]][x].inventory_item_data.pokemon_data.pokemon_id;
          pkmnImage = pad_with_zeroes(bagPokemon[users[i]][x].inventory_item_data.pokemon_data.pokemon_id, 3) + '.png';
          pkmnName = pokemonArray[pkmnNum-1].Name;
          pkmnCP = '<br>CP: ' + bagPokemon[users[i]][x].inventory_item_data.pokemon_data.cp;
          pkmnMove1 = '<br>Move 1: ' + bagPokemon[users[i]][x].inventory_item_data.pokemon_data.move_1;
          pkmnMove2 = '<br>Move 2: ' + bagPokemon[users[i]][x].inventory_item_data.pokemon_data.move_2;
          ivAtk = bagPokemon[users[i]][x].inventory_item_data.pokemon_data.individual_attack;
          ivDef = bagPokemon[users[i]][x].inventory_item_data.pokemon_data.individual_defense;
          ivSta = bagPokemon[users[i]][x].inventory_item_data.pokemon_data.individual_stamina;
          if (ivAtk === undefined) { ivAtk = 0; }
          if (ivDef === undefined) { ivDef = 0; }
          if (ivSta === undefined) { ivSta = 0; }
          ivList = '<td>Attack: ' + ivAtk + '<br>Defense: ' + ivDef + '<br>Stamina: ' + ivSta + '</td>';
          pokeballUsed = '<td><img src="image/items/' + bagPokemon[users[i]][x].inventory_item_data.pokemon_data.pokeball + '.png" class="png_img_small"></td>';
        }
        out += '<tr><td><img src="image/pokemon/' + 
                pkmnImage + 
                '" class="png_img"></td><td class="left-align">Name: ' + 
                pkmnName +
                '<br>Number: ' + 
                pkmnNum + 
                pkmnCP +
                pkmnMove1 +
                pkmnMove2 +
                '</td>' +
                ivList +
                pokeballUsed +
                '</tr>';
      }
      out += '</table></div>';
    }
    out += '</div>';
    document.getElementById('subcontent').innerHTML = out;
    $('ul.tabs').tabs();
  }
  if (menu == 4) {
    document.getElementById('subtitle').innerHTML = "Pokedex";
    out = '<div class="col s12"><ul class="tabs">';
    for (i = 0; i < users.length; i++) {
      out += '<li class="tab col s3"><a href="#tabP' +
              users[i] +
              '">' +
              users[i] +
              '</a></li>';
    }
    out += '</ul></div>';
    for (i = 0; i < users.length; i++) {
      pkmnTotal = pokedex[users[i]].length;
      out += '<div id="tabP' +
            users[i] +
            '" class="col s12 items"><h5>' + users[i] + ' | ' + pkmnTotal + ' / 151</h5><table>';
      for (x = 0; x < pokedex[users[i]].length; x++) {
        pkmnNum = pokedex[users[i]][x].inventory_item_data.pokedex_entry.pokedex_entry_number;
        pkmnImage = pad_with_zeroes(pokedex[users[i]][x].inventory_item_data.pokedex_entry.pokedex_entry_number, 3) +'.png';
        pkmnName = pokemonArray[pkmnNum-1].Name;
        out += '<tr><td><img src="image/pokemon/' +
                pkmnImage +
                '" class="png_img"></td><td class="left-align">Name: ' +
                pkmnName +
                '<br>Number: ' +
                pkmnNum +
                '<br>Times Encountered: ' +
                pokedex[users[i]][x].inventory_item_data.pokedex_entry.times_encountered + 
                '<br>Times Caught: ' +
                pokedex[users[i]][x].inventory_item_data.pokedex_entry.times_captured +
                '</td></tr>';
      }
      out += '</table></div>';
    }
    out += '</div>';
    document.getElementById('subcontent').innerHTML = out;
    $('ul.tabs').tabs();
  }
}