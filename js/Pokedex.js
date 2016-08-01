class Pokedex {
    constructor(data) {
        this.entries = {};
        for (var i = 0; i < data.length; i++) {
            var entry = {};
            var entryData = data[i].inventory_item_data.pokedex_entry;
            entry['id'] = entryData.pokedex_entry_number;
            entry['name'] = Pokemon.getNameById(entry['id']);
            entry['image'] = Pokemon.getImageById(entry['id']);
            entry['encountered'] = entryData.times_encountered || 0;
            entry['captured'] = entryData.times_captured || 0;
            this.entries[entry['id']] = entry;
        }
    }

    getEntry(id) {
        return this.entries['' + id];
    }

    getNumEntries() {
        return Object.keys(this.entries).length;
    }

    getAllEntries() {
        var keys = Object.keys(this.entries);
        var returnData = [];
        for (var i = 0; i < keys.length; i++) {
            returnData.push(this.getEntry(keys[i]));
        }
        return returnData;
    }

    getAllEntriesSorted(sortKey) {
        var sortedPokedex = this.getAllEntries();
        switch (sortKey) {
            case 'id':
                sortedPokedex.sort(function (a, b) {
                    return a.id - b.id;
                });
                break;
            case 'name':
                sortedPokedex.sort(function (a, b) {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                break;
            case 'enc':
                sortedPokedex.sort(function (a, b) {
                    return a.encountered - b.encountered;
                });
                break;
            case 'cap':
                sortedPokedex.sort(function (a, b) {
                    return a.captured - b.captured;
                });
                break;
            default:
                sortedPokedex.sort(function (a, b) {
                    return a.id - b.id;
                });
                break;
        }
        return sortedPokedex;
    }
}
