import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Select, Space, Spin, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import MenuCard from '../../components/Menu/MenuCard';
import { fetchMenuItems } from '../../store/slices/menuSlice';
import { addToCart } from '../../store/slices/cartSlice';

const { Search } = Input;
const { Option } = Select;

const FilterContainer = styled.div`
  padding: 24px;
  background: #fff;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const MenuContainer = styled.div`
  padding: 24px;
  min-height: 500px;
`;

const Menu = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.menu);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tags: [],
    priceRange: ''
  });

  useEffect(() => {
    dispatch(fetchMenuItems(filters));
  }, [dispatch, filters]);

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleCategoryChange = (value) => {
    setFilters(prev => ({ ...prev, category: value }));
  };

  const handleTagsChange = (value) => {
    setFilters(prev => ({ ...prev, tags: value }));
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
  };

  return (
    <div>
      <FilterContainer>
        <Space size="large">
          <Search
            placeholder="搜索菜品"
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
          <Select
            placeholder="选择分类"
            style={{ width: 120 }}
            onChange={handleCategoryChange}
            allowClear
          >
            <Option value="主食">主食</Option>
            <Option value="沙拉">沙拉</Option>
            <Option value="汤品">汤品</Option>
            <Option value="饮品">饮品</Option>
          </Select>
          <Select
            mode="multiple"
            placeholder="选择标签"
            style={{ width: 200 }}
            onChange={handleTagsChange}
            allowClear
          >
            <Option value="素食">素食</Option>
            <Option value="无麸质">无麸质</Option>
            <Option value="低卡路里">低卡路里</Option>
            <Option value="高蛋白">高蛋白</Option>
          </Select>
        </Space>
      </FilterContainer>

      <MenuContainer>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : items.length > 0 ? (
          <Row gutter={[16, 16]}>
            {items.map(item => (
              <Col key={item._id} xs={24} sm={12} md={8} lg={6}>
                <MenuCard item={item} onAddToCart={handleAddToCart} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无菜品" />
        )}
      </MenuContainer>
    </div>
  );
};

export default Menu;
