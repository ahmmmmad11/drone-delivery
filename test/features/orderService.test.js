const { expect } = require('chai');
const path = require('path');
const testConfig = require('../config');

const { Order, Client, Admin, sequelize } = testConfig.requireModule(testConfig.MODELS_PATH);
const OrderService = testConfig.requireModule(path.join(testConfig.SERVICES_PATH, 'orderService.js'));
const orderStatus = require('@/app/enums/orderStatus');
const TestMigrationHelper = require('../migrationHelper');


describe('Test orderService', function() {
    this.timeout(30000); // Longer timeout for database operations

    let orderService;
    let migrationHelper;
    let testClient;
    let testAdmin;

    // Run migrations once before all tests
    before(async () => {
        migrationHelper = new TestMigrationHelper();
        await migrationHelper.runMigrations();
        console.log('Database ready for integration tests');
    });

    beforeEach(async () => {
        orderService = new OrderService();

        // Create test client and admin
        testClient = await Client.create({});
        testAdmin = await Admin.create({});
    });

    // Clean tables after each test
    afterEach(async () => {
        await Order.destroy({ where: {}, force: true });
        await Client.destroy({ where: {}, force: true });
        await Admin.destroy({ where: {}, force: true });
    });

    describe('Full workflow integration tests', () => {
        it('should create an order with correct initial values', async () => {
            const orderData = {
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: {
                    country: "Bahrain",
                    state: "Capital",
                    city: "Manama",
                    street: "255 st"
                },
                destinationAddress: {
                    country: "Bahrain",
                    state: "Capital",
                    city: "Manama",
                    street: "251 st"
                },
                originLocation: {
                    lat: 53.4894849,
                    lng: 53.4894249
                },
                destinationLocation: {
                    lat: 53.4894848,
                    lng: 53.4894248
                }
            };

            const order = await orderService.create(orderData);

            expect(order.creatorId).to.equal(testClient.id);
            expect(order.creatorType).to.equal('Client');
            expect(order.status).to.equal(orderStatus.PENDING);
            expect(order.originAddress).to.deep.equal(orderData.originAddress);
            expect(order.destinationAddress).to.deep.equal(orderData.destinationAddress);
            expect(order.originLocation).to.deep.equal(orderData.originLocation);
            expect(order.currentLocation).to.deep.equal(orderData.originLocation);
            expect(order.destinationLocation).to.deep.equal(orderData.destinationLocation);
        });

        it('should list orders with pagination for client', async () => {
            // Create multiple orders for the test client
            for (let i = 0; i < 5; i++) {
                await orderService.create({
                    creatorId: testClient.id,
                    creatorType: 'Client',
                    originAddress: {
                        country: "Bahrain",
                        state: "Capital",
                        city: "Manama",
                        street: `${255 + i} st`
                    },
                    destinationAddress: {
                        country: "Bahrain",
                        state: "Capital",
                        city: "Manama",
                        street: `${251 + i} st`
                    },
                    originLocation: { lat: 53.489 + i * 0.001, lng: 53.489 + i * 0.001 },
                    destinationLocation: { lat: 53.488 + i * 0.001, lng: 53.488 + i * 0.001 }
                });
            }

            const result = await orderService.getOrders(testClient.id, 'Client', {}, 1, 3);

            expect(result.data).to.have.lengthOf(3);
            expect(result.pagination.totalItems).to.equal(5);
            expect(result.pagination.totalPages).to.equal(2);
            expect(result.pagination.hasNextPage).to.be.true;
            expect(result.pagination.hasPreviousPage).to.be.false;
            expect(result.pagination.currentPage).to.equal(1);
            expect(result.pagination.nextPage).to.equal(2);
        });

        it('should list all orders for admin regardless of creator', async () => {
            // Create orders for different clients
            const client2 = await Client.create({});

            await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            await orderService.create({
                creatorId: client2.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "256 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "252 st" },
                originLocation: { lat: 53.4895849, lng: 53.4895249 },
                destinationLocation: { lat: 53.4895848, lng: 53.4895248 }
            });

            const result = await orderService.getOrders(testAdmin.id, 'Admin', {}, 1, 10);

            expect(result.data).to.have.lengthOf(2);
            expect(result.pagination.totalItems).to.equal(2);

            await client2.destroy({ force: true });
        });

        it('should only show client their own orders', async () => {
            const client2 = await Client.create({});

            // Create order for testClient
            await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            // Create order for client2
            await orderService.create({
                creatorId: client2.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "256 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "252 st" },
                originLocation: { lat: 53.4895849, lng: 53.4895249 },
                destinationLocation: { lat: 53.4895848, lng: 53.4895248 }
            });

            const result = await orderService.getOrders(testClient.id, 'Client', {}, 1, 10);

            expect(result.data).to.have.lengthOf(1);
            expect(result.data[0].creatorId).to.equal(testClient.id);

            await client2.destroy({ force: true });
        });

        it('should update order addresses and locations', async () => {
            const order = await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            const updateData = {
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "300 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "400 st" },
                originLocation: { lat: 54.0, lng: 54.0 },
                destinationLocation: { lat: 55.0, lng: 55.0 }
            };

            const updatedOrder = await orderService.update(order.id, updateData);

            expect(updatedOrder.originAddress).to.deep.equal(updateData.originAddress);
            expect(updatedOrder.destinationAddress).to.deep.equal(updateData.destinationAddress);
            expect(updatedOrder.originLocation).to.deep.equal(updateData.originLocation);
            expect(updatedOrder.destinationLocation).to.deep.equal(updateData.destinationLocation);
        });

        it('should update currentLocation when originLocation changes and order is at origin', async () => {
            const order = await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            const newOriginLocation = { lat: 54.0, lng: 54.0 };
            const updatedOrder = await orderService.update(order.id, {
                originLocation: newOriginLocation
            });

            expect(updatedOrder.currentLocation).to.deep.equal(newOriginLocation);
        });

        it('should not update currentLocation when originLocation changes but order has moved', async () => {
            const order = await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            // Simulate order has moved
            await order.update({ currentLocation: { lat: 53.5, lng: 53.5 } });

            const newOriginLocation = { lat: 54.0, lng: 54.0 };
            const updatedOrder = await orderService.update(order.id, {
                originLocation: newOriginLocation
            });

            expect(updatedOrder.currentLocation).to.deep.equal({ lat: 53.5, lng: 53.5 });
            expect(updatedOrder.currentLocation).to.not.deep.equal(newOriginLocation);
        });

        it('should cancel a pending order', async () => {
            const order = await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            const cancelledOrder = await orderService.cancel(order.id);

            expect(cancelledOrder.status).to.equal(orderStatus.CANCELLED);
        });

        it('should get a single order by ID', async () => {
            const order = await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            const foundOrder = await orderService.getOrder(order.id);

            expect(foundOrder).to.not.be.null;
            expect(foundOrder.id).to.equal(order.id);
            expect(foundOrder.creatorId).to.equal(testClient.id);
        });

        it('should filter orders by status', async () => {
            // Create pending order
            await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            // Create and cancel another order
            const order2 = await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "256 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "252 st" },
                originLocation: { lat: 53.4895849, lng: 53.4895249 },
                destinationLocation: { lat: 53.4895848, lng: 53.4895248 }
            });
            await orderService.cancel(order2.id);

            const pendingOrders = await orderService.getOrders(
                testClient.id,
                'Client',
                { status: orderStatus.PENDING },
                1,
                10
            );

            expect(pendingOrders.data).to.have.lengthOf(1);
            expect(pendingOrders.data[0].status).to.equal(orderStatus.PENDING);

            const cancelledOrders = await orderService.getOrders(
                testClient.id,
                'Client',
                { status: orderStatus.CANCELLED },
                1,
                10
            );

            expect(cancelledOrders.data).to.have.lengthOf(1);
            expect(cancelledOrders.data[0].status).to.equal(orderStatus.CANCELLED);
        });
    });

    describe('Pagination edge cases', () => {
        it('should enforce maximum limit of 500', async () => {
            await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            const result = await orderService.getOrders(testClient.id, 'Client', {}, 1, 1000);

            expect(result.pagination.pageSize).to.equal(500);
        });

        it('should default to limit 100 when limit is less than 1', async () => {
            await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            const result = await orderService.getOrders(testClient.id, 'Client', {}, 1, 0);

            expect(result.pagination.pageSize).to.equal(100);
        });

        it('should default to page 1 when page is less than 1', async () => {
            await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            const result = await orderService.getOrders(testClient.id, 'Client');

            expect(result.pagination.currentPage).to.equal(1);
        });

        it('should handle pagination correctly on second page', async () => {
            // Create 5 orders
            for (let i = 0; i < 5; i++) {
                await orderService.create({
                    creatorId: testClient.id,
                    creatorType: 'Client',
                    originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: `${255 + i} st` },
                    destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: `${251 + i} st` },
                    originLocation: { lat: 53.489 + i * 0.001, lng: 53.489 + i * 0.001 },
                    destinationLocation: { lat: 53.488 + i * 0.001, lng: 53.488 + i * 0.001 }
                });
            }

            const result = await orderService.getOrders(testClient.id, 'Client', {}, 2, 3);

            expect(result.data).to.have.lengthOf(2);
            expect(result.pagination.currentPage).to.equal(2);
            expect(result.pagination.hasNextPage).to.be.false;
            expect(result.pagination.hasPreviousPage).to.be.true;
            expect(result.pagination.previousPage).to.equal(1);
        });

        it('should handle empty database queries', async () => {
            const result = await orderService.getOrders(testClient.id, 'Client', {}, 1, 10);

            expect(result.data).to.be.an('array').that.is.empty;
            expect(result.pagination.totalItems).to.equal(0);
            expect(result.pagination.totalPages).to.equal(0);
            expect(result.pagination.hasNextPage).to.be.false;
            expect(result.pagination.hasPreviousPage).to.be.false;
        });
    });

    describe('Error handling', () => {
        it('should throw error when updating non-existent order', async () => {
            try {
                await orderService.update(99999, {
                    originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "300 st" }
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('order not found');
            }
        });

        it('should throw error when cancelling non-existent order', async () => {
            try {
                await orderService.cancel(99999);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('order not found');
            }
        });

        it('should throw error when cancelling non-pending order', async () => {
            const order = await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            await orderService.cancel(order.id);

            try {
                await orderService.cancel(order.id);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('only pending orders can be canceled');
            }
        });

        it('should return null when getting non-existent order', async () => {
            const order = await orderService.getOrder(99999);
            expect(order).to.be.null;
        });

        it('should handle partial updates correctly', async () => {
            const order = await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            const updatedOrder = await orderService.update(order.id, {
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "300 st" }
            });

            // Only origin address should change
            expect(updatedOrder.originAddress.street).to.equal("300 st");
            expect(updatedOrder.destinationAddress).to.deep.equal(order.destinationAddress);
            expect(updatedOrder.originLocation).to.deep.equal(order.originLocation);
            expect(updatedOrder.destinationLocation).to.deep.equal(order.destinationLocation);
        });
    });

    describe('Order lifecycle tests', () => {
        it('should handle complete order lifecycle: create -> update -> cancel', async () => {
            // Create
            const order = await orderService.create({
                creatorId: testClient.id,
                creatorType: 'Client',
                originAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "255 st" },
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "251 st" },
                originLocation: { lat: 53.4894849, lng: 53.4894249 },
                destinationLocation: { lat: 53.4894848, lng: 53.4894248 }
            });

            expect(order.status).to.equal(orderStatus.PENDING);

            // Update
            const updatedOrder = await orderService.update(order.id, {
                destinationAddress: { country: "Bahrain", state: "Capital", city: "Manama", street: "999 st" }
            });

            expect(updatedOrder.destinationAddress.street).to.equal("999 st");
            expect(updatedOrder.status).to.equal(orderStatus.PENDING);

            // Cancel
            const cancelledOrder = await orderService.cancel(order.id);

            expect(cancelledOrder.status).to.equal(orderStatus.CANCELLED);
        });
    });
});
