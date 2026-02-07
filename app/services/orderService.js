const { Order } = require('@/app/models/index.js');
const orderStatus = require('@/app/enums/orderStatus.js');

class OrderService {
    async getOrders(
        creatorId,
        creatorType,
        filters = {},
        page = 1,
        limit = 100,
        include = [],
        order = [['createdAt', 'DESC']]
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

        if (creatorType !== 'Admin') {
            filters.creatorId = creatorId
            filters.creatorType = creatorType
        }

        let result =  await Order.findAndCountAll({
            where: filters,
            offset: offset,
            limit: limit,
            order: order,
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

    async create(orderData) {
        return await Order.create({
            creatorId: orderData.creatorId,
            creatorType: orderData.creatorType,
            originAddress: orderData.originAddress,
            destinationAddress: orderData.destinationAddress,
            originLocation: orderData.originLocation,
            currentLocation: orderData.originLocation,
            destinationLocation: orderData.destinationLocation,
            status: orderStatus.PENDING,
        })
    }

    async update(orderId, orderData) {
        let order = await Order.findByPk(orderId)

        if (!order) {
            throw new Error('order not found')
        }

        let currentLocation =  order.currentLocation

        if (order.originLocation.lat === order.currentLocation.lat && order.originLocation.lng === order.currentLocation.lng) {
            currentLocation = orderData.originLocation ?? order.originLocation
        }

        return await order.update({
            originAddress: orderData.originAddress ?? order.originAddress,
            destinationAddress: orderData.destinationAddress ?? order.destinationAddress,
            originLocation: orderData.originLocation ?? order.originLocation,
            destinationLocation: orderData.destinationLocation ?? order.destinationLocation,
            currentLocation: currentLocation
        })
    }

    async getOrder(orderId, filters = {}, include = []) {
        return  await Order.findByPk(orderId, {
                where: filters,
                include: include
            })
    }

    async cancel(orderId) {
        let order = await Order.findByPk(orderId)

        if (!order) {
            throw new Error('order not found')
        }

        if (order.status !== orderStatus.PENDING) {
            throw new Error('only pending orders can be canceled')
        }

        return await order.update({
            status: orderStatus.CANCELLED,
        })
    }
}

module.exports = OrderService