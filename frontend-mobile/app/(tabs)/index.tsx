import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ModelCard } from '@/components/ModelCard';
import { mockModels } from '@/data/mockModels';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#fff', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.gridContainer}>
        {mockModels.map((model) => (
          <ModelCard
            key={model.id}
            title={model.title}
            price={model.price}
            thumbnail={model.thumbnail}
            onPress={() => router.push(`../model/${model.id}`)}
          />
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 30,
    width: 50,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
});
