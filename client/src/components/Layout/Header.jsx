import React from 'react';
import { Layout, Menu, Badge, Space, Button, Avatar } from 'antd';
import { 
  HomeOutlined, 
  MenuOutlined, 
  ShoppingCartOutlined, 
  UserOutlined,
  OrderedListOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const { Header: AntHeader } = Layout;

const StyledHeader = styled(AntHeader)`
  background: #fff;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: fixed;
  width: 100%;
  z-index: 1000;
`;

const Logo = styled(Link)`
  float: left;
  height: 64px;
  padding: 0 24px;
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
  text-decoration: none;
  display: flex;
  align-items: center;
`;

const StyledMenu = styled(Menu)`
  line-height: 64px;
  border-bottom: none;
`;

const Header = () => {
  const location = useLocation();
  const { cartItems } = useSelector(state => state.cart);
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/menu',
      icon: <MenuOutlined />,
      label: '菜单'
    }
  ];

  if (isAuthenticated) {
    menuItems.push(
      {
        key: '/orders',
        icon: <OrderedListOutlined />,
        label: '我的订单'
      }
    );
  }

  return (
    <StyledHeader>
      <Logo to="/">健康食品</Logo>
      <Space style={{ float: 'right', marginRight: 24 }}>
        <Badge count={cartItems.length}>
          <Button 
            type="text" 
            icon={<ShoppingCartOutlined style={{ fontSize: 24 }} />}
            onClick={() => {/* Open cart drawer */}}
          />
        </Badge>
        {isAuthenticated ? (
          <Space>
            <Avatar src={user?.avatar} icon={<UserOutlined />} />
            <span>{user?.name}</span>
          </Space>
        ) : (
          <Space>
            <Button type="link">
              <Link to="/login">登录</Link>
            </Button>
            <Button type="primary">
              <Link to="/register">注册</Link>
            </Button>
          </Space>
        )}
      </Space>
      <StyledMenu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ marginRight: 200 }}
      />
    </StyledHeader>
  );
};

export default Header;
