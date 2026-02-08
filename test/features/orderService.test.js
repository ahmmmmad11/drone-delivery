const { expect } = require('chai');
const path = require('path');
const testConfig = require('../config');

const { Drone, Client, Delivery, Order, sequelize, DroneLocation } = testConfig.requireModule(testConfig.MODELS_PATH);
const OrderService = testConfig.requireModule(path.join(testConfig.SERVICES_PATH, 'orderService.js'));
const droneStatus = testConfig.requireModule(path.join(testConfig.ENUMS_PATH, 'droneStatues.js'));
const orderStatus = require('@/app/enums/orderStatus')
const TestMigrationHelper = require('../migrationHelper');

describe('OrderService - Integration Tests', function() {
    this.timeout(30000);

    let orderService;
    let migrationHelper;

    // Run migrations once before all tests
    before(async () => {
        migrationHelper = new TestMigrationHelper();
        await migrationHelper.runMigrations();
        console.log('Database ready for integration tests');
    });

    // Clean up database after all tests
    after(async () => {
        await sequelize.close();
        console.log('Database cleaned up');
    });

    beforeEach(() => {
        orderService = new OrderService();
    });

    // Clean tables after each test
    afterEach(async () => {
        await DroneLocation.destroy({ where: {}, force: true });
        await Delivery.destroy({ where: {}, force: true });
        await Order.destroy({ where: {}, force: true });
        await Drone.destroy({ where: {}, force: true });
    });

    describe('Full workflow integration tests', () => {
        it('should list of orders with pagination', async () => {
            // Create multiple drones
            for (let i = 0; i < 5; i++) {
                await Drone.create({
                    status: droneStatus.ACTIVE,
                    model: 'av1',
                    number: '1',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },);
            }

            const result = await orderService.getDrones({}, 1, 3);

            expect(result.data).to.have.lengthOf(3);
            expect(result.pagination.totalItems).to.equal(5);
            expect(result.pagination.totalPages).to.equal(2);
            expect(result.pagination.hasNextPage).to.be.true;
        });

        it('should handle drone lifecycle: create -> set broken -> set fixed', async () => {
            const droneData = {
                status: droneStatus.ACTIVE,
                model: 'av1',
                number: '1',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            let drone = await Drone.create(droneData);
            expect(drone.status).to.equal(droneStatus.ACTIVE);

            // Set to broken
            drone = await orderService.setBroken(drone.id);
            expect(drone.status).to.equal(droneStatus.BROKEN);

            // Set to fixed (active)
            drone = await orderService.setFixed(drone.id);
            expect(drone.status).to.equal(droneStatus.ACTIVE);
        });

        it('should handle order workflow with delivery', async () => {
            // Create drone
            const drone = await Drone.create({
                status: droneStatus.ACTIVE,
                model: 'av1',
                number: '1',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const client = await Client.create({

            })

            const orderData = {
                "originAddress": {
                    "country": "Bahrain",
                    "state": "Capital",
                    "city": "Manama",
                    "street": "255 st"
                },
                "destinationAddress": {
                    "country": "Bahrain",
                    "state": "Capital",
                    "city": "Manama",
                    "street": "251 st"
                },
                "originLocation": {
                    "lat": 53.4894849,
                    "lng": 53.4894249
                },
                "destinationLocation": {
                    "lat": 53.4894848,
                    "lng": 53.4894248
                }
            }
            // Create order
            const order = await Order.create({
                creatorId: client.id,
                creatorType: 'Client',
                originAddress: orderData.originAddress,
                destinationAddress: orderData.destinationAddress,
                originLocation: orderData.originLocation,
                currentLocation: orderData.originLocation,
                reserved: false,
                destinationLocation: orderData.destinationLocation,
                status: orderStatus.PENDING,
            });

            // Create delivery
            const delivery = await Delivery.create({
                droneId: drone.id,
                orderId: order.id,
                status: 'reserved'
            });

            // Get current order
            const currentOrder = await orderService.getCurrentDroneOrder(drone.id);

            expect(currentOrder.delivery).to.not.be.null;
            expect(currentOrder.order).to.not.be.null;
            expect(currentOrder.delivery.id).to.equal(delivery.id);
            expect(currentOrder.order.id).to.equal(order.id);
        });

        it('should update order location during delivery', async () => {
            // Create drone, order, and delivery
            const drone = await Drone.create({
                status: droneStatus.ACTIVE,
                model: 'av1',
                number: '1',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const orderData = {
                "originAddress": {
                    "country": "Bahrain",
                    "state": "Capital",
                    "city": "Manama",
                    "street": "255 st"
                },
                "destinationAddress": {
                    "country": "Bahrain",
                    "state": "Capital",
                    "city": "Manama",
                    "street": "251 st"
                },
                "originLocation": {
                    "lat": 53.4894849,
                    "lng": 53.4894249
                },
                "destinationLocation": {
                    "lat": 53.4894848,
                    "lng": 53.4894248
                }
            }

            const client = await Client.create({

            })

            // Create order
            const order = await Order.create({
                creatorId: client.id,
                creatorType: 'Client',
                originAddress: orderData.originAddress,
                destinationAddress: orderData.destinationAddress,
                originLocation: orderData.originLocation,
                currentLocation: orderData.originLocation,
                reserved: false,
                destinationLocation: orderData.destinationLocation,
                status: orderStatus.PENDING,
            });

            await Delivery.create({
                droneId: drone.id,
                orderId: order.id,
                status: 'reserved'
            });

            // Update location
            const newLocation = { lat: 40.7580, lng: -73.9855 };
            await orderService.updateCurrentOrderLocation(drone.id, newLocation);

            // Verify location was updated
            const updatedOrder = await Order.findByPk(order.id);
            expect(updatedOrder.currentLocation).to.deep.equal(newLocation);
        });

        it('should drop current order when drone breaks', async () => {
            // Setup: Create drone with active delivery
            const drone = await Drone.create({
                status: droneStatus.ACTIVE,
                model: 'av1',
                number: '1',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const orderData = {
                "originAddress": {
                    "country": "Bahrain",
                    "state": "Capital",
                    "city": "Manama",
                    "street": "255 st"
                },
                "destinationAddress": {
                    "country": "Bahrain",
                    "state": "Capital",
                    "city": "Manama",
                    "street": "251 st"
                },
                "originLocation": {
                    "lat": 53.4894849,
                    "lng": 53.4894249
                },
                "destinationLocation": {
                    "lat": 53.4894848,
                    "lng": 53.4894248
                }
            }

            const client = await Client.create({

            })

            // Create order
            const order = await Order.create({
                creatorId: client.id,
                creatorType: 'Client',
                originAddress: orderData.originAddress,
                destinationAddress: orderData.destinationAddress,
                originLocation: orderData.originLocation,
                currentLocation: orderData.originLocation,
                reserved: false,
                destinationLocation: orderData.destinationLocation,
                status: orderStatus.PENDING,
            });

            let delivery = await Delivery.create({
                droneId: drone.id,
                orderId: order.id,
                status: 'reserved'
            });

            // Break the drone (should drop order)
            await orderService.setBroken(drone.id);

            // Verify delivery failed
            const updatedDelivery = await Delivery.findByPk(delivery.id);
            expect(updatedDelivery.status).to.equal('failed');

            // Verify order unreserved and location cleared
            const updatedOrder = await Order.findByPk(order.id);
            expect(updatedOrder.reserved).to.be.false;
        });

        it('should filter drones by status', async () => {
            await Drone.create({
                model: 'av1',
                number: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
                status: droneStatus.ACTIVE
            });

            await Drone.create({
                model: 'av1',
                number: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
                status: droneStatus.BROKEN
            });

            await Drone.create({
                model: 'av1',
                number: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
                status: droneStatus.ACTIVE
            });

            const activeDrones = await orderService.getDrones(
                { status: droneStatus.ACTIVE },
                1,
                10
            );

            expect(activeDrones.data).to.have.lengthOf(2);
            activeDrones.data.forEach(drone => {
                expect(drone.status).to.equal(droneStatus.ACTIVE);
            });
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle updating location for non-existent order', async () => {
            const drone = await Drone.create({
                model: 'av1',
                number: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
                status: droneStatus.ACTIVE
            });

            const location = { lat: 40.7580, lng: -73.9855 };
            const result = await orderService.updateCurrentOrderLocation(drone.id, location);

            expect(result).to.be.undefined;
        });

        it('should not update location for cancelled orders', async () => {
            const orderData = {
                "originAddress": {
                    "country": "Bahrain",
                    "state": "Capital",
                    "city": "Manama",
                    "street": "255 st"
                },
                "destinationAddress": {
                    "country": "Bahrain",
                    "state": "Capital",
                    "city": "Manama",
                    "street": "251 st"
                },
                "originLocation": {
                    "lat": 53.4894849,
                    "lng": 53.4894249
                },
                "destinationLocation": {
                    "lat": 53.4894848,
                    "lng": 53.4894248
                }
            }

            const client = await Client.create({

            })

            // Create order
            const order = await Order.create({
                creatorId: client.id,
                creatorType: 'Client',
                originAddress: orderData.originAddress,
                destinationAddress: orderData.destinationAddress,
                originLocation: orderData.originLocation,
                currentLocation: orderData.originLocation,
                reserved: false,
                destinationLocation: orderData.destinationLocation,
                status: orderStatus.PENDING,
            });

            await Delivery.create({
                droneId: drone.id,
                orderId: order.id,
                status: 'reserved'
            });

            const newLocation = { lat: 40.7580, lng: -73.9855 };
            await orderService.updateCurrentOrderLocation(drone.id, newLocation);

            const updatedOrder = await Order.findByPk(order.id);
            expect(updatedOrder.currentLocation).to.deep.equal({ lat:  40.7580, lng: -73.9855 });
        });

        it('should handle empty database queries', async () => {
            const result = await orderService.getDrones({}, 1, 10);

            expect(result.data).to.be.an('array').that.is.empty;
            expect(result.pagination.totalItems).to.equal(0);
            expect(result.pagination.totalPages).to.equal(0);
        });
    });
});