const { Drone, Delivery, Order, sequelize} = require('@/app/models/index.js');
const droneStatus = require('@/app/enums/droneStatues.js');
const {Op} = require('sequelize');
const orderStatus = require('@/app/enums/orderStatus.js');

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

        drone =  await drone.update({
            status: droneStatus.BROKEN,
        })

        this.dropCurrenOrder(droneId)

        return drone
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

    async getCurrentDroneOrder(droneId) {
        const delivery = await Delivery.findOne({
            where: {
                droneId: droneId,
                status: {
                    [Op.notIn]: ['failed', 'delivered', 'cancelled']
                }
            },
            include: [{
                model: Order,
                as: 'order',
                where: {
                    status: {
                        [Op.notIn]: ['cancelled', 'delivered']
                    }
                }
            }],
            order: [['createdAt', 'DESC']] // Get the most recent active delivery
        });

        return {delivery: delivery, order: delivery?.order || null};
    }

    async updateCurrentOrderLocation(droneId, location) {
        let {order} = await this.getCurrentDroneOrder(droneId)

        if (! order || ['cancelled', 'delivered'].includes(order.status)) {
            return
        }

        return await order.update({
            currentLocation: location
        })
    }

    async dropCurrenOrder(droneId) {
        let {delivery, order} = await this.getCurrentDroneOrder(droneId)

        let transaction = await sequelize.transaction()

        try {
            if (delivery) {
                await delivery.update({
                    status: 'failed'
                }, {transaction})
            }

            if (order) {
                await order.update({
                    reserved: false
                }, {transaction})
            }

            await transaction.commit()
        } catch (error) {
            await transaction.rollback()
            throw error
        }

        return await order.update({
            currentLocation: null
        })
    }
}

module.exports = DroneService