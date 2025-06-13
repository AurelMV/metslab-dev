import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type CategoryFilterProps = {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
};

export function CategoryFilter({ categories, selectedCategory, onCategorySelect }: CategoryFilterProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              {
                backgroundColor: isSelected ? category.color : colors.background,
                borderColor: isSelected ? category.color : colors.tabIconDefault,
              }
            ]}
            onPress={() => onCategorySelect(category.id)}
          >
            <IconSymbol
              name={category.icon}
              size={20}
              color={isSelected ? '#FFFFFF' : colors.tabIconDefault}
            />
            <ThemedText
              style={[
                styles.categoryText,
                { color: isSelected ? '#FFFFFF' : colors.text }
              ]}
            >
              {category.name}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
