const {DroneLocation} = require('@/app/models/index.js');
const droneService = require('@/app/services/droneService.js');

class DroneLocationService {
    async setLocation(droneId, location) {
        const service = new droneService()

        if (! location.lat || ! location.lng) {
            throw new Error('Invalid location data');
        }

        let droneLocation = await DroneLocation.create({
            droneId: droneId,
            location: location
        });

        await service.updateCurrentOrderLocation(droneId, location)

        return droneLocation;
    }
}

module.exports = DroneLocationService;