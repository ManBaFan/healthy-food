import React from 'react';
import { Card, Tag, Button, Space, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Meta } = Card;
const { Text } = Typography;

const StyledCard = styled(Card)`
  width: 300px;
  margin: 16px;
  .ant-card-cover img {
    height: 200px;
    object-fit: cover;
  }
`;

const PriceText = styled(Text)`
  font-size: 18px;
  color: #f5222d;
  font-weight: bold;
`;

const MenuCard = ({ item, onAddToCart }) => {
  const { name, nameEn, price, description, image, tags, nutritionInfo } = item;

  return (
    <StyledCard
      hoverable
      cover={<img alt={name} src={image} />}
      actions={[
        <Button 
          type="primary" 
          icon={<ShoppingCartOutlined />}
          onClick={() => onAddToCart(item)}
        >
          加入购物车
        </Button>
      ]}
    >
      <Meta
        title={
          <Space direction="vertical" size={0}>
            <Text strong>{name}</Text>
            <Text type="secondary">{nameEn}</Text>
          </Space>
        }
        description={
          <Space direction="vertical">
            <Text>{description}</Text>
            <PriceText>¥{price}</PriceText>
            <Space wrap>
              {tags?.map((tag) => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
            </Space>
            <Text type="secondary">
              卡路里: {nutritionInfo?.calories} | 
              蛋白质: {nutritionInfo?.protein}g | 
              碳水: {nutritionInfo?.carbs}g
            </Text>
          </Space>
        }
      />
    </StyledCard>
  );
};

export default MenuCard;
