import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: product.imagen_url }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.nombre}
        </Text>

        {(product.rating || product.reviews) && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.rating}>{product.rating ?? '4.5'}</Text>
            <Text style={styles.reviews}>({product.reviews ?? '0'})</Text>
          </View>
        )}

        {product.downloadCount !== undefined && (
          <View style={styles.downloadContainer}>
            <Ionicons name="download" size={12} color="#6b7280" />
            <Text style={styles.downloadCount}>{product.downloadCount}</Text>
          </View>
        )}

        <Text style={styles.price}>S/ {product.precio.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 6,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 2,
  },
  downloadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  downloadCount: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
});
