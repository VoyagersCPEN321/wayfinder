import * as mongoose from "mongoose";


class LocationsMap {
    private locations: {};
    private COLLECTION_NAME: string = "locations";
    /**
     * Load the stored building to address translations from the db into memory
     * so it is fast to use when parsing new user schedules.
     */
    public async config() {
        this.locations = [];
        let cursor = await mongoose.connection.db.collection(this.COLLECTION_NAME).find();
        let hasNext = await cursor.hasNext();
        while (hasNext) {
            let currDoc = await cursor.next();
            this.locations[currDoc.buildingName] = currDoc.address;
            hasNext = await cursor.hasNext();
        }
        console.log("Done init locations.");
        return true;
    }
    public getAddress(buildingName: string): string {
        return this.locations ? this.locations[buildingName] : null;
    }
}

export default new LocationsMap();