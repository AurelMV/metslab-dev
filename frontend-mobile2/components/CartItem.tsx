import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
}

export default function CartItem({ item, onRemove }: CartItemProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: item.product.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.product.name}
        </Text>
        <View style={styles.formatContainer}>
          {item.product.format.map((format, index) => (
            <Text key={index} style={styles.format}>
              {format}
            </Text>
          ))}
        </View>
        <Text style={styles.fileSize}>{item.product.fileSize}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>S/ {item.product.price.toFixed(2)}</Text>
          <Text style={styles.quantity}>x{item.quantity}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Ionicons name="trash" size={20} color="#dc2626" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  formatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  format: {
    fontSize: 10,
    color: '#6366f1',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  quantity: {
    fontSize: 14,
    color: '#6b7280',
  },
  removeButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
});