
class FavoritesManager {

    constructor() {
        this.favorite_schedules = [];
        this.schedule_hashes = new Set();

    }

    addFavorite(events, name, hash) {

        if (this.schedule_hashes.has(hash)) {
            return false;
        }

        this.schedule_hashes.add(hash);
        this.favorite_schedules.push({"events": events, "name": name, "hash": hash});

        return true;
    }

    removeFavoriteAtIndex(index) {
        let schedule = this.favorite_schedules[index];
        let hash = schedule["hash"];

        this.schedule_hashes.delete(hash);
        this.favorite_schedules = this.favorite_schedules.splice(index, 1);
    }

    removeFavoriteByHash(hash) {
        if (!this.schedule_hashes.has(hash)) {
            return;
        }
        var index = -1;
        for (let i in this.favorite_schedules) {
            if (this.favorite_schedules[i]["hash"] == hash) {
                index = i;
                break;
            }
        }

        this.removeFavoriteAtIndex(index);
    }

    getScheduleAtIndex(index) {
        return this.favorite_schedules[index];
    }

    getEventsAtIndex(index) {
        return this.favorite_schedules[index]["events"];
    }

    getNameAtIndex(index) {
        return this.favorite_schedules[index]["name"];
    }

    scheduleInFavorites(schedule_hash) {
        return this.schedule_hashes.has(schedule_hash);
    }

    getNumberOfFavorites() {
        return this.favorite_schedules.length;
    }

}
