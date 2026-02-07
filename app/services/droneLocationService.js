const {DroneLocation} = require('@/app/models/index.js');

class DroneLocationService {
    async setLocation(droneId, location) {
        if (! location.lat || ! location.lng) {
            throw new Error('Invalid location data');
        }

        return await DroneLocation.create({
            droneId: droneId,
            location: location
        });
    }
}

module.exports = DroneLocationService;