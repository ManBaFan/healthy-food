const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '请输入菜品名称'],
        trim: true
    },
    nameEn: {
        type: String,
        required: [true, '请输入英文名称'],
        trim: true
    },
    category: {
        type: String,
        required: [true, '请选择分类'],
        enum: ['主食', '沙拉', '汤品', '饮品', '小食']
    },
    price: {
        type: Number,
        required: [true, '请输入价格']
    },
    description: {
        type: String,
        required: [true, '请输入描述']
    },
    descriptionEn: {
        type: String,
        required: [true, '请输入英文描述']
    },
    nutritionInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
        fiber: Number
    },
    ingredients: [{
        name: String,
        quantity: Number,
        unit: String
    }],
    allergens: [{
        type: String,
        enum: ['花生', '坚果', '大豆', '乳制品', '麸质', '海鲜', '蛋']
    }],
    image: {
        type: String,
        required: [true, '请上传图片']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number,
        required: [true, '请输入准备时间（分钟）']
    },
    tags: [{
        type: String,
        enum: ['素食', '纯素', '无麸质', '低卡路里', '高蛋白']
    }],
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for search optimization
MenuItemSchema.index({ name: 'text', nameEn: 'text', description: 'text' });

// Virtual populate reviews
MenuItemSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'menuItem',
    justOne: false
});

// Calculate average rating when saving
MenuItemSchema.pre('save', function(next) {
    if (this.rating.count > 0) {
        this.rating.average = Math.round((this.rating.average * 10)) / 10;
    }
    next();
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
