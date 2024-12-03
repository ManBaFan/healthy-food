# 营养生活 Healthy Food Management System

A comprehensive microservices-based recipe and meal planning system with advanced nutritional tracking capabilities.

一个基于微服务架构的食谱和膳食计划系统，具有先进的营养跟踪功能。

## ✨ Features | 功能特点

- 🌏 Bilingual support (Chinese/English) | 双语支持（中文/英文）
- 🍳 Recipe management with nutritional analysis | 食谱管理与营养分析
- 📊 Advanced nutritional tracking | 营养追踪
- 🗓️ Intelligent meal planning | 智能膳食规划
- 🥗 Dietary preferences and restrictions | 饮食偏好和限制
- 💡 AI-powered recipe recommendations | AI驱动的食谱推荐
- 📱 Responsive design for all devices | 全设备响应式设计

## 🛠 Tech Stack | 技术栈

### Frontend | 前端
- React 18
- Redux Toolkit
- Mantine UI
- React Router 6
- Axios

### Backend | 后端
- Node.js & Express
- MongoDB 6.0
- Redis 7.0
- JWT Authentication
- Winston & Morgan

### DevOps | 运维
- Docker & Docker Compose
- Nginx
- Prometheus & Grafana
- GitHub Actions

## 🚀 Quick Start | 快速开始

### Prerequisites | 前置要求
- Docker & Docker Compose
- Git

### Installation | 安装

1. Clone the repository | 克隆仓库
```bash
git clone https://github.com/ManBaFan/healthy-food.git
cd healthy-food
```

2. Start with Docker Compose | 使用Docker Compose启动
```bash
docker-compose up -d
```

The application will be available at | 应用程序将在以下地址可用:
- Main Website | 主站: http://localhost
- Admin Panel | 管理后台: http://localhost/admin
- API Documentation | API文档: http://localhost/api/docs

## 🔌 API Endpoints | API端点

### Menu | 菜单
- `GET /api/menu` - List all menu items | 列出所有菜单项
- `GET /api/menu/:id` - Get menu item details | 获取菜单项详情
- `GET /api/menu/category/:category` - Filter by category | 按类别筛选
- `POST /api/menu` - Create new menu item | 创建新菜单项
- `PUT /api/menu/:id` - Update menu item | 更新菜单项
- `DELETE /api/menu/:id` - Delete menu item | 删除菜单项

### Orders | 订单
- `GET /api/orders` - List all orders | 列出所有订单
- `POST /api/orders` - Create new order | 创建新订单
- `GET /api/orders/:id` - Get order details | 获取订单详情
- `PATCH /api/orders/:id/status` - Update order status | 更新订单状态

## 🔐 Environment Variables | 环境变量

Create a `.env` file in the root directory | 在根目录创建 `.env` 文件:

```env
# Node
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://mongodb:27017/healthy-food
REDIS_URI=redis://redis:6379

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=24h
```

## 🤝 Contributing | 贡献

1. Fork the repository | 复刻仓库
2. Create your feature branch | 创建功能分支
3. Commit your changes | 提交更改
4. Push to the branch | 推送到分支
5. Open a Pull Request | 创建拉取请求

## 📝 License | 许可证

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 Support | 支持

For support, email support@healthyfood.com or join our Slack channel.

如需支持，请发送电子邮件至 support@healthyfood.com 或加入我们的 Slack 频道。
