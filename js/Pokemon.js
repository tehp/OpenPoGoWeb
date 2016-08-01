class Pokemon {
    constructor(data) {
        this.pokemon_id = data.pokemon_id;
        this.unique_id = data.unique_id;
        this.name = Pokemon.getNameById(this.id) || "Unknown";
        this.combatPower = data.cp || 0;
        this.attackPotential = data.individual_attack || 0;
        this.defensePotential = data.individual_defense || 0;
        this.speedPotential = data.individual_stamina || 0;
        this.creationTime = data.creation_time_ms || 0;
        this.hp = data.stamina || 0;
        this.max_hp = data.stamina_max || 0;
    }
    
    getSpeciesNum() {
        return this.pokemon_id;
    }
    
    getUniqueId() {
        return this.unique_id;
    }
    
    getName() {
        return Pokemon.getNameById(this.pokemon_id) || "Unknown";
    }
    
    getCombatPower() {
        return this.combatPower;
    }
    
    getAttackPotential() {
        return this.attackPotential;
    }

    getDefensePotential() {
        return this.attackPotential;
    }

    getSpeedPotential() {
        return this.attackPotential;
    }
    
    getPotential() {
        return ((this.attackPotential + this.defensePotential + this.speedPotential) / 45.0).toFixed(2);
    }

    getHP() {
        return this.hp;
    }

    getMaxHP() {
        return this.max_hp;
    }

    getCreationTime() {
        return this.creationTime;
    }

    getImage() {
        return Pokemon.getImageById(this.pokemon_id);
    }

    getPaddedId() {
        return Pokemon.getPaddedId(this.pokemon_id);
    }

    static getPaddedId(id) {
        var str = '' + id;
        var pad = '000';
        return pad.substring(0, pad.length - str.length) + str
    }

    static getImageById(id) {
        return Pokemon.getPaddedId(id) + '.png'
    }

    static setPokemonData(data) {
        Pokemon.pokemonData = data;
    }

    static setPokemonCandyData(data) {
        Pokemon.pokemonCandyData = data;
    }

    static getPokemonById(id) {
        return Pokemon.pokemonData[id - 1];
    }

    static getNameById(id) {
        return Pokemon.getPokemonById(id).Name;
    }

    static getCandyId(id) {
        return Pokemon.pokemonCandyData[id];
    }
}
