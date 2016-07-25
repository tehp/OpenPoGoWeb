var i;
var map;
var openFlag1 = false;
var openFlag2 = false;
var openFlag3 = false;
var openFlag4 = false;
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
var pokemoncandyArray = {};
var stats = {};
var user_data = {};
var pathcoords = {};
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
  log({message:'Loading Data..'});
  loadJSON('pokemondata.json', function(data, successData) {
    pokemonArray = data;
  }, errorFunc, 'pokemonData');
  loadJSON('pokemoncandy.json', function(data, successData) {
    pokemoncandyArray = data;
  }, errorFunc, 'pokemonCandy');
  for (var i = 0; i < users.length; i++) {
    user_data[users[i]] = {};
    pathcoords[users[i]] = [];
  }
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 50.0830986, lng: 6.7613762},
    zoom: 8
  });

  document.getElementById('switchPan').checked = userFollow;
  document.getElementById('switchZoom').checked = userZoom;
  document.getElementById('imageType').checked = (imageExt != '.png');
  document.getElementById('strokeOn').checked = false;
  placeTrainer();
  addCatchable();
  log({message:'Data Loaded!'});
  setInterval(updateTrainer, 1000);
  setInterval(addCatchable, 1000);
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

$('#strokeOn').change(function(){
    for (var i = 0; i < users.length; i++) {
        user_data[users[i]].trainerPath.setOptions({strokeOpacity: this.checked ? 1.0 : 0.0})
    }
});

$('#optionsButton').click(function(){
    $('#optionsList').toggle();
});

$('#logs-button').click(function(){
  $('#logs-panel').toggle();
});

var errorFunc = function(xhr) {
  console.error(xhr);
};

var invSuccess = function(data, user_index) {
  user_data[users[user_index]].bagCandy = filter(data, 'pokemon_family');
  user_data[users[user_index]].bagItems = filter(data, 'item');
  user_data[users[user_index]].bagPokemon = filter(data, 'pokemon_data');
  user_data[users[user_index]].pokedex = filter(data, 'pokedex_entry');
  user_data[users[user_index]].stats = filter(data, 'player_stats');
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
              icon: 'image/forts/' + teams[(fort.owned_by_team || 0)] + '.png'
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
            pokemonGuard = 'Guard Pokemon: ' + (pokemonArray[fort.guard_pokemon_id-1].Name || "None") + '<br>';
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
  if (pathcoords[users[user_index]][pathcoords[users[user_index]].length] > 1) {
    var tempcoords = [{lat: parseFloat(data.lat), lng: parseFloat(data.lng)}];
    if (tempcoords.lat != pathcoords[users[user_index]][pathcoords[users[user_index]].length-1].lat && tempcoords.lng != pathcoords[users[user_index]][pathcoords[users[user_index]].length-1].lng || pathcoords[users[user_index]].length === 1) {
      pathcoords[users[user_index]].push({lat: parseFloat(data.lat), lng: parseFloat(data.lng)})
    }
  } else {
    pathcoords[users[user_index]].push({lat: parseFloat(data.lat), lng: parseFloat(data.lng)})
  }  
  if (user_data[users[user_index]].hasOwnProperty('marker') === false) {
    buildTrainerList();
    addInventory();
    log({message: "Trainer loaded: " +users[user_index], color: "blue-text"});
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
    if (pathcoords[users[user_index]].length === 2) {
      user_data[users[user_index]].trainerPath = new google.maps.Polyline({
        map: map,
        path: pathcoords[users[user_index]],
        geodisc: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.0,
        strokeWeight: 2
      });
    } else {
      user_data[users[user_index]].trainerPath.setPath(pathcoords[users[user_index]]);
    }
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
        log({message: poke_name+" appeared near trainder: " +users[user_index], color: "green-text"});
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
      log({message: "The Pokemon has been caught or fled " +users[user_index]});
      for (var key in user_data[users[user_index]].catchables) {
        user_data[users[user_index]].catchables[key].setMap(null);
      }
      user_data[users[user_index]].catchables = undefined;
    }
  }
};

function findBot(user_index) {
  map.setZoom(16);
  map.panTo({
    lat: parseFloat(pathcoords[users[user_index]][pathcoords[users[user_index]].length-1].lat),
    lng: parseFloat(pathcoords[users[user_index]][pathcoords[users[user_index]].length-1].lng)
  });

}

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

// Init tooltip

$(document).ready(function(){
  $('.tooltipped').tooltip({delay: 50});
});

// Bots list and menus

$(document).on('click','.tInfo',function(){
  if (!openFlag1) {
    buildMenu($(this).closest("ul").attr("user_id"),1);
    openFlag1 = true;
    openFlag2 = false;
    openFlag3 = false;
    openFlag4 = false;
  } else {
    $('#submenu').toggle();
    openFlag1 = false;
    openFlag2 = false;
    openFlag3 = false;
    openFlag4 = false;
  }
});

$(document).on('click','.tItems',function(){
  if (!openFlag2) {
    buildMenu($(this).closest("ul").attr("user_id"),2);
    openFlag2 = true;
    openFlag1 = false;
    openFlag3 = false;
    openFlag4 = false;
  } else {
    $('#submenu').toggle();
    openFlag1 = false;
    openFlag2 = false;
    openFlag3 = false;
    openFlag4 = false;
  }
});

$(document).on('click','.tPokemon',function(){
  if (!openFlag3) {
    buildMenu($(this).closest("ul").attr("user_id"),3);
    openFlag3 = true;
    openFlag1 = false;
    openFlag2 = false;
    openFlag4 = false;
  } else {
    $('#submenu').toggle();
    openFlag1 = false;
    openFlag2 = false;
    openFlag3 = false;
    openFlag4 = false;
  }
});

$(document).on('click','.tPokedex',function(){
  if (!openFlag4) {
    buildMenu($(this).closest("ul").attr("user_id"),4);
    openFlag4 = true;
    openFlag1 = false;
    openFlag2 = false;
    openFlag3 = false;
  } else {
    $('#submenu').toggle();
    openFlag1 = false;
    openFlag2 = false;
    openFlag3 = false;
    openFlag4 = false;
  }
});

$(document).on('click','#close',function(){
  $('#submenu').toggle();
    openFlag1 = false;
    openFlag2 = false;
    openFlag3 = false;
    openFlag4 = false;
});

$(document).on('click','.bot-name',function(){
  if (openFlag1 || openFlag2 || openFlag3 || openFlag4) {
    $('#submenu').toggle();
    openFlag1 = false;
    openFlag2 = false;
    openFlag3 = false;
    openFlag4 = false;
  }
});

function buildTrainerList() {
  var out = '<div class="col s12"><ul id="bots-list" class="collapsible" data-collapsible="accordion"> \
              <li><div class="collapsible-title"><i class="material-icons">people</i>Bots</div></li>';
  for(var i = 0; i < users.length; i++)
  {
    out += '<li><div class="collapsible-header bot-name">'+users[i]+
           '</div><div class="collapsible-body"><ul user_id="'+i+'">\
           <li><a class="indigo waves-effect waves-light btn tInfo">Info</a></li><br>\
           <li><a class="indigo waves-effect waves-light btn tItems">Items</a></li><br>\
           <li><a class="indigo waves-effect waves-light btn tPokemon">Pokemon</a></li><br>\
           <li><a class="indigo waves-effect waves-light btn tPokedex">Pokedex</a></li><br>\
           <li><a class="indigo waves-effect waves-light btn tFind" onClick="findBot('+i+')">Find</a></li>\
           </ul> \
           </div>\
           </li>';
  }
  out += "</ul></div>";
  document.getElementById('trainers').innerHTML = out;
  $('.collapsible').collapsible();
}

function buildMenu(user_id, menu) {
  $("#submenu").show();
  if (menu == 1) {
    document.getElementById('subtitle').innerHTML = 'Trainer Info';

    document.getElementById('sortButtons').innerHTML = "";

    out = '';
    var current_user_stats = user_data[users[user_id]].stats[0].inventory_item_data.player_stats;
      out += '<div class="row"><div class="col s12"><h5>' +
              users[user_id] +
              '</h5><br>Level: ' +
              current_user_stats.level +
              '<br>Exp: ' +
              current_user_stats.experience +
              '<br>Exp to Lvl ' +
              ( parseInt(current_user_stats.level, 10) + 1 ) +
              ': ' +
              (parseInt(current_user_stats.next_level_xp, 10) - current_user_stats.experience) +
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
    
    document.getElementById('subcontent').innerHTML = out;
  }
  if (menu == 2) {
    var current_user_bag_items = user_data[users[user_id]].bagItems;
    document.getElementById('subtitle').innerHTML = current_user_bag_items.length+" items in Bag";

    document.getElementById('sortButtons').innerHTML = "";

    out = '<div class="row items">';
    for (i = 0; i < current_user_bag_items.length; i++) {
      out += '<div class="col s12 m4 l3 center" style="float: left"><img src="image/items/' +
              current_user_bag_items[i].inventory_item_data.item.item_id +
              '.png" class="item_img"><br><b>' +
              itemsArray[current_user_bag_items[i].inventory_item_data.item.item_id] +
              '</b><br>Count: ' +
              (current_user_bag_items[i].inventory_item_data.item.count || 0) +
              '</div>';
    }
    out += '</div>';
    document.getElementById('subcontent').innerHTML = out;
  }
  if (menu == 3) {
    pkmnTotal = user_data[users[user_id]].bagPokemon.length;
    document.getElementById('subtitle').innerHTML = pkmnTotal+" Pokemon";

    sortButtons = '<div class="col s12">Sort : ';
    sortButtons += '<div class="chip"><a href="javascript:sortAndShowBagPokemon(\'cp\',' + user_id + ')">CP</a></div>';
    sortButtons += '<div class="chip"><a href="javascript:sortAndShowBagPokemon(\'iv\',' + user_id + ')">IV</a></div>';
    sortButtons += '<div class="chip"><a href="javascript:sortAndShowBagPokemon(\'name\',' + user_id + ')">Name</a></div>';
    sortButtons += '<div class="chip"><a href="javascript:sortAndShowBagPokemon(\'id\',' + user_id + ')">ID</a></div>';
    sortButtons += '<div class="chip"><a href="javascript:sortAndShowBagPokemon(\'time\',' + user_id + ')">Time</a></div>';
    sortButtons += '</div>';

    document.getElementById('sortButtons').innerHTML = sortButtons;

    sortAndShowBagPokemon('cp', user_id);
  }
  if (menu == 4) {
    pkmnTotal = user_data[users[user_id]].pokedex.length;
    document.getElementById('subtitle').innerHTML = "Pokedex "+ pkmnTotal + ' / 151';

    sortButtons = '<div class="col s12">Sort : ';
    sortButtons += '<div class="chip"><a href="javascript:sortAndShowPokedex(\'id\',' + user_id + ')">ID</a></div>';
    sortButtons += '<div class="chip"><a href="javascript:sortAndShowPokedex(\'name\',' + user_id + ')">Name</a></div>';
    sortButtons += '<div class="chip"><a href="javascript:sortAndShowPokedex(\'enc\',' + user_id + ')">Seen</a></div>';
    sortButtons += '<div class="chip"><a href="javascript:sortAndShowPokedex(\'cap\',' + user_id + ')">Caught</a></div>';
    sortButtons += '</div>';

    document.getElementById('sortButtons').innerHTML = sortButtons;

    sortAndShowPokedex('id', user_id);
  }
}

function getCandy(p_num, user_id) {
  for (var i = 0; i <  user_data[users[user_id]].bagCandy.length; i++) {
    checkCandy = user_data[users[user_id]].bagCandy[i].inventory_item_data.pokemon_family.family_id;
    if (pokemoncandyArray[p_num] === checkCandy) {
      return (user_data[users[user_id]].bagCandy[i].inventory_item_data.pokemon_family.candy || 0);
    }
  }
}

function sortAndShowBagPokemon(sortOn, user_id) {
  user_id = user_id || 0;
  if(!user_data[users[user_id]].bagPokemon.length) return;
  sortOn = sortOn || 'cp';
  var sortedPokemon = [];
  var eggs = 0;
  out = '<div class="row items">';
  for (i = 0; i <  user_data[users[user_id]].bagPokemon.length; i++) {
    if( user_data[users[user_id]].bagPokemon[i].inventory_item_data.pokemon_data.is_egg) {
      eggs++;
      continue;
    }
    pkmID = user_data[users[user_id]].bagPokemon[i].inventory_item_data.pokemon_data.pokemon_id;
    pkmnName = pokemonArray[pkmID-1].Name;
    pkmCP = user_data[users[user_id]].bagPokemon[i].inventory_item_data.pokemon_data.cp;
    pkmIVA = user_data[users[user_id]].bagPokemon[i].inventory_item_data.pokemon_data.individual_attack || 0;
    pkmIVD = user_data[users[user_id]].bagPokemon[i].inventory_item_data.pokemon_data.individual_defense || 0;
    pkmIVS = user_data[users[user_id]].bagPokemon[i].inventory_item_data.pokemon_data.individual_stamina || 0;
    pkmIV = ((pkmIVA + pkmIVD + pkmIVS) / 45.0).toFixed(2);
    sortedPokemon.push({
      "name": pkmnName,
      "id":pkmID,
      "cp": pkmCP,
      "iv": pkmIV
    });
  }
  switch(sortOn) {
    case 'name':
      sortedPokemon.sort(function(a, b){
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      });
      break;
    case 'id':
      sortedPokemon.sort(function(a, b){
        return a.id - b.id
      });
      break;
    case 'cp':
      sortedPokemon.sort(function(a, b){
        if (a.cp > b.cp) return -1
        if(a.cp < b.cp) return 1
        return 0
      });
      break;
    case 'iv':
      sortedPokemon.sort(function(a, b){
        if (a.iv > b.iv) return -1
        if(a.iv < b.iv) return 1
        return 0
      });
      break;
      break;
    case 'time':
      sortedPokemon.sort(function(a, b){
        if (a.creation_time_ms > b.creation_time_ms) return -1
        if(a.creation_time_ms < b.creation_time_ms) return 1
        return 0
      });
      break;
  }
  for (i = 0; i < sortedPokemon.length; i++) {
    pkmnNum = sortedPokemon[i].id;
    pkmnImage = pad_with_zeroes(pkmnNum, 3) + '.png';
    pkmnName = pokemonArray[pkmnNum-1].Name;
    pkmnCP = sortedPokemon[i].cp;
    pkmnIV = sortedPokemon[i].iv;
    candyNum = getCandy(pkmnNum, user_id)
    out += '<div class="col s12 m6 l3 center"><img src="image/pokemon/' +
            pkmnImage +
            '" class="png_img"><br><b>' +
            pkmnName +
            '</b><br>' +
            pkmnCP +
            '<br>IV: ' +
            pkmnIV +
            '<br>Candy: ' +
            candyNum +
            '</div>';
  }
  // Add number of eggs
  out += '<div class="col s12 m4 l3 center" style="float: left;"><img src="image/pokemon/Egg.png" class="png_img"><br><b>You have ' + eggs + ' eggs</div>';
  out += '</div>';
  document.getElementById('subcontent').innerHTML = out;
}

function sortAndShowPokedex(sortOn, user_id) {
  user_id = (user_id || 0);
  if(!user_data[users[user_id]].pokedex.length) return;
  sortOn = sortOn || 'id';
  var sortedPokedex = [];
  out = '<div class="row items">';
  for (i = 0; i < user_data[users[user_id]].pokedex.length; i++) {
    pkmID = user_data[users[user_id]].pokedex[i].inventory_item_data.pokedex_entry.pokedex_entry_number;
    pkmnName = pokemonArray[pkmID-1].Name;
    pkmEnc = user_data[users[user_id]].pokedex[i].inventory_item_data.pokedex_entry.times_encountered;
    pkmCap = user_data[users[user_id]].pokedex[i].inventory_item_data.pokedex_entry.times_captured;
    sortedPokedex.push({
      "name": pkmnName,
      "id": pkmID,
      "cap": (pkmEnc || 0),
      "enc": (pkmCap || 0)
    });
  }
  console.log(sortedPokedex)
  switch(sortOn) {
    case 'id':
      sortedPokedex.sort(function(a, b){
        return a.id - b.id
      });
      break;
    case 'name':
      sortedPokedex.sort(function(a, b){
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      });
      break;
    case 'enc':
      sortedPokedex.sort(function(a, b){
        return a.enc - b.enc
      });
      break;
    case 'cap':
      sortedPokedex.sort(function(a, b){
        return a.cap - b.cap
      });
      break;
  }
  for (var i = 0; i < sortedPokedex.length; i++) {
    pkmnNum = sortedPokedex[i].id;
    pkmnImage = pad_with_zeroes(pkmnNum, 3) +'.png';
    pkmnName = pokemonArray[pkmnNum-1].Name;
    pkmnName = pokemonArray[pkmnNum-1].Name;
    pkmnEnc = sortedPokedex[i].enc
    pkmnCap = sortedPokedex[i].cap
    candyNum = getCandy(pkmnNum, user_id)
    out += '<div class="col s12 m6 l3 center"><img src="image/pokemon/' +
            pkmnImage +
            '" class="png_img"><br><b> ' +
            pad_with_zeroes(pkmnNum, 3) +
            ' ' +
            pkmnName +
            '</b><br>Times Seen: ' +
            pkmnEnc + 
            '<br>Times Caught: ' +
            pkmnCap +
            '<br>Candy: ' +
            pkmnCap +
            '</div>';
  }
  out += '</div>';
  document.getElementById('subcontent').innerHTML = out;
}

// Adds events to log panel and if it's closed sends Toast
function log( log_object ){
  var currentDate = new Date();
  var time = ('0' + currentDate.getHours()).slice(-2) + ':'
             + ('0' + (currentDate.getMinutes())).slice(-2);
  $("#logs-panel .card-content").append("<div class='log-item'>\
  <span class='log-date'>"+time+"</span><p class='"+log_object.color+"'>"+log_object.message+"</p></div>");
  if(!$('#logs-panel').is(":visible")){
    Materialize.toast(log_object.message, 3000);
  }
}
