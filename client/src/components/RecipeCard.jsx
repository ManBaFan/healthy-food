import React from 'react';
import { Card, Badge, Stack, Image, Text, Group, Button } from '@mantine/core';
import { IconClock, IconChefHat, IconScale } from '@tabler/icons-react';

const RecipeCard = ({ recipe, onView }) => {
  const { title, description, preparationTime, cookingTime, difficulty, dietaryCategories, imageUrl, nutrition } = recipe;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={imageUrl || '/default-recipe.jpg'}
          height={160}
          alt={title}
        />
      </Card.Section>

      <Stack mt="md" spacing="sm">
        <Text weight={500} size="lg">{title}</Text>
        
        <Text size="sm" color="dimmed" lineClamp={2}>
          {description}
        </Text>

        <Group spacing="xs">
          {dietaryCategories.map((category) => (
            <Badge key={category} variant="light" color="green">
              {category}
            </Badge>
          ))}
        </Group>

        <Group spacing="lg">
          <Group spacing="xs">
            <IconClock size={16} />
            <Text size="sm">{preparationTime + cookingTime} min</Text>
          </Group>
          
          <Group spacing="xs">
            <IconChefHat size={16} />
            <Text size="sm" transform="capitalize">{difficulty}</Text>
          </Group>
          
          <Group spacing="xs">
            <IconScale size={16} />
            <Text size="sm">{nutrition.calories} kcal</Text>
          </Group>
        </Group>

        <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={() => onView(recipe)}>
          View Recipe
        </Button>
      </Stack>
    </Card>
  );
};

export default RecipeCard;
