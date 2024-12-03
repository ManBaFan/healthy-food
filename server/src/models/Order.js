const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        menuItem: {
            type: mongoose.Schema.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        specialInstructions: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['待支付', '已支付', '准备中', '配送中', '已完成', '已取消'],
        default: '待支付'
    },
    paymentMethod: {
        type: String,
        enum: ['微信支付', '支付宝', '银行卡'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['待支付', '支付成功', '支付失败', '已退款'],
        default: '待支付'
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        contactNumber: String
    },
    deliveryTime: {
        requested: Date,
        actual: Date
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['待支付', '已支付', '准备中', '配送中', '已完成', '已取消']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    specialRequirements: String,
    couponApplied: {
        type: mongoose.Schema.ObjectId,
        ref: 'Coupon'
    },
    discountAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `ORD${year}${month}${day}${random}`;
    }
    next();
});

// Update status history when status changes
OrderSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date()
        });
    }
    next();
});

// Calculate total amount
OrderSchema.pre('save', function(next) {
    if (this.isModified('items')) {
        this.totalAmount = this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        if (this.discountAmount) {
            this.totalAmount -= this.discountAmount;
        }
    }
    next();
});

module.exports = mongoose.model('Order', OrderSchema);
