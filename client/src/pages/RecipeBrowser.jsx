import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  TextInput,
  MultiSelect,
  Select,
  RangeSlider,
  Button,
  Group,
  Text,
  LoadingOverlay,
  Pagination,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconSearch, IconFilter } from '@tabler/icons-react';
import { debounce } from 'lodash';
import { fetchRecipes, setFilters, clearFilters, selectRecipes, selectLoading, selectError, selectTotalPages, selectCurrentPage } from '../store/recipeSlice';
import RecipeCard from '../components/RecipeCard';

const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'dairy-free', label: 'Dairy Free' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const RecipeBrowser = () => {
  const dispatch = useDispatch();
  const recipes = useSelector(selectRecipes);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const totalPages = useSelector(selectTotalPages);
  const currentPage = useSelector(selectCurrentPage);

  const form = useForm({
    initialValues: {
      search: '',
      dietary: [],
      difficulty: '',
      maxTime: 120,
      minRating: 0,
      cuisine: '',
    },
  });

  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () => debounce((values) => {
      dispatch(fetchRecipes({ ...values, page: 1 }));
    }, 500),
    [dispatch]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle form changes
  const handleFormChange = useCallback((values) => {
    dispatch(setFilters(values));
    debouncedSearch(values);
  }, [dispatch, debouncedSearch]);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    dispatch(fetchRecipes({ ...form.values, page }));
  }, [dispatch, form.values]);

  // Reset filters
  const handleReset = useCallback(() => {
    form.reset();
    dispatch(clearFilters());
    dispatch(fetchRecipes({ page: 1 }));
  }, [dispatch, form]);

  // Initial load
  useEffect(() => {
    dispatch(fetchRecipes({ page: 1 }));
  }, [dispatch]);

  const renderFilters = useMemo(() => (
    <Paper shadow="sm" radius="md" p="md" mb="xl">
      <form onChange={form.onSubmit(handleFormChange)}>
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              icon={<IconSearch size={16} />}
              placeholder="Search recipes..."
              {...form.getInputProps('search')}
            />
          </Grid.Col>
          
          <Grid.Col sm={6} md={4}>
            <MultiSelect
              label="Dietary Restrictions"
              placeholder="Select restrictions"
              data={DIETARY_OPTIONS}
              {...form.getInputProps('dietary')}
            />
          </Grid.Col>

          <Grid.Col sm={6} md={4}>
            <Select
              label="Difficulty"
              placeholder="Select difficulty"
              data={DIFFICULTY_OPTIONS}
              clearable
              {...form.getInputProps('difficulty')}
            />
          </Grid.Col>

          <Grid.Col sm={12} md={4}>
            <Text size="sm">Maximum Preparation Time (minutes)</Text>
            <RangeSlider
              min={0}
              max={240}
              step={15}
              label={(value) => `${value}min`}
              {...form.getInputProps('maxTime')}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Group position="right">
              <Button
                variant="light"
                onClick={handleReset}
              >
                Reset Filters
              </Button>
              <Button
                type="submit"
                leftIcon={<IconFilter size={16} />}
              >
                Apply Filters
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </Paper>
  ), [form, handleReset]);

  const renderRecipes = useMemo(() => (
    <Grid>
      {recipes.map((recipe) => (
        <Grid.Col key={recipe._id} xs={12} sm={6} md={4} lg={3}>
          <RecipeCard recipe={recipe} />
        </Grid.Col>
      ))}
    </Grid>
  ), [recipes]);

  return (
    <Container size="xl" py="xl">
      {renderFilters}

      <div style={{ position: 'relative', minHeight: '200px' }}>
        <LoadingOverlay visible={loading} />
        
        {error && (
          <Text color="red" align="center" mb="md">
            {error}
          </Text>
        )}

        {renderRecipes}

        {recipes.length === 0 && !loading && (
          <Text align="center" color="dimmed" size="lg" mt="xl">
            No recipes found matching your criteria
          </Text>
        )}

        {totalPages > 1 && (
          <Group position="center" mt="xl">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              radius="md"
            />
          </Group>
        )}
      </div>
    </Container>
  );
};

export default React.memo(RecipeBrowser);
