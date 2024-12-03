import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Select,
  MultiSelect,
  NumberInput,
  Stack,
  Card,
  Badge,
  ActionIcon,
  LoadingOverlay,
  Progress,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconRefresh, IconTrash, IconChevronRight } from '@tabler/icons-react';
import { generateMealPlan, selectMealPlan, selectLoading, selectError } from '../store/recipeSlice';
import RecipeCard from '../components/RecipeCard';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const DIETARY_RESTRICTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'dairy-free', label: 'Dairy Free' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
];

const MealPlanner = () => {
  const dispatch = useDispatch();
  const mealPlan = useSelector(selectMealPlan);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  const [selectedDay, setSelectedDay] = useState(0);

  const form = useForm({
    initialValues: {
      days: 7,
      meals: ['breakfast', 'lunch', 'dinner'],
      calories: 2000,
      dietary: [],
      protein: 100,
      carbs: 250,
      fat: 70,
    },
    validate: {
      days: (value) => (value < 1 || value > 14 ? 'Days must be between 1 and 14' : null),
      calories: (value) => (value < 1000 || value > 4000 ? 'Calories must be between 1000 and 4000' : null),
      meals: (value) => (value.length === 0 ? 'Select at least one meal type' : null),
    },
  });

  const handleGeneratePlan = (values) => {
    dispatch(generateMealPlan(values));
  };

  const nutritionProgress = useMemo(() => {
    if (!mealPlan?.days[selectedDay]) return null;

    const dailyNutrition = mealPlan.days[selectedDay].nutrition;
    const targets = form.values;

    return (
      <Stack spacing="xs">
        <Text weight={500}>Daily Nutrition Progress</Text>
        <Group grow spacing="xs">
          <Stack spacing={5}>
            <Text size="sm">Calories ({dailyNutrition.calories}/{targets.calories})</Text>
            <Progress 
              value={(dailyNutrition.calories / targets.calories) * 100} 
              color="blue"
            />
          </Stack>
          <Stack spacing={5}>
            <Text size="sm">Protein ({dailyNutrition.protein}g/{targets.protein}g)</Text>
            <Progress 
              value={(dailyNutrition.protein / targets.protein) * 100} 
              color="green"
            />
          </Stack>
          <Stack spacing={5}>
            <Text size="sm">Carbs ({dailyNutrition.carbs}g/{targets.carbs}g)</Text>
            <Progress 
              value={(dailyNutrition.carbs / targets.carbs) * 100} 
              color="orange"
            />
          </Stack>
          <Stack spacing={5}>
            <Text size="sm">Fat ({dailyNutrition.fat}g/{targets.fat}g)</Text>
            <Progress 
              value={(dailyNutrition.fat / targets.fat) * 100} 
              color="grape"
            />
          </Stack>
        </Group>
      </Stack>
    );
  }, [mealPlan?.days, selectedDay, form.values]);

  return (
    <Container size="xl" py="xl">
      <Grid>
        <Grid.Col md={4}>
          <Paper shadow="sm" radius="md" p="md">
            <form onSubmit={form.onSubmit(handleGeneratePlan)}>
              <Stack spacing="md">
                <Title order={2}>Meal Plan Settings</Title>

                <NumberInput
                  label="Number of Days"
                  min={1}
                  max={14}
                  {...form.getInputProps('days')}
                />

                <MultiSelect
                  label="Meal Types"
                  data={MEAL_TYPES}
                  placeholder="Select meal types"
                  {...form.getInputProps('meals')}
                />

                <NumberInput
                  label="Daily Calorie Target"
                  min={1000}
                  max={4000}
                  step={50}
                  {...form.getInputProps('calories')}
                />

                <MultiSelect
                  label="Dietary Restrictions"
                  data={DIETARY_RESTRICTIONS}
                  placeholder="Select restrictions"
                  {...form.getInputProps('dietary')}
                />

                <NumberInput
                  label="Daily Protein Target (g)"
                  min={0}
                  {...form.getInputProps('protein')}
                />

                <NumberInput
                  label="Daily Carbs Target (g)"
                  min={0}
                  {...form.getInputProps('carbs')}
                />

                <NumberInput
                  label="Daily Fat Target (g)"
                  min={0}
                  {...form.getInputProps('fat')}
                />

                <Button 
                  type="submit" 
                  leftIcon={<IconRefresh size={16} />}
                  loading={loading}
                >
                  Generate Meal Plan
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid.Col>

        <Grid.Col md={8}>
          <Paper shadow="sm" radius="md" p="md">
            <div style={{ position: 'relative', minHeight: '200px' }}>
              <LoadingOverlay visible={loading} />

              {error && (
                <Text color="red" align="center" mb="md">
                  {error}
                </Text>
              )}

              {mealPlan && (
                <Stack spacing="xl">
                  <Group position="apart">
                    <Title order={2}>Your Meal Plan</Title>
                    <Group spacing="xs">
                      {Array.from({ length: mealPlan.days.length }).map((_, index) => (
                        <ActionIcon
                          key={index}
                          variant={selectedDay === index ? 'filled' : 'light'}
                          onClick={() => setSelectedDay(index)}
                        >
                          {index + 1}
                        </ActionIcon>
                      ))}
                    </Group>
                  </Group>

                  {nutritionProgress}

                  <Stack spacing="md">
                    {mealPlan.days[selectedDay]?.meals.map((meal, index) => (
                      <Card key={index} shadow="sm" p="md">
                        <Group position="apart" mb="xs">
                          <Group>
                            <Badge size="lg" variant="filled">
                              {meal.type}
                            </Badge>
                            <Text weight={500}>{meal.recipe.title}</Text>
                          </Group>
                          <Button 
                            variant="light"
                            rightIcon={<IconChevronRight size={16} />}
                            component="a"
                            href={`/recipes/${meal.recipe._id}`}
                          >
                            View Recipe
                          </Button>
                        </Group>
                        <Text size="sm" color="dimmed" mb="md">
                          {meal.recipe.description}
                        </Text>
                        <Group spacing="xs">
                          <Badge color="blue">
                            {meal.recipe.nutrition.calories} kcal
                          </Badge>
                          <Badge color="green">
                            {meal.recipe.nutrition.protein}g protein
                          </Badge>
                          <Badge color="orange">
                            {meal.recipe.nutrition.carbs}g carbs
                          </Badge>
                          <Badge color="grape">
                            {meal.recipe.nutrition.fat}g fat
                          </Badge>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              )}

              {!mealPlan && !loading && (
                <Text align="center" color="dimmed" size="lg">
                  Configure your preferences and generate a meal plan
                </Text>
              )}
            </div>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default React.memo(MealPlanner);
