import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

type ModelCardProps = {
  title: string;
  price: number;
  thumbnail: string;
  onPress: () => void;
};

export function ModelCard({ title, price, thumbnail, onPress }: ModelCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: thumbnail }} style={styles.image} />
      <View style={styles.info}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText>${price.toFixed(2)}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 150,
  },
  info: {
    padding: 8,
  },
});
