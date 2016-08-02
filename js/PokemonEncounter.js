class PokemonEncounter {
    constructor(data) {
        this._encounter_id = data["encounter_id"];
        this._expiration_time_ms = data["expiration_time_ms"];
        this._latitude = data["latitude"];
        this._longitude = data["longitude"];
        this._spawn_point_id = data["spawn_point_id"];
        this._pokemon_id = data["pokemon_id"];
    }

    getEncounterId() {
        return this._encounter_id;
    }

    getExpirationTime() {
        return this._expiration_time_ms / 1000;
    }

    getLatitude() {
        return this._latitude;
    }

    getLongitude() {
        return this._longitude;
    }

    getSpeciesNum() {
        return this._pokemon_id;
    }
    
    getSpeciesName() {
        return Pokemon.getNameById(this.getSpeciesNum());
    }

    getSpawnPointId() {
        return this._spawn_point_id;
    }

    isCatchable() {
        return this.getEncounterId() !== undefined && this.getSpeciesNum() !== undefined;
    }
}