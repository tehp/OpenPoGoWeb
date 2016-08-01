class Item {

    constructor(item_id, item_count) {
        this.item_id = item_id;
        this.item_count = item_count;
    }

    getItemId() {
        return this.item_id;
    }

    getItemCount() {
        return this.item_count;
    }

    getItemName() {
        return Item.getName(this.getItemId());
    }

    static getName(id) {
        return Item.itemsArray[id] || "Unknown";
    }
}

Item.itemsArray = {
    '0': 'Unknown',
    '1': 'Pokeball',
    '2': 'Great Ball',
    '3': 'Ultra Ball',
    '4': 'Master Ball',
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
    '501': 'Lure Module',
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
