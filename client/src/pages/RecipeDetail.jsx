import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Image,
  List,
  Tabs,
  Button,
  LoadingOverlay,
  Rating,
} from '@mantine/core';
import { IconClock, IconChefHat, IconScale, IconUsers } from '@tabler/icons-react';
import { fetchRecipeById, selectSelectedRecipe, selectLoading, selectError } from '../store/recipeSlice';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const recipe = useSelector(selectSelectedRecipe);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    if (id) {
      dispatch(fetchRecipeById(id));
    }
  }, [dispatch, id]);

  const handleBack = () => {
    navigate(-1);
  };

  const nutritionInfo = useMemo(() => {
    if (!recipe?.nutrition) return null;
    return (
      <List spacing="xs">
        <List.Item><strong>Calories:</strong> {recipe.nutrition.calories}kcal</List.Item>
        <List.Item><strong>Protein:</strong> {recipe.nutrition.protein}g</List.Item>
        <List.Item><strong>Carbohydrates:</strong> {recipe.nutrition.carbs}g</List.Item>
        <List.Item><strong>Fat:</strong> {recipe.nutrition.fat}g</List.Item>
        <List.Item><strong>Fiber:</strong> {recipe.nutrition.fiber}g</List.Item>
      </List>
    );
  }, [recipe?.nutrition]);

  const ingredientsList = useMemo(() => {
    if (!recipe?.ingredients) return null;
    return (
      <List spacing="xs">
        {recipe.ingredients.map((ingredient, index) => (
          <List.Item key={index}>
            {ingredient.amount} {ingredient.unit} {ingredient.name}
            {ingredient.notes && <Text size="sm" color="dimmed"> ({ingredient.notes})</Text>}
          </List.Item>
        ))}
      </List>
    );
  }, [recipe?.ingredients]);

  const instructionsList = useMemo(() => {
    if (!recipe?.instructions) return null;
    return (
      <List type="ordered" spacing="md">
        {recipe.instructions.map((step, index) => (
          <List.Item key={index}>
            {step}
          </List.Item>
        ))}
      </List>
    );
  }, [recipe?.instructions]);

  if (error) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" withBorder>
          <Text color="red" align="center" size="lg">
            {error}
          </Text>
          <Group position="center" mt="md">
            <Button onClick={handleBack}>Go Back</Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <div style={{ position: 'relative', minHeight: '200px' }}>
        <LoadingOverlay visible={loading} />
        
        {recipe && (
          <>
            <Button variant="subtle" onClick={handleBack} mb="md">
              ← Back to Recipes
            </Button>

            <Grid>
              <Grid.Col md={6}>
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  radius="md"
                  fit="cover"
                  height={400}
                />
              </Grid.Col>

              <Grid.Col md={6}>
                <Title order={1} mb="md">{recipe.title}</Title>

                <Group spacing="xl" mb="md">
                  <Group>
                    <IconClock size={20} />
                    <Text>{recipe.cookTime} mins</Text>
                  </Group>
                  <Group>
                    <IconChefHat size={20} />
                    <Text>{recipe.difficulty}</Text>
                  </Group>
                  <Group>
                    <IconUsers size={20} />
                    <Text>Serves {recipe.servings}</Text>
                  </Group>
                </Group>

                <Group mb="md">
                  {recipe.dietary?.map((diet) => (
                    <Badge key={diet} size="lg">
                      {diet}
                    </Badge>
                  ))}
                </Group>

                <Rating value={recipe.rating} readOnly size="lg" mb="md" />
                
                <Text mb="xl">{recipe.description}</Text>
              </Grid.Col>
            </Grid>

            <Paper mt="xl" p="md">
              <Tabs defaultValue="ingredients">
                <Tabs.List>
                  <Tabs.Tab value="ingredients" icon={<IconScale size={14} />}>
                    Ingredients
                  </Tabs.Tab>
                  <Tabs.Tab value="instructions">Instructions</Tabs.Tab>
                  <Tabs.Tab value="nutrition">Nutrition</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="ingredients" pt="xl">
                  {ingredientsList}
                </Tabs.Panel>

                <Tabs.Panel value="instructions" pt="xl">
                  {instructionsList}
                </Tabs.Panel>

                <Tabs.Panel value="nutrition" pt="xl">
                  {nutritionInfo}
                </Tabs.Panel>
              </Tabs>
            </Paper>
          </>
        )}
      </div>
    </Container>
  );
};

export default React.memo(RecipeDetail);
