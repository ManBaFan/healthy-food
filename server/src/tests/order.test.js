const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const MenuItem = require('../models/Menu');
const Order = require('../models/Order');
const { connect, clearDatabase, closeDatabase } = require('./setup');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Order Tests', () => {
    let token;
    let menuItem;
    let user;

    const testUser = {
        name: '测试用户',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
    };

    const testMenuItem = {
        name: '测试菜品',
        nameEn: 'Test Dish',
        category: '主食',
        price: 88,
        description: '测试描述',
        descriptionEn: 'Test description',
        nutritionInfo: {
            calories: 500,
            protein: 20,
            carbs: 60,
            fat: 15
        },
        image: 'test.jpg',
        preparationTime: 15
    };

    beforeEach(async () => {
        // Create test user and get token
        user = await User.create(testUser);
        token = user.getSignedJwtToken();

        // Create test menu item
        testMenuItem.createdBy = user._id;
        menuItem = await MenuItem.create(testMenuItem);
    });

    describe('POST /api/orders', () => {
        it('should create a new order', async () => {
            const orderData = {
                items: [{
                    menuItem: menuItem._id,
                    quantity: 2
                }],
                paymentMethod: '微信支付',
                deliveryAddress: {
                    street: '测试街道',
                    city: '测试城市',
                    zipCode: '100000'
                }
            };

            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send(orderData);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.customer).toBeDefined();
            expect(res.body.data.items.length).toBe(1);
            expect(res.body.data.status).toBe('待支付');
        });

        it('should not create order with invalid menu item', async () => {
            const orderData = {
                items: [{
                    menuItem: '507f1f77bcf86cd799439011', // Invalid ID
                    quantity: 2
                }],
                paymentMethod: '微信支付'
            };

            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send(orderData);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/orders', () => {
        beforeEach(async () => {
            // Create test orders
            await Order.create({
                customer: user._id,
                items: [{
                    menuItem: menuItem._id,
                    quantity: 1,
                    price: menuItem.price
                }],
                totalAmount: menuItem.price,
                status: '待支付',
                paymentMethod: '微信支付',
                orderNumber: 'TEST001'
            });
        });

        it('should get user orders', async () => {
            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].customer._id.toString()).toBe(user._id.toString());
        });

        it('should filter orders by status', async () => {
            const res = await request(app)
                .get('/api/orders?status=待支付')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].status).toBe('待支付');
        });
    });

    describe('PUT /api/orders/:id/status', () => {
        let order;

        beforeEach(async () => {
            // Create admin user
            const adminUser = await User.create({
                ...testUser,
                email: 'admin@example.com',
                role: 'admin'
            });
            token = adminUser.getSignedJwtToken();

            // Create test order
            order = await Order.create({
                customer: user._id,
                items: [{
                    menuItem: menuItem._id,
                    quantity: 1,
                    price: menuItem.price
                }],
                totalAmount: menuItem.price,
                status: '待支付',
                paymentMethod: '微信支付',
                orderNumber: 'TEST001'
            });
        });

        it('should update order status', async () => {
            const res = await request(app)
                .put(`/api/orders/${order._id}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    status: '已支付',
                    note: '支付成功'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('已支付');
            expect(res.body.data.statusHistory.length).toBe(2);
        });

        it('should not allow invalid status transition', async () => {
            const res = await request(app)
                .put(`/api/orders/${order._id}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    status: '已完成',
                    note: '直接完成'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
