const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Validation middleware
exports.validate = (validations) => {
    return async (req, res, next) => {
        try {
            // Run all validations
            for (let validation of validations) {
                const result = await validation.run(req);
                if (result.errors.length) break;
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array().map(err => ({
                        field: err.param,
                        message: err.msg
                    }))
                });
            }
            next();
        } catch (error) {
            logger.error('Validation error:', error);
            res.status(500).json({
                success: false,
                message: '验证失败'
            });
        }
    };
};

// Common validation rules
exports.rules = {
    // User validation rules
    user: {
        name: {
            notEmpty: {
                errorMessage: '姓名不能为空'
            },
            isLength: {
                options: { min: 2, max: 50 },
                errorMessage: '姓名长度必须在2-50个字符之间'
            }
        },
        email: {
            notEmpty: {
                errorMessage: '邮箱不能为空'
            },
            isEmail: {
                errorMessage: '请输入有效的邮箱地址'
            }
        },
        password: {
            notEmpty: {
                errorMessage: '密码不能为空'
            },
            isLength: {
                options: { min: 6 },
                errorMessage: '密码长度不能少于6个字符'
            }
        }
    },

    // Menu item validation rules
    menuItem: {
        name: {
            notEmpty: {
                errorMessage: '菜品名称不能为空'
            },
            isLength: {
                options: { min: 2, max: 100 },
                errorMessage: '菜品名称长度必须在2-100个字符之间'
            }
        },
        price: {
            notEmpty: {
                errorMessage: '价格不能为空'
            },
            isFloat: {
                options: { min: 0 },
                errorMessage: '价格必须是大于0的数字'
            }
        },
        category: {
            notEmpty: {
                errorMessage: '分类不能为空'
            },
            isIn: {
                options: [['主食', '沙拉', '汤品', '饮品', '小食']],
                errorMessage: '无效的分类'
            }
        }
    },

    // Order validation rules
    order: {
        items: {
            notEmpty: {
                errorMessage: '订单项不能为空'
            },
            isArray: {
                errorMessage: '订单项必须是数组'
            }
        },
        'items.*.menuItem': {
            notEmpty: {
                errorMessage: '菜品ID不能为空'
            },
            isMongoId: {
                errorMessage: '无效的菜品ID'
            }
        },
        'items.*.quantity': {
            notEmpty: {
                errorMessage: '数量不能为空'
            },
            isInt: {
                options: { min: 1 },
                errorMessage: '数量必须是大于0的整数'
            }
        },
        paymentMethod: {
            notEmpty: {
                errorMessage: '支付方式不能为空'
            },
            isIn: {
                options: [['微信支付', '支付宝', '银行卡']],
                errorMessage: '无效的支付方式'
            }
        }
    }
};
