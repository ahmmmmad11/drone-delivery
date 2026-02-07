const { Drone } = require('@/app/models/index.js');
const droneStatus = require('@/app/enums/droneStatues.js');

class DroneService {
    async getDrones(
        filters = {},
        page = 1,
        limit = 100,
        include = [],
        drone = [['createdAt', 'DESC']]
    ) {
        const offset = (page - 1) * limit;

        if (limit > 500) {
            limit = 500
        }

        if (limit < 1) {
            limit = 100
        }

        if (page < 1) {
            page = 1
        }

        let result =  await Drone.findAndCountAll({
            where: filters,
            offset: offset,
            limit: limit,
            drone: drone,
            include: include,
        })

        const totalPages = Math.ceil(result.count / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            data: result.rows,
            pagination: {
                totalItems: result.count,
                totalPages: totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage: hasNextPage,
                hasPreviousPage: hasPreviousPage,
                nextPage: hasNextPage ? page + 1 : null,
                previousPage: hasPreviousPage ? page - 1 : null
            }
        };
    }

    async create(data) {
        return await Drone.create({
            creatorId: data.creatorId,
            creatorType: data.creatorType,
            originAddress: data.originAddress,
            destinationAddress: data.destinationAddress,
            originLocation: data.originLocation,
            destinationLocation: data.destinationLocation,
            status: droneStatus.PENDING,
        })
    }

    async getDrone(droneId, filters = {}, include = []) {
        return  await Drone.findByPk(droneId, {
                where: filters,
                include: include
            })
    }

    async setBroken(droneId) {
        let drone = await Drone.findByPk(droneId)

        if (!drone) {
            throw new Error('drone not found')
        }

        if (drone.status === droneStatus.BROKEN) {
            throw new Error('drone is already broken')
        }

        return await drone.update({
            status: droneStatus.BROKEN,
        })
    }

    async setFixed(droneId) {
        let drone = await Drone.findByPk(droneId)

        if (!drone) {
            throw new Error('drone not found')
        }

        if (drone.status === droneStatus.ACTIVE) {
            throw new Error('drone is already Active')
        }

        return await drone.update({
            status: droneStatus.ACTIVE,
        })
    }
}

module.exports = DroneService